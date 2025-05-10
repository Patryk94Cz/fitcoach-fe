// src/app/features/workout-plans/workout-plan-form/workout-plan-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

import { WorkoutPlanService } from '../../../core/services/workout-plan.service';
import { ExerciseService } from '../../../core/services/exercise.service';
import {
  WorkoutPlan,
  WorkoutDay,
  WorkoutExercise,
  WorkoutGoal
} from '../../../models/workout-plan.model';
import { Exercise, DifficultyLevel } from '../../../models/exercise.model';
import { debounceTime, distinctUntilChanged, switchMap, Observable, map, startWith, of } from 'rxjs';

@Component({
  selector: 'app-workout-plan-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatSliderModule,
    MatDividerModule,
    MatStepperModule,
    MatExpansionModule,
    MatTooltipModule
  ],
  templateUrl: './workout-plan-form.component.html',
  styleUrls: ['./workout-plan-form.component.scss']
})
export class WorkoutPlanFormComponent implements OnInit {
  workoutPlanForm: FormGroup;
  isEditMode = false;
  workoutPlanId?: number;
  loading = false;
  allExercises: Exercise[] = [];
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  // Listy dostępnych opcji
  workoutGoals = Object.values(WorkoutGoal);
  difficultyLevels = Object.values(DifficultyLevel);

  constructor(
    private fb: FormBuilder,
    private workoutPlanService: WorkoutPlanService,
    private exerciseService: ExerciseService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.workoutPlanForm = this.createForm();
  }

