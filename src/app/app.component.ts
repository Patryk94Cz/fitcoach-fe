// src/app/app.component.ts
import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs/operators';
import { MatSidenavModule } from '@angular/material/sidenav';

import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    SidebarComponent,
    MatSidenavModule
  ],
  template: `
    <!-- Globalny navbar -->
    <app-navbar (sidebarToggle)="toggleSidebar()"></app-navbar>

    <!-- Sidebar - widoczny tylko dla zalogowanych -->
    <app-sidebar *ngIf="authService.isAuthenticated()"
                 (toggleSidebar)="onSidebarToggled($event)">
    </app-sidebar>

    <!-- Główna zawartość aplikacji z odpowiednim marginesem zależnym od stanu sidebar -->
    <main [ngClass]="{'with-sidebar': authService.isAuthenticated(),
                      'sidebar-expanded': sidebarExpanded && authService.isAuthenticated()}">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    main {
      min-height: 100vh;
      padding-top: 64px; /* Przestrzeń dla fixed navbar */
    }

    .with-sidebar {
      margin-left: 60px; /* Dla zwiniętego sidebara */
      transition: margin-left 0.3s ease;
    }

    .sidebar-expanded {
      margin-left: 220px; /* Dla rozwiniętego sidebara */
    }

    @media (max-width: 600px) {
      main {
        padding-top: 56px; /* Mniejszy padding dla mniejszych ekranów */
      }
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'fitcoach';
  private platformId = inject(PLATFORM_ID);
  sidebarExpanded = true;

  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit() {
    // Monitoruj ukończone nawigacje i resetuj przewijanie strony
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Przewijaj do góry przy każdej zmianie strony - tylko w przeglądarce
      if (isPlatformBrowser(this.platformId)) {
        window.scrollTo(0, 0);
      }
    });
  }

  toggleSidebar() {
    this.sidebarExpanded = !this.sidebarExpanded;
  }

  onSidebarToggled(isExpanded: boolean) {
    this.sidebarExpanded = isExpanded;
  }
}
