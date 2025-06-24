import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, ActivatedRoute, RouterLink} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatChipsModule} from '@angular/material/chips';
import {MatDividerModule} from '@angular/material/divider';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDialogModule, MatDialog} from '@angular/material/dialog';
import {MatExpansionModule} from '@angular/material/expansion';

import {WorkoutSessionService} from '../../../core/services/workout-session.service';
import {ExerciseService} from '../../../core/services/exercise.service';
import {WorkoutSession} from '../../../models/workout-session.model';
import {ConfirmDialogComponent} from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-session-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatExpansionModule,
    RouterLink
  ],
  templateUrl: './session-detail.component.html',
  styleUrls: ['./session-detail.component.scss']
})
export class SessionDetailComponent implements OnInit {
  sessionId!: number;
  session: WorkoutSession | null = null;
  loading = false;

  constructor(
    private sessionService: WorkoutSessionService,
    private exerciseService: ExerciseService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.sessionId = +this.route.snapshot.paramMap.get('id')!;
    this.loadSessionDetails();
  }


  loadSessionDetails(): void {
    this.loading = true;

    this.sessionService.getSessionById(this.sessionId)
      .subscribe({
        next: (session) => {
          this.session = session;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading session details:', error);
          this.snackBar.open('Nie udało się załadować szczegółów sesji treningowej', 'OK', {duration: 3000});
          this.loading = false;
          this.router.navigate(['/my-workouts']);
        }
      });
  }


  deleteSession(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Usuwanie sesji treningowej',
        message: 'Czy na pewno chcesz usunąć tę sesję treningową? Tej operacji nie można cofnąć.',
        confirmButtonText: 'Usuń',
        cancelButtonText: 'Anuluj'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sessionService.deleteSession(this.sessionId).subscribe({
          next: () => {
            this.snackBar.open('Sesja treningowa została usunięta', 'OK', {duration: 3000});
            this.router.navigate(['/my-workouts']);
          },
          error: (error) => {
            console.error('Error deleting session:', error);
            this.snackBar.open('Nie udało się usunąć sesji treningowej', 'OK', {duration: 3000});
          }
        });
      }
    });
  }


  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getMuscleGroupName(muscleGroup: string): string {
    return this.exerciseService.getMuscleGroupName(muscleGroup as any);
  }

  getDifficultyName(level: string): string {
    return this.exerciseService.getDifficultyName(level as any);
  }
}
