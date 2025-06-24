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
import {MatPaginatorIntl, MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTabsModule} from '@angular/material/tabs';
import {MatSnackBarModule, MatSnackBar} from '@angular/material/snack-bar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatRippleModule} from '@angular/material/core';
import {MatExpansionModule} from '@angular/material/expansion';

import {WorkoutPlanService} from '../../../core/services/workout-plan.service';
import {
  WorkoutPlan,
  WorkoutGoal
} from '../../../models/workout-plan.model';
import {PageResponse, DifficultyLevel} from '../../../models/exercise.model';
import {WorkoutPlanCardComponent} from '../workout-plan-card/workout-plan-card.component';
import {AuthService} from '../../../core/services/auth.service';
import {PolishPaginatorIntl} from '../../exercises/exercise-history-table/exercise-history-table.component';


export interface FilterOptions {
  goal: WorkoutGoal | '';
  difficultyLevel: DifficultyLevel | '';
  author: number | null;
  sortBy: SortOption;
  maxFrequency: number | null;
}

export enum SortOption {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  HIGHEST_RATED = 'highest_rated',
  MOST_POPULAR = 'most_popular',
  MY_PLANS = 'my_plans'
}

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
    MatExpansionModule,
    WorkoutPlanCardComponent
  ],
  templateUrl: './workout-plan-list.component.html',
  styleUrls: ['./workout-plan-list.component.scss'],
  providers: [
    {provide: MatPaginatorIntl, useClass: PolishPaginatorIntl}
  ]
})
export class WorkoutPlanListComponent implements OnInit {

  workoutPlans: WorkoutPlan[] = [];
  loading = false;
  totalItems = 0;


  currentPage = 0;
  pageSize = 12;
  sortField = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  filterPanelOpen = false;


  searchKeyword = '';


  activeTab = 0;


  filterOptions: FilterOptions = {
    goal: '',
    difficultyLevel: '',
    author: null,
    sortBy: SortOption.NEWEST,
    maxFrequency: null
  };


  workoutGoals: WorkoutGoal[] = [];
  difficultyLevels: DifficultyLevel[] = [];


  authors: { id: number, username: string }[] = [];


  sortOptions = [
    {value: SortOption.NEWEST, label: 'Najnowsze'},
    {value: SortOption.OLDEST, label: 'Najstarsze'},
    {value: SortOption.HIGHEST_RATED, label: 'Najwyżej oceniane'},
    {value: SortOption.MOST_POPULAR, label: 'Najpopularniejsze'},
    {value: SortOption.MY_PLANS, label: 'Moje plany'}
  ];

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


    this.loadAuthors();


    this.loadWorkoutPlans();
  }


  loadAuthors(): void {


    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.authors = [
          {
            id: user.id,
            username: user.username + ' (Ja)'
          }
        ];
      }
    });
  }


  loadWorkoutPlans(): void {
    this.loading = true;

    let request$: Observable<PageResponse<WorkoutPlan>>;


    if (this.activeTab === 1) {

      request$ = this.workoutPlanService.getMostPopularWorkoutPlans(
        this.currentPage, this.pageSize
      );
    } else if (this.activeTab === 2) {

      request$ = this.workoutPlanService.getTopRatedWorkoutPlans(
        this.currentPage, this.pageSize
      );
    } else if (this.activeTab === 3) {

      request$ = this.workoutPlanService.getMyWorkoutPlans(
        this.currentPage, this.pageSize
      );
    } else if (this.searchKeyword) {

      request$ = this.workoutPlanService.searchWorkoutPlans(
        this.searchKeyword, this.currentPage, this.pageSize
      );
    } else if (this.filterOptions.goal) {

      request$ = this.workoutPlanService.getWorkoutPlansByGoal(
        this.filterOptions.goal as WorkoutGoal, this.currentPage, this.pageSize
      );
    } else if (this.filterOptions.difficultyLevel) {

      request$ = this.workoutPlanService.getWorkoutPlansByDifficulty(
        this.filterOptions.difficultyLevel as DifficultyLevel, this.currentPage, this.pageSize
      );
    } else if (this.filterOptions.maxFrequency) {

      request$ = this.workoutPlanService.getRecommendedWorkoutPlans(
        this.filterOptions.maxFrequency,
        this.filterOptions.difficultyLevel as DifficultyLevel || undefined,
        this.currentPage,
        this.pageSize
      );
    } else {

      const sortField = this.getSortField();
      const sortDirection = this.getSortDirection();
      request$ = this.workoutPlanService.getWorkoutPlans(
        this.currentPage, this.pageSize, sortField, sortDirection
      );
    }

    request$.subscribe({
      next: (response) => {
        this.workoutPlans = response.content;
        this.totalItems = response.totalElements;
        this.loading = false;


        if (this.filterOptions.author !== null) {
          this.filterByAuthor();
        }
      },
      error: (error) => {
        console.error('Błąd podczas ładowania planów treningowych:', error);
        this.snackBar.open('Nie udało się załadować planów treningowych', 'OK', {duration: 3000});
        this.loading = false;
      }
    });
  }


  filterByAuthor(): void {
    if (this.filterOptions.author !== null) {
      this.workoutPlans = this.workoutPlans.filter(
        plan => plan.author?.id === this.filterOptions.author
      );


      this.totalItems = this.workoutPlans.length;
    }
  }


  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadWorkoutPlans();
  }


  onTabChange(index: number): void {
    this.activeTab = index;
    this.currentPage = 0;
    this.loadWorkoutPlans();
  }


  applyFilters(): void {
    this.currentPage = 0;
    this.loadWorkoutPlans();
  }


  clearFilters(): void {
    this.searchKeyword = '';
    this.filterOptions = {
      goal: '',
      difficultyLevel: '',
      author: null,
      sortBy: SortOption.NEWEST,
      maxFrequency: null
    };
    this.currentPage = 0;
    this.loadWorkoutPlans();
  }


  hasActiveFilters(): boolean {
    return !!(
      this.searchKeyword ||
      this.filterOptions.goal ||
      this.filterOptions.difficultyLevel ||
      this.filterOptions.author !== null ||
      this.filterOptions.maxFrequency ||
      this.activeTab !== 0
    );
  }


  getSortField(): string {
    switch (this.filterOptions.sortBy) {
      case SortOption.NEWEST:
        return 'createdAt';
      case SortOption.OLDEST:
        return 'createdAt';
      case SortOption.HIGHEST_RATED:
        return 'averageRating';
      case SortOption.MOST_POPULAR:
        return 'participantsCount';
      default:
        return 'name';
    }
  }

  getSortDirection(): 'asc' | 'desc' {
    switch (this.filterOptions.sortBy) {
      case SortOption.NEWEST:
        return 'desc';
      case SortOption.OLDEST:
        return 'asc';
      case SortOption.HIGHEST_RATED:
        return 'desc';
      case SortOption.MOST_POPULAR:
        return 'desc';
      default:
        return 'asc';
    }
  }


  viewWorkoutPlanDetails(planId: number): void {
    this.router.navigate(['/workout-plans', planId]);
  }

  createNewWorkoutPlan(): void {
    this.router.navigate(['/workout-plans/create']);
  }


  getGoalName(goal: WorkoutGoal): string {
    return this.workoutPlanService.getGoalName(goal);
  }

  getDifficultyName(level: DifficultyLevel): string {
    return this.workoutPlanService.getDifficultyName(level);
  }
}
