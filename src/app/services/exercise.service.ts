// src/app/services/exercise.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private apiUrl = `${environment.apiUrl}/exercises`;

  constructor(private http: HttpClient) { }

  // Pobieranie listy wszystkich publicznych ćwiczeń
  getExercises(page = 0, size = 10, sortBy = 'name', sortDir = 'asc'): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<any>(this.apiUrl, { params });
  }

  // Pobieranie szczegółów ćwiczenia
  getExerciseById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Tworzenie nowego ćwiczenia
  createExercise(exercise: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, exercise);
  }

  // Aktualizacja ćwiczenia
  updateExercise(id: number, exercise: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, exercise);
  }

  // Usuwanie ćwiczenia
  deleteExercise(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Filtrowanie ćwiczeń po grupie mięśniowej
  getExercisesByMuscleGroup(muscleGroup: string, page = 0, size = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.apiUrl}/muscle/${muscleGroup}`, { params });
  }

  // Filtrowanie ćwiczeń po poziomie trudności
  getExercisesByDifficulty(level: string, page = 0, size = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.apiUrl}/difficulty/${level}`, { params });
  }

  // Filtrowanie ćwiczeń po tagu
  getExercisesByTag(tag: string, page = 0, size = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.apiUrl}/tag/${tag}`, { params });
  }

  // Wyszukiwanie ćwiczeń
  searchExercises(keyword: string, page = 0, size = 10): Observable<any> {
    let params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.apiUrl}/search`, { params });
  }

  // Pobieranie najwyżej ocenianych ćwiczeń
  getTopRatedExercises(page = 0, size = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.apiUrl}/top-rated`, { params });
  }

  // Pobieranie własnych ćwiczeń
  getMyExercises(page = 0, size = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.apiUrl}/my`, { params });
  }

  // Pobieranie ocen dla ćwiczenia
  getExerciseRatings(exerciseId: number, page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc'): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<any>(`${this.apiUrl}/${exerciseId}/ratings`, { params });
  }

  // Ocenianie ćwiczenia
  rateExercise(exerciseId: number, rating: number, comment: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${exerciseId}/ratings`, { rating, comment });
  }

  // Aktualizacja oceny
  updateRating(exerciseId: number, rating: number, comment: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${exerciseId}/ratings`, { rating, comment });
  }

  // Usuwanie oceny
  deleteRating(exerciseId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${exerciseId}/ratings`);
  }

  // Sprawdzanie czy użytkownik ocenił ćwiczenie
  hasRated(exerciseId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${exerciseId}/ratings/has-rated`);
  }

  // Pobieranie swojej oceny dla ćwiczenia
  getMyRating(exerciseId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${exerciseId}/ratings/me`);
  }
}
