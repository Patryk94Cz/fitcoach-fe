// src/app/features/workout-sessions/session-form/session-form.component.ts
import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, AbstractControl} from '@angular/forms';
import {Router, RouterLink, ActivatedRoute} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatSliderModule} from '@angular/material/slider';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatStepperModule} from '@angular/material/stepper';
import {MatDividerModule} from '@angular/material/divider';

import { WorkoutDay, WorkoutExercise } from '../../../models/workout-plan.model';
import {WorkoutSessionService} from '../../../core/services/workout-session.service';
import {WorkoutPlanService} from '../../../core/services/workout-plan.service';
import {ExerciseService} from '../../../core/services/exercise.service';
import {UserWorkoutPlan} from '../../../models/workout-plan.model';
import {WorkoutSessionRequest, ExercisePerformanceRequest} from '../../../models/workout-session.model';

@Component({
  selector: 'app-session-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatStepperModule,
    MatDividerModule
  ],
  templateUrl: './session-form.component.html',
  styleUrls: ['./session-form.component.scss']
})
export class SessionFormComponent implements OnInit {
  sessionForm: FormGroup;
  loading = {
    plans: false,
    plan: false,
    submit: false
  };
  userWorkoutPlans: UserWorkoutPlan[] = [];
  selectedPlan: UserWorkoutPlan | null = null;
  planExercises: any[] = [];

  constructor(
    private fb: FormBuilder,
    private workoutSessionService: WorkoutSessionService,
    private workoutPlanService: WorkoutPlanService,
    private exerciseService: ExerciseService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.sessionForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadUserPlans();
  }

  // Create the form structure
  createForm(): FormGroup {
    return this.fb.group({
      userWorkoutPlanId: [null, Validators.required],
      completedDayNumber: [null, Validators.required],
      notes: [''],
      exercisePerformances: this.fb.array([])
    });
  }

  // Load user's workout plans
  loadUserPlans(): void {
    this.loading.plans = true;

    this.workoutPlanService.getUserWorkoutPlans()
      .subscribe({
        next: (response) => {
          // Filter only active plans
          this.userWorkoutPlans = response.content.filter(
            plan => plan.status === 'IN_PROGRESS' || plan.status === 'NOT_STARTED'
          );
          this.loading.plans = false;

          // If there are no plans, show message and redirect
          if (this.userWorkoutPlans.length === 0) {
            this.snackBar.open(
              'Nie masz aktywnych planów treningowych. Dołącz do planu, aby rejestrować sesje.',
              'OK',
              {duration: 5000}
            );
            this.router.navigate(['/workout-plans']);
          }
        },
        error: (error) => {
          console.error('Error loading workout plans:', error);
          this.snackBar.open('Nie udało się załadować planów treningowych', 'OK', {duration: 3000});
          this.loading.plans = false;
        }
      });
  }

  onPlanSelected(planId: number): void {
    this.loading.plan = true;

    // Znajdź wybrany plan z listy
    this.selectedPlan = this.userWorkoutPlans.find(p => p.id === planId) || null;

    if (this.selectedPlan) {
      // Ustaw domyślny numer dnia (obecny dzień)
      this.sessionForm.get('completedDayNumber')?.setValue(this.selectedPlan.currentDay);

      // Pobierz szczegóły planu użytkownika
      this.workoutPlanService.getUserWorkoutPlan(planId)
        .subscribe({
          next: (userPlanDetails) => {
            // Pobierz pełne szczegóły planu treningowego
            this.workoutPlanService.getWorkoutPlan(userPlanDetails.workoutPlan.id)
              .subscribe({
                next: (workoutPlan) => {
                  // Znajdź aktualny dzień
                  const currentDayNumber = this.sessionForm.get('completedDayNumber')?.value;
                  const currentDay = workoutPlan.workoutDays.find(
                    (day: WorkoutDay) => day.dayNumber === currentDayNumber
                  );

                  if (currentDay && currentDay.exercises) {
                    // Wyczyść poprzednie ćwiczenia
                    this.exercisePerformancesArray.clear();

                    // Zapisz ćwiczenia do późniejszego użycia
                    this.planExercises = currentDay.exercises;

                    // Dodaj grupy formularzy dla każdego ćwiczenia
                    currentDay.exercises.forEach((exercise: WorkoutExercise, index: number) => {
                      this.addExercisePerformance(
                        exercise.exercise?.id || 0,
                        exercise.setsCount || 0,
                        exercise.repsCount || 0,
                        exercise.weight || '',
                        index + 1
                      );
                    });
                  }

                  this.loading.plan = false;
                },
                error: (error) => {
                  console.error('Błąd podczas ładowania szczegółów planu treningowego:', error);
                  this.snackBar.open('Nie udało się załadować szczegółów planu', 'OK', { duration: 3000 });
                  this.loading.plan = false;
                }
              });
          },
          error: (error) => {
            console.error('Błąd podczas ładowania szczegółów planu użytkownika:', error);
            this.snackBar.open('Nie udało się załadować szczegółów planu użytkownika', 'OK', { duration: 3000 });
            this.loading.plan = false;
          }
        });
    }
  }

