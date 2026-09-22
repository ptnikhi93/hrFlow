import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-topbar',
  imports: [],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar {
  private authService = inject(AuthService);

  user = this.authService.getUser();

  logout(): void {
    this.authService.logout();
  }
}
