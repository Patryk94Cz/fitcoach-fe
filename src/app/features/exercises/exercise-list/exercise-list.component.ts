// src/app/features/exercises/exercise-list/exercise-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Observable, startWith, map, combineLatest } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {MatPaginatorIntl, MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';

import { ExerciseService } from '../../../core/services/exercise.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  Exercise,
  MuscleGroup,
  DifficultyLevel,
  PageResponse
} from '../../../models/exercise.model';
import { ExerciseCardComponent } from '../exercise-card/exercise-card.component';
import { User } from '../../../models/user.model';
import {PolishPaginatorIntl} from '../exercise-history-table/exercise-history-table.component';

// Filter and sort options
export interface FilterOptions {
  muscleGroup: MuscleGroup | '';
  difficultyLevel: DifficultyLevel | '';
  author: number | null;
  sortBy: SortOption;
}

export enum SortOption {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  HIGHEST_RATED = 'highest_rated',
  MOST_POPULAR = 'most_popular',
  MY_EXERCISES = 'my_exercises',
  FAVORITES = 'favorites'
}

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
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule,
    MatBadgeModule,
    MatExpansionModule,
    MatDividerModule,
    ExerciseCardComponent
  ],
  templateUrl: './exercise-list.component.html',
  styleUrls: ['./exercise-list.component.scss'],
  providers: [
    { provide: MatPaginatorIntl, useClass: PolishPaginatorIntl }
  ]
})
export class ExerciseListComponent implements OnInit {
  // Exercises data
  exercises: Exercise[] = [];
  loading = false;
  totalItems = 0;

  // Pagination parameters
  currentPage = 0;
  pageSize = 12;

  // Filter and search
  searchKeyword = '';
  filterPanelOpen = false;
  filterOptions: FilterOptions = {
    muscleGroup: '',
    difficultyLevel: '',
    author: null,
    sortBy: SortOption.NEWEST
  };

  // Dropdown options
  muscleGroups = Object.values(MuscleGroup);
  difficultyLevels = Object.values(DifficultyLevel);
  sortOptions = [
    { value: SortOption.NEWEST, label: 'Najnowsze' },
    { value: SortOption.OLDEST, label: 'Najstarsze' },
    { value: SortOption.HIGHEST_RATED, label: 'Najwyżej oceniane' },
    { value: SortOption.MOST_POPULAR, label: 'Najpopularniejsze' },
    { value: SortOption.MY_EXERCISES, label: 'Moje ćwiczenia' },
    { value: SortOption.FAVORITES, label: 'Ulubione' }
  ];

  // Authors list for filtering
  authors: { id: number, username: string }[] = [];
  currentUser: User | null = null;

  // Favorites
  favoriteExercises: Set<number> = new Set();

