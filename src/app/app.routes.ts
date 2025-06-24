import {Routes} from '@angular/router';
import {authGuard} from './core/guards/auth.guard';

export const routes: Routes = [

  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    data: {prerender: true}
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    data: {prerender: true}
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    data: {prerender: true}
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    data: {prerender: true}
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    data: {prerender: true}
  },


  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    data: {prerender: false}
  },
  {
    path: 'exercises',
    loadComponent: () => import('./features/exercises/exercise-list/exercise-list.component').then(m => m.ExerciseListComponent),
    canActivate: [authGuard],
    data: {prerender: false}
  },
  {
    path: 'exercises/create',
    loadComponent: () => import('./features/exercises/exercise-form/exercise-form.component').then(m => m.ExerciseFormComponent),
    canActivate: [authGuard],
    data: {prerender: false}
  },
  {
    path: 'exercises/edit/:id',
    loadComponent: () => import('./features/exercises/exercise-form/exercise-form.component').then(m => m.ExerciseFormComponent),
    canActivate: [authGuard],
    data: {prerender: false}
  },
  {
    path: 'exercises/:id',
    loadComponent: () => import('./features/exercises/exercise-detail/exercise-detail.component').then(m => m.ExerciseDetailComponent),
    canActivate: [authGuard],
    data: {prerender: false}
  },
  {
    path: 'workout-plans',
    loadComponent: () => import('./features/workout-plans/workout-plan-list/workout-plan-list.component').then(m => m.WorkoutPlanListComponent),
    canActivate: [authGuard],
    data: {prerender: false}
  },
  {
    path: 'workout-plans/create',
    loadComponent: () => import('./features/workout-plans/workout-plan-form/workout-plan-form.component').then(m => m.WorkoutPlanFormComponent),
    canActivate: [authGuard],
    data: {prerender: false}
  },
  {
    path: 'workout-plans/edit/:id',
    loadComponent: () => import('./features/workout-plans/workout-plan-form/workout-plan-form.component').then(m => m.WorkoutPlanFormComponent),
    canActivate: [authGuard],
    data: {prerender: false}
  },
  {
    path: 'workout-plans/:id',
    loadComponent: () => import('./features/workout-plans/workout-plan-detail/workout-plan-detail.component').then(m => m.WorkoutPlanDetailComponent),
    canActivate: [authGuard],
    data: {prerender: false}
  },
  {
    path: 'my-workout-plans',
    loadComponent: () => import('./features/workout-plans/my-workout-plans/my-workout-plans.component').then(m => m.MyWorkoutPlansComponent),
    canActivate: [authGuard],
    data: {prerender: false}
  },
  {
    path: 'new-workout',
    loadComponent: () => import('./features/workout-sessions/new-workout/new-workout.component').then(m => m.NewWorkoutComponent),
    canActivate: [authGuard],
    data: {prerender: false}
  },
  {
    path: 'workout-sessions/new',
    loadComponent: () => import('./features/workout-sessions/session-form/session-form.component').then(m => m.SessionFormComponent),
    canActivate: [authGuard],
    data: {prerender: false}
  },
  {
    path: 'workout-sessions/:id',
    loadComponent: () => import('./features/workout-sessions/session-detail/session-detail.component').then(m => m.SessionDetailComponent),
    canActivate: [authGuard],
    data: {prerender: false}
  },
  {
    path: 'my-workouts',
    loadComponent: () => import('./features/workout-sessions/workout-history/workout-history.component').then(m => m.WorkoutHistoryComponent),
    canActivate: [authGuard],
    data: {prerender: false}
  },
  {
    path: 'exercise-history-table',
    loadComponent: () => import('./features/exercises/exercise-history-table/exercise-history-table.component').then(m => m.ExerciseHistoryTableComponent),
    canActivate: [authGuard],
    data: {prerender: false}
  },
  {
    path: 'exercise-stats',
    loadComponent: () => import('./features/statistics/exercise-stats/exercise-stats.component').then(m => m.ExerciseStatsComponent),
    canActivate: [authGuard],
    data: {prerender: false}
  },


  {
    path: '**',
    redirectTo: '',
    data: {prerender: true}
  }
];
