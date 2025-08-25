import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import {CommonModule} from "@angular/common";
import {AuthService} from "../../services/auth.service";



export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors|null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password && confirmPassword && password != confirmPassword ?
    { passwordMismatch: true} : null;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required],
    role: ['ADMIN', Validators.required],
  }, { validators: passwordMatchValidator});

  successMessage: string = '';
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  onSubmit() {
    if (this.registerForm.valid) {
      const { username, password, role } = this.registerForm.value;
      this.authService.register({username, password, role}).subscribe({
        next: (res: any) => {
          this.successMessage = 'Registro exitoso';
          this.errorMessage = '';
          this.registerForm.reset({role:'ADMIN'});
        },
        error: (err: any) => {
          this.errorMessage = 'Error al registrar';
          this.successMessage = '';
        }
      });
    }
  }

}
