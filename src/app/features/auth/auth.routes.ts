import { Routes } from '@angular/router';

import { ForgotPassword } from './forgot-password/forgot-password';
import { Login } from './login/login';
import { Register } from './register/register';

export const loginRoutes: Routes = [{ path: '', component: Login }];
export const registerRoutes: Routes = [{ path: '', component: Register }];
export const forgotPasswordRoutes: Routes = [{ path: '', component: ForgotPassword }];
