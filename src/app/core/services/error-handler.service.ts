import { ErrorHandler, Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private http = inject(HttpClient);

  handleError(error: any): void {
    // Zawsze loguj do console
    console.error('Global error caught:', error);

    // W production wyślij do Azure Functions API
    if (environment.production) {
      this.logErrorToAPI(error);
    }

    // Opcjonalnie: pokaż user-friendly message
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

    // Wyślij do Azure Functions
    this.http.post('/api/log-error', errorData).subscribe({
      next: () => console.log('Error logged to API'),
      error: (apiError) => console.error('Failed to log error to API:', apiError)
    });
  }

  private getCurrentUserId(): string | null {
    // Implementuj zgodnie z twoim systemem auth
    // Na przykład: pobierz z localStorage, JWT token itp.
    return localStorage.getItem('userId') || null;
  }

  private showUserFriendlyError(error: any): void {
    // Możesz tutaj dodać logic do pokazywania toast/snackbar użytkownikowi
  }

  // Metody pomocnicze do ręcznego trackowania
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
