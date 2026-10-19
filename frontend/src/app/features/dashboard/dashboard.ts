import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AttendanceService } from '../../core/services/attendance.service';
import { Attendance } from '../../core/models/attendance.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private attendanceService = inject(AttendanceService);

  user = this.authService.getUser();

  // The admin account has no employee profile, so it has no attendance card
  showCard = this.user?.role !== 'admin';

  now = new Date();
  today = signal<Attendance | null>(null);
  loading = signal(true);
  acting = signal(false);
  errorMessage = signal('');

  workHoursText = computed(() => {
    const record = this.today();
    return record?.workHours ? Number(record.workHours).toFixed(2) : '';
  });

  ngOnInit(): void {
    if (!this.showCard) return;

    this.attendanceService.getToday().subscribe({
      next: (res) => {
        this.today.set(res.attendance);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Could not load attendance');
        this.loading.set(false);
      }
    });
  }

  checkIn(): void {
    this.acting.set(true);
    this.errorMessage.set('');

    this.attendanceService.checkIn().subscribe({
      next: (res) => {
        this.today.set(res.attendance);
        this.acting.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Check in failed');
        this.acting.set(false);
      }
    });
  }

  checkOut(): void {
    this.acting.set(true);
    this.errorMessage.set('');

    this.attendanceService.checkOut().subscribe({
      next: (res) => {
        this.today.set(res.attendance);
        this.acting.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Check out failed');
        this.acting.set(false);
      }
    });
  }
}