# FitCoach - Frontend Application

![Angular](https://img.shields.io/badge/Angular-18.0.0-red?style=flat-square&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Material Design](https://img.shields.io/badge/Material%20Design-18.0-blue?style=flat-square&logo=material-design)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## 📋 Spis treści

- [Opis projektu](#-opis-projektu)
- [Funkcjonalności](#-funkcjonalności)
- [Architektura aplikacji](#-architektura-aplikacji)
- [Stos technologiczny](#-stos-technologiczny)
- [Struktura projektu](#-struktura-projektu)
- [Instalacja i uruchomienie](#-instalacja-i-uruchomienie)
- [Konfiguracja](#-konfiguracja)
- [Moduły i komponenty](#-moduły-i-komponenty)
- [Routing i nawigacja](#-routing-i-nawigacja)
- [Zarządzanie stanem](#-zarządzanie-stanem)
- [Stylowanie i UI](#-stylowanie-i-ui)
- [Wizualizacje i wykresy](#-wizualizacje-i-wykresy)
- [Testowanie](#-testowanie)
- [Bezpieczeństwo](#-bezpieczeństwo)
- [Performance](#-performance)
- [Deployment](#-deployment)

## 🎯 Opis projektu

FitCoach to nowoczesna aplikacja webowa do zarządzania treningami i śledzenia postępów fitness. Aplikacja umożliwia użytkownikom tworzenie spersonalizowanych planów treningowych, rejestrowanie sesji treningowych oraz monitorowanie swoich osiągnięć poprzez zaawansowane wizualizacje i analizy.

### Cele aplikacji

- **Personalizacja treningów** - Tworzenie planów dopasowanych do indywidualnych potrzeb
- **Monitoring postępów** - Śledzenie rozwoju poprzez interaktywne wykresy i statystyki
- **Społeczność fitness** - Dzielenie się planami i oceną ćwiczeń innych użytkowników
- **Motywacja** - Gamifikacja procesu treningowego poprzez postępy i osiągnięcia

## ✨ Funkcjonalności

### 🔐 Autentykacja i autoryzacja
- Rejestracja nowych użytkowników z walidacją
- Logowanie z zapamiętywaniem sesji
- Reset hasła poprzez email
- Zarządzanie profilem użytkownika
- Zabezpieczone routes z guard'ami

### 🏋️ Zarządzanie ćwiczeniami
- **Biblioteka ćwiczeń** - Przeglądanie bazy ćwiczeń z filtrowaniem i wyszukiwaniem
- **Tworzenie ćwiczeń** - Dodawanie własnych ćwiczeń z opisami i instrukcjami
- **Kategoryzacja** - Podział na grupy mięśniowe, poziomy trudności, rodzaje sprzętu
- **System ocen** - Ocenianie i komentowanie ćwiczeń przez użytkowników
- **Ulubione** - Dodawanie ćwiczeń do listy ulubionych

### 📅 Plany treningowe
- **Kreator planów** - Wieloetapowy formularz tworzenia planów treningowych
- **Harmonogram** - Definowanie dni treningowych z konkretnymi ćwiczeniami
- **Parametry ćwiczeń** - Ustalanie liczby serii, powtórzeń, obciążeń i czasu odpoczynku
- **Cele treningowe** - Klasyfikacja planów według celów (siła, masa, redukcja, wytrzymałość)
- **Współdzielenie** - Publikowanie planów dla innych użytkowników
- **Dołączanie do planów** - Możliwość korzystania z planów innych użytkowników

### 📊 Sesje treningowe
- **Rejestracja treningów** - Zapisywanie wykonanych ćwiczeń z parametrami
- **Historia sesji** - Przeglądanie wszystkich odbytych treningów
- **Szczegóły sesji** - Dokładne informacje o każdym treningu
- **Notatki** - Dodawanie uwag do ćwiczeń i całych sesji
- **Postęp w planie** - Śledzenie realizacji planów treningowych

### 📈 Analityka i statystyki
- **Dashboard** - Główny panel z kluczowymi metrykami
- **Wykresy postępów** - Interaktywne wizualizacje rozwoju w poszczególnych ćwiczeniach
- **Kalendarz aktywności** - Heatmapa pokazująca regularność treningów (podobna do GitHub)
- **Statystyki tygodniowe** - Podsumowanie aktywności w bieżącym tygodniu
- **Trendy** - Analiza długoterminowych postępów

### 🎨 Interfejs użytkownika
- **Material Design** - Nowoczesny, intuicyjny design
- **Responsywność** - Pełna funkcjonalność na wszystkich urządzeniach
- **Dark/Light mode** - Wsparcie dla różnych motywów kolorystycznych
- **Animacje** - Płynne przejścia i mikrointerakcje
- **Accessibility** - Zgodność z wytycznymi WCAG

## 🏗️ Architektura aplikacji

### Wzorce architektoniczne

**Single Page Application (SPA)**
- Aplikacja ładowana jednorazowo z dynamiczną nawigacją
- Komunikacja z API poprzez HTTP calls
- Client-side routing z Angular Router

**Component-Based Architecture**
- Standalone components zamiast tradycyjnych modułów
- Kompozycja funkcjonalności poprzez komponenty
- Reużywalne komponenty UI w folderze `shared`

**Feature-Based Structure**
- Organizacja kodu według funkcjonalności biznesowych
- Każda feature ma własne komponenty, serwisy i modele
- Wyraźne oddzielenie odpowiedzialności

### Warstwy aplikacji

1. **Presentation Layer** - Komponenty Angular z szablonami i stylami
2. **Business Logic Layer** - Serwisy z logiką biznesową
3. **Data Access Layer** - HTTP interceptory i serwisy komunikacji z API
4. **Model Layer** - Definicje typów TypeScript i interfejsów

## 🛠️ Stos technologiczny

### Framework i biblioteki

| Technologia | Wersja | Zastosowanie |
|------------|--------|--------------|
| **Angular** | 18.0.0 | Framework aplikacji |
| **TypeScript** | 5.0+ | Język programowania |
| **RxJS** | 7.8+ | Programowanie reaktywne |
| **Angular Material** | 18.0+ | Komponenty UI |
| **D3.js** | 7.8+ | Wizualizacje danych |
| **SCSS** | - | Stylowanie |

### Narzędzia deweloperskie

- **Angular CLI** - Narzędzia budowania i developerskie
- **ESLint** - Linting kodu TypeScript
- **Prettier** - Formatowanie kodu
- **Jasmine + Karma** - Testowanie jednostkowe
- **Cypress** - Testy end-to-end

### Biblioteki dodatkowe

- **Material Icons** - Ikony

## 📁 Struktura projektu

```
src/
├── app/
│   ├── core/                     # Podstawowe serwisy i funkcjonalności
│   │   ├── guards/               # Route guards (auth, role)
│   │   ├── interceptors/         # HTTP interceptors
│   │   └── services/             # Główne serwisy biznesowe
│   │       ├── auth.service.ts
│   │       ├── exercise.service.ts
│   │       ├── workout-plan.service.ts
│   │       └── workout-session.service.ts
│   │
│   ├── features/                 # Moduły funkcjonalne
│   │   ├── auth/                 # Autentykacja
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   │
│   │   ├── dashboard/            # Panel główny
│   │   │   └── dashboard/
│   │   │
│   │   ├── exercises/            # Zarządzanie ćwiczeniami
│   │   │   ├── exercise-list/
│   │   │   ├── exercise-detail/
│   │   │   ├── exercise-form/
│   │   │   ├── exercise-card/
│   │   │   └── exercise-history-table/
│   │   │
│   │   ├── workout-plans/        # Plany treningowe
│   │   │   ├── workout-plan-list/
│   │   │   ├── workout-plan-detail/
│   │   │   ├── workout-plan-form/
│   │   │   ├── workout-plan-card/
│   │   │   └── my-workout-plans/
│   │   │
│   │   ├── workout-sessions/     # Sesje treningowe
│   │   │   ├── workout-history/
│   │   │   ├── session-detail/
│   │   │   ├── new-workout/
│   │   │   └── exercise-history/
│   │   │
│   │   ├── statistics/           # Analityka i wykresy
│   │   │   └── exercise-stats/
│   │   │
│   │   └── home/                 # Strona główna
│   │
│   ├── models/                   # Definicje typów i interfejsów
│   │   ├── auth/
│   │   ├── exercise.model.ts
│   │   ├── workout-plan.model.ts
│   │   ├── workout-session.model.ts
│   │   └── user.model.ts
│   │
│   ├── shared/                   # Komponenty współdzielone
│   │   ├── components/
│   │   │   ├── navbar/
│   │   │   ├── confirm-dialog/
│   │   │   └── loading-spinner/
│   │   ├── pipes/
│   │   └── validators/
│   │
│   ├── app.component.ts          # Główny komponent
│   ├── app.config.ts             # Konfiguracja aplikacji
│   └── app.routes.ts             # Definicje tras
│
├── assets/                       # Zasoby statyczne
│   ├── images/
│   └── icons/
│
├── environments/                 # Konfiguracje środowiskowe
│   ├── environment.ts
│   └── environment.prod.ts
│
└── styles/                       # Globalne style
    ├── _variables.scss
    ├── _mixins.scss
    └── styles.scss
```

## 🚀 Instalacja i uruchomienie

### Wymagania systemowe

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 lub **yarn** >= 1.22.0
- **Angular CLI** >= 18.0.0

### Kroki instalacji

1. **Klonowanie repozytorium**
```bash
git clone https://github.com/your-repo/fitcoach-frontend.git
cd fitcoach-frontend
```

2. **Instalacja zależności**
```bash
npm install
# lub
yarn install
```

3. **Konfiguracja środowiska**
```bash
cp src/environments/environment.example.ts src/environments/environment.ts
# Edytuj plik environment.ts zgodnie z potrzebami
```

4. **Uruchomienie aplikacji**
```bash
ng serve
# lub
npm start
```

Aplikacja będzie dostępna pod adresem: `http://localhost:4200`

### Skrypty npm

```json
{
  "start": "ng serve",
  "build": "ng build",
  "build:prod": "ng build --configuration production",
  "test": "ng test",
  "test:watch": "ng test --watch",
  "e2e": "ng e2e",
  "lint": "ng lint",
  "format": "prettier --write src/**/*.{ts,html,scss}"
}
```

## ⚙️ Konfiguracja

### Środowiska

**Development (environment.ts)**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  enableDevTools: true
};
```

**Production (environment.prod.ts)**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.fitcoach.app',
  enableDevTools: false
};
```

### Konfiguracja HTTP

**HTTP Interceptors**
- `AuthInterceptor` - Automatyczne dodawanie token'ów autoryzacji
- `ErrorInterceptor` - Globalna obsługa błędów HTTP
- `LoadingInterceptor` - Zarządzanie wskaźnikami ładowania

## 🧩 Moduły i komponenty

### Core Services

**AuthService**
- Zarządzanie autentykacją użytkowników
- Przechowywanie i walidacja JWT tokenów
- Auto-logout przy wygaśnięciu sesji

**ExerciseService**
- CRUD operacje na ćwiczeniach
- Filtrowanie i wyszukiwanie
- System oceniania

**WorkoutPlanService**
- Zarządzanie planami treningowymi
- Dołączanie do planów
- Śledzenie postępów

**WorkoutSessionService**
- Rejestracja sesji treningowych
- Historia treningów
- Analityka postępów

### Shared Components

**ConfirmDialogComponent**
- Uniwersalne okno dialogowe potwierdzeń
- Konfigurowalny tytuł i treść
- Obsługa różnych akcji

**NavbarComponent**
- Główna nawigacja aplikacji
- Responsywne menu
- Indykatory stanu użytkownika

### Feature Components

**Dashboard**
- Interaktywne wykresy D3.js
- Statystyki tygodniowe
- Heatmapa aktywności

**Exercise Management**
- Lista z filtrowaniem i paginacją
- Formularz tworzenia/edycji
- System oceniania i komentarzy

**Workout Planning**
- Wieloetapowy kreator planów
- Drag&drop organizacja ćwiczeń
- Podgląd harmonogramu

## 🗺️ Routing i nawigacja

### Struktura tras

```typescript
const routes: Routes = [
  { path: '', component: HomeComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'exercises',
    children: [
      { path: '', component: ExerciseListComponent },
      { path: 'create', component: ExerciseFormComponent },
      { path: ':id', component: ExerciseDetailComponent },
      { path: ':id/edit', component: ExerciseFormComponent }
    ]
  },
  // ... pozostałe trasy
];
```

### Guards

- **AuthGuard** - Sprawdzanie autentykacji
- **RoleGuard** - Weryfikacja uprawnień
- **UnsavedChangesGuard** - Ochrona przed utratą danych

## 🔄 Zarządzanie stanem

### RxJS i Reactive Programming

**BehaviorSubjects dla stanu globalnego**
```typescript
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
}
```

**Reactive Forms z walidacją**
```typescript
this.exerciseForm = this.fb.group({
  name: ['', [Validators.required, Validators.minLength(3)]],
  description: ['', [Validators.required, Validators.minLength(10)]],
  difficultyLevel: ['', Validators.required]
});
```

### LocalStorage Management

- Przechowywanie JWT tokenów
- Cache'owanie ulubionych ćwiczeń
- Preferencje użytkownika

## 🎨 Stylowanie i UI

### Material Design System

**Tema kolorystyczna**
```scss
$fitcoach-primary: mat.define-palette(mat.$indigo-palette);
$fitcoach-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);
$fitcoach-warn: mat.define-palette(mat.$red-palette);
```

**Responsive Design**
```scss
@mixin mobile {
  @media (max-width: 768px) { @content; }
}

@mixin tablet {
  @media (min-width: 769px) and (max-width: 1024px) { @content; }
}

@mixin desktop {
  @media (min-width: 1025px) { @content; }
}
```

### Component Styling

- **SCSS** z zagnieżdżonymi selektorami
- **BEM methodology** dla nazewnictwa klas
- **CSS Custom Properties** dla dynamicznych wartości
- **Angular Material theming** dla konsystentności

## 📊 Wizualizacje i wykresy

### D3.js Integration

**Weekly Activity Tracker**
```typescript
renderWeeklyTracker(): void {
  const svg = d3.select('#weekly-tracker')
    .append('svg')
    .attr('width', width)
    .attr('height', height);
    
  // Rendering logic for weekly progress circles
}
```

**Activity Heatmap (GitHub-style)**
```typescript
renderActivityHeatmap(): void {
  const colorScale = d3.scaleLinear<string>()
    .domain([0, 1, 2, 3, 4])
    .range(['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']);
    
  // Heatmap rendering with workout frequency data
}
```

**Exercise Progress Charts**
```typescript
renderChart(): void {
  const line = d3.line<ChartData>()
    .x(d => x(d.date))
    .y(d => y(d.weight))
    .curve(d3.curveMonotoneX);
    
  // Progress line chart for exercise weight tracking
}
```

### Chart Features

- **Interaktywne tooltips** z informacjami szczegółowymi
- **Zoom i pan** dla szczegółowej analizy
- **Animacje przejść** między stanami danych
- **Responsive sizing** dopasowanie do rozmiaru ekranu

## 🧪 Testowanie

### Unit Testing

**Jasmine + Karma Configuration**
```typescript
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService],
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  it('should authenticate user with valid credentials', () => {
    // Test implementation
  });
});
```

**Component Testing**
```typescript
describe('ExerciseListComponent', () => {
  let component: ExerciseListComponent;
  let fixture: ComponentFixture<ExerciseListComponent>;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ExerciseListComponent]
    });
    fixture = TestBed.createComponent(ExerciseListComponent);
    component = fixture.componentInstance;
  });
  
  it('should display exercises list', () => {
    // Test implementation
  });
});
```

### E2E Testing

**Cypress Configuration**
```typescript
describe('Workout Plan Creation', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/workout-plans/create');
  });
  
  it('should create new workout plan', () => {
    cy.get('[data-cy=plan-name]').type('My Custom Plan');
    cy.get('[data-cy=submit-button]').click();
    cy.url().should('include', '/workout-plans/');
  });
});
```

### Testing Strategy

- **Unit Tests** - Minimum 80% code coverage
- **Integration Tests** - Testowanie komunikacji między komponentami
- **E2E Tests** - Scenariusze użytkownika end-to-end
- **Visual Regression Tests** - Sprawdzanie zgodności UI

## 🔒 Bezpieczeństwo

### Authentication & Authorization

**JWT Token Management**
```typescript
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = this.authService.getToken();
    
    if (authToken) {
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${authToken}` }
      });
      return next.handle(authReq);
    }
    
    return next.handle(req);
  }
}
```

**Route Protection**
```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }
    
    this.router.navigate(['/login']);
    return false;
  }
}
```

### Security Measures

- **XSS Protection** - Sanityzacja danych wejściowych
- **CSRF Protection** - Tokeny CSRF w żądaniach
- **Content Security Policy** - Ograniczenie źródeł zasobów
- **Input Validation** - Walidacja po stronie klienta i serwera

## ⚡ Performance

### Optimization Strategies

**Lazy Loading**
```typescript
const routes: Routes = [
  {
    path: 'exercises',
    loadChildren: () => import('./features/exercises/exercises.routes')
      .then(m => m.EXERCISES_ROUTES)
  }
];
```

**OnPush Change Detection**
```typescript
@Component({
  selector: 'app-exercise-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`
})
export class ExerciseCardComponent {
  @Input() exercise!: Exercise;
}
```

**Virtual Scrolling**
```html
<cdk-virtual-scroll-viewport itemSize="80" class="exercise-viewport">
  <div *cdkVirtualFor="let exercise of exercises">
    <app-exercise-card [exercise]="exercise"></app-exercise-card>
  </div>
</cdk-virtual-scroll-viewport>
```

### Performance Metrics

- **First Contentful Paint** < 1.5s
- **Largest Contentful Paint** < 2.5s
- **Cumulative Layout Shift** < 0.1
- **Time to Interactive** < 3.0s

## 🚀 Deployment

### Build Configuration

**Production Build**
```bash
ng build --configuration production
```

**Build Optimizations**
- Tree shaking - Usuwanie nieużywanego kodu
- Code splitting - Podział kodu na chunki
- Minification - Kompresja plików
- AOT Compilation - Ahead-of-time kompilacja

### Deployment Platforms

**Netlify**
```toml
[build]
  command = "ng build --configuration production"
  publish = "dist/fitcoach-frontend"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Docker**
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:prod

FROM nginx:alpine
COPY --from=build /app/dist/fitcoach-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
```

### CI/CD Pipeline

**GitHub Actions**
```yaml
name: Build and Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run build:prod
```

## 📝 Dokumentacja API

### HTTP Client Configuration

**Base Service**
```typescript
@Injectable()
export abstract class BaseService {
  protected apiUrl = environment.apiUrl;
  
  constructor(protected http: HttpClient) {}
  
  protected handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => error);
  }
}
```

**Exercise Service Example**
```typescript
@Injectable()
export class ExerciseService extends BaseService {
  getExercises(page = 0, size = 10): Observable<PageResponse<Exercise>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    return this.http.get<PageResponse<Exercise>>(`${this.apiUrl}/exercises`, { params })
      .pipe(catchError(this.handleError));
  }
}
```

## 🤝 Contributing

### Development Workflow

1. **Fork** repozytorium
2. **Utwórz** feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** zmiany: `git commit -m 'Add amazing feature'`
4. **Push** branch: `git push origin feature/amazing-feature`
5. **Otwórz** Pull Request

### Code Style

- **TypeScript** - Strict mode enabled
- **ESLint** - Airbnb configuration
- **Prettier** - Automatyczne formatowanie
- **Conventional Commits** - Standardized commit messages

### Pull Request Guidelines

- Opis zmian w PR description
- Unit testy dla nowych funkcjonalności
- Update dokumentacji jeśli potrzebne
- Wszystkie checks muszą przechodzić
