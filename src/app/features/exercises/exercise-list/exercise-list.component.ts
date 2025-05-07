// src/app/features/exercises/exercise-list/exercise-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';

import { ExerciseService } from '../../../core/services/exercise.service';
import {
  Exercise,
  MuscleGroup,
  DifficultyLevel,
  PageResponse
} from '../../../models/exercise.model';
import { ExerciseCardComponent } from '../exercise-card/exercise-card.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-exercise-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatRippleModule,
    ExerciseCardComponent
  ],
  templateUrl: './exercise-list.component.html',
  styleUrls: ['./exercise-list.component.scss']
})
export class ExerciseListComponent implements OnInit {
  // Dane ćwiczeń
  exercises: Exercise[] = [];
  loading = false;
  totalItems = 0;

  // Parametry filtrowania i paginacji
  currentPage = 0;
  pageSize = 12;
  sortField = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Aktywne filtry
  selectedMuscleGroup: MuscleGroup | null = null;
  selectedDifficultyLevel: DifficultyLevel | null = null;
  searchKeyword = '';
  activeTab = 0; // 0 = wszystkie, 1 = top, 2 = moje

  // Listy wartości dla filtrów
  muscleGroups: MuscleGroup[] = [];
  difficultyLevels: DifficultyLevel[] = [];

  constructor(
    private exerciseService: ExerciseService,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.muscleGroups = this.exerciseService.getAllMuscleGroups();
    this.difficultyLevels = this.exerciseService.getAllDifficultyLevels();
    this.loadExercises();
  }

  // Metoda do ładowania ćwiczeń w zależności od aktywnych filtrów
  loadExercises(): void {
    this.loading = true;

    let request$: Observable<PageResponse<Exercise>>;

    // Wybór odpowiedniej metody w zależności od aktywnych filtrów i zakładki
    if (this.activeTab === 1) {
      // Top oceniane ćwiczenia
      request$ = this.exerciseService.getTopRatedExercises(this.currentPage, this.pageSize);
    } else if (this.activeTab === 2) {
      // Moje ćwiczenia
      request$ = this.exerciseService.getMyExercises(this.currentPage, this.pageSize);
    } else if (this.searchKeyword) {
      // Wyszukiwanie
      request$ = this.exerciseService.searchExercises(
        this.searchKeyword, this.currentPage, this.pageSize
      );
    } else if (this.selectedMuscleGroup) {
      // Filtrowanie po grupie mięśniowej
      request$ = this.exerciseService.getExercisesByMuscleGroup(
        this.selectedMuscleGroup, this.currentPage, this.pageSize
      );
    } else if (this.selectedDifficultyLevel) {
      // Filtrowanie po poziomie trudności
      request$ = this.exerciseService.getExercisesByDifficulty(
        this.selectedDifficultyLevel, this.currentPage, this.pageSize
      );
    } else {
      // Domyślne ładowanie wszystkich ćwiczeń
      request$ = this.exerciseService.getExercises(
        this.currentPage, this.pageSize, this.sortField, this.sortDirection
      );
    }


    request$.subscribe({
      next: (response) => {
        this.exercises = response.content;
        this.totalItems = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Błąd podczas ładowania ćwiczeń:', error);
        this.snackBar.open('Nie udało się załadować ćwiczeń', 'OK', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  // Obsługa zmiany strony w paginacji
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadExercises();
  }

  // Obsługa zmiany zakładki (wszystkie/top/moje)
  onTabChange(index: number): void {
    this.activeTab = index;
    this.currentPage = 0; // Reset do pierwszej strony
    this.loadExercises();
  }

  // Czyszczenie wszystkich filtrów
  clearFilters(): void {
    this.selectedMuscleGroup = null;
    this.selectedDifficultyLevel = null;
    this.searchKeyword = '';
    this.currentPage = 0;
    this.loadExercises();
  }

  // Obsługa wyszukiwania
  onSearch(): void {
    this.currentPage = 0; // Reset do pierwszej strony
    this.loadExercises();
  }

  // Filtrowanie po grupie mięśniowej
  filterByMuscleGroup(muscleGroup: MuscleGroup): void {
    this.selectedMuscleGroup = muscleGroup;
    this.selectedDifficultyLevel = null; // Czyścimy inne filtry
    this.currentPage = 0;
    this.loadExercises();
  }

  // Filtrowanie po poziomie trudności
  filterByDifficulty(level: DifficultyLevel): void {
    this.selectedDifficultyLevel = level;
    this.selectedMuscleGroup = null; // Czyścimy inne filtry
    this.currentPage = 0;
    this.loadExercises();
  }

  // Formatowanie nazw z enum do przyjaznych nazw
  getMuscleGroupName(muscleGroup: MuscleGroup): string {
    return this.exerciseService.getMuscleGroupName(muscleGroup);
  }

  getDifficultyName(level: DifficultyLevel): string {
    return this.exerciseService.getDifficultyName(level);
  }

  // Nawigacja do szczegółów ćwiczenia
  viewExerciseDetails(exerciseId: number): void {
    this.router.navigate(['/exercises', exerciseId]);
  }

  // Nawigacja do ekranu tworzenia nowego ćwiczenia
  createNewExercise(): void {
    this.router.navigate(['/exercises/create']);
  }
}
