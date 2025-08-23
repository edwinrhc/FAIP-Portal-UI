import { Component } from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth.service";


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  })

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  onSubmit(){
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res: any) => console.log('✅ Login exitoso', res),
        error: (err: any) => console.error('❌ Error al iniciar sesión', err),
      });
    }
  }

}
