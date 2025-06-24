import {Component, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {MatTableModule, MatTableDataSource} from '@angular/material/table';
import {MatPaginator, MatPaginatorModule, MatPaginatorIntl} from '@angular/material/paginator';
import {MatSort, MatSortModule, Sort} from '@angular/material/sort';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';

import {WorkoutSessionService} from '../../../core/services/workout-session.service';
import {ExerciseHistory, HistoryEntry} from '../../../models/workout-session.model';


interface FlattenedHistoryEntry extends HistoryEntry {
  exerciseName: string;
}


export class PolishPaginatorIntl extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Elementów na stronę:';
  override nextPageLabel = 'Następna strona';
  override previousPageLabel = 'Poprzednia strona';
  override firstPageLabel = 'Pierwsza strona';
  override lastPageLabel = 'Ostatnia strona';

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0) {
      return 'Strona 1 z 1';
    }
    const amountPages = Math.ceil(length / pageSize);
    return `Strona ${page + 1} z ${amountPages} (${length} elementów)`;
  };
}

@Component({
  selector: 'app-exercise-history-table',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './exercise-history-table.component.html',
  styleUrls: ['./exercise-history-table.component.scss'],
  providers: [
    {provide: MatPaginatorIntl, useClass: PolishPaginatorIntl}
  ]
})
export class ExerciseHistoryTableComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['date', 'exerciseName', 'setsCompleted', 'repsCompleted', 'weightUsed'];
  dataSource = new MatTableDataSource<FlattenedHistoryEntry>([]);


  selectedExercise: string = '';
  uniqueExerciseNames: string[] = [];
  loading = false;


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  originalData: FlattenedHistoryEntry[] = [];
  exerciseHistory: ExerciseHistory[] = [];

  constructor(
    private workoutSessionService: WorkoutSessionService,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
    this.loadExerciseHistory();
  }

  ngAfterViewInit(): void {


    setTimeout(() => {
      this.setupSortingAndPagination();
    });
  }

  setupSortingAndPagination(): void {

    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'date':
          return new Date(item.date).getTime();
        case 'exerciseName':
          return item.exerciseName;
        case 'setsCompleted':
          return item.setsCompleted;
        case 'repsCompleted':
          return item.repsCompleted;
        case 'weightUsed':

          const weightMatch = item.weightUsed.match(/\d+/);
          return weightMatch ? parseInt(weightMatch[0], 10) : 0;
        default:
          return (item as any)[property];
      }
    };


    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadExerciseHistory(): void {
    this.loading = true;

    this.workoutSessionService.getAllExercisesHistory().subscribe({
      next: (history) => {
        this.exerciseHistory = history;


        this.uniqueExerciseNames = history.map(item => item.exerciseName);


        const flattenedData: FlattenedHistoryEntry[] = [];

        history.forEach(exerciseHistory => {
          exerciseHistory.history.forEach(entry => {
            flattenedData.push({
              ...entry,
              exerciseName: exerciseHistory.exerciseName
            } as FlattenedHistoryEntry);
          });
        });

        this.originalData = flattenedData;
        this.dataSource.data = flattenedData;
        this.loading = false;


        setTimeout(() => {
          this.setupSortingAndPagination();
        });
      },
      error: (error) => {
        console.error('Błąd podczas ładowania historii ćwiczeń:', error);
        this.snackBar.open('Nie udało się załadować historii ćwiczeń', 'OK', {duration: 3000});
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    if (!this.selectedExercise) {

      this.dataSource.data = [...this.originalData];
    } else {

      this.dataSource.data = this.originalData.filter(item =>
        item.exerciseName === this.selectedExercise
      );
    }


    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilter(): void {
    this.selectedExercise = '';
    this.dataSource.data = [...this.originalData];


    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL');
  }


  hasActiveFilter(): boolean {
    return !!this.selectedExercise;
  }


  hasNoResults(): boolean {
    return this.dataSource.data.length === 0;
  }


  logSortingState(sort: Sort): void {
    console.log('Sorting state:', sort);
  }
}