  constructor(
    private exerciseService: ExerciseService,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;

      // Add current user to authors list if logged in
      if (user) {
        this.ensureCurrentUserInAuthors();
      }
    });

    // Initialize from localStorage
    this.loadFavoritesFromStorage();

    // Load exercises with initial filters
    this.loadExercises();

    // Load authors for filter
    this.loadAuthors();
  }

  // Load authors for the filter dropdown
  loadAuthors(): void {
    // This would typically come from an API call
    // For now, we'll use dummy data and ensure current user is included
    this.exerciseService.getExercises(0, 1000).subscribe({
      next: (response) => {
        // Extract unique authors from exercises
        const authorMap = new Map<number, string>();

        response.content.forEach(exercise => {
          if (exercise.author) {
            authorMap.set(exercise.author.id, exercise.author.username);
          }
        });

        // Convert to array for dropdown
        this.authors = Array.from(authorMap.entries()).map(([id, username]) => ({
          id,
          username
        }));

        // Ensure current user is in the list
        this.ensureCurrentUserInAuthors();
      }
    });
  }

  // Make sure current user is at the top of authors list
  ensureCurrentUserInAuthors(): void {
    if (!this.currentUser) return;

    // Remove current user if present
    this.authors = this.authors.filter(author => author.id !== this.currentUser?.id);

    // Add current user to the front of the array
    this.authors.unshift({
      id: this.currentUser.id,
      username: this.currentUser.username + ' (Ja)'
    });
  }

  // Load exercises with current filters
  loadExercises(): void {
    this.loading = true;

    // Determine which API method to call based on filters
    if (this.filterOptions.sortBy === SortOption.HIGHEST_RATED) {
      this.loadTopRatedExercises();
    } else if (this.filterOptions.sortBy === SortOption.MY_EXERCISES) {
      this.loadMyExercises();
    } else if (this.filterOptions.sortBy === SortOption.FAVORITES) {
      this.loadFavoriteExercises();
    } else if (this.searchKeyword) {
      this.searchExercises();
    } else if (this.filterOptions.muscleGroup) {
      this.loadExercisesByMuscleGroup();
    } else if (this.filterOptions.difficultyLevel) {
      this.loadExercisesByDifficulty();
    } else if (this.filterOptions.author !== null) {
      this.loadExercisesByAuthor();
    } else {
      // Default load with sorting options
      const sortField = this.getSortField();
      const sortDirection = this.getSortDirection();
      this.loadAllExercises(sortField, sortDirection);
    }
  }

  // Helper to get sort field based on sort option
  getSortField(): string {
    switch (this.filterOptions.sortBy) {
      case SortOption.NEWEST:
        return 'createdAt';
      case SortOption.OLDEST:
        return 'createdAt';
      default:
        return 'name';
    }
  }

  // Helper to get sort direction based on sort option
  getSortDirection(): 'asc' | 'desc' {
    switch (this.filterOptions.sortBy) {
      case SortOption.NEWEST:
        return 'desc';
      case SortOption.OLDEST:
        return 'asc';
      default:
        return 'asc';
    }
  }

  // Load all exercises with sorting
  loadAllExercises(sortField: string, sortDirection: 'asc' | 'desc'): void {
    this.exerciseService.getExercises(
      this.currentPage,
      this.pageSize,
      sortField,
      sortDirection
    ).subscribe(this.handleExercisesResponse.bind(this));
  }

  // Load top rated exercises
  loadTopRatedExercises(): void {
    this.exerciseService.getTopRatedExercises(
      this.currentPage,
      this.pageSize
    ).subscribe(this.handleExercisesResponse.bind(this));
  }

  // Load user's exercises
  loadMyExercises(): void {
    this.exerciseService.getMyExercises(
      this.currentPage,
      this.pageSize
    ).subscribe(this.handleExercisesResponse.bind(this));
  }

  // Load exercises by muscle group
  loadExercisesByMuscleGroup(): void {
    if (!this.filterOptions.muscleGroup) return;

    this.exerciseService.getExercisesByMuscleGroup(
      this.filterOptions.muscleGroup as MuscleGroup,
      this.currentPage,
      this.pageSize
    ).subscribe(this.handleExercisesResponse.bind(this));
  }

  // Load exercises by difficulty
  loadExercisesByDifficulty(): void {
    if (!this.filterOptions.difficultyLevel) return;

    this.exerciseService.getExercisesByDifficulty(
      this.filterOptions.difficultyLevel as DifficultyLevel,
      this.currentPage,
      this.pageSize
    ).subscribe(this.handleExercisesResponse.bind(this));
  }

  // Load exercises by author
  loadExercisesByAuthor(): void {
    // This would need a backend API endpoint
    // For now, we'll filter client-side on dummy data
    this.exerciseService.getExercises(
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (response) => {
        // Client-side filtering by author
        if (this.filterOptions.author !== null) {
          const filteredContent = response.content.filter(
            exercise => exercise.author?.id === this.filterOptions.author
          );

          // Create a modified response
          const filteredResponse: PageResponse<Exercise> = {
            ...response,
            content: filteredContent,
            totalElements: filteredContent.length
          };

          this.handleExercisesResponse(filteredResponse);
        } else {
          this.handleExercisesResponse(response);
        }
      },
      error: this.handleExercisesError.bind(this)
    });
  }

  // Load favorite exercises
  loadFavoriteExercises(): void {
    // This would typically be an API call to get user's favorites
    // For now, we'll filter client-side using localStorage favorites
    this.exerciseService.getExercises(0, 1000).subscribe({
      next: (response) => {
        // Client-side filtering of favorites
        const filteredContent = response.content.filter(
          exercise => exercise.id && this.favoriteExercises.has(exercise.id)
        );

        // Create a modified response with pagination
        const startIndex = this.currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pagedContent = filteredContent.slice(startIndex, endIndex);

        const filteredResponse: PageResponse<Exercise> = {
          ...response,
          content: pagedContent,
          totalElements: filteredContent.length
        };

        this.handleExercisesResponse(filteredResponse);
      },
      error: this.handleExercisesError.bind(this)
    });
  }

  // Search exercises
  searchExercises(): void {
    this.exerciseService.searchExercises(
      this.searchKeyword,
      this.currentPage,
      this.pageSize
    ).subscribe(this.handleExercisesResponse.bind(this));
  }

  // Handle successful exercises response
  handleExercisesResponse(response: PageResponse<Exercise>): void {
    this.exercises = response.content;
    this.totalItems = response.totalElements;
    this.loading = false;
  }

  // Handle exercise loading error
  handleExercisesError(error: any): void {
    console.error('Error loading exercises:', error);
    this.snackBar.open('Nie udało się załadować ćwiczeń', 'OK', { duration: 3000 });
    this.exercises = [];
    this.loading = false;
  }

  // Apply filters and reload exercises
  applyFilters(): void {
    this.currentPage = 0; // Reset to first page
    this.loadExercises();
  }

  // Clear all filters
  clearFilters(): void {
    this.searchKeyword = '';
    this.filterOptions = {
      muscleGroup: '',
      difficultyLevel: '',
      author: null,
      sortBy: SortOption.NEWEST
    };
    this.currentPage = 0;
    this.loadExercises();
  }

  // Handle page change event
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadExercises();
  }

  // Navigate to exercise details
  viewExerciseDetails(exerciseId: number): void {
    this.router.navigate(['/exercises', exerciseId]);
  }

  // Navigate to create new exercise
  createNewExercise(): void {
    this.router.navigate(['/exercises/create']);
  }

  // Toggle exercise as favorite
  toggleFavorite(exerciseId: number, event: Event): void {
    event.stopPropagation(); // Prevent card click navigation

    if (this.favoriteExercises.has(exerciseId)) {
      this.favoriteExercises.delete(exerciseId);
    } else {
      this.favoriteExercises.add(exerciseId);
    }

    // Save to localStorage
    this.saveFavoritesToStorage();

    // Reload if on favorites view
    if (this.filterOptions.sortBy === SortOption.FAVORITES) {
      this.loadExercises();
    }
  }

  // Check if exercise is favorite
  isFavorite(exerciseId: number | undefined): boolean {
    return exerciseId !== undefined && this.favoriteExercises.has(exerciseId);
  }

  // Save favorites to localStorage
  saveFavoritesToStorage(): void {
    localStorage.setItem('favoriteExercises', JSON.stringify(Array.from(this.favoriteExercises)));
  }

  // Load favorites from localStorage
  loadFavoritesFromStorage(): void {
    const storedFavorites = localStorage.getItem('favoriteExercises');
    if (storedFavorites) {
      this.favoriteExercises = new Set(JSON.parse(storedFavorites));
    }
  }

  // Helper methods for template
  getMuscleGroupName(muscleGroup: string): string {
    return this.exerciseService.getMuscleGroupName(muscleGroup as any);
  }

  getDifficultyName(level: string): string {
    return this.exerciseService.getDifficultyName(level as any);
  }
}
