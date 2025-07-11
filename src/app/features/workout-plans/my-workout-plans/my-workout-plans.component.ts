
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { WorkoutPlanService } from '../../../core/services/workout-plan.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UserWorkoutPlan, WorkoutPlanProgress, WorkoutPlanStatus } from '../../../models/workout-plan.model';

@Component({
  selector: 'app-my-workout-plans',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatBadgeModule,
    MatDialogModule,
    MatSnackBarModule,
    MatPaginatorModule
  ],
  templateUrl: './my-workout-plans.component.html',
  styleUrls: ['./my-workout-plans.component.scss']
})
export class MyWorkoutPlansComponent implements OnInit {
  userWorkoutPlans: UserWorkoutPlan[] = [];
  loading = false;
  totalItems = 0;
  currentPage = 0;
  pageSize = 10;


  updating: { [key: number]: boolean } = {};


  activeTab = 0;

  constructor(
    private workoutPlanService: WorkoutPlanService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUserWorkoutPlans();
  }


  loadUserWorkoutPlans(): void {
    this.loading = true;

    this.workoutPlanService.getUserWorkoutPlans(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.userWorkoutPlans = response.content;
        this.totalItems = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Błąd podczas pobierania planów użytkownika:', error);
        this.snackBar.open('Nie udało się pobrać planów treningowych', 'OK', { duration: 3000 });
        this.loading = false;
      }
    });
  }


  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUserWorkoutPlans();
  }


  filterByStatus(status: WorkoutPlanStatus | null): void {


    this.loadUserWorkoutPlans();
  }


  onTabChange(index: number): void {
    this.activeTab = index;


    this.loadUserWorkoutPlans();
  }


  moveToNextDay(userPlan: UserWorkoutPlan): void {
    if (!userPlan || userPlan.status === WorkoutPlanStatus.COMPLETED) return;

    const nextDay = userPlan.currentDay + 1;
    const totalDays = userPlan.workoutPlan.totalDays || 0;

    if (nextDay > totalDays) return;

    const progressPercentage = Math.round((nextDay / totalDays) * 100);

    const progress: WorkoutPlanProgress = {
      currentDay: nextDay,
      status: WorkoutPlanStatus.IN_PROGRESS,
      progressPercentage: progressPercentage
    };

    this.updating[userPlan.id] = true;

    this.workoutPlanService.updateWorkoutPlanProgress(userPlan.id, progress).subscribe({
      next: (updatedPlan) => {

        const index = this.userWorkoutPlans.findIndex(p => p.id === userPlan.id);
        if (index !== -1) {
          this.userWorkoutPlans[index] = updatedPlan;
        }
        this.snackBar.open('Postęp zaktualizowany', 'OK', { duration: 3000 });
        this.updating[userPlan.id] = false;
      },
      error: (error) => {
        console.error('Błąd podczas aktualizacji postępu:', error);
        this.snackBar.open('Nie udało się zaktualizować postępu', 'OK', { duration: 3000 });
        this.updating[userPlan.id] = false;
      }
    });
  }


  completeWorkoutPlan(userPlan: UserWorkoutPlan): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Zakończenie planu treningowego',
        message: 'Czy na pewno chcesz zakończyć ten plan treningowy? Twój postęp zostanie zapisany, ale plan będzie oznaczony jako ukończony.',
        confirmButtonText: 'Zakończ',
        cancelButtonText: 'Anuluj'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const progress: WorkoutPlanProgress = {
          currentDay: userPlan.currentDay,
          status: WorkoutPlanStatus.COMPLETED,
          progressPercentage: 100
        };

        this.updating[userPlan.id] = true;

        this.workoutPlanService.updateWorkoutPlanProgress(userPlan.id, progress).subscribe({
          next: (updatedPlan) => {

            const index = this.userWorkoutPlans.findIndex(p => p.id === userPlan.id);
            if (index !== -1) {
              this.userWorkoutPlans[index] = updatedPlan;
            }
            this.snackBar.open('Plan treningowy został zakończony!', 'OK', { duration: 3000 });
            this.updating[userPlan.id] = false;
          },
          error: (error) => {
            console.error('Błąd podczas aktualizacji statusu planu:', error);
            this.snackBar.open('Nie udało się zakończyć planu treningowego', 'OK', { duration: 3000 });
            this.updating[userPlan.id] = false;
          }
        });
      }
    });
  }


  abandonWorkoutPlan(userPlan: UserWorkoutPlan): void {
    if (!userPlan) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Porzucanie planu treningowego',
        message: 'Czy na pewno chcesz porzucić ten plan treningowy? Twój postęp zostanie utracony.',
        confirmButtonText: 'Porzuć',
        cancelButtonText: 'Anuluj'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updating[userPlan.id] = true;

        this.workoutPlanService.abandonWorkoutPlan(userPlan.id).subscribe({
          next: () => {

            this.userWorkoutPlans = this.userWorkoutPlans.filter(p => p.id !== userPlan.id);
            this.snackBar.open('Plan treningowy został porzucony', 'OK', { duration: 3000 });
            this.updating[userPlan.id] = false;
          },
          error: (error) => {
            console.error('Błąd podczas porzucania planu:', error);
            this.snackBar.open('Nie udało się porzucić planu', 'OK', { duration: 3000 });
            this.updating[userPlan.id] = false;
          }
        });
      }
    });
  }


  viewWorkoutPlanDetails(planId: number): void {
    this.router.navigate(['/workout-plans', planId]);
  }


  canMoveToNextDay(userPlan: UserWorkoutPlan): boolean {
    if (!userPlan) return false;
    return userPlan.status === WorkoutPlanStatus.IN_PROGRESS &&
      userPlan.currentDay < (userPlan.workoutPlan.totalDays || 0);
  }

  canCompleteWorkoutPlan(userPlan: UserWorkoutPlan): boolean {
    if (!userPlan) return false;

    return userPlan.status !== 'COMPLETED';
  }


  getStatusName(status: string): string {
    const statusNames: Record<string, string> = {
      'NOT_STARTED': 'Nie rozpoczęty',
      'IN_PROGRESS': 'W trakcie',
      'COMPLETED': 'Ukończony',
      'ABANDONED': 'Porzucony'
    };
    return statusNames[status] || status;
  }

  getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      'NOT_STARTED': '#9e9e9e',
      'IN_PROGRESS': '#2196f3',
      'COMPLETED': '#4caf50',
      'ABANDONED': '#f44336'
    };
    return statusColors[status] || '#000000';
  }

  getDifficultyName(difficultyLevel: string): string {
    return this.workoutPlanService.getDifficultyName(difficultyLevel as any);
  }

  getGoalName(goal: string): string {
    return this.workoutPlanService.getGoalName(goal as any);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL');
  }
}