  ngOnInit(): void {
    // Pobierz dostępne ćwiczenia
    this.loadExercises();

    // Sprawdź, czy to tryb edycji
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.workoutPlanId = +id;
        this.loadWorkoutPlan(this.workoutPlanId);
      }
    });
  }

  // Tworzenie formularza
  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      imageUrl: [''],
      difficultyLevel: ['BEGINNER', Validators.required],
      goal: ['GENERAL_FITNESS', Validators.required],
      estimatedDurationMinutes: [60, [Validators.min(5), Validators.max(240)]],
      suggestedFrequencyPerWeek: [3, [Validators.required, Validators.min(1), Validators.max(7)]],
      equipmentNeeded: [''],
      caloriesBurned: [null, [Validators.min(0), Validators.max(2000)]],
      tags: this.fb.array([]),
      isPublic: [true],
      workoutDays: this.fb.array([])
    });
  }

  // Ładowanie ćwiczeń
  loadExercises(): void {
    this.exerciseService.getExercises(0, 1000).subscribe({
      next: (response) => {
        this.allExercises = response.content;
      },
      error: (error) => {
        console.error('Błąd podczas ładowania ćwiczeń:', error);
        this.snackBar.open('Nie udało się załadować ćwiczeń', 'OK', { duration: 3000 });
      }
    });
  }

  // Ładowanie planu treningowego do edycji
  loadWorkoutPlan(id: number): void {
    this.loading = true;

    this.workoutPlanService.getWorkoutPlanById(id).subscribe({
      next: (plan) => {
        // Reset formularza i ustaw wartości
        this.workoutPlanForm.reset();

        // Ustaw podstawowe dane
        this.workoutPlanForm.patchValue({
          name: plan.name,
          description: plan.description,
          imageUrl: plan.imageUrl,
          difficultyLevel: plan.difficultyLevel,
          goal: plan.goal,
          estimatedDurationMinutes: plan.estimatedDurationMinutes,
          suggestedFrequencyPerWeek: plan.suggestedFrequencyPerWeek,
          equipmentNeeded: plan.equipmentNeeded,
          caloriesBurned: plan.caloriesBurned,
          isPublic: plan.isPublic
        });

        // Ustaw tagi
        if (plan.tags && plan.tags.length > 0) {
          this.tagsArray.clear();
          plan.tags.forEach(tag => {
            this.tagsArray.push(this.fb.control(tag));
          });
        }

        // Ustaw dni treningowe
        if (plan.workoutDays && plan.workoutDays.length > 0) {
          this.workoutDaysArray.clear();
          plan.workoutDays.forEach(day => {
            const dayGroup = this.createWorkoutDayGroup();
            dayGroup.patchValue({
              dayNumber: day.dayNumber,
              name: day.name,
              description: day.description
            });

            // Ustaw ćwiczenia dla dnia
            const exercisesArray = dayGroup.get('exercises') as FormArray;
            exercisesArray.clear();

            if (day.exercises && day.exercises.length > 0) {
              day.exercises.forEach(exercise => {
                const exerciseGroup = this.createExerciseGroup();
                exerciseGroup.patchValue({
                  exerciseId: exercise.exercise?.id,
                  order: exercise.order,
                  setsCount: exercise.setsCount,
                  repsCount: exercise.repsCount,
                  restTimeSeconds: exercise.restTimeSeconds,
                  weight: exercise.weight,
                  notes: exercise.notes
                });
                exercisesArray.push(exerciseGroup);
              });
            }

            this.workoutDaysArray.push(dayGroup);
          });
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Błąd podczas ładowania planu treningowego:', error);
        this.snackBar.open('Nie udało się załadować planu treningowego', 'OK', { duration: 3000 });
        this.loading = false;
        this.router.navigate(['/workout-plans']);
      }
    });
  }

  // Obsługa formularza
  onSubmit(): void {
    // Sprawdź ogólną poprawność formularza
    if (this.workoutPlanForm.invalid) {
      this.markFormGroupTouched(this.workoutPlanForm);
      return;
    }

    // Sprawdź czy są dni treningowe
    if (this.workoutDaysArray.length === 0) {
      this.snackBar.open('Plan treningowy musi zawierać przynajmniej jeden dzień treningowy', 'OK', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });

      // Przejdź do zakładki z dniami treningowymi
      const stepperComponent = document.querySelector('mat-stepper') as any;
      if (stepperComponent && stepperComponent.selectedIndex !== 1) {
        stepperComponent.selectedIndex = 1;
      }

      return;
    }

    this.loading = true;

    // Przygotuj dane do wysłania
    const formValue = this.workoutPlanForm.value;

    // Normalizacja danych
    const workoutPlanData: WorkoutPlan = {
      name: formValue.name,
      description: formValue.description,
      imageUrl: formValue.imageUrl,
      difficultyLevel: formValue.difficultyLevel,
      goal: formValue.goal,
      estimatedDurationMinutes: formValue.estimatedDurationMinutes,
      suggestedFrequencyPerWeek: formValue.suggestedFrequencyPerWeek,
      equipmentNeeded: formValue.equipmentNeeded,
      caloriesBurned: formValue.caloriesBurned,
      tags: formValue.tags || [],
      isPublic: formValue.isPublic,
      workoutDays: formValue.workoutDays.map((day: any, index: number) => ({
        dayNumber: day.dayNumber || index + 1,
        name: day.name,
        description: day.description,
        exercises: day.exercises.map((exercise: any, exerciseIndex: number) => ({
          exerciseId: exercise.exerciseId,
          order: exercise.order || exerciseIndex + 1,
          setsCount: exercise.setsCount,
          repsCount: exercise.repsCount,
          restTimeSeconds: exercise.restTimeSeconds,
          weight: exercise.weight,
          notes: exercise.notes
        }))
      }))
    };

    if (this.isEditMode && this.workoutPlanId) {
      // Aktualizacja istniejącego planu
      this.workoutPlanService.updateWorkoutPlan(this.workoutPlanId, workoutPlanData).subscribe({
        next: (updatedPlan) => {
          this.snackBar.open('Plan treningowy został zaktualizowany', 'OK', { duration: 3000 });
          this.loading = false;
          this.router.navigate(['/workout-plans', this.workoutPlanId]);
        },
        error: (error) => {
          console.error('Błąd podczas aktualizacji planu treningowego:', error);

          let errorMessage = 'Nie udało się zaktualizować planu treningowego';

          // Obsługa błędów walidacji z serwera
          if (error.error && error.error.errors) {
            if (typeof error.error.errors === 'object') {
              const errorMessages = Object.values(error.error.errors);
              if (errorMessages.length > 0) {
                errorMessage = errorMessages[0] as string;
              }
            } else if (typeof error.error.errors === 'string') {
              errorMessage = error.error.errors;
            }
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }

          this.snackBar.open(errorMessage, 'OK', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });

          this.loading = false;
        }
      });
    } else {
      // Utworzenie nowego planu
      this.workoutPlanService.createWorkoutPlan(workoutPlanData).subscribe({
        next: (newPlan) => {
          this.snackBar.open('Plan treningowy został utworzony', 'OK', { duration: 3000 });
          this.loading = false;
          this.router.navigate(['/workout-plans', newPlan.id]);
        },
        error: (error) => {
          console.error('Błąd podczas tworzenia planu treningowego:', error);

          let errorMessage = 'Nie udało się utworzyć planu treningowego';

          // Obsługa błędów walidacji z serwera
          if (error.error && error.error.errors) {
            if (typeof error.error.errors === 'object') {
              const errorMessages = Object.values(error.error.errors);
              if (errorMessages.length > 0) {
                errorMessage = errorMessages[0] as string;
              }
            } else if (typeof error.error.errors === 'string') {
              errorMessage = error.error.errors;
            }
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }

          this.snackBar.open(errorMessage, 'OK', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });

          this.loading = false;
        }
      });
    }
  }

  // Pomocnicza metoda do oznaczania wszystkich kontrolek jako dotknięte
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        for (let i = 0; i < control.length; i++) {
          const arrayControl = control.at(i);
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        }
      }
    });
  }

  // Getters dla form arrays
  get tagsArray(): FormArray {
    return this.workoutPlanForm.get('tags') as FormArray;
  }

  get workoutDaysArray(): FormArray {
    return this.workoutPlanForm.get('workoutDays') as FormArray;
  }

  // Bezpieczne pobieranie kontrolek exercises dla danego dnia
  getExercisesArray(dayIndex: number): FormArray {
    const dayControl = this.workoutDaysArray.at(dayIndex);
    if (!dayControl) return this.fb.array([]);

    const exercisesControl = (dayControl as FormGroup).get('exercises');
    return exercisesControl as FormArray || this.fb.array([]);
  }

  // Konwertuje AbstractControl na FormGroup z bezpiecznym sprawdzeniem
  asFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  // Pobiera wartość z kontrolki formularza z bezpiecznym sprawdzeniem null
  safeGetValue(control: AbstractControl | null, field: string): any {
    if (!control) return null;
    const group = control as FormGroup;
    return group.get(field)?.value;
  }

  // Metody do tworzenia podgrup formularzy
  createWorkoutDayGroup(): FormGroup {
    return this.fb.group({
      dayNumber: [null],
      name: ['', Validators.required],
      description: [''],
      exercises: this.fb.array([])
    });
  }

  createExerciseGroup(): FormGroup {
    return this.fb.group({
      exerciseId: [null, Validators.required],
      order: [null],
      setsCount: [3, [Validators.required, Validators.min(1), Validators.max(20)]],
      repsCount: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
      restTimeSeconds: [60, [Validators.required, Validators.min(0), Validators.max(300)]],
      weight: [''],
      notes: ['']
    });
  }

  // Metody do obsługi dni treningowych
  addWorkoutDay(): void {
    const dayNumber = this.workoutDaysArray.length + 1;
    const dayGroup = this.createWorkoutDayGroup();
    dayGroup.patchValue({
      dayNumber: dayNumber,
      name: `Dzień ${dayNumber}`
    });

    // Dodaj dzień do tablicy dni
    this.workoutDaysArray.push(dayGroup);

    // Dodaj domyślne ćwiczenie po dodaniu dnia
    this.addExercise(this.workoutDaysArray.length - 1);

    // Pokaż komunikat potwierdzenia
    this.snackBar.open('Dodano nowy dzień treningowy', 'OK', {
      duration: 2000
    });
  }

  removeWorkoutDay(index: number): void {
    this.workoutDaysArray.removeAt(index);
    // Zaktualizuj numery dni
    this.updateDayNumbers();
  }

  updateDayNumbers(): void {
    for (let i = 0; i < this.workoutDaysArray.length; i++) {
      const dayGroup = this.workoutDaysArray.at(i) as FormGroup;
      dayGroup.get('dayNumber')?.setValue(i + 1);
    }
  }

  // Metody do obsługi ćwiczeń
  addExercise(dayIndex: number): void {
    const exercisesArray = this.getExercisesArray(dayIndex);
    const exerciseGroup = this.createExerciseGroup();
    exerciseGroup.patchValue({
      order: exercisesArray.length + 1
    });
    exercisesArray.push(exerciseGroup);
  }

  removeExercise(dayIndex: number, exerciseIndex: number): void {
    const exercisesArray = this.getExercisesArray(dayIndex);
    exercisesArray.removeAt(exerciseIndex);
    // Zaktualizuj numery ćwiczeń
    this.updateExerciseOrder(dayIndex);
  }

  updateExerciseOrder(dayIndex: number): void {
    const exercisesArray = this.getExercisesArray(dayIndex);
    for (let i = 0; i < exercisesArray.length; i++) {
      const exerciseGroup = exercisesArray.at(i) as FormGroup;
      exerciseGroup.get('order')?.setValue(i + 1);
    }
  }

  // Obsługa tagów
  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.tagsArray.push(this.fb.control(value));
    }

    event.chipInput!.clear();
  }

  removeTag(index: number): void {
    this.tagsArray.removeAt(index);
  }

  // Pomocnicze metody do widoku
  getExerciseName(exerciseId: number): string {
    const exercise = this.allExercises.find(e => e.id === exerciseId);
    return exercise ? exercise.name : '';
  }

  getGoalName(goal: string): string {
    return this.workoutPlanService.getGoalName(goal as any);
  }

  getDifficultyName(level: string): string {
    return this.workoutPlanService.getDifficultyName(level as any);
  }

  getMuscleGroupName(muscleGroup: string): string {
    return this.exerciseService.getMuscleGroupName(muscleGroup as any);
  }

  // Pomocnicza metoda sprawdzająca czy mamy dni treningowe
  get hasWorkoutDays(): boolean {
    return this.workoutDaysArray.length > 0;
  }
}
