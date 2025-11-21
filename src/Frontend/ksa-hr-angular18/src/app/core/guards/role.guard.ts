// Role Guard - Protect routes based on user roles
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';
import { Role } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const requiredRoles = route.data['roles'] as Role[];

    if (!requiredRoles || requiredRoles.length === 0) {
      return new Observable(observer => {
        observer.next(true);
        observer.complete();
      });
    }

    return this.authService.currentUser$.pipe(
      map(user => {
        if (!user) {
          this.router.navigate(['/login']);
          return false;
        }

        const hasRole = this.authService.hasAnyRole(requiredRoles);
        
        if (hasRole) {
          return true;
        }

        // User doesn't have required role
        this.router.navigate(['/unauthorized']);
        return false;
      })
    );
  }
}
