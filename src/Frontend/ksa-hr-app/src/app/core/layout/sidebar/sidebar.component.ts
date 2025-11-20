import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  template: `
    <aside class="sidebar">
      <nav class="sidebar-nav">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          Dashboard | لوحة التحكم
        </a>
        <a routerLink="/employees" routerLinkActive="active" class="nav-item">
          Employees | الموظفون
        </a>
        <a routerLink="/payroll" routerLinkActive="active" class="nav-item">
          Payroll | الرواتب
        </a>
        <a routerLink="/leave" routerLinkActive="active" class="nav-item">
          Leave Management | إدارة الإجازات
        </a>
        <a routerLink="/eosb-calculator" routerLinkActive="active" class="nav-item">
          EOSB Calculator | حاسبة نهاية الخدمة
        </a>
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 280px;
      background-color: var(--surface);
      border-right: 1px solid var(--border);
      padding: 1.5rem 0;
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
    }

    .nav-item {
      padding: 1rem 1.5rem;
      text-decoration: none;
      color: var(--text-primary);
      transition: all 0.3s ease;
      border-right: 3px solid transparent;
    }

    .nav-item:hover {
      background-color: rgba(0, 108, 53, 0.05);
      border-right-color: var(--primary-light);
    }

    .nav-item.active {
      background-color: rgba(0, 108, 53, 0.1);
      border-right-color: var(--primary-color);
      color: var(--primary-color);
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid var(--border);
      }

      .nav-item {
        border-right: none;
        border-bottom: 3px solid transparent;
      }

      .nav-item:hover {
        border-bottom-color: var(--primary-light);
      }

      .nav-item.active {
        border-bottom-color: var(--primary-color);
      }
    }
  `]
})
export class SidebarComponent {
  constructor(private router: Router) { }
}
