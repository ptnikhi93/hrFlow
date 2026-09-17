import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HealthService {
  private apiUrl = 'http://localhost:5000/api/health';

  constructor(private http: HttpClient) {}

  checkHealth(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}