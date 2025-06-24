// src/app/core/services/exercise.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Exercise,
  ExerciseRating,
  MuscleGroup,
  DifficultyLevel,
  PageResponse,
  RatingRequest
} from '../../models/exercise.model';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private apiUrl = `${environment.apiUrl}/exercises`;

  constructor(private http: HttpClient) { }

  getExercises(page = 0, size = 10, sortBy = 'name', sortDir: 'asc' | 'desc' = 'asc'): Observable<PageResponse<Exercise>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<PageResponse<Exercise>>(this.apiUrl, { params });
  }

  getExerciseById(id: number): Observable<Exercise> {
    return this.http.get<Exercise>(`${this.apiUrl}/${id}`);
  }

  createExercise(exercise: Exercise): Observable<Exercise> {
    return this.http.post<Exercise>(this.apiUrl, exercise);
  }

  updateExercise(id: number, exercise: Exercise): Observable<Exercise> {
    return this.http.put<Exercise>(`${this.apiUrl}/${id}`, exercise);
  }

  deleteExercise(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getExercisesByMuscleGroup(muscleGroup: MuscleGroup, page = 0, size = 10): Observable<PageResponse<Exercise>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<Exercise>>(`${this.apiUrl}/muscle/${muscleGroup}`, { params });
  }

  getExercisesByDifficulty(level: DifficultyLevel, page = 0, size = 10): Observable<PageResponse<Exercise>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<Exercise>>(`${this.apiUrl}/difficulty/${level}`, { params });
  }

  getExercisesByTag(tag: string, page = 0, size = 10): Observable<PageResponse<Exercise>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<Exercise>>(`${this.apiUrl}/tag/${tag}`, { params });
  }

  searchExercises(keyword: string, page = 0, size = 10): Observable<PageResponse<Exercise>> {
    let params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<Exercise>>(`${this.apiUrl}/search`, { params });
  }

  getTopRatedExercises(page = 0, size = 10): Observable<PageResponse<Exercise>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<Exercise>>(`${this.apiUrl}/top-rated`, { params });
  }

  getMyExercises(page = 0, size = 10): Observable<PageResponse<Exercise>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<Exercise>>(`${this.apiUrl}/my`, { params });
  }

  getExerciseRatings(exerciseId: number, page = 0, size = 10, sortBy = 'createdAt', sortDir: 'asc' | 'desc' = 'desc'): Observable<PageResponse<ExerciseRating>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<PageResponse<ExerciseRating>>(`${this.apiUrl}/${exerciseId}/ratings`, { params });
  }

  rateExercise(exerciseId: number, ratingRequest: RatingRequest): Observable<ExerciseRating> {
    return this.http.post<ExerciseRating>(`${this.apiUrl}/${exerciseId}/ratings`, ratingRequest);
  }

  updateRating(exerciseId: number, ratingRequest: RatingRequest): Observable<ExerciseRating> {
    return this.http.put<ExerciseRating>(`${this.apiUrl}/${exerciseId}/ratings`, ratingRequest);
  }

  deleteRating(exerciseId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${exerciseId}/ratings`);
  }

  hasRated(exerciseId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${exerciseId}/ratings/has-rated`);
  }

  getMyRating(exerciseId: number): Observable<ExerciseRating> {
    return this.http.get<ExerciseRating>(`${this.apiUrl}/${exerciseId}/ratings/me`);
  }

  getFavoriteExercises(exerciseIds: number[]): Observable<Exercise[]> {
    return new Observable<Exercise[]>(observer => {
      if (exerciseIds.length === 0) {
        observer.next([]);
        observer.complete();
        return;
      }

      let params = new HttpParams();
      exerciseIds.forEach(id => {
        params = params.append('ids', id.toString());
      });

      this.getExercises(0, 1000).subscribe({
        next: (response) => {
          const favorites = response.content.filter(exercise =>
            exercise.id && exerciseIds.includes(exercise.id)
          );
          observer.next(favorites);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        }
      });
    });
  }

  addToFavorites(exerciseId: number): Observable<boolean> {
    console.log(`Adding exercise ${exerciseId} to favorites (client-side only)`);
    return of(true);
  }

  removeFromFavorites(exerciseId: number): Observable<boolean> {
    console.log(`Removing exercise ${exerciseId} from favorites (client-side only)`);
    return of(true);
  }

  getMuscleGroupName(muscleGroup: MuscleGroup): string {
    const names = {
      [MuscleGroup.CHEST]: 'Klatka piersiowa',
      [MuscleGroup.BACK]: 'Plecy',
      [MuscleGroup.SHOULDERS]: 'Barki',
      [MuscleGroup.BICEPS]: 'Biceps',
      [MuscleGroup.TRICEPS]: 'Triceps',
      [MuscleGroup.LEGS]: 'Nogi',
      [MuscleGroup.CORE]: 'Brzuch',
      [MuscleGroup.GLUTES]: 'Pośladki',
      [MuscleGroup.CALVES]: 'Łydki',
      [MuscleGroup.FOREARMS]: 'Przedramiona',
      [MuscleGroup.FULL_BODY]: 'Całe ciało'
    };
    return names[muscleGroup];
  }

  getDifficultyName(level: DifficultyLevel): string {
    const names = {
      [DifficultyLevel.BEGINNER]: 'Początkujący',
      [DifficultyLevel.INTERMEDIATE]: 'Średniozaawansowany',
      [DifficultyLevel.ADVANCED]: 'Zaawansowany'
    };
    return names[level];
  }

  getRiskLevelName(level: string): string {
    const names: Record<string, string> = {
      'LOW': 'Niskie',
      'MEDIUM': 'Średnie',
      'HIGH': 'Wysokie'
    };
    return names[level] || level;
  }

  getAllMuscleGroups(): MuscleGroup[] {
    return Object.values(MuscleGroup);
  }

  getAllDifficultyLevels(): DifficultyLevel[] {
    return Object.values(DifficultyLevel);
  }
}
