import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {PageResponse} from '../../models/exercise.model';
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

  constructor(private http: HttpClient) {
  }


  getSessionById(sessionId: number): Observable<WorkoutSession> {
    return this.http.get<WorkoutSession>(`${this.apiUrl}/${sessionId}`);
  }


  createSession(sessionRequest: WorkoutSessionRequest): Observable<WorkoutSession> {
    return this.http.post<WorkoutSession>(this.apiUrl, sessionRequest);
  }


  deleteSession(sessionId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${sessionId}`);
  }


  getSessionsByPlan(userPlanId: number, page = 0, size = 10, sortBy = 'sessionDate', sortDir: 'asc' | 'desc' = 'desc'): Observable<PageResponse<WorkoutSessionListItem>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<PageResponse<WorkoutSessionListItem>>(`${this.apiUrl}/plan/${userPlanId}`, {params});
  }


  getRecentSessions(page = 0, size = 10): Observable<PageResponse<WorkoutSessionListItem>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<WorkoutSessionListItem>>(`${this.apiUrl}/recent`, {params});
  }


  getExerciseHistory(exerciseId: number): Observable<ExerciseHistory[]> {
    return this.http.get<ExerciseHistory[]>(`${this.apiUrl}/history/exercise/${exerciseId}`);
  }


  getAllExercisesHistory(): Observable<ExerciseHistory[]> {
    return this.http.get<ExerciseHistory[]>(`${this.apiUrl}/history/all`);
  }
}
