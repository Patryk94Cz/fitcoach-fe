import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {FormsModule, ReactiveFormsModule, FormControl} from '@angular/forms';
import {Observable, startWith, map, combineLatest} from 'rxjs';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatPaginatorIntl, MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatChipsModule} from '@angular/material/chips';
import {MatBadgeModule} from '@angular/material/badge';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatDividerModule} from '@angular/material/divider';

import {ExerciseService} from '../../../core/services/exercise.service';
import {AuthService} from '../../../core/services/auth.service';
import {
  Exercise,
  MuscleGroup,
  DifficultyLevel,
  PageResponse
} from '../../../models/exercise.model';
import {ExerciseCardComponent} from '../exercise-card/exercise-card.component';
import {User} from '../../../models/user.model';
import {PolishPaginatorIntl} from '../exercise-history-table/exercise-history-table.component';


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
    {provide: MatPaginatorIntl, useClass: PolishPaginatorIntl}
  ]
})
export class ExerciseListComponent implements OnInit {

  exercises: Exercise[] = [];
  loading = false;
  totalItems = 0;


  currentPage = 0;
  pageSize = 12;


  searchKeyword = '';
  filterPanelOpen = false;
  filterOptions: FilterOptions = {
    muscleGroup: '',
    difficultyLevel: '',
    author: null,
    sortBy: SortOption.NEWEST
  };


  muscleGroups = Object.values(MuscleGroup);
  difficultyLevels = Object.values(DifficultyLevel);
  sortOptions = [
    {value: SortOption.NEWEST, label: 'Najnowsze'},
    {value: SortOption.OLDEST, label: 'Najstarsze'},
    {value: SortOption.HIGHEST_RATED, label: 'Najwyżej oceniane'},
    {value: SortOption.MOST_POPULAR, label: 'Najpopularniejsze'},
    {value: SortOption.MY_EXERCISES, label: 'Moje ćwiczenia'},
    {value: SortOption.FAVORITES, label: 'Ulubione'}
  ];


  authors: { id: number, username: string }[] = [];
  currentUser: User | null = null;


  favoriteExercises: Set<number> = new Set();

  constructor(
    private exerciseService: ExerciseService,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
  }

  ngOnInit(): void {

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;


      if (user) {
        this.ensureCurrentUserInAuthors();
      }
    });


    this.loadFavoritesFromStorage();


    this.loadExercises();


    this.loadAuthors();
  }


  loadAuthors(): void {


    this.exerciseService.getExercises(0, 1000).subscribe({
      next: (response) => {

        const authorMap = new Map<number, string>();

        response.content.forEach(exercise => {
          if (exercise.author) {
            authorMap.set(exercise.author.id, exercise.author.username);
          }
        });


        this.authors = Array.from(authorMap.entries()).map(([id, username]) => ({
          id,
          username
        }));


        this.ensureCurrentUserInAuthors();
      }
    });
  }


  ensureCurrentUserInAuthors(): void {
    if (!this.currentUser) return;


    this.authors = this.authors.filter(author => author.id !== this.currentUser?.id);


    this.authors.unshift({
      id: this.currentUser.id,
      username: this.currentUser.username + ' (Ja)'
    });
  }


  loadExercises(): void {
    this.loading = true;


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

      const sortField = this.getSortField();
      const sortDirection = this.getSortDirection();
      this.loadAllExercises(sortField, sortDirection);
    }
  }


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


  loadAllExercises(sortField: string, sortDirection: 'asc' | 'desc'): void {
    this.exerciseService.getExercises(
      this.currentPage,
      this.pageSize,
      sortField,
      sortDirection
    ).subscribe(this.handleExercisesResponse.bind(this));
  }


  loadTopRatedExercises(): void {
    this.exerciseService.getTopRatedExercises(
      this.currentPage,
      this.pageSize
    ).subscribe(this.handleExercisesResponse.bind(this));
  }


  loadMyExercises(): void {
    this.exerciseService.getMyExercises(
      this.currentPage,
      this.pageSize
    ).subscribe(this.handleExercisesResponse.bind(this));
  }


  loadExercisesByMuscleGroup(): void {
    if (!this.filterOptions.muscleGroup) return;

    this.exerciseService.getExercisesByMuscleGroup(
      this.filterOptions.muscleGroup as MuscleGroup,
      this.currentPage,
      this.pageSize
    ).subscribe(this.handleExercisesResponse.bind(this));
  }


  loadExercisesByDifficulty(): void {
    if (!this.filterOptions.difficultyLevel) return;

    this.exerciseService.getExercisesByDifficulty(
      this.filterOptions.difficultyLevel as DifficultyLevel,
      this.currentPage,
      this.pageSize
    ).subscribe(this.handleExercisesResponse.bind(this));
  }


  loadExercisesByAuthor(): void {


    this.exerciseService.getExercises(
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (response) => {

        if (this.filterOptions.author !== null) {
          const filteredContent = response.content.filter(
            exercise => exercise.author?.id === this.filterOptions.author
          );


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


  loadFavoriteExercises(): void {


    this.exerciseService.getExercises(0, 1000).subscribe({
      next: (response) => {

        const filteredContent = response.content.filter(
          exercise => exercise.id && this.favoriteExercises.has(exercise.id)
        );


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


  searchExercises(): void {
    this.exerciseService.searchExercises(
      this.searchKeyword,
      this.currentPage,
      this.pageSize
    ).subscribe(this.handleExercisesResponse.bind(this));
  }


  handleExercisesResponse(response: PageResponse<Exercise>): void {
    this.exercises = response.content;
    this.totalItems = response.totalElements;
    this.loading = false;
  }


  handleExercisesError(error: any): void {
    console.error('Error loading exercises:', error);
    this.snackBar.open('Nie udało się załadować ćwiczeń', 'OK', {duration: 3000});
    this.exercises = [];
    this.loading = false;
  }


  applyFilters(): void {
    this.currentPage = 0;
    this.loadExercises();
  }


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


  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadExercises();
  }


  viewExerciseDetails(exerciseId: number): void {
    this.router.navigate(['/exercises', exerciseId]);
  }


  createNewExercise(): void {
    this.router.navigate(['/exercises/create']);
  }


  toggleFavorite(exerciseId: number, event: Event): void {
    event.stopPropagation();

    if (this.favoriteExercises.has(exerciseId)) {
      this.favoriteExercises.delete(exerciseId);
    } else {
      this.favoriteExercises.add(exerciseId);
    }


    this.saveFavoritesToStorage();


    if (this.filterOptions.sortBy === SortOption.FAVORITES) {
      this.loadExercises();
    }
  }


  isFavorite(exerciseId: number | undefined): boolean {
    return exerciseId !== undefined && this.favoriteExercises.has(exerciseId);
  }


  saveFavoritesToStorage(): void {
    localStorage.setItem('favoriteExercises', JSON.stringify(Array.from(this.favoriteExercises)));
  }


  loadFavoritesFromStorage(): void {
    const storedFavorites = localStorage.getItem('favoriteExercises');
    if (storedFavorites) {
      this.favoriteExercises = new Set(JSON.parse(storedFavorites));
    }
  }


  getMuscleGroupName(muscleGroup: string): string {
    return this.exerciseService.getMuscleGroupName(muscleGroup as any);
  }

  getDifficultyName(level: string): string {
    return this.exerciseService.getDifficultyName(level as any);
  }
}
