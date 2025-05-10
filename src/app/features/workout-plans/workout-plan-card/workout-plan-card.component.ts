// src/app/features/workout-plans/workout-plan-card/workout-plan-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

import { WorkoutPlan, WorkoutGoal } from '../../../models/workout-plan.model';
import { WorkoutPlanService } from '../../../core/services/workout-plan.service';

@Component({
  selector: 'app-workout-plan-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './workout-plan-card.component.html',
  styleUrls: ['./workout-plan-card.component.scss']
})
export class WorkoutPlanCardComponent {
  @Input() workoutPlan!: WorkoutPlan;

  constructor(private workoutPlanService: WorkoutPlanService) {}

  // Pobierz przyjazną nazwę celu treningu
  getGoalName(goal: string): string {
    return this.workoutPlanService.getGoalName(goal as WorkoutGoal);
  }

  // Pobierz przyjazną nazwę poziomu trudności
  getDifficultyName(level: string): string {
    return this.workoutPlanService.getDifficultyName(level as any);
  }

  // Generuj kolor tła karty w zależności od celu treningu
  getGoalColor(goal: string): string {
    const colors: Record<string, string> = {
      'STRENGTH': 'rgba(63, 81, 181, 0.1)',
      'ENDURANCE': 'rgba(0, 150, 136, 0.1)',
      'WEIGHT_LOSS': 'rgba(255, 64, 129, 0.1)',
      'MUSCLE_GAIN': 'rgba(255, 152, 0, 0.1)',
      'GENERAL_FITNESS': 'rgba(76, 175, 80, 0.1)',
      'FLEXIBILITY': 'rgba(156, 39, 176, 0.1)'
    };
    return colors[goal] || 'transparent';
  }

  // Generuj kolor tekstu celu treningu
  getGoalTextColor(goal: string): string {
    const colors: Record<string, string> = {
      'STRENGTH': '#3f51b5',
      'ENDURANCE': '#009688',
      'WEIGHT_LOSS': '#ff4081',
      'MUSCLE_GAIN': '#ff9800',
      'GENERAL_FITNESS': '#4caf50',
      'FLEXIBILITY': '#9c27b0'
    };
    return colors[goal] || '#000000';
  }

  // Generuj domyślny obrazek jeśli nie ma URL obrazka
  getImageUrl(): string {
    return this.workoutPlan.imageUrl || 'assets/images/workout-placeholder.jpg';
  }

  // Generuj gwiazdki na podstawie oceny
  getStarRating(): number[] {
    if (!this.workoutPlan.averageRating) return [];
    const rating = Math.round(this.workoutPlan.averageRating * 2) / 2; // Zaokrąglij do 0.5
    return Array(5).fill(0).map((_, i) => {
      if (i + 0.5 === rating) return 0.5;
      if (i < rating) return 1;
      return 0;
    });
  }

  // Format częstotliwości treningów
  formatFrequencyText(frequency: number): string {
    return frequency === 1
      ? '1 trening tygodniowo'
      : `${frequency} treningi tygodniowo`;
  }
}
