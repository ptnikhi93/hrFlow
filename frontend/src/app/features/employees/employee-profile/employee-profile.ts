import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { Employee } from '../../../core/models/employee.model';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './employee-profile.html',
  styleUrl: './employee-profile.scss'
})
export class EmployeeProfile implements OnInit {
  private route = inject(ActivatedRoute);
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);

  employee = signal<Employee | null>(null);
  loading = signal(true);
  errorMessage = signal('');

  role = this.authService.getUser()?.role;
  canManage = this.role === 'admin' || this.role === 'hr';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    // /employees/5 shows employee 5. /profile shows the logged-in user's own profile.
    const request$ = id
      ? this.employeeService.getById(Number(id))
      : this.employeeService.getMyProfile();

    request$.subscribe({
      next: (emp) => {
        this.employee.set(emp);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to load profile');
        this.loading.set(false);
      }
    });
  }
}