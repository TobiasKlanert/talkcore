import { Component, input } from '@angular/core';

@Component({
  selector: 'app-auth-form-layout',
  templateUrl: './auth-form-layout.html',
  styleUrl: './auth-form-layout.scss',
})
export class AuthFormLayout {
  title = input.required<string>();
  subtitle = input.required<string>();
}
