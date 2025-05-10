// src/app/features/workout-plans/workout-plan-detail/workout-plan-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule } from '@angular/material/stepper';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

import { WorkoutPlanService } from '../../../core/services/workout-plan.service';
import { ExerciseService } from '../../../core/services/exercise.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

import {
  WorkoutPlan,
  WorkoutPlanRating,
  WorkoutDay,
  WorkoutPlanProgress,
  WorkoutPlanStatus,
  UserWorkoutPlan
} from '../../../models/workout-plan.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-workout-plan-detail',
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
    MatExpansionModule,
    MatStepperModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './workout-plan-detail.component.html',
  styleUrls: ['./workout-plan-detail.component.scss']
})
export class WorkoutPlanDetailComponent implements OnInit {
  workoutPlanId!: number;
  workoutPlan: WorkoutPlan | null = null;
  userPlan: UserWorkoutPlan | null = null;
  ratings: WorkoutPlanRating[] = [];
  currentUser: User | null = null;
  isAuthor = false;
  userRating: WorkoutPlanRating | null = null;
  hasRated = false;
  isJoined = false;
  activeDay = 0;

  loading = {
    plan: false,
    ratings: false,
    rating: false,
    userPlan: false,
    join: false,
    update: false
  };

  ratingForm: FormGroup;
  starRating = 0;
  readonly ratingValues = [1, 2, 3, 4, 5];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workoutPlanService: WorkoutPlanService,
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
    this.workoutPlanId = +this.route.snapshot.paramMap.get('id')!;

