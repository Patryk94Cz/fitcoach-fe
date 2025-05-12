// src/app/app.routes.ts (updated)
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  // Ścieżki dla ćwiczeń
  {
    path: 'exercises',
    loadComponent: () => import('./features/exercises/exercise-list/exercise-list.component').then(m => m.ExerciseListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'exercises/create',
    loadComponent: () => import('./features/exercises/exercise-form/exercise-form.component').then(m => m.ExerciseFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'exercises/:id',
    loadComponent: () => import('./features/exercises/exercise-detail/exercise-detail.component').then(m => m.ExerciseDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'exercises/edit/:id',
    loadComponent: () => import('./features/exercises/exercise-form/exercise-form.component').then(m => m.ExerciseFormComponent),
    canActivate: [authGuard]
  },
  // Ścieżki dla planów treningowych
  {
    path: 'workout-plans',
    loadComponent: () => import('./features/workout-plans/workout-plan-list/workout-plan-list.component').then(m => m.WorkoutPlanListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'workout-plans/create',
    loadComponent: () => import('./features/workout-plans/workout-plan-form/workout-plan-form.component').then(m => m.WorkoutPlanFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'workout-plans/:id',
    loadComponent: () => import('./features/workout-plans/workout-plan-detail/workout-plan-detail.component').then(m => m.WorkoutPlanDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'workout-plans/edit/:id',
    loadComponent: () => import('./features/workout-plans/workout-plan-form/workout-plan-form.component').then(m => m.WorkoutPlanFormComponent),
    canActivate: [authGuard]
  },
  // Nowa ścieżka dla rejestracji treningu
  {
    path: 'new-workout',
    loadComponent: () => import('./features/workout-sessions/new-workout/new-workout.component').then(m => m.NewWorkoutComponent),
    canActivate: [authGuard]
  },
  // Ścieżki dla historii treningów
  {
    path: 'my-workouts',
    loadComponent: () => import('./features/workout-sessions/workout-history/workout-history.component').then(m => m.WorkoutHistoryComponent),
    canActivate: [authGuard]
  },
  // Ścieżki dla sesji treningowych
  {
    path: 'workout-sessions/:id',
    loadComponent: () => import('./features/workout-sessions/session-detail/session-detail.component').then(m => m.SessionDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
