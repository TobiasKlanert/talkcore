import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthFormLayout } from '../../components/auth-form-layout/auth-form-layout';

@Component({
  selector: 'app-register-success-page',
  imports: [AuthFormLayout, RouterLink],
  templateUrl: './register-success-page.html',
})
export class RegisterSuccessPage {}
