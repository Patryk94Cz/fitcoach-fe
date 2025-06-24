import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { WorkoutSessionService } from '../../../core/services/workout-session.service';
import { ExerciseHistory, HistoryEntry } from '../../../models/workout-session.model';
import * as d3 from 'd3';
import {max, min, sum} from 'd3';

interface ChartData {
  date: Date;
  weight: number;
}

@Component({
  selector: 'app-exercise-stats',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './exercise-stats.component.html',
  styleUrls: ['./exercise-stats.component.scss']
})
export class ExerciseStatsComponent implements OnInit, AfterViewInit {
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  filterForm: FormGroup;
  loading = false;
  exerciseHistory: ExerciseHistory[] = [];
  uniqueExercises: { name: string, id: string }[] = [];
  selectedExercise: string | null = null;
  selectedRange: 'week' | 'month' | 'year' = 'month';
  chartData: ChartData[] = [];
  chartInitialized = false;

  noDataMessage = '';

  constructor(
    private fb: FormBuilder,
    private workoutSessionService: WorkoutSessionService,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      exerciseId: [''],
      dateRange: ['month']
    });
  }

  ngOnInit(): void {
    this.loadExerciseHistory();

    this.filterForm.valueChanges.subscribe(values => {
      this.selectedExercise = values.exerciseId;
      this.selectedRange = values.dateRange;
      this.prepareChartData();

      if (this.chartContainer && this.chartInitialized) {
        this.renderChart();
      }
    });
  }

  ngAfterViewInit(): void {
    this.chartInitialized = true;

    if (this.selectedExercise) {
      this.prepareChartData();
      this.renderChart();
    }
  }

  getMinWeight(): number {
    if (!this.chartData || this.chartData.length === 0) {
      return 0;
    }
    return this.chartData.reduce(
      (min, curr) => curr.weight < min ? curr.weight : min,
      this.chartData[0].weight
    );
  }

  getMaxWeight(): number {
    if (!this.chartData || this.chartData.length === 0) {
      return 0;
    }
    return this.chartData.reduce(
      (max, curr) => curr.weight > max ? curr.weight : max,
      0
    );
  }

  getAverageWeight(): number {
    if (!this.chartData || this.chartData.length === 0) {
      return 0;
    }
    return this.chartData.reduce((sum, curr) => sum + curr.weight, 0) / this.chartData.length;
  }

  loadExerciseHistory(): void {
    this.loading = true;

    this.workoutSessionService.getAllExercisesHistory().subscribe({
      next: (history) => {
        this.exerciseHistory = history;

        this.uniqueExercises = history.map(item => ({
          name: item.exerciseName,
          id: item.exerciseName
        }));

        if (this.uniqueExercises.length > 0) {
          const firstExerciseId = this.uniqueExercises[0].id;

          this.filterForm.patchValue({
            exerciseId: firstExerciseId
          });

          this.selectedExercise = firstExerciseId;
          this.prepareChartData();

          if (this.chartInitialized) {
            this.renderChart();
          }
        } else {
          this.noDataMessage = 'Brak historii ćwiczeń. Zarejestruj swoje pierwsze treningi.';
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Błąd podczas ładowania historii ćwiczeń:', error);
        this.snackBar.open('Nie udało się załadować historii ćwiczeń', 'OK', { duration: 3000 });
        this.loading = false;
        this.noDataMessage = 'Wystąpił błąd podczas ładowania danych.';
      }
    });
  }

  prepareChartData(): void {
    if (!this.selectedExercise) {
      this.chartData = [];
      return;
    }

    const exerciseData = this.exerciseHistory.find(
      ex => ex.exerciseName === this.selectedExercise
    );

    if (!exerciseData || exerciseData.history.length === 0) {
      this.chartData = [];
      return;
    }

    const now = new Date();
    let startDate: Date;

    switch (this.selectedRange) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
    }

    this.chartData = exerciseData.history
      .filter(entry => new Date(entry.date) >= startDate)
      .map(entry => {
        let weightValue = 0;
        const weightMatch = entry.weightUsed.match(/(\d+)/);
        if (weightMatch) {
          weightValue = parseInt(weightMatch[0], 10);
        }

        return {
          date: new Date(entry.date),
          weight: weightValue
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  renderChart(): void {
    if (!this.chartContainer) {
      return;
    }

    const element = this.chartContainer.nativeElement;
    while (element.firstChild) {
      element.firstChild.remove();
    }

    if (!this.chartData || this.chartData.length === 0) {
      this.renderEmptyState();
      return;
    }

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
      .domain(d3.extent(this.chartData, d => d.date) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(this.chartData, d => d.weight) as number * 1.1])
      .range([height, 0]);

    const line = d3.line<ChartData>()
      .x(d => x(d.date))
      .y(d => y(d.weight))
      .curve(d3.curveMonotoneX);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat('%d %b') as any))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    svg.append('g')
      .call(d3.axisLeft(y));

    svg.append('path')
      .datum(this.chartData)
      .attr('fill', 'none')
      .attr('stroke', '#3f51b5')
      .attr('stroke-width', 3)
      .attr('d', line);

    svg.selectAll('.dot')
      .data(this.chartData)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.date))
      .attr('cy', d => y(d.weight))
      .attr('r', 5)
      .attr('fill', '#3f51b5')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    const tooltip = d3.select('body').append('div')
      .attr('class', 'chart-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('font-size', '12px')
      .style('z-index', '10');

    svg.selectAll('.dot')
      .on('mouseover', (event, d:any) => {
        tooltip.transition()
          .duration(200)
          .style('opacity', .9);
        tooltip.html(`Data: ${d.date.toLocaleDateString('pl-PL')}<br/>Waga: ${d.weight} kg`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', () => {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 0 - (margin.top / 2))
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text(`Progres obciążenia: ${this.selectedExercise}`);

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Obciążenie (kg)');
  }

  renderEmptyState(): void {
    const element = this.chartContainer.nativeElement;
    const width = element.clientWidth;
    const height = 400;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const container = svg.append('g')
      .attr('transform', `translate(${width/2}, ${height/2})`);

    container.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-1em')
      .text('Brak danych do wyświetlenia');

    container.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .text('Wybierz inne ćwiczenie lub zakres dat');
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL');
  }

  onRangeChange(range: 'week' | 'month' | 'year'): void {
    this.filterForm.patchValue({ dateRange: range });
  }

  protected readonly max = max;
  protected readonly min = min;
  protected readonly sum = sum;
}
