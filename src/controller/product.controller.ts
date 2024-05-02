import { Request, Response, request } from 'express';
import pool from '../../database.config';
import multer from 'multer';
import path from 'path';

const fs = require('node:fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    }
})
const upload = multer({ storage: storage }).single('image');

function guardarImagen(file) {
    const ext = path.extname(file.originalname);
    const newPath = `${file.filename}${ext}`
    fs.renameSync(file.path, './uploads/' + newPath);
    return newPath;
}

export const CreateProduct = async (request: Request, response: Response) => {
    upload(request, response, async function (err) {
        if (err) {
          console.error('Error al cargar la imagen', err);
          return response.status(500).json({ message: 'Error al cargar la imagen' });
        }
        const {
            code,
            name,
            price,
            stock,
            details
        } = request.body;

        const newPath = guardarImagen(request.file);

        try {
            const result = await pool.query(
                'INSERT INTO products (code, name, price, stock, details, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [code, name, price, stock, details, newPath]
            );

            const ProductoAgregado = result.rows[0];
            return response.status(201).json({
                name: ProductoAgregado.name,
                message: 'agregado correctamente.',
                data: ProductoAgregado
            });
        } catch (error) {
            console.error('Error al agregar producto:', error);
            return response.status(500).json({ message: 'Error interno del servidor' });
        }

    });
}

export const ShowProduct = async (request: Request, response: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM products;',
        );
        const products = result.rows;
        return response.status(200).json(products);
    }
    catch (error) {
        console.error('Error al mostrar producto:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const DeleteProduct = async (request: Request, response: Response) => {
    const code = request.params.id;

    try {
        const result = await pool.query(
            'DELETE FROM products WHERE code = $1',
            [code]
        );
        if (result.rowCount === 1) {
            return response.status(200).json({
                message:'Producto eliminado correctamente'
            });
        } else {
            return response.status(404).json({
                message: 'No se encontró ningún producto con el código proporcionado'
            });
        }    
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const SearchProductByName = async (request: Request, response: Response) => {
    const { name } = request.query;

    try {
        const result = await pool.query(
            'SELECT * FROM products WHERE name ILIKE $1',
            [`%${name}%`]
        );

        const productoEncontrado = result.rows;
        return response.status(200).json(productoEncontrado);
    } 
    catch (error) {
        console.error('Error al buscar producto:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};