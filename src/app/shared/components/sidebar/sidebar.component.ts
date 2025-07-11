import {Component, Output, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDividerModule} from '@angular/material/divider';
import {MatSidenavModule} from '@angular/material/sidenav';
import {AuthService} from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule,
    MatSidenavModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  isExpanded = true;

  @Output() toggleSidebar = new EventEmitter<boolean>();


  navItems = [
    {
      name: 'Dashboard',
      route: '/dashboard',
      icon: 'dashboard'
    },
    {
      name: 'Wykres',
      route: '/exercise-stats',
      icon: 'trending_up'
    },
    {
      name: 'Nowy trening',
      route: '/new-workout',
      icon: 'add_circle'
    },
    {
      name: 'Ćwiczenia',
      route: '/exercises',
      icon: 'fitness_center'
    },
    {
      name: 'Plany treningowe',
      route: '/workout-plans',
      icon: 'event_note'
    },
    {
      name: 'Historia treningów',
      route: '/my-workouts',
      icon: 'history'
    },
    {
      name: 'Historia ćwiczeń',
      route: '/exercise-history-table',
      icon: 'trending_up'
    },

  ];

  constructor(
    private router: Router,
    public authService: AuthService
  ) {
  }


  toggleMenu() {
    this.isExpanded = !this.isExpanded;
    this.toggleSidebar.emit(this.isExpanded);
  }


  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