  // When day is changed, update exercises
  onDayChanged(dayNumber: number): void {
    if (!this.selectedPlan) return;

    this.loading.plan = true;

    // Pobierz szczegóły planu użytkownika
    this.workoutPlanService.getUserWorkoutPlan(this.selectedPlan.id)
      .subscribe({
        next: (userPlanDetails) => {
          // Pobierz pełne szczegóły planu treningowego
          this.workoutPlanService.getWorkoutPlan(userPlanDetails.workoutPlan.id)
            .subscribe({
              next: (workoutPlan) => {
                // Znajdź wybrany dzień
                const selectedDay = workoutPlan.workoutDays.find(
                  (day: WorkoutDay) => day.dayNumber === dayNumber
                );

                if (selectedDay && selectedDay.exercises) {
                  // Wyczyść poprzednie ćwiczenia
                  this.exercisePerformancesArray.clear();

                  // Zapisz ćwiczenia do późniejszego użycia
                  this.planExercises = selectedDay.exercises;

                  // Dodaj grupy formularzy dla każdego ćwiczenia
                  selectedDay.exercises.forEach((exercise: WorkoutExercise, index: number) => {
                    this.addExercisePerformance(
                      exercise.exercise?.id || 0,
                      exercise.setsCount || 0,
                      exercise.repsCount || 0,
                      exercise.weight || '',
                      index + 1
                    );
                  });
                }

                this.loading.plan = false;
              },
              error: (error) => {
                console.error('Błąd podczas ładowania szczegółów planu:', error);
                this.snackBar.open('Nie udało się załadować szczegółów planu', 'OK', { duration: 3000 });
                this.loading.plan = false;
              }
            });
        },
        error: (error) => {
          console.error('Błąd podczas ładowania szczegółów planu użytkownika:', error);
          this.snackBar.open('Nie udało się załadować szczegółów planu użytkownika', 'OK', { duration: 3000 });
          this.loading.plan = false;
        }
      });
  }

  // Form submission
  onSubmit(): void {
    if (this.sessionForm.invalid) {
      // Mark all fields as touched to display validation errors
      this.markFormGroupTouched(this.sessionForm);
      return;
    }

    this.loading.submit = true;

    const formValue = this.sessionForm.value;
    const sessionRequest: WorkoutSessionRequest = {
      userWorkoutPlanId: formValue.userWorkoutPlanId,
      completedDayNumber: formValue.completedDayNumber,
      notes: formValue.notes,
      exercisePerformances: formValue.exercisePerformances
    };

    this.workoutSessionService.createSession(sessionRequest)
      .subscribe({
        next: (session) => {
          this.snackBar.open('Sesja treningowa została zarejestrowana pomyślnie!', 'OK', {
            duration: 3000
          });

          // Redirect to session details or history page
          this.router.navigate(['/my-workouts']);
        },
        error: (error) => {
          console.error('Error creating session:', error);
          this.snackBar.open(
            'Nie udało się zarejestrować sesji treningowej. Spróbuj ponownie.',
            'OK',
            {duration: 5000}
          );
          this.loading.submit = false;
        }
      });
  }

  // Helper to add exercise performance to form array
  addExercisePerformance(
    exerciseId: number,
    defaultSets: number = 0,
    defaultReps: number = 0,
    defaultWeight: string = '',
    orderNumber: number = 1
  ): void {
    const exercise = this.fb.group({
      exerciseId: [exerciseId, Validators.required],
      setsCompleted: [defaultSets, [Validators.required, Validators.min(1)]],
      repsCompleted: [defaultReps, [Validators.required, Validators.min(1)]],
      weightUsed: [defaultWeight, Validators.required],
      notes: [''],
      orderNumber: [orderNumber]
    });

    this.exercisePerformancesArray.push(exercise);
  }

  // Helper to get exercise name by ID
  getExerciseName(exerciseId: number): string {
    const exercise = this.planExercises.find(e => e.exercise?.id === exerciseId);
    return exercise?.exercise?.name || 'Ćwiczenie';
  }

  // Helper to get available day numbers from the selected plan
  get availableDays(): number[] {
    if (!this.selectedPlan || !this.selectedPlan.workoutPlan.totalDays) {
      return [];
    }

    const days = [];
    for (let i = 1; i <= this.selectedPlan.workoutPlan.totalDays; i++) {
      days.push(i);
    }
    return days;
  }

  // Helper to access exercise performances form array
  get exercisePerformancesArray(): FormArray {
    return this.sessionForm.get('exercisePerformances') as FormArray;
  }

  // Utility to mark all form controls as touched
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      }
    });
  }
}
