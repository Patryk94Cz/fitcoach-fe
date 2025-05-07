// src/app/features/exercises/exercise-form/exercise-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
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
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';

import { ExerciseService } from '../../../core/services/exercise.service';
import {
  Exercise,
  MuscleGroup,
  DifficultyLevel,
  RiskLevel
} from '../../../models/exercise.model';

@Component({
  selector: 'app-exercise-form',
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
    MatDividerModule
  ],
  templateUrl: './exercise-form.component.html',
  styleUrls: ['./exercise-form.component.scss']
})
export class ExerciseFormComponent implements OnInit {
  exerciseForm: FormGroup;
  isEditMode = false;
  exerciseId?: number;
  loading = false;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  // Listy dostępnych opcji
  muscleGroups: MuscleGroup[] = [];
  difficultyLevels: DifficultyLevel[] = [];
  riskLevels = Object.values(RiskLevel);

  constructor(
    private fb: FormBuilder,
    private exerciseService: ExerciseService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.exerciseForm = this.createForm();
  }

  ngOnInit(): void {
    // Pobierz dostępne opcje
    this.muscleGroups = this.exerciseService.getAllMuscleGroups();
    this.difficultyLevels = this.exerciseService.getAllDifficultyLevels();

    // Sprawdź, czy to tryb edycji
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.exerciseId = +id;
        this.loadExercise(this.exerciseId);
      }
    });
  }

  // Tworzenie formularza
  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      primaryMuscleGroup: ['', Validators.required],
      secondaryMuscleGroups: [[]],
      imageUrl: [''],
      videoUrl: [''],
      difficultyLevel: ['', Validators.required],
      equipmentNeeded: [''],
      caloriesBurned: [null, [Validators.min(0), Validators.max(1000)]],
      tags: this.fb.array([]),
      riskLevel: ['LOW', Validators.required],
      isPublic: [true]
    });
  }

  // Ładowanie ćwiczenia do edycji
  loadExercise(id: number): void {
    this.loading = true;

    this.exerciseService.getExerciseById(id).subscribe({
      next: (exercise) => {
        // Wypełnij formularz danymi ćwiczenia
        this.exerciseForm.patchValue({
          name: exercise.name,
          description: exercise.description,
          primaryMuscleGroup: exercise.primaryMuscleGroup,
          secondaryMuscleGroups: exercise.secondaryMuscleGroups,
          imageUrl: exercise.imageUrl,
          videoUrl: exercise.videoUrl,
          difficultyLevel: exercise.difficultyLevel,
          equipmentNeeded: exercise.equipmentNeeded,
          caloriesBurned: exercise.caloriesBurned,
          riskLevel: exercise.riskLevel,
          isPublic: exercise.isPublic
        });

        // Dodaj tagi
        if (exercise.tags && exercise.tags.length > 0) {
          const tagsArray = this.exerciseForm.get('tags') as FormArray;
          tagsArray.clear();

          exercise.tags.forEach(tag => {
            tagsArray.push(this.fb.control(tag));
          });
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Błąd podczas ładowania ćwiczenia:', error);
        this.snackBar.open('Nie udało się załadować ćwiczenia', 'OK', { duration: 3000 });
        this.loading = false;
        this.router.navigate(['/exercises']);
      }
    });
  }

  // Obsługa formularza
  onSubmit(): void {
    if (this.exerciseForm.invalid) {
      this.markFormGroupTouched(this.exerciseForm);
      return;
    }

    this.loading = true;

    // Przygotuj dane do wysłania
    const exerciseData: Exercise = {
      ...this.exerciseForm.value,
      tags: (this.tagsArray.value || []).map((tag: any) => tag)
    };

    if (this.isEditMode && this.exerciseId) {
      // Aktualizacja ćwiczenia
      this.exerciseService.updateExercise(this.exerciseId, exerciseData).subscribe({
        next: (updatedExercise) => {
          this.snackBar.open('Ćwiczenie zostało zaktualizowane', 'OK', { duration: 3000 });
          this.loading = false;
          this.router.navigate(['/exercises', this.exerciseId]);
        },
        error: (error) => {
          console.error('Błąd podczas aktualizacji ćwiczenia:', error);
          this.snackBar.open('Nie udało się zaktualizować ćwiczenia', 'OK', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      // Tworzenie nowego ćwiczenia
      this.exerciseService.createExercise(exerciseData).subscribe({
        next: (newExercise) => {
          this.snackBar.open('Ćwiczenie zostało utworzone', 'OK', { duration: 3000 });
          this.loading = false;
          this.router.navigate(['/exercises', newExercise.id]);
        },
        error: (error) => {
          console.error('Błąd podczas tworzenia ćwiczenia:', error);
          this.snackBar.open('Nie udało się utworzyć ćwiczenia', 'OK', { duration: 3000 });
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
      }
    });
  }

  // Obsługa tagów
  get tagsArray(): FormArray {
    return this.exerciseForm.get('tags') as FormArray;
  }

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
  getMuscleGroupName(muscleGroup: string): string {
    return this.exerciseService.getMuscleGroupName(muscleGroup as any);
  }

  getDifficultyName(level: string): string {
    return this.exerciseService.getDifficultyName(level as any);
  }

  getRiskLevelName(level: string): string {
    return this.exerciseService.getRiskLevelName(level);
  }
}
