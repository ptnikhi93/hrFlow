import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AttendanceService } from '../../../core/services/attendance.service';
import { Attendance, AttendanceSummary } from '../../../core/models/attendance.model';

@Component({
  selector: 'app-my-attendance',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './my-attendance.html',
  styleUrl: './my-attendance.scss'
})
export class MyAttendance implements OnInit {
  private attendanceService = inject(AttendanceService);
  private destroyRef = inject(DestroyRef);

  // A month input works with values like "2026-10"
  monthControl = new FormControl(new Date().toLocaleDateString('en-CA').slice(0, 7), {
    nonNullable: true
  });

  records = signal<Attendance[]>([]);
  summary = signal<AttendanceSummary>({ presentDays: 0, halfDays: 0, totalWorkHours: 0 });
  loading = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    this.load();

    this.monthControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (value) this.load();
      });
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.attendanceService.getMyAttendance(this.monthControl.value).subscribe({
      next: (res) => {
        this.records.set(res.records);
        this.summary.set(res.summary);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to load attendance');
        this.loading.set(false);
      }
    });
  }

  statusLabel(status: string): string {
    return status === 'half_day' ? 'Half day' : status;
  }
}