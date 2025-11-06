import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.append(key, params[key].toString());
        }
      });
    }
    return this.http.get<T>(endpoint, { params: httpParams });
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(endpoint, body);
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(endpoint, body);
  }

  patch<T>(endpoint: string, body: any): Observable<T> {
    return this.http.patch<T>(endpoint, body);
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(endpoint);
  }

  // Helper metódy pre časté operácie
  getById<T>(endpoint: string, id: string): Observable<T> {
    return this.get<T>(`${endpoint}/${id}`);
  }

  create<T>(endpoint: string, data: Partial<T>): Observable<T> {
    return this.post<T>(endpoint, data);
  }

  update<T>(endpoint: string, id: string, data: Partial<T>): Observable<T> {
    return this.put<T>(`${endpoint}/${id}`, data);
  }

  remove<T>(endpoint: string, id: string): Observable<T> {
    return this.delete<T>(`${endpoint}/${id}`);
  }
}
