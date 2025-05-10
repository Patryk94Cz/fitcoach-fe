// src/app/features/workout-plans/workout-plan-list/workout-plan-list.component.ts
import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Observable} from 'rxjs';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatChipsModule} from '@angular/material/chips';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTabsModule} from '@angular/material/tabs';
import {MatSnackBarModule, MatSnackBar} from '@angular/material/snack-bar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatRippleModule} from '@angular/material/core';

import {WorkoutPlanService} from '../../../core/services/workout-plan.service';
import {
  WorkoutPlan,
  WorkoutGoal
} from '../../../models/workout-plan.model';
import {PageResponse, DifficultyLevel} from '../../../models/exercise.model';
import {WorkoutPlanCardComponent} from '../workout-plan-card/workout-plan-card.component';
import {AuthService} from '../../../core/services/auth.service';

@Component({
  selector: 'app-workout-plan-list',
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
    WorkoutPlanCardComponent
  ],
  templateUrl: './workout-plan-list.component.html',
  styleUrls: ['./workout-plan-list.component.scss']
})
export class WorkoutPlanListComponent implements OnInit {
  // Dane planów treningowych
  workoutPlans: WorkoutPlan[] = [];
  loading = false;
  totalItems = 0;

  // Parametry filtrowania i paginacji
  currentPage = 0;
  pageSize = 12;
  sortField = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Aktywne filtry
  selectedGoal: WorkoutGoal | null = null;
  selectedDifficultyLevel: DifficultyLevel | null = null;
  searchKeyword = '';
  activeTab = 0; // 0 = wszystkie, 1 = popularne, 2 = top oceniane, 3 = moje

  // Listy wartości dla filtrów
  workoutGoals: WorkoutGoal[] = [];
  difficultyLevels: DifficultyLevel[] = [];

  // Maksymalne treningi tygodniowo dla filtra rekomendacji
  maxFrequencyPerWeek: number | null = null;
  showRecommendedFilter = false;

  constructor(
    private workoutPlanService: WorkoutPlanService,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.workoutGoals = this.workoutPlanService.getAllWorkoutGoals();
    this.difficultyLevels = [
      DifficultyLevel.BEGINNER,
      DifficultyLevel.INTERMEDIATE,
      DifficultyLevel.ADVANCED
    ];
    this.loadWorkoutPlans();
  }

  // Metoda do ładowania planów treningowych w zależności od aktywnych filtrów
  loadWorkoutPlans(): void {
    this.loading = true;

    let request$: Observable<PageResponse<WorkoutPlan>>;

    // Wybór odpowiedniej metody w zależności od aktywnych filtrów i zakładki
    if (this.activeTab === 1) {
      // Popularne plany
      request$ = this.workoutPlanService.getMostPopularWorkoutPlans(
        this.currentPage, this.pageSize
      );
    } else if (this.activeTab === 2) {
      // Top oceniane plany
      request$ = this.workoutPlanService.getTopRatedWorkoutPlans(
        this.currentPage, this.pageSize
      );
    } else if (this.activeTab === 3) {
      // Moje plany
      request$ = this.workoutPlanService.getMyWorkoutPlans(
        this.currentPage, this.pageSize
      );
    } else if (this.showRecommendedFilter && this.maxFrequencyPerWeek) {
      // Rekomendowane plany
      request$ = this.workoutPlanService.getRecommendedWorkoutPlans(
        this.maxFrequencyPerWeek,
        this.selectedDifficultyLevel || undefined,
        this.currentPage,
        this.pageSize
      );
    } else if (this.searchKeyword) {
      // Wyszukiwanie
      request$ = this.workoutPlanService.searchWorkoutPlans(
        this.searchKeyword, this.currentPage, this.pageSize
      );
    } else if (this.selectedGoal) {
      // Filtrowanie po celu
      request$ = this.workoutPlanService.getWorkoutPlansByGoal(
        this.selectedGoal, this.currentPage, this.pageSize
      );
    } else if (this.selectedDifficultyLevel) {
      // Filtrowanie po poziomie trudności
      request$ = this.workoutPlanService.getWorkoutPlansByDifficulty(
        this.selectedDifficultyLevel, this.currentPage, this.pageSize
      );
    } else {
      // Domyślne ładowanie wszystkich planów
      request$ = this.workoutPlanService.getWorkoutPlans(
        this.currentPage, this.pageSize, this.sortField, this.sortDirection
      );
    }

    request$.subscribe({
      next: (response) => {
        this.workoutPlans = response.content;
        this.totalItems = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Błąd podczas ładowania planów treningowych:', error);
        this.snackBar.open('Nie udało się załadować planów treningowych', 'OK', {duration: 3000});
        this.loading = false;
      }
    });
  }

  // Obsługa zmiany strony w paginacji
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadWorkoutPlans();
  }

  // Obsługa zmiany zakładki
  onTabChange(index: number): void {
    this.activeTab = index;
    this.currentPage = 0; // Reset do pierwszej strony
    this.clearFilters(false); // Czyszczenie filtrów, ale bez przeładowania
    this.loadWorkoutPlans();
  }

  // Czyszczenie wszystkich filtrów
  clearFilters(reload = true): void {
    this.selectedGoal = null;
    this.selectedDifficultyLevel = null;
    this.searchKeyword = '';
    this.maxFrequencyPerWeek = null;
    this.showRecommendedFilter = false;
    this.currentPage = 0;

    if (reload) {
      this.loadWorkoutPlans();
    }
  }

  // Obsługa wyszukiwania
  onSearch(): void {
    this.currentPage = 0; // Reset do pierwszej strony
    this.selectedGoal = null; // Czyszczenie innych filtrów
    this.selectedDifficultyLevel = null;
    this.maxFrequencyPerWeek = null;
    this.showRecommendedFilter = false;
    this.loadWorkoutPlans();
  }

  // Filtrowanie po celu treningu
  filterByGoal(goal: WorkoutGoal): void {
    this.selectedGoal = goal;
    this.selectedDifficultyLevel = null; // Czyścimy inne filtry
    this.maxFrequencyPerWeek = null;
    this.showRecommendedFilter = false;
    this.currentPage = 0;
    this.loadWorkoutPlans();
  }

  // Filtrowanie po poziomie trudności
  filterByDifficulty(level: DifficultyLevel): void {
    this.selectedDifficultyLevel = level;
    this.selectedGoal = null; // Czyścimy inne filtry
    this.currentPage = 0;
    this.loadWorkoutPlans();
  }

  // Filtrowanie planów rekomendowanych
  toggleRecommendedFilter(): void {
    this.showRecommendedFilter = !this.showRecommendedFilter;

    if (!this.showRecommendedFilter) {
      this.maxFrequencyPerWeek = null;
      this.loadWorkoutPlans();
    }
  }

  // Zastosowanie filtra rekomendacji
  applyRecommendedFilter(): void {
    if (this.maxFrequencyPerWeek) {
      this.currentPage = 0;
      this.loadWorkoutPlans();
    }
  }

  // Formatowanie nazw z enum do przyjaznych nazw
  getGoalName(goal: WorkoutGoal): string {
    return this.workoutPlanService.getGoalName(goal);
  }

  getDifficultyName(level: DifficultyLevel): string {
    return this.workoutPlanService.getDifficultyName(level);
  }

  // Nawigacja do szczegółów planu
  viewWorkoutPlanDetails(planId: number): void {
    this.router.navigate(['/workout-plans', planId]);
  }

  // Nawigacja do ekranu tworzenia nowego planu
  createNewWorkoutPlan(): void {
    this.router.navigate(['/workout-plans/create']);
  }
}
