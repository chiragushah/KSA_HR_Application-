// Error Interceptor - Handle HTTP errors globally
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Client Error: ${error.error.message}`;
        } else {
          // Server-side error
          errorMessage = this.getServerErrorMessage(error);
          
          // Handle specific HTTP status codes
          switch (error.status) {
            case 401:
              // Unauthorized - redirect to login
              this.router.navigate(['/login']);
              break;
            case 403:
              // Forbidden - redirect to unauthorized page
              this.router.navigate(['/unauthorized']);
              break;
            case 404:
              // Not found
              console.error('Resource not found:', error.url);
              break;
            case 500:
              // Server error
              console.error('Server error:', errorMessage);
              break;
          }
        }

        // Log error to console (in production, send to logging service)
        console.error('HTTP Error:', errorMessage);

        return throwError(() => ({
          status: error.status,
          message: errorMessage,
          error: error.error
        }));
      })
    );
  }

  private getServerErrorMessage(error: HttpErrorResponse): string {
    if (error.error && typeof error.error === 'object') {
      // API error with message
      if (error.error.message) {
        return error.error.message;
      }
      // Validation errors
      if (error.error.errors) {
        return Object.values(error.error.errors).flat().join(', ');
      }
    }

    // Default error message
    return `Server Error (${error.status}): ${error.statusText}`;
  }
}
