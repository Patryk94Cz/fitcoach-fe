// src/app/features/exercises/exercise-card/exercise-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

import { Exercise } from '../../../models/exercise.model';
import { ExerciseService } from '../../../core/services/exercise.service';

@Component({
  selector: 'app-exercise-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule
  ],
  templateUrl: './exercise-card.component.html',
  styleUrls: ['./exercise-card.component.scss']
})
export class ExerciseCardComponent {
  @Input() exercise!: Exercise;

  constructor(private exerciseService: ExerciseService) {}

  // Pobierz przyjazną nazwę grupy mięśniowej
  getMuscleGroupName(muscleGroup: string): string {
    return this.exerciseService.getMuscleGroupName(muscleGroup as any);
  }

  // Pobierz przyjazną nazwę poziomu trudności
  getDifficultyName(level: string): string {
    return this.exerciseService.getDifficultyName(level as any);
  }

  // Generuj kolor tła karty w zależności od poziomu trudności
  getDifficultyColor(level: string): string {
    const colors: Record<string, string> = {
      'BEGINNER': 'rgba(76, 175, 80, 0.1)',
      'INTERMEDIATE': 'rgba(255, 152, 0, 0.1)',
      'ADVANCED': 'rgba(244, 67, 54, 0.1)'
    };
    return colors[level] || 'transparent';
  }

  // Generuj kolor tekstu poziomu trudności
  getDifficultyTextColor(level: string): string {
    const colors: Record<string, string> = {
      'BEGINNER': '#388e3c',
      'INTERMEDIATE': '#f57c00',
      'ADVANCED': '#d32f2f'
    };
    return colors[level] || '#000000';
  }

  // Generuj domyślny obrazek jeśli nie ma URL obrazka
  getImageUrl(): string {
    return this.exercise.imageUrl || 'assets/images/exercise-placeholder.jpg';
  }

  // Generuj gwiazdki na podstawie oceny
  getStarRating(): number[] {
    const stars = [];

    // Always show 5 stars, either filled, half-filled or empty
    for (let i = 0; i < 5; i++) {
      if (!this.exercise.averageRating) {
        // No rating - all empty stars
        stars.push(0);
      } else {
        const rating = this.exercise.averageRating;
        if (i + 0.5 < rating) {
          // Full star
          stars.push(1);
        } else if (i < rating && i + 1 > rating) {
          // Half star
          stars.push(0.5);
        } else {
          // Empty star
          stars.push(0);
        }
      }
    }

    return stars;
  }

  // Check if exercise is new (created in the last 7 days)
  isNewExercise(): boolean {
    if (!this.exercise.createdAt) return false;

    const creationDate = new Date(this.exercise.createdAt);
    const currentDate = new Date();

    // Calculate difference in days
    const diffTime = Math.abs(currentDate.getTime() - creationDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= 7; // Consider as new if created within the last 7 days
  }
}
