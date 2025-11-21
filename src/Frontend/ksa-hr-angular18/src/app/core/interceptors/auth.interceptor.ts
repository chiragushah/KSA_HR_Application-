// Auth Interceptor - Add JWT token to HTTP requests
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Check if request requires authentication
    if (this.isApiRequest(request)) {
      return from(this.addAuthHeader(request)).pipe(
        switchMap(authRequest => next.handle(authRequest))
      );
    }

    return next.handle(request);
  }

  private async addAuthHeader(request: HttpRequest<unknown>): Promise<HttpRequest<unknown>> {
    try {
      const token = await this.authService.getAccessToken().toPromise();
      
      if (token) {
        return request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Error getting access token:', error);
    }

    return request;
  }

  private isApiRequest(request: HttpRequest<unknown>): boolean {
    // Add authentication header only for API requests
    return request.url.includes('/api/');
  }
}
