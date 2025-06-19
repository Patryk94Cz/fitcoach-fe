import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'home',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'register',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'forgot-password',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'reset-password',
    renderMode: RenderMode.Prerender
  },

  {
    path: 'dashboard',
    renderMode: RenderMode.Server
  },
  {
    path: 'exercises',
    renderMode: RenderMode.Server
  },
  {
    path: 'exercises/create',
    renderMode: RenderMode.Server
  },
  {
    path: 'workout-plans',
    renderMode: RenderMode.Server
  },
  {
    path: 'workout-plans/create',
    renderMode: RenderMode.Server
  },
  {
    path: 'my-workouts',
    renderMode: RenderMode.Server
  },
  {
    path: 'new-workout',
    renderMode: RenderMode.Server
  },
  {
    path: 'exercise-history-table',
    renderMode: RenderMode.Server
  },
  {
    path: 'exercise-stats',
    renderMode: RenderMode.Server
  },

  {
    path: 'exercises/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'exercises/edit/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'workout-plans/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'workout-plans/edit/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'workout-sessions/:id',
    renderMode: RenderMode.Server
  },

  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
