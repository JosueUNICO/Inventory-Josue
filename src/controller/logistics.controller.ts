import { Request, Response, request } from 'express';
import pool from '../../database.config';

export const AddStock = async (request: Request, response: Response) => {
    const {
        activity,
        code,
        amount,
        details
    } = request.body;

    try {
        const productoExistente = await pool.query('SELECT code, stock FROM products WHERE code = $1',
            [code]
        );
        if (productoExistente.rows.length > 0) {

            await pool.query('UPDATE products SET stock = stock + $1 WHERE code = $2',
                [amount, code]
            )

            const result = await pool.query(
                'INSERT INTO register (activity, datetime, code, amount, details) VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4) RETURNING *',
                [activity, code, amount, details]
            );
            const LogsAgregado = result.rows[0];
            return response.status(201).json({
            data: LogsAgregado
        });
        } else {
            console.error('El code product no existe en la tabla productos')
            return response.status(404).json({message: 'El code product no existe en la base de datos'})
        }
    } catch (error) {
        console.error('Ha ocurrido un error al agregar el stock:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const SubtractStock = async (request: Request, response: Response) => {
    const {
        activity,
        code,
        amount,
        details
    } = request.body;

    try {
        const productoExistente = await pool.query('SELECT code, stock FROM products WHERE code = $1',
            [code]
        );
        if (productoExistente.rows.length > 0) {

            await pool.query('UPDATE products SET stock = stock - $1 WHERE code = $2',
                [amount, code]
            )

            const result = await pool.query(
                'INSERT INTO register (activity, datetime, code, amount, details) VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4) RETURNING *',
                [activity, code, amount, details]
            );
            const LogsAgregado = result.rows[0];
            return response.status(201).json({
            data: LogsAgregado
        });
        } else {
            console.error('El code product no existe en la tabla productos')
            return response.status(404).json({message: 'El code product no existe en la base de datos'})
        }
    } catch (error) {
        console.error('Ha ocurrido un error al agregar el stock:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const SearchProductByCode = async (request: Request, response: Response) => {
    const code = request.params.code;
    try {
        const result = await pool.query(
            'SELECT * FROM products WHERE code = $1',
            [code]
        );

        const productoEncontrado = result.rows[0];
        if (!productoEncontrado) {
            return response.status(404).json({existente: false,  message: 'Producto no encontrado' });
        }

        return response.status(200).json({existente: true, productoEncontrado});
    } 
    catch (error) {
        console.error('Error al buscar producto:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const ShowRegister = async (request: Request, response: Response) => {
    try {
        const result = await pool.query(
            'SELECT register.activity, register.code, products.name, register.amount, register.datetime, register.details FROM register JOIN products ON register.code = products.code;'
        );
        const reportes = result.rows;
        return response.status(200).json(reportes);
    } catch (error) {
        console.error('Error al obtener reportes: ', error);
        return response.status(500).json({message: 'Error interno del servidor'});
    }
}