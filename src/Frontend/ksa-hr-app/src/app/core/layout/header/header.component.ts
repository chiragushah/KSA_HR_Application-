import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  template: `
    <header class="header">
      <div class="header-container">
        <div class="logo">
          <h2>KSA HR System | نظام الموارد البشرية</h2>
        </div>
        <nav class="nav">
          <button class="btn btn-secondary">Logout | تسجيل الخروج</button>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background-color: var(--primary-color);
      color: white;
      padding: 1rem 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .header-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo h2 {
      margin: 0;
      font-size: 1.5rem;
    }

    .nav button {
      background-color: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .nav button:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }
  `]
})
export class HeaderComponent { }
