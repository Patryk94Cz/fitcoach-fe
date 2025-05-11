// src/app/features/workout-sessions/exercise-history/exercise-history.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { WorkoutSessionService } from '../../../core/services/workout-session.service';
import { ExerciseService } from '../../../core/services/exercise.service';
import { ExerciseHistory } from '../../../models/workout-session.model';

@Component({
  selector: 'app-exercise-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatExpansionModule,
    MatTableModule,
    MatSortModule,
    MatSnackBarModule
  ],
  templateUrl: './exercise-history.component.html',
  styleUrls: ['./exercise-history.component.scss']
})
export class ExerciseHistoryComponent implements OnInit {
  exerciseHistory: ExerciseHistory[] = [];
  loading = false;
  displayedColumns: string[] = ['date', 'setsCompleted', 'repsCompleted', 'weightUsed'];

  constructor(
    private sessionService: WorkoutSessionService,
    private exerciseService: ExerciseService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadExerciseHistory();
  }

  // Load history for all exercises
  loadExerciseHistory(): void {
    this.loading = true;

    this.sessionService.getAllExercisesHistory()
      .subscribe({
        next: (history) => {
          this.exerciseHistory = history;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading exercise history:', error);
          this.snackBar.open('Nie udało się załadować historii ćwiczeń', 'OK', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  // Sort table data
  sortData(sort: Sort, exerciseIndex: number): void {
    if (!sort.active || sort.direction === '') {
      return;
    }

    const data = [...this.exerciseHistory[exerciseIndex].history];
    this.exerciseHistory[exerciseIndex].history = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'date': return this.compare(new Date(a.date).getTime(), new Date(b.date).getTime(), isAsc);
        case 'setsCompleted': return this.compare(a.setsCompleted, b.setsCompleted, isAsc);
        case 'repsCompleted': return this.compare(a.repsCompleted, b.repsCompleted, isAsc);
        case 'weightUsed': return this.compareWeights(a.weightUsed, b.weightUsed, isAsc);
        default: return 0;
      }
    });
  }

  // Compare function for sorting
  private compare(a: number, b: number, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  // Compare weights (which could be strings like "50kg" or "body weight")
  private compareWeights(a: string, b: string, isAsc: boolean): number {
    // Try to extract numeric values
    const aMatch = a.match(/(\d+)/);
    const bMatch = b.match(/(\d+)/);

    // If both have numeric values, compare those
    if (aMatch && bMatch) {
      return this.compare(parseInt(aMatch[0]), parseInt(bMatch[0]), isAsc);
    }

    // If one has numeric value and other doesn't, numeric comes first
    if (aMatch && !bMatch) return isAsc ? -1 : 1;
    if (!aMatch && bMatch) return isAsc ? 1 : -1;

    // Otherwise just compare the strings
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  // Format date for display
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  }
}
