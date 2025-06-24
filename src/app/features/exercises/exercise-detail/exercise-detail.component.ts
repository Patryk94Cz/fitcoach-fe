import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import {MatChipsModule} from '@angular/material/chips';
import {MatDividerModule} from '@angular/material/divider';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDialogModule, MatDialog} from '@angular/material/dialog';
import {MatTooltipModule} from '@angular/material/tooltip';

import {ExerciseService} from '../../../core/services/exercise.service';
import {Exercise, ExerciseRating, RatingRequest} from '../../../models/exercise.model';
import {AuthService} from '../../../core/services/auth.service';
import {User} from '../../../models/user.model';
import {ConfirmDialogComponent} from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-exercise-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './exercise-detail.component.html',
  styleUrls: ['./exercise-detail.component.scss']
})
export class ExerciseDetailComponent implements OnInit {
  exerciseId!: number;
  exercise: Exercise | null = null;
  ratings: ExerciseRating[] = [];
  currentUser: User | null = null;
  isAuthor = false;
  userRating: ExerciseRating | null = null;
  hasRated = false;
  isFavorite = false;

  loading = {
    exercise: false,
    ratings: false,
    rating: false
  };

  ratingForm: FormGroup;
  starRating = 0;
  readonly ratingValues = [1, 2, 3, 4, 5];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private exerciseService: ExerciseService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.ratingForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', Validators.maxLength(500)]
    });
  }

  ngOnInit(): void {
    this.exerciseId = +this.route.snapshot.paramMap.get('id')!;


    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.loadExercise();
    this.loadRatings();
    this.checkUserRating();
    this.checkIfFavorite();
  }


  loadExercise(): void {
    this.loading.exercise = true;

    this.exerciseService.getExerciseById(this.exerciseId).subscribe({
      next: (data) => {
        this.exercise = data;

        if (this.currentUser && this.exercise.author) {
          this.isAuthor = this.currentUser.id === this.exercise.author.id;
        }
        this.loading.exercise = false;
      },
      error: (error) => {
        console.error('Błąd podczas ładowania ćwiczenia:', error);
        this.snackBar.open('Nie udało się załadować ćwiczenia', 'OK', {duration: 3000});
        this.loading.exercise = false;

        this.router.navigate(['/exercises']);
      }
    });
  }


  loadRatings(): void {
    this.loading.ratings = true;

    this.exerciseService.getExerciseRatings(this.exerciseId).subscribe({
      next: (response) => {
        this.ratings = response.content;
        this.loading.ratings = false;
      },
      error: (error) => {
        console.error('Błąd podczas ładowania ocen:', error);
        this.loading.ratings = false;
      }
    });
  }


  checkUserRating(): void {
    this.loading.rating = true;

    this.exerciseService.hasRated(this.exerciseId).subscribe({
      next: (hasRated) => {
        this.hasRated = hasRated;

        if (hasRated) {
          this.exerciseService.getMyRating(this.exerciseId).subscribe({
            next: (rating) => {
              this.userRating = rating;
              this.ratingForm.patchValue({
                rating: rating.rating,
                comment: rating.comment
              });
              this.starRating = rating.rating;
              this.loading.rating = false;
            },
            error: (error) => {
              console.error('Błąd podczas pobierania oceny użytkownika:', error);
              this.loading.rating = false;
            }
          });
        } else {
          this.loading.rating = false;
        }
      },
      error: (error) => {
        console.error('Błąd podczas sprawdzania oceny użytkownika:', error);
        this.loading.rating = false;
      }
    });
  }


  checkIfFavorite(): void {

    const storedFavorites = localStorage.getItem('favoriteExercises');
    if (storedFavorites) {
      const favorites = JSON.parse(storedFavorites) as number[];
      this.isFavorite = favorites.includes(this.exerciseId);
    }
  }


  toggleFavorite(): void {

    const storedFavorites = localStorage.getItem('favoriteExercises');
    let favorites: number[] = [];

    if (storedFavorites) {
      favorites = JSON.parse(storedFavorites);
    }

    if (this.isFavorite) {

      favorites = favorites.filter(id => id !== this.exerciseId);
      this.exerciseService.removeFromFavorites(this.exerciseId).subscribe();
      this.snackBar.open('Usunięto z ulubionych', 'OK', {duration: 2000});
    } else {

      favorites.push(this.exerciseId);
      this.exerciseService.addToFavorites(this.exerciseId).subscribe();
      this.snackBar.open('Dodano do ulubionych', 'OK', {duration: 2000});
    }


    localStorage.setItem('favoriteExercises', JSON.stringify(favorites));
    this.isFavorite = !this.isFavorite;
  }


  onRateExercise(): void {
    if (this.ratingForm.invalid) {
      return;
    }

    const ratingRequest: RatingRequest = {
      rating: this.ratingForm.value.rating,
      comment: this.ratingForm.value.comment
    };

    this.loading.rating = true;

    if (this.hasRated) {

      this.exerciseService.updateRating(this.exerciseId, ratingRequest).subscribe({
        next: (updatedRating) => {
          this.userRating = updatedRating;
          this.snackBar.open('Ocena została zaktualizowana', 'OK', {duration: 3000});
          this.loadRatings();
          this.loadExercise();
          this.loading.rating = false;
        },
        error: (error) => {
          console.error('Błąd podczas aktualizacji oceny:', error);
          this.snackBar.open('Nie udało się zaktualizować oceny', 'OK', {duration: 3000});
          this.loading.rating = false;
        }
      });
    } else {

      this.exerciseService.rateExercise(this.exerciseId, ratingRequest).subscribe({
        next: (newRating) => {
          this.userRating = newRating;
          this.hasRated = true;
          this.snackBar.open('Ocena została dodana', 'OK', {duration: 3000});
          this.loadRatings();
          this.loadExercise();
          this.loading.rating = false;
        },
        error: (error) => {
          console.error('Błąd podczas dodawania oceny:', error);
          this.snackBar.open('Nie udało się dodać oceny', 'OK', {duration: 3000});
          this.loading.rating = false;
        }
      });
    }
  }


  deleteRating(): void {
    this.exerciseService.deleteRating(this.exerciseId).subscribe({
      next: () => {
        this.hasRated = false;
        this.userRating = null;
        this.ratingForm.reset();
        this.starRating = 0;
        this.snackBar.open('Ocena została usunięta', 'OK', {duration: 3000});
        this.loadRatings();
        this.loadExercise();
      },
      error: (error) => {
        console.error('Błąd podczas usuwania oceny:', error);
        this.snackBar.open('Nie udało się usunąć oceny', 'OK', {duration: 3000});
      }
    });
  }


  setRating(rating: number): void {
    this.starRating = rating;
    this.ratingForm.patchValue({rating});
  }


  editExercise(): void {
    this.router.navigate(['/exercises/edit', this.exerciseId]);
  }


  deleteExercise(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Usuwanie ćwiczenia',
        message: 'Czy na pewno chcesz usunąć to ćwiczenie? Tej operacji nie można cofnąć.',
        confirmButtonText: 'Usuń',
        cancelButtonText: 'Anuluj'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.exerciseService.deleteExercise(this.exerciseId).subscribe({
          next: () => {
            this.snackBar.open('Ćwiczenie zostało usunięte', 'OK', {duration: 3000});
            this.router.navigate(['/exercises']);
          },
          error: (error) => {
            console.error('Błąd podczas usuwania ćwiczenia:', error);
            this.snackBar.open('Nie udało się usunąć ćwiczenia', 'OK', {duration: 3000});
          }
        });
      }
    });
  }


  getMuscleGroupName(muscleGroup: string): string {
    return this.exerciseService.getMuscleGroupName(muscleGroup as any);
  }

  getDifficultyName(level: string): string {
    return this.exerciseService.getDifficultyName(level as any);
  }

  getRiskLevelName(level: string): string {
    return this.exerciseService.getRiskLevelName(level);
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => {
      return i < rating ? 1 : 0;
    });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL');
  }
}
