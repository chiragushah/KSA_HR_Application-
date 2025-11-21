// Authentication Service - Azure AD Integration
import { Injectable } from '@angular/core';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { AuthenticationResult, InteractionStatus } from '@azure/msal-browser';
import { BehaviorSubject, Observable, filter } from 'rxjs';
import { UserRole, Role } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserRole | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) {
    this.initializeAuthentication();
  }

  private initializeAuthentication(): void {
    // Monitor authentication status changes
    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None)
      )
      .subscribe(() => {
        this.setAuthenticationStatus();
        this.setCurrentUser();
      });
  }

  private setAuthenticationStatus(): void {
    const accounts = this.msalService.instance.getAllAccounts();
    this.isAuthenticatedSubject.next(accounts.length > 0);
  }

  private setCurrentUser(): void {
    const account = this.msalService.instance.getActiveAccount();
    
    if (account) {
      // Extract roles from token claims
      const roles = this.extractRolesFromToken(account.idTokenClaims);
      
      const userRole: UserRole = {
        userId: account.homeAccountId,
        roles: roles
      };
      
      this.currentUserSubject.next(userRole);
    } else {
      this.currentUserSubject.next(null);
    }
  }

  private extractRolesFromToken(claims: any): Role[] {
    if (!claims || !claims.roles) {
      return [Role.Employee]; // Default role
    }

    const roles: Role[] = [];
    const tokenRoles = Array.isArray(claims.roles) ? claims.roles : [claims.roles];

    tokenRoles.forEach(role => {
      if (role === 'HRAdministrator') {
        roles.push(Role.HRAdministrator);
      } else if (role === 'TeamManager') {
        roles.push(Role.TeamManager);
      } else if (role === 'Employee') {
        roles.push(Role.Employee);
      }
    });

    return roles.length > 0 ? roles : [Role.Employee];
  }

  /**
   * Login user
   */
  login(): Observable<AuthenticationResult> {
    return new Observable(observer => {
      this.msalService.loginPopup()
        .subscribe({
          next: (result: AuthenticationResult) => {
            this.msalService.instance.setActiveAccount(result.account);
            this.setAuthenticationStatus();
            this.setCurrentUser();
            observer.next(result);
            observer.complete();
          },
          error: (error) => {
            observer.error(error);
          }
        });
    });
  }

  /**
   * Logout user
   */
  logout(): void {
    this.msalService.logoutPopup().subscribe(() => {
      this.isAuthenticatedSubject.next(false);
      this.currentUserSubject.next(null);
    });
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Get current user
   */
  getCurrentUser(): UserRole | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: Role): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.roles.includes(role) : false;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: Role[]): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    return roles.some(role => user.roles.includes(role));
  }

  /**
   * Get user's highest role (for display purposes)
   */
  getPrimaryRole(): Role | null {
    const user = this.currentUserSubject.value;
    if (!user || user.roles.length === 0) return null;

    // Priority order: HRAdministrator > TeamManager > Employee
    if (user.roles.includes(Role.HRAdministrator)) {
      return Role.HRAdministrator;
    }
    if (user.roles.includes(Role.TeamManager)) {
      return Role.TeamManager;
    }
    return Role.Employee;
  }

  /**
   * Get access token for API calls
   */
  getAccessToken(): Observable<string> {
    return new Observable(observer => {
      this.msalService.acquireTokenSilent({
        scopes: ['api://ksa-hr-api/access_as_user']
      }).subscribe({
        next: (result: AuthenticationResult) => {
          observer.next(result.accessToken);
          observer.complete();
        },
        error: (error) => {
          // Fallback to interactive acquisition
          this.msalService.acquireTokenPopup({
            scopes: ['api://ksa-hr-api/access_as_user']
          }).subscribe({
            next: (result: AuthenticationResult) => {
              observer.next(result.accessToken);
              observer.complete();
            },
            error: (popupError) => {
              observer.error(popupError);
            }
          });
        }
      });
    });
  }
}
