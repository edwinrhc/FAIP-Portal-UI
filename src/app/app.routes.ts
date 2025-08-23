import { Routes } from '@angular/router';
import {LoginComponent} from "./auth/pages/login/login.component";
import {RegisterComponent} from "./auth/pages/register/register.component";

export const routes: Routes = [

  {path:'', redirectTo:'auth/login', pathMatch:'full'},
  {path:'auth/login', component: LoginComponent },
  {path:'auth/register', component: RegisterComponent },

];
