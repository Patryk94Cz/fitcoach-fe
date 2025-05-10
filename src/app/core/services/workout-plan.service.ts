// src/app/core/services/workout-plan.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse, DifficultyLevel} from '../../models/exercise.model';
import {
  WorkoutPlan,
  WorkoutPlanRating,
  UserWorkoutPlan,
  WorkoutGoal,
  WorkoutPlanProgress,
  JoinWorkoutPlanRequest
} from '../../models/workout-plan.model';

@Injectable({
  providedIn: 'root'
})
export class WorkoutPlanService {
  private apiUrl = `${environment.apiUrl}/workout-plans`;
  private userPlansUrl = `${environment.apiUrl}/user/workout-plans`;

  constructor(private http: HttpClient) { }

  // Pobieranie planów treningowych
  getWorkoutPlans(page = 0, size = 10, sortBy = 'name', sortDir: 'asc' | 'desc' = 'asc'): Observable<PageResponse<WorkoutPlan>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<PageResponse<WorkoutPlan>>(this.apiUrl, { params });
  }

  // Pobieranie szczegółów planu treningowego
  getWorkoutPlanById(id: number): Observable<WorkoutPlan> {
    return this.http.get<WorkoutPlan>(`${this.apiUrl}/${id}`);
  }

  // Tworzenie nowego planu treningowego
  createWorkoutPlan(plan: WorkoutPlan): Observable<WorkoutPlan> {
    return this.http.post<WorkoutPlan>(this.apiUrl, plan);
  }

  // Aktualizacja planu treningowego
  updateWorkoutPlan(id: number, plan: WorkoutPlan): Observable<WorkoutPlan> {
    return this.http.put<WorkoutPlan>(`${this.apiUrl}/${id}`, plan);
  }

  // Usuwanie planu treningowego
  deleteWorkoutPlan(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Filtrowanie planów treningowych po poziomie trudności
  getWorkoutPlansByDifficulty(difficultyLevel: DifficultyLevel, page = 0, size = 10): Observable<PageResponse<WorkoutPlan>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<WorkoutPlan>>(`${this.apiUrl}/difficulty/${difficultyLevel}`, { params });
  }

  // Filtrowanie planów treningowych po celu
  getWorkoutPlansByGoal(goal: WorkoutGoal, page = 0, size = 10): Observable<PageResponse<WorkoutPlan>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<WorkoutPlan>>(`${this.apiUrl}/goal/${goal}`, { params });
  }

  // Filtrowanie planów treningowych po tagu
  getWorkoutPlansByTag(tag: string, page = 0, size = 10): Observable<PageResponse<WorkoutPlan>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<WorkoutPlan>>(`${this.apiUrl}/tag/${tag}`, { params });
  }

  // Wyszukiwanie planów treningowych
  searchWorkoutPlans(keyword: string, page = 0, size = 10): Observable<PageResponse<WorkoutPlan>> {
    let params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<WorkoutPlan>>(`${this.apiUrl}/search`, { params });
  }

  // Pobieranie najwyżej ocenianych planów treningowych
  getTopRatedWorkoutPlans(page = 0, size = 10): Observable<PageResponse<WorkoutPlan>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<WorkoutPlan>>(`${this.apiUrl}/top-rated`, { params });
  }

  // Pobieranie najpopularniejszych planów treningowych
  getMostPopularWorkoutPlans(page = 0, size = 10): Observable<PageResponse<WorkoutPlan>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<WorkoutPlan>>(`${this.apiUrl}/most-popular`, { params });
  }

  // Pobieranie rekomendowanych planów treningowych
  getRecommendedWorkoutPlans(
    maxFrequencyPerWeek?: number,
    maxDifficultyLevel?: DifficultyLevel,
    page = 0,
    size = 10
  ): Observable<PageResponse<WorkoutPlan>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (maxFrequencyPerWeek) {
      params = params.set('maxFrequencyPerWeek', maxFrequencyPerWeek.toString());
    }

    if (maxDifficultyLevel) {
      params = params.set('maxDifficultyLevel', maxDifficultyLevel);
    }

    return this.http.get<PageResponse<WorkoutPlan>>(`${this.apiUrl}/recommended`, { params });
  }

  // Pobieranie własnych planów treningowych
  getMyWorkoutPlans(page = 0, size = 10): Observable<PageResponse<WorkoutPlan>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<WorkoutPlan>>(`${this.apiUrl}/my`, { params });
  }

  // OCENY PLANÓW TRENINGOWYCH

  // Pobieranie ocen dla planu treningowego
  getWorkoutPlanRatings(
    planId: number,
    page = 0,
    size = 10,
    sortBy = 'createdAt',
    sortDir: 'asc' | 'desc' = 'desc'
  ): Observable<PageResponse<WorkoutPlanRating>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<PageResponse<WorkoutPlanRating>>(`${this.apiUrl}/${planId}/ratings`, { params });
  }

  // Ocenianie planu treningowego
  rateWorkoutPlan(planId: number, rating: number, comment: string): Observable<WorkoutPlanRating> {
    return this.http.post<WorkoutPlanRating>(`${this.apiUrl}/${planId}/ratings`, { rating, comment });
  }

  // Aktualizacja oceny planu
  updateWorkoutPlanRating(planId: number, rating: number, comment: string): Observable<WorkoutPlanRating> {
    return this.http.put<WorkoutPlanRating>(`${this.apiUrl}/${planId}/ratings`, { rating, comment });
  }

  // Usuwanie oceny planu
  deleteWorkoutPlanRating(planId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${planId}/ratings`);
  }

  // Sprawdzanie czy użytkownik ocenił plan treningowy
  hasRatedWorkoutPlan(planId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${planId}/ratings/has-rated`);
  }

  // Pobieranie swojej oceny dla planu treningowego
  getMyWorkoutPlanRating(planId: number): Observable<WorkoutPlanRating> {
    return this.http.get<WorkoutPlanRating>(`${this.apiUrl}/${planId}/ratings/me`);
  }

  // ZARZĄDZANIE PLANAMI TRENINGOWYMI UŻYTKOWNIKA

  // Zapisywanie się na plan treningowy
  joinWorkoutPlan(workoutPlanId: number): Observable<UserWorkoutPlan> {
    const request: JoinWorkoutPlanRequest = { workoutPlanId };
    return this.http.post<UserWorkoutPlan>(`${this.userPlansUrl}/join`, request);
  }

  // Aktualizacja postępu w planie treningowym
  updateWorkoutPlanProgress(userPlanId: number, progress: WorkoutPlanProgress): Observable<UserWorkoutPlan> {
    return this.http.put<UserWorkoutPlan>(`${this.userPlansUrl}/${userPlanId}`, progress);
  }

  // Porzucanie planu treningowego
  abandonWorkoutPlan(userPlanId: number): Observable<any> {
    return this.http.delete<any>(`${this.userPlansUrl}/${userPlanId}`);
  }

  // Pobieranie szczegółów planu treningowego użytkownika
  getUserWorkoutPlan(userPlanId: number): Observable<UserWorkoutPlan> {
    return this.http.get<UserWorkoutPlan>(`${this.userPlansUrl}/${userPlanId}`);
  }

  // Pobieranie wszystkich planów treningowych użytkownika
  getUserWorkoutPlans(page = 0, size = 10): Observable<PageResponse<UserWorkoutPlan>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<UserWorkoutPlan>>(`${this.userPlansUrl}`, { params });
  }

  // Pomocnicze metody

  // Konwersja WorkoutGoal na przyjazną nazwę
  getGoalName(goal: WorkoutGoal): string {
    const names = {
      [WorkoutGoal.STRENGTH]: 'Siła',
      [WorkoutGoal.ENDURANCE]: 'Wytrzymałość',
      [WorkoutGoal.WEIGHT_LOSS]: 'Redukcja wagi',
      [WorkoutGoal.MUSCLE_GAIN]: 'Budowa masy mięśniowej',
      [WorkoutGoal.GENERAL_FITNESS]: 'Ogólna sprawność',
      [WorkoutGoal.FLEXIBILITY]: 'Elastyczność'
    };
    return names[goal];
  }

  // Konwersja DifficultyLevel na przyjazną nazwę
  getDifficultyName(level: DifficultyLevel): string {
    const names = {
      [DifficultyLevel.BEGINNER]: 'Początkujący',
      [DifficultyLevel.INTERMEDIATE]: 'Średniozaawansowany',
      [DifficultyLevel.ADVANCED]: 'Zaawansowany'
    };
    return names[level];
  }

  // Pobranie listy wszystkich celów treningowych
  getAllWorkoutGoals(): WorkoutGoal[] {
    return Object.values(WorkoutGoal);
  }
}
