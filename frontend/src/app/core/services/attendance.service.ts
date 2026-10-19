import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Attendance, MyAttendanceResponse, TodayResponse } from '../models/attendance.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/attendance';

  checkIn(): Observable<{ message: string; attendance: Attendance }> {
    return this.http.post<{ message: string; attendance: Attendance }>(`${this.apiUrl}/check-in`, {});
  }

  checkOut(): Observable<{ message: string; attendance: Attendance }> {
    return this.http.post<{ message: string; attendance: Attendance }>(`${this.apiUrl}/check-out`, {});
  }

  getToday(): Observable<TodayResponse> {
    return this.http.get<TodayResponse>(`${this.apiUrl}/today`);
  }

  getMyAttendance(month?: string): Observable<MyAttendanceResponse> {
    let params = new HttpParams();
    if (month) params = params.set('month', month);
    return this.http.get<MyAttendanceResponse>(`${this.apiUrl}/my`, { params });
  }
}