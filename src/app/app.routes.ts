import { Routes } from '@angular/router';
import {LoginComponent} from "./auth/pages/login/login.component";
import {RegisterComponent} from "./auth/pages/register/register.component";
import {AdminPanelComponent} from "./pages/admin-panel/admin-panel.component";
import {authGuard} from "./guards/auth.guard";
import {SolicitudesComponent} from "./pages/solicitudes/solicitudes.component";

export const routes: Routes = [

  {path:'', redirectTo:'auth/login', pathMatch:'full'},
  {path:'auth/login', component: LoginComponent },
  {path:'auth/register', component: RegisterComponent },
  {path:'solicitudes', component: SolicitudesComponent },
  {path:'admin', component: AdminPanelComponent, canActivate: [authGuard] },

];
