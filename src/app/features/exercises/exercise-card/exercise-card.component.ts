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
    MatButtonModule,
    RouterLink
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
    if (!this.exercise.averageRating) return [];
    const rating = Math.round(this.exercise.averageRating * 2) / 2; // Zaokrąglij do 0.5
    return Array(5).fill(0).map((_, i) => {
      if (i + 0.5 === rating) return 0.5;
      if (i < rating) return 1;
      return 0;
    });
  }
}
