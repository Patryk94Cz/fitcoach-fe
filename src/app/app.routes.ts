// src/app/app.routes.ts - Aktualizacja routingu o ścieżki do ćwiczeń
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
  // Dodane ścieżki dla ćwiczeń - wszystkie z guardami wymagającymi zalogowania
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
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
