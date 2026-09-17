import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HealthService } from './core/services/health.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('frontend');
  backendStatus = signal('Checking...');

  constructor(private healthService: HealthService) {}

  ngOnInit(): void {
    this.healthService.checkHealth().subscribe({
      next: (res) => {
        this.backendStatus.set(res.message);
      },
      error: (err) => {
        this.backendStatus.set('Backend not reachable');
        console.error(err);
      }
    });
  }
}