import {Component} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', Validators.required],
  });

  successMessage: string = '';
  errorMessage: string = '';


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router) {
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const {username, password} = this.loginForm.value;

      this.authService.login({username, password}).subscribe({
        next: (res: any) => {
          this.successMessage = 'Inicio de sesión exitoso';
          this.errorMessage = '';

          localStorage.setItem('token', res.token);
          this.loginForm.reset();

          this.router.navigate(['/admin']);
        },
        error: (err: any) => {
          this.errorMessage = 'Credenciales incorrectas';
          this.successMessage = '';
        }
      });
    }
  }
}
