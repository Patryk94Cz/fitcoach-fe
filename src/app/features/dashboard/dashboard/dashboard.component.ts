import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { WorkoutSessionService } from '../../../core/services/workout-session.service';
import { WorkoutPlanService } from '../../../core/services/workout-plan.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None // Potrzebne dla stylów D3
})
export class DashboardComponent implements OnInit {
  totalWorkouts = 0;
  weeklyWorkouts = 0;
  activePlans = 0;
  totalItems = 0;

  constructor(
    private workoutSessionService: WorkoutSessionService,
    private workoutPlanService: WorkoutPlanService
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.renderWeeklyTracker();
    this.renderActivityHeatmap();
  }

  loadStats(): void {
    // Pobieranie statystyk
    this.workoutSessionService.getRecentSessions(0, 1).subscribe(response => {
      this.totalItems = response.totalElements;
    });

    // Pobieranie tygodniowych treningów
    const today = new Date();
    const startOfWeek = this.getMonday(new Date());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    this.workoutSessionService.getRecentSessions(0, 100).subscribe(response => {
      // Liczba treningów w tym tygodniu
      this.weeklyWorkouts = response.content.filter(session => {
        const sessionDate = new Date(session.sessionDate);
        return sessionDate >= startOfWeek && sessionDate <= endOfWeek;
      }).length;

      // Całkowita liczba treningów
      this.totalWorkouts = response.totalElements;
    });

    // Pobieranie aktywnych planów
    this.workoutPlanService.getUserWorkoutPlans().subscribe(response => {
      this.activePlans = response.content.filter(plan =>
        plan.status === 'IN_PROGRESS' || plan.status === 'NOT_STARTED'
      ).length;
    });
  }

