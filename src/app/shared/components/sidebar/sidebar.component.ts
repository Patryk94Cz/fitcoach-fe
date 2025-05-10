// src/app/shared/components/sidebar/sidebar.component.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AuthService } from '../../../core/services/auth.service';

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

  // Navigation menu items
  navItems = [
    {
      name: 'Dashboard',
      route: '/dashboard',
      icon: 'dashboard'
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
      name: 'Moje treningi',
      route: '/my-workouts',
      icon: 'assignment'
    }
  ];

  constructor(
    private router: Router,
    public authService: AuthService
  ) { }

  // Toggle sidebar expansion
  toggleMenu() {
    this.isExpanded = !this.isExpanded;
    this.toggleSidebar.emit(this.isExpanded);
  }

  // Navigate to route
  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
