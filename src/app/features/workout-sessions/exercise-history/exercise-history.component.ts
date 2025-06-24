import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatDividerModule} from '@angular/material/divider';
import {MatBadgeModule} from '@angular/material/badge';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatDialogModule, MatDialog} from '@angular/material/dialog';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatChipsModule} from '@angular/material/chips';

import {WorkoutSessionService} from '../../../core/services/workout-session.service';
import {WorkoutPlanService} from '../../../core/services/workout-plan.service';
import {WorkoutSessionListItem} from '../../../models/workout-session.model';
import {UserWorkoutPlan} from '../../../models/workout-plan.model';
import {ConfirmDialogComponent} from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-workout-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDividerModule,
    MatBadgeModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatDialogModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './workout-history.component.html',
  styleUrls: ['./workout-history.component.scss']
})

export class WorkoutHistoryComponent implements OnInit {

  sessions: WorkoutSessionListItem[] = [];
  loading = {
    sessions: false,
    plans: false
  };
  totalItems = 0;
  currentPage = 0;
  pageSize = 10;


  activeWorkoutPlans: UserWorkoutPlan[] = [];
  selectedPlanId: number | null = null;


  activeTab = 0;

  constructor(
    private workoutSessionService: WorkoutSessionService,
    private workoutPlanService: WorkoutPlanService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.loadRecentSessions();
    this.loadActiveWorkoutPlans();
  }


  loadRecentSessions(): void {
    this.loading.sessions = true;
    this.workoutSessionService.getRecentSessions(this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.sessions = response.content;
          this.totalItems = response.totalElements;
          this.loading.sessions = false;
        },
        error: (error) => {
          console.error('Błąd podczas ładowania sesji treningowych:', error);
          this.snackBar.open('Nie udało się załadować historii treningów', 'OK', {duration: 3000});
          this.loading.sessions = false;
        }
      });
  }


  loadSessionsByPlan(planId: number): void {
    this.loading.sessions = true;
    this.selectedPlanId = planId;

    this.workoutSessionService.getSessionsByPlan(planId, this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.sessions = response.content;
          this.totalItems = response.totalElements;
          this.loading.sessions = false;
        },
        error: (error) => {
          console.error('Błąd podczas ładowania sesji dla planu:', error);
          this.snackBar.open('Nie udało się załadować sesji dla wybranego planu', 'OK', {duration: 3000});
          this.loading.sessions = false;
        }
      });
  }


  loadActiveWorkoutPlans(): void {
    this.loading.plans = true;

    this.workoutPlanService.getUserWorkoutPlans()
      .subscribe({
        next: (response) => {

          this.activeWorkoutPlans = response.content.filter(
            plan => plan.status === 'IN_PROGRESS' || plan.status === 'NOT_STARTED' || plan.status === 'COMPLETED'
          );
          this.loading.plans = false;
        },
        error: (error) => {
          console.error('Błąd podczas ładowania planów treningowych:', error);
          this.snackBar.open('Nie udało się załadować planów treningowych', 'OK', {duration: 3000});
          this.loading.plans = false;
        }
      });
  }


  onTabChange(index: number): void {
    this.activeTab = index;
    this.currentPage = 0;

    if (index === 0) {

      this.selectedPlanId = null;
      this.loadRecentSessions();
    } else if (index === 1 && this.activeWorkoutPlans.length > 0) {

      this.selectedPlanId = this.activeWorkoutPlans[0].id;
      this.loadSessionsByPlan(this.activeWorkoutPlans[0].id);
    }
  }


  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;

    if (this.selectedPlanId) {
      this.loadSessionsByPlan(this.selectedPlanId);
    } else {
      this.loadRecentSessions();
    }
  }


  onPlanChange(planId: number): void {
    this.currentPage = 0;
    this.loadSessionsByPlan(planId);
  }


  viewSessionDetails(sessionId: number): void {
    this.router.navigate(['/workout-sessions', sessionId]);
  }


  deleteSession(session: WorkoutSessionListItem, event: Event): void {
    event.stopPropagation();

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
        this.workoutSessionService.deleteSession(session.id).subscribe({
          next: () => {
            this.snackBar.open('Sesja treningowa została usunięta', 'OK', {duration: 3000});


            if (this.selectedPlanId) {
              this.loadSessionsByPlan(this.selectedPlanId);
            } else {
              this.loadRecentSessions();
            }
          },
          error: (error) => {
            console.error('Błąd podczas usuwania sesji:', error);
            this.snackBar.open('Nie udało się usunąć sesji', 'OK', {duration: 3000});
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


  getPlanStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      'NOT_STARTED': '#9e9e9e',
      'IN_PROGRESS': '#2196f3',
      'COMPLETED': '#4caf50',
      'ABANDONED': '#f44336'
    };
    return statusColors[status] || '#000000';
  }


  getPlanStatusName(status: string): string {
    const statusNames: Record<string, string> = {
      'NOT_STARTED': 'Nie rozpoczęty',
      'IN_PROGRESS': 'W trakcie',
      'COMPLETED': 'Ukończony',
      'ABANDONED': 'Porzucony'
    };
    return statusNames[status] || status;
  }
}
