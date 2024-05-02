import express, { Request, Response } from 'express';
import cors from 'cors';
import { UserRoute } from './routes/usuario.route';
import { ProductRoute } from './routes/product.route';
import { LogisticsRoute } from './routes/logistics.route';

function appInit() {
    const app = express();
    app.use(cors());
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    // Usa tus rutas definidas
    app.use(UserRoute);
    app.use(ProductRoute);
    app.use(LogisticsRoute)

    app.use('/uploads', express.static('uploads'));

    app.listen(3000, () => {
        console.log('Se conecto a la base de datos');
    });
}

appInit();
