import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatChipsModule} from '@angular/material/chips';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink} from '@angular/router';

import {Exercise} from '../../../models/exercise.model';
import {ExerciseService} from '../../../core/services/exercise.service';

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

  constructor(private exerciseService: ExerciseService) {
  }


  getMuscleGroupName(muscleGroup: string): string {
    return this.exerciseService.getMuscleGroupName(muscleGroup as any);
  }


  getDifficultyName(level: string): string {
    return this.exerciseService.getDifficultyName(level as any);
  }


  getDifficultyColor(level: string): string {
    const colors: Record<string, string> = {
      'BEGINNER': 'rgba(76, 175, 80, 0.1)',
      'INTERMEDIATE': 'rgba(255, 152, 0, 0.1)',
      'ADVANCED': 'rgba(244, 67, 54, 0.1)'
    };
    return colors[level] || 'transparent';
  }


  getDifficultyTextColor(level: string): string {
    const colors: Record<string, string> = {
      'BEGINNER': '#388e3c',
      'INTERMEDIATE': '#f57c00',
      'ADVANCED': '#d32f2f'
    };
    return colors[level] || '#000000';
  }


  getImageUrl(): string {
    return this.exercise.imageUrl || 'assets/images/exercise-placeholder.jpg';
  }


  getStarRating(): number[] {
    const stars = [];


    for (let i = 0; i < 5; i++) {
      if (!this.exercise.averageRating) {

        stars.push(0);
      } else {
        const rating = this.exercise.averageRating;
        if (i + 0.5 < rating) {

          stars.push(1);
        } else if (i < rating && i + 1 > rating) {

          stars.push(0.5);
        } else {

          stars.push(0);
        }
      }
    }

    return stars;
  }


  isNewExercise(): boolean {
    if (!this.exercise.createdAt) return false;

    const creationDate = new Date(this.exercise.createdAt);
    const currentDate = new Date();


    const diffTime = Math.abs(currentDate.getTime() - creationDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= 7;
  }
}
