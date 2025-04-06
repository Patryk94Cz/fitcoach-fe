// src/app/app.component.ts
import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent
  ],
  template: `
    <!-- Globalny navbar -->
    <app-navbar></app-navbar>

    <!-- Główna zawartość aplikacji -->
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    main {
      min-height: 100vh;
      padding-top: 64px; /* Przestrzeń dla fixed navbar */
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

  constructor(
    private router: Router
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
}
