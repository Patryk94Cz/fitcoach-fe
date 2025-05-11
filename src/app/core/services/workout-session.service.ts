// src/app/core/services/workout-session.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse } from '../../models/exercise.model';
import {
  WorkoutSession,
  WorkoutSessionListItem,
  WorkoutSessionRequest,
  ExerciseHistory
} from '../../models/workout-session.model';

@Injectable({
  providedIn: 'root'
})
export class WorkoutSessionService {
  private apiUrl = `${environment.apiUrl}/workout-sessions`;

  constructor(private http: HttpClient) {}

  // Get session details
  getSessionById(sessionId: number): Observable<WorkoutSession> {
    return this.http.get<WorkoutSession>(`${this.apiUrl}/${sessionId}`);
  }

  // Record a new workout session
  createSession(sessionRequest: WorkoutSessionRequest): Observable<WorkoutSession> {
    return this.http.post<WorkoutSession>(this.apiUrl, sessionRequest);
  }

  // Delete a workout session
  deleteSession(sessionId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${sessionId}`);
  }

  // Get sessions for a specific workout plan
  getSessionsByPlan(userPlanId: number, page = 0, size = 10, sortBy = 'sessionDate', sortDir: 'asc' | 'desc' = 'desc'): Observable<PageResponse<WorkoutSessionListItem>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<PageResponse<WorkoutSessionListItem>>(`${this.apiUrl}/plan/${userPlanId}`, { params });
  }

  // Get recent sessions across all workout plans
  getRecentSessions(page = 0, size = 10): Observable<PageResponse<WorkoutSessionListItem>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<WorkoutSessionListItem>>(`${this.apiUrl}/recent`, { params });
  }

  // Get history for a specific exercise
  getExerciseHistory(exerciseId: number): Observable<ExerciseHistory[]> {
    return this.http.get<ExerciseHistory[]>(`${this.apiUrl}/history/exercise/${exerciseId}`);
  }

  // Get history for all exercises
  getAllExercisesHistory(): Observable<ExerciseHistory[]> {
    return this.http.get<ExerciseHistory[]>(`${this.apiUrl}/history/all`);
  }
}
