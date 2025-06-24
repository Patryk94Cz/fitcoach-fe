import { ErrorHandler, Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private http = inject(HttpClient);

  handleError(error: any): void {
    console.error('Global error caught:', error);

    if (environment.production) {
      this.logErrorToAPI(error);
    }

    this.showUserFriendlyError(error);
  }

  private logErrorToAPI(error: any): void {
    const errorData = {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace available',
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId() // Implementuj zgodnie z twoim systemem auth
    };

    this.http.post('/api/log-error', errorData).subscribe({
      next: () => console.log('Error logged to API'),
      error: (apiError) => console.error('Failed to log error to API:', apiError)
    });
  }

  private getCurrentUserId(): string | null {
    return localStorage.getItem('userId') || null;
  }

  private showUserFriendlyError(error: any): void {
  }

  trackEvent(name: string, properties?: any): void {
    if (environment.production) {
      this.http.post('/api/log-error', {
        message: `Event: ${name}`,
        properties,
        timestamp: new Date().toISOString(),
        url: window.location.href
      }).subscribe();
    }
  }

  trackUserAction(action: string, properties?: any): void {
    this.trackEvent('UserAction', { action, ...properties });
  }
}
