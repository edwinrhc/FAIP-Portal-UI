import { Component } from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    role: ['ADMIN', Validators.required],
  });

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  onSubmit() {
    if (this.registerForm.valid) {
      console.log('📤 Enviando al backend:', this.registerForm.value);
      this.authService.register(this.registerForm.value).subscribe({
        next: (res: any) => console.log('✅ Registro exitoso', res),
        error: (err: any) => console.error('❌ Error en registro', err),
      });
    }
  }

}
