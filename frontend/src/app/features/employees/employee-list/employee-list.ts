import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../core/models/employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.scss'
})
export class EmployeeList implements OnInit {
  private employeeService = inject(EmployeeService);
  private destroyRef = inject(DestroyRef);

  employees = signal<Employee[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  searchControl = new FormControl('', { nonNullable: true });
  statusControl = new FormControl('', { nonNullable: true });

  ngOnInit(): void {
    this.loadEmployees();

    // Wait 300ms after the user stops typing, then search
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadEmployees());

    this.statusControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadEmployees());
  }

  loadEmployees(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.employeeService
      .getAll(this.searchControl.value, this.statusControl.value)
      .subscribe({
        next: (list) => {
          this.employees.set(list);
          this.loading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Failed to load employees');
          this.loading.set(false);
        }
      });
  }

  deactivate(employee: Employee): void {
    const confirmed = confirm(`Deactivate ${employee.user.name}?`);
    if (!confirmed) return;

    this.employeeService.deactivate(employee.id).subscribe({
      next: () => this.loadEmployees(),
      error: (err) => this.errorMessage.set(err.error?.message || 'Failed to deactivate')
    });
  }
}