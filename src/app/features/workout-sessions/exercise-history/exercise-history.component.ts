// src/app/features/workout-sessions/exercise-history/exercise-history.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-exercise-history',
  standalone: true,
  imports: [CommonModule],
  template: '<div>Przekierowywanie...</div>', // Minimalny template
  styles: []
})
export class ExerciseHistoryComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    // Przekierowanie do historii treningów zgodnie z wymaganiami
    this.router.navigate(['/my-workouts']);
  }
}
