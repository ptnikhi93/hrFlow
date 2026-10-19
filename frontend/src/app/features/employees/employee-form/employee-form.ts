import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './employee-form.html',
  styleUrl: './employee-form.scss'
})
export class EmployeeForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);

  employeeId: number | null = null;
  isEdit = false;
  isAdmin = this.authService.getUser()?.role === 'admin';

  loading = signal(false);
  saving = signal(false);
  errorMessage = signal('');

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['employee'],
    phone: [''],
    department: [''],
    designation: [''],
    dateOfJoining: [''],
    dateOfBirth: [''],
    gender: [''],
    address: [''],
    status: ['active'],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEdit = true;
      this.employeeId = Number(id);

      // Password is only set when creating. A disabled control is ignored
      // by validation and left out of form.value.
      this.form.controls.password.disable();

      this.loading.set(true);
      this.employeeService.getById(this.employeeId).subscribe({
        next: (emp) => {
          this.form.patchValue({
            name: emp.user.name,
            email: emp.user.email,
            role: emp.user.role,
            phone: emp.phone ?? '',
            department: emp.department ?? '',
            designation: emp.designation ?? '',
            dateOfJoining: emp.dateOfJoining ?? '',
            dateOfBirth: emp.dateOfBirth ?? '',
            gender: emp.gender ?? '',
            address: emp.address ?? '',
            status: emp.status,
          });
          this.loading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Failed to load employee');
          this.loading.set(false);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    // The database rejects an empty string for dates and gender, so send null instead
    const raw = this.form.value as any;
    const payload = {
      ...raw,
      dateOfJoining: raw.dateOfJoining || null,
      dateOfBirth: raw.dateOfBirth || null,
      gender: raw.gender || null,
    };

    const request$ = this.isEdit
      ? this.employeeService.update(this.employeeId!, payload)
      : this.employeeService.create(payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/employees']);
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to save employee');
      }
    });
  }
}