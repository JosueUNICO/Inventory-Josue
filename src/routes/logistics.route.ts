import Router from 'express';
import { AddStock, SearchProductByCode, ShowRegister, SubtractStock } from '../controller/logistics.controller';

export const LogisticsRoute = Router()
LogisticsRoute.post("/add_stock", AddStock)
LogisticsRoute.post("/subtract_stock", SubtractStock)
LogisticsRoute.get("/search_product_by_code/:code", SearchProductByCode)
LogisticsRoute.get("/show_register", ShowRegister)