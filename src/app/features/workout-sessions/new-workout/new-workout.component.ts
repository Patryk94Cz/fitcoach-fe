// src/app/features/workout-sessions/new-workout/new-workout.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';

import { WorkoutSessionService } from '../../../core/services/workout-session.service';
import { WorkoutPlanService } from '../../../core/services/workout-plan.service';
import { UserWorkoutPlan, WorkoutDay, WorkoutExercise } from '../../../models/workout-plan.model';
import { WorkoutSessionRequest } from '../../../models/workout-session.model';

@Component({
  selector: 'app-new-workout',
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
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatStepperModule,
    MatDividerModule
  ],
  templateUrl: './new-workout.component.html',
  styleUrls: ['./new-workout.component.scss']
})
export class NewWorkoutComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;

  sessionForm: FormGroup;
  userWorkoutPlans: UserWorkoutPlan[] = [];
  selectedPlan: UserWorkoutPlan | null = null;
  currentDayExercises: WorkoutExercise[] = [];

  loading = {
    plans: false,
    plan: false,
    submit: false
  };

  constructor(
    private fb: FormBuilder,
    private workoutSessionService: WorkoutSessionService,
    private workoutPlanService: WorkoutPlanService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.sessionForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadUserWorkoutPlans();
  }

  createForm(): FormGroup {
    return this.fb.group({
      userWorkoutPlanId: [null, Validators.required],
      completedDayNumber: [null, Validators.required],
      notes: [''],
      exercisePerformances: this.fb.array([])
    });
  }

  get exercisePerformancesArray(): FormArray {
    return this.sessionForm.get('exercisePerformances') as FormArray;
  }

  loadUserWorkoutPlans(): void {
    this.loading.plans = true;

    this.workoutPlanService.getUserWorkoutPlans().subscribe({
      next: (response) => {
        this.userWorkoutPlans = response.content;
        this.loading.plans = false;

        if (this.userWorkoutPlans.length === 0) {
          this.snackBar.open('Nie masz żadnych planów treningowych. Dołącz do planu aby rejestrować treningi.', 'OK', {
            duration: 5000
          });
          this.router.navigate(['/workout-plans']);
        }
      },
      error: (error) => {
        console.error('Błąd podczas ładowania planów treningowych:', error);
        this.snackBar.open('Nie udało się załadować planów treningowych', 'OK', { duration: 3000 });
        this.loading.plans = false;
      }
    });
  }

  onPlanSelected(planId: number): void {
    this.selectedPlan = this.userWorkoutPlans.find(p => p.id === planId) || null;

    if (this.selectedPlan) {
      this.sessionForm.get('completedDayNumber')?.setValue(null);
    }
  }

  onDayChanged(dayNumber: number): void {
    if (!this.selectedPlan) return;

    this.loading.plan = true;

    this.workoutPlanService.getWorkoutPlanById(this.selectedPlan.workoutPlan.id).subscribe({
      next: (plan) => {
        const selectedDay = plan.workoutDays.find(day => day.dayNumber === dayNumber);

        if (selectedDay && selectedDay.exercises) {
          this.exercisePerformancesArray.clear();
          this.currentDayExercises = selectedDay.exercises;

          selectedDay.exercises.forEach((exercise, index) => {
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
  }

  addExercisePerformance(
    exerciseId: number,
    defaultSets: number = 0,
    defaultReps: number = 0,
    defaultWeight: string = '',
    orderNumber: number = 1
  ): void {
    const exerciseGroup = this.fb.group({
      exerciseId: [exerciseId, Validators.required],
      setsCompleted: [defaultSets, [Validators.required, Validators.min(1)]],
      repsCompleted: [defaultReps, [Validators.required, Validators.min(1)]],
      weightUsed: [defaultWeight, Validators.required],
      notes: [''],
      orderNumber: [orderNumber]
    });

    this.exercisePerformancesArray.push(exerciseGroup);
  }

  onSubmit(): void {
    if (this.sessionForm.invalid) {
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

    this.workoutSessionService.createSession(sessionRequest).subscribe({
      next: (session) => {
        this.snackBar.open('Sesja treningowa została zarejestrowana!', 'OK', { duration: 3000 });
        this.router.navigate(['/my-workouts']);
        this.loading.submit = false;
      },
      error: (error) => {
        console.error('Błąd podczas rejestrowania sesji:', error);
        this.snackBar.open('Nie udało się zarejestrować sesji treningowej', 'OK', { duration: 3000 });
        this.loading.submit = false;
      }
    });
  }

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

  getExerciseName(exerciseId: number): string {
    const exercise = this.currentDayExercises.find(e => e.exercise?.id === exerciseId);
    return exercise?.exercise?.name || 'Ćwiczenie';
  }

  get availableDays(): number[] {
    if (!this.selectedPlan || !this.selectedPlan.workoutPlan.totalDays) {
      return [];
    }

    return Array.from({ length: this.selectedPlan.workoutPlan.totalDays }, (_, i) => i + 1);
  }

  hasCompletedPlans(): boolean {
    return this.userWorkoutPlans?.some(plan => plan.status === 'COMPLETED') || false;
  }
}
