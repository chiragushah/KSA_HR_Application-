// Loading Service - Global loading state management
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  constructor() {}

  setLoading(isLoading: boolean): void {
    this.loadingSubject.next(isLoading);
  }

  get isLoading(): boolean {
    return this.loadingSubject.value;
  }
}
