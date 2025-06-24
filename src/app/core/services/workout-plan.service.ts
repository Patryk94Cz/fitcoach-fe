import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {catchError, map, Observable, of, throwError} from 'rxjs';
import {environment} from '../../../environments/environment';
import {PageResponse, DifficultyLevel} from '../../models/exercise.model';
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

  constructor(private http: HttpClient) {
  }

  getWorkoutPlan(workoutPlanId: number): Observable<WorkoutPlan> {
    return this.http.get<WorkoutPlan>(`${this.apiUrl}/workout-plans/${workoutPlanId}`);
  }


  getWorkoutPlans(page = 0, size = 10, sortBy = 'name', sortDir: 'asc' | 'desc' = 'asc'): Observable<PageResponse<WorkoutPlan>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<PageResponse<WorkoutPlan>>(this.apiUrl, {params});
  }


  getWorkoutPlanById(id: number): Observable<WorkoutPlan> {
    return this.http.get<WorkoutPlan>(`${this.apiUrl}/${id}`);
  }


  createWorkoutPlan(plan: WorkoutPlan): Observable<WorkoutPlan> {
    return this.http.post<WorkoutPlan>(this.apiUrl, plan);
  }


  updateWorkoutPlan(id: number, plan: WorkoutPlan): Observable<WorkoutPlan> {
    return this.http.put<WorkoutPlan>(`${this.apiUrl}/${id}`, plan);
  }


  deleteWorkoutPlan(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }


  getWorkoutPlansByDifficulty(difficultyLevel: DifficultyLevel, page = 0, size = 10): Observable<PageResponse<WorkoutPlan>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<WorkoutPlan>>(`${this.apiUrl}/difficulty/${difficultyLevel}`, {params});
  }


  getWorkoutPlansByGoal(goal: WorkoutGoal, page = 0, size = 10): Observable<PageResponse<WorkoutPlan>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<WorkoutPlan>>(`${this.apiUrl}/goal/${goal}`, {params});
  }


  getWorkoutPlansByTag(tag: string, page = 0, size = 10): Observable<PageResponse<WorkoutPlan>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<WorkoutPlan>>(`${this.apiUrl}/tag/${tag}`, {params});
  }


  searchWorkoutPlans(keyword: string, page = 0, size = 10): Observable<PageResponse<WorkoutPlan>> {
    let params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<WorkoutPlan>>(`${this.apiUrl}/search`, {params});
  }


  getTopRatedWorkoutPlans(page = 0, size = 10): Observable<PageResponse<WorkoutPlan>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<WorkoutPlan>>(`${this.apiUrl}/top-rated`, {params});
  }


  getMostPopularWorkoutPlans(page = 0, size = 10): Observable<PageResponse<WorkoutPlan>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<WorkoutPlan>>(`${this.apiUrl}/most-popular`, {params});
  }


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

    return this.http.get<PageResponse<WorkoutPlan>>(`${this.apiUrl}/recommended`, {params});
  }


  getMyWorkoutPlans(page = 0, size = 10): Observable<PageResponse<WorkoutPlan>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<WorkoutPlan>>(`${this.apiUrl}/my`, {params});
  }


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

    return this.http.get<PageResponse<WorkoutPlanRating>>(`${this.apiUrl}/${planId}/ratings`, {params});
  }


  rateWorkoutPlan(planId: number, rating: number, comment: string): Observable<WorkoutPlanRating> {
    return this.http.post<WorkoutPlanRating>(`${this.apiUrl}/${planId}/ratings`, {rating, comment});
  }


  updateWorkoutPlanRating(planId: number, rating: number, comment: string): Observable<WorkoutPlanRating> {
    return this.http.put<WorkoutPlanRating>(`${this.apiUrl}/${planId}/ratings`, {rating, comment});
  }


  deleteWorkoutPlanRating(planId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${planId}/ratings`);
  }


  hasRatedWorkoutPlan(planId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${planId}/ratings/has-rated`);
  }


  getMyWorkoutPlanRating(planId: number): Observable<WorkoutPlanRating> {
    return this.http.get<WorkoutPlanRating>(`${this.apiUrl}/${planId}/ratings/me`);
  }


  joinWorkoutPlan(workoutPlanId: number): Observable<UserWorkoutPlan> {
    const request: JoinWorkoutPlanRequest = {workoutPlanId};
    return this.http.post<UserWorkoutPlan>(`${this.userPlansUrl}/join`, request);
  }


  updateWorkoutPlanProgress(userPlanId: number, progress: WorkoutPlanProgress): Observable<UserWorkoutPlan> {
    return this.http.put<UserWorkoutPlan>(`${this.userPlansUrl}/${userPlanId}`, progress);
  }


  abandonWorkoutPlan(userPlanId: number): Observable<any> {

    const options = {
      responseType: 'text' as 'json',
      headers: new HttpHeaders({
        'Accept': 'text/plain, */*'
      })
    };

    return this.http.delete<any>(`${this.userPlansUrl}/${userPlanId}`, options)
      .pipe(
        map(response => {

          if (typeof response === 'string') {
            return {message: response};
          }
          return response;
        }),
        catchError(error => {

          if (error.status === 200 && error.error instanceof SyntaxError) {

            return of({message: 'Plan treningowy został porzucony'});
          }
          return throwError(() => error);
        })
      );
  }


  getUserWorkoutPlan(userPlanId: number): Observable<UserWorkoutPlan> {
    return this.http.get<UserWorkoutPlan>(`${this.userPlansUrl}/${userPlanId}`);
  }


  getUserWorkoutPlans(page = 0, size = 10): Observable<PageResponse<UserWorkoutPlan>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<UserWorkoutPlan>>(`${this.userPlansUrl}`, {params});
  }


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


  getDifficultyName(level: DifficultyLevel): string {
    const names = {
      [DifficultyLevel.BEGINNER]: 'Początkujący',
      [DifficultyLevel.INTERMEDIATE]: 'Średniozaawansowany',
      [DifficultyLevel.ADVANCED]: 'Zaawansowany'
    };
    return names[level];
  }


  getAllWorkoutGoals(): WorkoutGoal[] {
    return Object.values(WorkoutGoal);
  }
}