  renderWeeklyTracker(): void {
    // Pobieramy dane sesji treningowych z tego tygodnia
    const today = new Date();
    const startOfWeek = this.getMonday(today);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    this.workoutSessionService.getRecentSessions(0, 100).subscribe(response => {
      // Filtrujemy sesje z tego tygodnia
      const thisWeekSessions = response.content.filter(session => {
        const sessionDate = new Date(session.sessionDate);
        return sessionDate >= startOfWeek && sessionDate <= endOfWeek;
      });

      // Tworzymy tablicę dni tygodnia
      const weekDays: any = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(date.getDate() + i);

        weekDays.push({
          name: ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'][i],
          date: date,
          hasWorkout: false,
          isToday: this.isSameDay(date, today)
        });
      }

      // Oznaczamy dni z treningami
      thisWeekSessions.forEach(session => {
        const sessionDate = new Date(session.sessionDate);
        const dayOfWeek = (sessionDate.getDay() + 6) % 7; // Konwersja niedzieli (0) na 6
        weekDays[dayOfWeek].hasWorkout = true;
      });

      // Renderujemy komponent
      this.renderWeeklyTrackerD3(weekDays);
    });
  }

  renderWeeklyTrackerD3(weekDays: any[]): void {
    // Usuwamy poprzedni svg jeśli istnieje
    d3.select('#weekly-tracker').selectAll('*').remove();

    // Pobieramy szerokość kontenera
    const container = document.getElementById('weekly-tracker');
    const containerWidth = container ? container.clientWidth : 700;

    const width = containerWidth || 700; // Używamy pełnej szerokości lub fallback do 700px
    const height = 100;

    const svg = d3.select('#weekly-tracker')
      .append('svg')
      .attr('width', '100%') // Używamy 100% szerokości
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const dayWidth = width / 7;

    // Grupa dla każdego dnia
    const days = svg.selectAll('.day-group')
      .data(weekDays)
      .enter()
      .append('g')
      .attr('class', 'day-group')
      .attr('transform', (d, i) => `translate(${i * dayWidth + dayWidth/2}, ${height/2})`);

    // Dodajemy nazwę dnia
    days.append('text')
      .attr('class', 'day-name')
      .attr('text-anchor', 'middle')
      .attr('y', -30)
      .text(d => d.name);

    // Dodajemy okrąg ze statusem
    days.append('circle')
      .attr('class', d => `day-circle ${d.hasWorkout ? 'active' : 'inactive'} ${d.isToday ? 'today' : ''}`)
      .attr('r', 18)
      .attr('fill', d => d.hasWorkout ? '#4CAF50' : '#f5f5f5')
      .attr('stroke', d => d.isToday ? '#3f51b5' : 'none')
      .attr('stroke-width', d => d.isToday ? 2 : 0);

    // Dodajemy ikonę zaznaczenia dla dni z treningiem
    days.filter(d => d.hasWorkout)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', 'white')
      .attr('font-family', 'Material Icons')
      .attr('font-size', '14px')
      .text('check');

    // Dodajemy szarą ikonę dla dni bez treningu
    days.filter(d => !d.hasWorkout)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#bdbdbd') // Kolor szary
      .attr('font-family', 'Material Icons')
      .attr('font-size', '14px')
      .text('close'); // lub inna ikona np. 'remove'
  }

  renderActivityHeatmap(): void {
    // Pobieramy dane sesji treningowych z ostatniego roku
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    this.workoutSessionService.getRecentSessions(0, 365).subscribe(response => {
      // Tworzymy mapę dat z licznikiem treningów
      const workoutMap = new Map();

      response.content.forEach(session => {
        const date = new Date(session.sessionDate);
        const dateKey = d3.timeFormat('%Y-%m-%d')(date);
        workoutMap.set(dateKey, (workoutMap.get(dateKey) || 0) + 1);
      });

      // Renderujemy heatmapę
      this.renderHeatmapD3(workoutMap, oneYearAgo, today);
    });
  }

  renderHeatmapD3(workoutMap: Map<string, number>, startDate: Date, endDate: Date): void {
    // Usuwamy poprzedni svg jeśli istnieje
    d3.select('#activity-heatmap').selectAll('*').remove();

    // Pobieramy szerokość kontenera
    const container = document.getElementById('activity-heatmap');
    const containerWidth = container ? container.clientWidth : 800;

    // Parametry heatmapy
    const cellSize = 12;
    const cellMargin = 2;
    const totalSize = cellSize + cellMargin;

    const weeksInYear = 53;

    // Dostosowujemy szerokość, aby wypełnić kontener
    const width = containerWidth || totalSize * weeksInYear + 40;
    const height = totalSize * 7 + 30; // Dodajemy miejsce na etykiety miesięcy

    // Skala kolorów - od jasno do ciemno zielonego
    const colorScale = d3.scaleLinear<string>()
      .domain([0, 1, 2, 3, 4])
      .range(['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'])
      .clamp(true);

    // Tworzymy element SVG
    const svg = d3.select('#activity-heatmap')
      .append('svg')
      .attr('width', '100%') // Używamy 100% szerokości
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMinYMid meet'); // Zmiana na xMinYMid dla lepszego rozmieszczenia

    // Tworzymy tooltip
    const tooltip = d3.select('#activity-heatmap')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    // Generujemy dni w zakresie
    const days = d3.timeDays(startDate, d3.timeDay.offset(endDate, 1));

    // Dostosowujemy skalę dla osi X, aby rozciągnąć heatmap
    const xScale = d3.scaleLinear()
      .domain([0, weeksInYear])
      .range([40, width - 10]); // Marginesy: lewy 40px, prawy 10px

    // Rysujemy komórki dla dni
    svg.selectAll('.day')
      .data(days)
      .enter()
      .append('rect')
      .attr('class', 'day')
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('x', d => {
        const weekOfYear = d3.timeWeek.count(d3.timeYear(d), d);
        return xScale(weekOfYear); // Używamy skali zamiast stałego mnożenia
      })
      .attr('y', d => {
        const dayOfWeek = d.getDay();
        return (dayOfWeek === 0 ? 6 : dayOfWeek - 1) * totalSize + 30; // Przesunięcie dla etykiet miesięcy
      })
      .attr('fill', d => {
        const dateKey = d3.timeFormat('%Y-%m-%d')(d);
        const count = workoutMap.get(dateKey) || 0;
        return colorScale(count);
      })
      .on('mouseover', (event, d) => {
        const dateKey = d3.timeFormat('%Y-%m-%d')(d);
        const count = workoutMap.get(dateKey) || 0;
        const formattedDate = d3.timeFormat('%d %b %Y')(d);

        tooltip.transition()
          .duration(200)
          .style('opacity', .9);

        tooltip.html(formattedDate + ': ' + (count ? count + ' trening(ów)' : 'Brak treningów'))
          .style('left', (event.pageX) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', () => {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });

    // Dodajemy etykiety miesięcy - dostosowane do rozciągniętego widoku
    const monthLabels = svg.selectAll('.month-label')
      .data(d3.timeMonths(startDate, endDate))
      .enter()
      .append('text')
      .attr('class', 'month-label')
      .attr('x', d => {
        const weekOfYear = d3.timeWeek.count(d3.timeYear(d), d);
        return xScale(weekOfYear); // Używamy skali
      })
      .attr('y', 20) // Przesunięcie dla etykiet miesięcy
      .text(d => d3.timeFormat('%b')(d));

    // Dodajemy etykiety dni tygodnia
    const weekdayLabels = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'];

    svg.selectAll('.weekday-label')
      .data(weekdayLabels)
      .enter()
      .append('text')
      .attr('class', 'day-label')
      .attr('x', 30)
      .attr('y', (d, i) => i * totalSize + 30 + cellSize - 2) // Przesunięcie dla etykiet dni
      .attr('text-anchor', 'end')
      .text(d => d);
  }

  // Pomocnicze metody
  getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // dostosowanie dla niedzieli
    return new Date(d.setDate(diff));
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  getCurrentWeekRange(): string {
    const startOfWeek = this.getMonday(new Date());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    const startStr = startOfWeek.toLocaleDateString('pl-PL', options);
    const endStr = endOfWeek.toLocaleDateString('pl-PL', options);
    const year = endOfWeek.getFullYear();

    return `${startStr} - ${endStr} ${year}`;
  }
}