    // Pobierz aktualnego użytkownika
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.loadWorkoutPlan();
    this.loadRatings();
    this.checkUserRating();
    this.checkUserPlan();
  }

  // Ładowanie danych planu treningowego
  loadWorkoutPlan(): void {
    this.loading.plan = true;

    this.workoutPlanService.getWorkoutPlanById(this.workoutPlanId).subscribe({
      next: (data) => {
        this.workoutPlan = data;
        // Sprawdź czy użytkownik jest autorem
        if (this.currentUser && this.workoutPlan.author) {
          this.isAuthor = this.currentUser.id === this.workoutPlan.author.id;
        }
        this.loading.plan = false;
      },
      error: (error) => {
        console.error('Błąd podczas ładowania planu treningowego:', error);
        this.snackBar.open('Nie udało się załadować planu treningowego', 'OK', { duration: 3000 });
        this.loading.plan = false;
        // Przekieruj do listy planów
        this.router.navigate(['/workout-plans']);
      }
    });
  }

  // Ładowanie ocen
  loadRatings(): void {
    this.loading.ratings = true;

    this.workoutPlanService.getWorkoutPlanRatings(this.workoutPlanId).subscribe({
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

  // Sprawdzenie czy użytkownik ocenił plan i pobranie jego oceny
  checkUserRating(): void {
    this.loading.rating = true;

    this.workoutPlanService.hasRatedWorkoutPlan(this.workoutPlanId).subscribe({
      next: (hasRated) => {
        this.hasRated = hasRated;

        if (hasRated) {
          this.workoutPlanService.getMyWorkoutPlanRating(this.workoutPlanId).subscribe({
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

  // Sprawdzenie czy użytkownik dołączył do planu
  checkUserPlan(): void {
    this.loading.userPlan = true;

    this.workoutPlanService.getUserWorkoutPlans().subscribe({
      next: (response) => {
        const userPlan = response.content.find(p => p.workoutPlan.id === this.workoutPlanId);
        if (userPlan) {
          this.userPlan = userPlan;
          this.isJoined = true;
          this.activeDay = userPlan.currentDay - 1; // Indeks dla mat-tab od 0
          if (this.activeDay < 0) this.activeDay = 0;
        }
        this.loading.userPlan = false;
      },
      error: (error) => {
        console.error('Błąd podczas sprawdzania planów użytkownika:', error);
        this.loading.userPlan = false;
      }
    });
  }

  // Obsługa oceniania
  onRateWorkoutPlan(): void {
    if (this.ratingForm.invalid) {
      return;
    }

    const rating = this.ratingForm.value.rating;
    const comment = this.ratingForm.value.comment;

    this.loading.rating = true;

    if (this.hasRated) {
      // Aktualizacja oceny
      this.workoutPlanService.updateWorkoutPlanRating(this.workoutPlanId, rating, comment).subscribe({
        next: (updatedRating) => {
          this.userRating = updatedRating;
          this.snackBar.open('Ocena została zaktualizowana', 'OK', { duration: 3000 });
          this.loadRatings();
          this.loadWorkoutPlan(); // Odśwież dane planu, aby zaktualizować średnią ocenę
          this.loading.rating = false;
        },
        error: (error) => {
          console.error('Błąd podczas aktualizacji oceny:', error);
          this.snackBar.open('Nie udało się zaktualizować oceny', 'OK', { duration: 3000 });
          this.loading.rating = false;
        }
      });
    } else {
      // Dodanie nowej oceny
      this.workoutPlanService.rateWorkoutPlan(this.workoutPlanId, rating, comment).subscribe({
        next: (newRating) => {
          this.userRating = newRating;
          this.hasRated = true;
          this.snackBar.open('Ocena została dodana', 'OK', { duration: 3000 });
          this.loadRatings();
          this.loadWorkoutPlan(); // Odśwież dane planu, aby zaktualizować średnią ocenę
          this.loading.rating = false;
        },
        error: (error) => {
          console.error('Błąd podczas dodawania oceny:', error);
          this.snackBar.open('Nie udało się dodać oceny', 'OK', { duration: 3000 });
          this.loading.rating = false;
        }
      });
    }
  }

  // Usuwanie oceny
  deleteRating(): void {
    this.workoutPlanService.deleteWorkoutPlanRating(this.workoutPlanId).subscribe({
      next: () => {
        this.hasRated = false;
        this.userRating = null;
        this.ratingForm.reset();
        this.starRating = 0;
        this.snackBar.open('Ocena została usunięta', 'OK', { duration: 3000 });
        this.loadRatings();
        this.loadWorkoutPlan(); // Odśwież dane planu, aby zaktualizować średnią ocenę
      },
      error: (error) => {
        console.error('Błąd podczas usuwania oceny:', error);
        this.snackBar.open('Nie udało się usunąć oceny', 'OK', { duration: 3000 });
      }
    });
  }

  // Wybór oceny (gwiazdki)
  setRating(rating: number): void {
    this.starRating = rating;
    this.ratingForm.patchValue({ rating });
  }

  // Dołączanie do planu treningowego
  joinWorkoutPlan(): void {
    this.loading.join = true;

    this.workoutPlanService.joinWorkoutPlan(this.workoutPlanId).subscribe({
      next: (userPlan) => {
        this.userPlan = userPlan;
        this.isJoined = true;
        this.loadWorkoutPlan(); // Odśwież licznik uczestników
        this.snackBar.open('Dołączono do planu treningowego!', 'OK', { duration: 3000 });
        this.loading.join = false;
      },
      error: (error) => {
        console.error('Błąd podczas dołączania do planu:', error);
        this.snackBar.open('Nie udało się dołączyć do planu', 'OK', { duration: 3000 });
        this.loading.join = false;
      }
    });
  }

  // Porzucanie planu treningowego
  abandonWorkoutPlan(): void {
    if (!this.userPlan) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Porzucanie planu treningowego',
        message: 'Czy na pewno chcesz porzucić ten plan treningowy? Twój postęp zostanie utracony.',
        confirmButtonText: 'Porzuć',
        cancelButtonText: 'Anuluj'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.userPlan) {
        this.workoutPlanService.abandonWorkoutPlan(this.userPlan.id).subscribe({
          next: () => {
            this.userPlan = null;
            this.isJoined = false;
            this.loadWorkoutPlan(); // Odśwież licznik uczestników
            this.snackBar.open('Plan treningowy został porzucony', 'OK', { duration: 3000 });
          },
          error: (error) => {
            console.error('Błąd podczas porzucania planu:', error);
            this.snackBar.open('Nie udało się porzucić planu', 'OK', { duration: 3000 });
          }
        });
      }
    });
  }

  // Zakończenie planu treningowego
  completeWorkoutPlan(): void {
    if (!this.userPlan) return;

    const progress: WorkoutPlanProgress = {
      currentDay: this.userPlan.currentDay,
      status: WorkoutPlanStatus.COMPLETED,
      progressPercentage: 100
    };

    this.loading.update = true;

    this.workoutPlanService.updateWorkoutPlanProgress(this.userPlan.id, progress).subscribe({
      next: (updatedPlan) => {
        this.userPlan = updatedPlan;
        this.snackBar.open('Gratulacje! Plan treningowy został zakończony.', 'OK', { duration: 3000 });
        this.loading.update = false;
      },
      error: (error) => {
        console.error('Błąd podczas aktualizacji postępu:', error);
        this.snackBar.open('Nie udało się zaktualizować postępu', 'OK', { duration: 3000 });
        this.loading.update = false;
      }
    });
  }

  // Przejście do następnego dnia treningu
  moveToNextDay(): void {
    if (!this.userPlan || !this.workoutPlan) return;

    const nextDay = this.userPlan.currentDay + 1;
    const totalDays = this.workoutPlan.workoutDays.length;

    if (nextDay > totalDays) return;

    const progressPercentage = Math.round((nextDay / totalDays) * 100);

    const progress: WorkoutPlanProgress = {
      currentDay: nextDay,
      status: WorkoutPlanStatus.IN_PROGRESS,
      progressPercentage: progressPercentage
    };

    this.loading.update = true;

    this.workoutPlanService.updateWorkoutPlanProgress(this.userPlan.id, progress).subscribe({
      next: (updatedPlan) => {
        this.userPlan = updatedPlan;
        this.activeDay = nextDay - 1; // Indeks dla mat-tab od 0
        this.snackBar.open('Postęp zaktualizowany', 'OK', { duration: 3000 });
        this.loading.update = false;
      },
      error: (error) => {
        console.error('Błąd podczas aktualizacji postępu:', error);
        this.snackBar.open('Nie udało się zaktualizować postępu', 'OK', { duration: 3000 });
        this.loading.update = false;
      }
    });
  }

  // Edycja planu treningowego
  editWorkoutPlan(): void {
    this.router.navigate(['/workout-plans/edit', this.workoutPlanId]);
  }

  // Usuwanie planu treningowego
  deleteWorkoutPlan(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Usuwanie planu treningowego',
        message: 'Czy na pewno chcesz usunąć ten plan treningowy? Tej operacji nie można cofnąć.',
        confirmButtonText: 'Usuń',
        cancelButtonText: 'Anuluj'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.workoutPlanService.deleteWorkoutPlan(this.workoutPlanId).subscribe({
          next: () => {
            this.snackBar.open('Plan treningowy został usunięty', 'OK', { duration: 3000 });
            this.router.navigate(['/workout-plans']);
          },
          error: (error) => {
            console.error('Błąd podczas usuwania planu treningowego:', error);
            this.snackBar.open('Nie udało się usunąć planu treningowego', 'OK', { duration: 3000 });
          }
        });
      }
    });
  }

  // Obsługa zmiany dnia treningu
  onDayChange(index: number): void {
    this.activeDay = index;
  }

  // Pomocnicze metody
  getGoalName(goal: string): string {
    return this.workoutPlanService.getGoalName(goal as any);
  }

  getDifficultyName(level: string): string {
    return this.workoutPlanService.getDifficultyName(level as any);
  }

  getMuscleGroupName(muscleGroup: string): string {
    return this.exerciseService.getMuscleGroupName(muscleGroup as any);
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

  getStatusName(status: string): string {
    const statusNames: Record<string, string> = {
      'NOT_STARTED': 'Nie rozpoczęty',
      'IN_PROGRESS': 'W trakcie',
      'COMPLETED': 'Ukończony',
      'ABANDONED': 'Porzucony'
    };
    return statusNames[status] || status;
  }

  getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      'NOT_STARTED': '#9e9e9e',
      'IN_PROGRESS': '#2196f3',
      'COMPLETED': '#4caf50',
      'ABANDONED': '#f44336'
    };
    return statusColors[status] || '#000000';
  }

  // Sprawdza czy pokazać przycisk następnego dnia
  canMoveToNextDay(): boolean {
    if (!this.userPlan || !this.workoutPlan) return false;
    return this.userPlan.currentDay < this.workoutPlan.workoutDays.length;
  }

  // Sprawdza czy pokazać przycisk zakończenia planu
  canCompleteWorkoutPlan(): boolean {
    if (!this.userPlan || !this.workoutPlan) return false;
    return this.userPlan.status === 'IN_PROGRESS' &&
      this.userPlan.currentDay >= this.workoutPlan.workoutDays.length / 2;
  }
}
