// Loading Interceptor - Track HTTP request loading state
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private totalRequests = 0;

  constructor(private loadingService: LoadingService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.totalRequests++;
    this.loadingService.setLoading(true);

    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.decrementRequests();
        }
      }),
      finalize(() => {
        this.decrementRequests();
      })
    );
  }

  private decrementRequests(): void {
    this.totalRequests--;
    if (this.totalRequests === 0) {
      this.loadingService.setLoading(false);
    }
  }
}
