import Router from 'express';
import { SearchProductByName, CreateProduct, DeleteProduct, ShowProduct } from '../controller/product.controller';

export const ProductRoute = Router()

ProductRoute.post("/registrar_producto", CreateProduct);   
ProductRoute.get("/mostrar", ShowProduct)
ProductRoute.delete("/eliminar_producto/:id", DeleteProduct);
ProductRoute.get("/buscar", SearchProductByName);
