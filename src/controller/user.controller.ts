import { Request, Response, request, response } from 'express';
import pool from '../../database.config';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

export const CreateUser = async (request: Request, response: Response) => {
    const {
        name,
        lastName,
        dni,
        dateOfBirth,
        gender,
        email,
        password
    } = request.body ;
    
    try {
        if (dni.toString().length !== 8) {
            return response.status(400).json({ message: 'El DNI debe tener exactamente 8 dígitos' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const result = await pool.query(
            'INSERT INTO users(name, lastName, dni, dateOfBirth, gender, email, password) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, lastName, dni, dateOfBirth, gender, email, hashedPassword]
        );

        const usuarioCreado = result.rows[0];
        return response.status(201).json({
            name: usuarioCreado.name,
            lastName: usuarioCreado.lastName,
            message: 'Usuario creado exitosamente',
            data: usuarioCreado
        });
    } 
    catch (error) {
        console.error('Error al crear usuario:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const LoginUsuario = async (request: Request, response: Response) => {
    const { email, password } = request.body;

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        const usuarioEncontrado = result.rows[0];
        if (!usuarioEncontrado) {
            return response.status(404).json({ message: 'Credenciales incorrectas' });
        }

        const passwordMatch = await bcrypt.compare(password, usuarioEncontrado.password);
        if (!passwordMatch) {
            return response.status(404).json({ message: 'Credenciales incorrectas' });
        }

        return response.status(200).json({ message: 'Inicio de sesión exitoso', usuario: usuarioEncontrado });
    } 
    catch (error) {
        console.error('Error al hacer Login', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

const generateRandomCode = (): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
};

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'jdccgotcamanchumbes@gmail.com', 
      pass: 'clhr jmbm dfxv tvde',
    },
  });

export const RecoverPassword = async (request: Request, response: Response) => {
    const { email } = request.body;

    try {
        const code = generateRandomCode();

        await pool.query(
            'UPDATE users SET token_recuperacion = $1 WHERE email = $2',
            [code, email]
        );

        await transporter.sendMail({
          from: 'jdccgotcamanchumbes@gmail.com',
          to: email,
          subject: 'Recuperación de contraseña',
          text: `Tu código de recuperación es: ${code}`,
        });
        
        return response.status(200).json({ 
            message: 'Se ha enviado un código para restablecer la contraseña'
        });
        
    } 
    catch (error) {
        console.error('Error al solicitar código', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const ChangePassword = async (request: Request, response: Response) => {
    const { email, token_recuperacion, newPassword } = request.body;

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND token_recuperacion = $2',
            [email, token_recuperacion]
        );

        const usuarioEncontrado = result.rows[0];
        if (!usuarioEncontrado) {
            return response.status(404).json({ message: 'Correo electrónico o código de recuperación incorrectos' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        await pool.query(
            'UPDATE users SET password = $1, token_recuperacion = NULL WHERE email = $2',
            [hashedPassword, email]
        );

        return response.status(200).json({ message: 'Contraseña cambiada exitosamente' });
    } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const SearchUserByDNI = async (request: Request, response: Response) => {
    const dni = request.params.dni;

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE dni = $1',
            [dni]
        );

        const usuarioEncontrado = result.rows[0];
        if (!usuarioEncontrado) {
            return response.status(404).json({ message: 'Error... Usuario no encontrado' });
        }

        return response.status(200).json(usuarioEncontrado);
    } 
    catch (error) {
        console.error('Error al buscar usuario por DNI:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};