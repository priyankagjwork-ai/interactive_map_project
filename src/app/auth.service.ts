import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private adminPassword = 'admin'; // Change this to your desired password
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.checkAuthFromStorage());
  isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  constructor() {}

  checkAuthFromStorage(): boolean {
    const auth = sessionStorage.getItem('map_admin_auth');
    return auth === 'true';
  }

  authenticate(password: string): boolean {
    if (password === this.adminPassword) {
      sessionStorage.setItem('map_admin_auth', 'true');
      this.isAuthenticatedSubject.next(true);
      return true;
    }
    return false;
  }

  logout(): void {
    sessionStorage.removeItem('map_admin_auth');
    this.isAuthenticatedSubject.next(false);
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  setPassword(newPassword: string): void {
    this.adminPassword = newPassword;
  }
}
