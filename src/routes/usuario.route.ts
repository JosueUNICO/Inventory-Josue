import Router from 'express';
import { CreateUser, LoginUsuario, RecoverPassword, ChangePassword, SearchUserByDNI } from '../controller/user.controller';

export const UserRoute = Router();

UserRoute.post("/registrar_usuario", CreateUser);   
UserRoute.post("/login", LoginUsuario);
UserRoute.post("/recover_password", RecoverPassword);
UserRoute.post("/change_password", ChangePassword);
UserRoute.get("/buscar/:dni", SearchUserByDNI)