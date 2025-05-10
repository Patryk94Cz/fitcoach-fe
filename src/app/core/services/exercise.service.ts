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

  // Pobieranie listy ćwiczeń z paginacją i sortowaniem
  getExercises(page = 0, size = 10, sortBy = 'name', sortDir: 'asc' | 'desc' = 'asc'): Observable<PageResponse<Exercise>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<PageResponse<Exercise>>(this.apiUrl, { params });
  }

  // Pobieranie szczegółów ćwiczenia
  getExerciseById(id: number): Observable<Exercise> {
    return this.http.get<Exercise>(`${this.apiUrl}/${id}`);
  }

  // Tworzenie nowego ćwiczenia
  createExercise(exercise: Exercise): Observable<Exercise> {
    return this.http.post<Exercise>(this.apiUrl, exercise);
  }

  // Aktualizacja ćwiczenia
  updateExercise(id: number, exercise: Exercise): Observable<Exercise> {
    return this.http.put<Exercise>(`${this.apiUrl}/${id}`, exercise);
  }

  // Usuwanie ćwiczenia
  deleteExercise(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Filtrowanie ćwiczeń po grupie mięśniowej
  getExercisesByMuscleGroup(muscleGroup: MuscleGroup, page = 0, size = 10): Observable<PageResponse<Exercise>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<Exercise>>(`${this.apiUrl}/muscle/${muscleGroup}`, { params });
  }

  // Filtrowanie ćwiczeń po poziomie trudności
  getExercisesByDifficulty(level: DifficultyLevel, page = 0, size = 10): Observable<PageResponse<Exercise>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<Exercise>>(`${this.apiUrl}/difficulty/${level}`, { params });
  }

  // Filtrowanie ćwiczeń po tagu
  getExercisesByTag(tag: string, page = 0, size = 10): Observable<PageResponse<Exercise>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<Exercise>>(`${this.apiUrl}/tag/${tag}`, { params });
  }

  // Wyszukiwanie ćwiczeń
  searchExercises(keyword: string, page = 0, size = 10): Observable<PageResponse<Exercise>> {
    let params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<Exercise>>(`${this.apiUrl}/search`, { params });
  }

  // Pobieranie najwyżej ocenianych ćwiczeń
  getTopRatedExercises(page = 0, size = 10): Observable<PageResponse<Exercise>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<Exercise>>(`${this.apiUrl}/top-rated`, { params });
  }

  // Pobieranie własnych ćwiczeń
  getMyExercises(page = 0, size = 10): Observable<PageResponse<Exercise>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<Exercise>>(`${this.apiUrl}/my`, { params });
  }

  // Pobieranie ocen dla ćwiczenia
  getExerciseRatings(exerciseId: number, page = 0, size = 10, sortBy = 'createdAt', sortDir: 'asc' | 'desc' = 'desc'): Observable<PageResponse<ExerciseRating>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<PageResponse<ExerciseRating>>(`${this.apiUrl}/${exerciseId}/ratings`, { params });
  }

  // Ocenianie ćwiczenia
  rateExercise(exerciseId: number, ratingRequest: RatingRequest): Observable<ExerciseRating> {
    return this.http.post<ExerciseRating>(`${this.apiUrl}/${exerciseId}/ratings`, ratingRequest);
  }

  // Aktualizacja oceny
  updateRating(exerciseId: number, ratingRequest: RatingRequest): Observable<ExerciseRating> {
    return this.http.put<ExerciseRating>(`${this.apiUrl}/${exerciseId}/ratings`, ratingRequest);
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
  getMyRating(exerciseId: number): Observable<ExerciseRating> {
    return this.http.get<ExerciseRating>(`${this.apiUrl}/${exerciseId}/ratings/me`);
  }

  // FAVORITES FUNCTIONALITY
  // Note: Since the backend doesn't have favorites API, we implement this client-side

  // Get favorite exercises - this would typically be a backend API call
  getFavoriteExercises(exerciseIds: number[]): Observable<Exercise[]> {
    // In a real implementation, this would call the backend
    // For now, we'll fetch all and filter client-side
    return new Observable<Exercise[]>(observer => {
      if (exerciseIds.length === 0) {
        observer.next([]);
        observer.complete();
        return;
      }

      // Create a params string with all IDs
      // In a real API, this might be a POST request with the IDs in the body
      let params = new HttpParams();
      exerciseIds.forEach(id => {
        params = params.append('ids', id.toString());
      });

      // For now, just get all exercises and filter them
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

  // Add to favorites - this would be an API call in a real implementation
  addToFavorites(exerciseId: number): Observable<boolean> {
    // This would be an API call in a real implementation
    console.log(`Adding exercise ${exerciseId} to favorites (client-side only)`);
    return of(true);
  }

  // Remove from favorites - this would be an API call in a real implementation
  removeFromFavorites(exerciseId: number): Observable<boolean> {
    // This would be an API call in a real implementation
    console.log(`Removing exercise ${exerciseId} from favorites (client-side only)`);
    return of(true);
  }

  // Pomocnicze metody do pracy z modelami

  // Konwersja MuscleGroup na przyjazną nazwę
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

  // Konwersja DifficultyLevel na przyjazną nazwę
  getDifficultyName(level: DifficultyLevel): string {
    const names = {
      [DifficultyLevel.BEGINNER]: 'Początkujący',
      [DifficultyLevel.INTERMEDIATE]: 'Średniozaawansowany',
      [DifficultyLevel.ADVANCED]: 'Zaawansowany'
    };
    return names[level];
  }

  // Konwersja RiskLevel na przyjazną nazwę
  getRiskLevelName(level: string): string {
    const names: Record<string, string> = {
      'LOW': 'Niskie',
      'MEDIUM': 'Średnie',
      'HIGH': 'Wysokie'
    };
    return names[level] || level;
  }

  // Pobranie listy wszystkich grup mięśniowych
  getAllMuscleGroups(): MuscleGroup[] {
    return Object.values(MuscleGroup);
  }

  // Pobranie listy poziomów trudności
  getAllDifficultyLevels(): DifficultyLevel[] {
    return Object.values(DifficultyLevel);
  }
}
