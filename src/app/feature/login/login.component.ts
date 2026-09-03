import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  imports: [MatButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  readonly returnUrl = input('/');
  readonly error = input<string | undefined>();

  login(): void {
    const returnUrl = this.returnUrl() || '/';
    const target = `${environment.bffUrl}/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`;
    window.location.href = target;
  }

  errorMessage(): string | null {
    switch (this.error()) {
      case 'access_denied':
        return 'Der Zugriff wurde abgelehnt. Bitte melde dich erneut an.';
      case 'expired':
        return 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.';
      case 'failed':
        return 'Die Anmeldung ist fehlgeschlagen. Bitte versuche es erneut.';
      default:
        return null;
    }
  }
}
