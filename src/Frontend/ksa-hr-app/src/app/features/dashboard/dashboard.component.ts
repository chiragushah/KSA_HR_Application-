import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard">
      <h1>Dashboard | لوحة التحكم</h1>
      
      <div class="grid grid-cols-4">
        <div class="card stat-card">
          <h3>Total Employees | إجمالي الموظفين</h3>
          <p class="stat-value">{{ totalEmployees }}</p>
        </div>
        
        <div class="card stat-card">
          <h3>Active | نشط</h3>
          <p class="stat-value">{{ activeEmployees }}</p>
        </div>
        
        <div class="card stat-card">
          <h3>Monthly Payroll | الرواتب الشهرية</h3>
          <p class="stat-value">SAR {{ monthlyPayroll | number:'1.0-0' }}</p>
        </div>
        
        <div class="card stat-card">
          <h3>Pending Leaves | إجازات معلقة</h3>
          <p class="stat-value">{{ pendingLeaves }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2">
        <div class="card">
          <h3>Recent Activities | الأنشطة الأخيرة</h3>
          <p>Recent employee updates and activities will appear here.</p>
        </div>
        
        <div class="card">
          <h3>Quick Actions | إجراءات سريعة</h3>
          <button class="btn btn-primary" routerLink="/employees/new">Add New Employee</button>
          <button class="btn btn-secondary" routerLink="/payroll">Process Payroll</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 1rem;
    }

    .stat-card {
      text-align: center;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary-color);
      margin-top: 0.5rem;
    }

    button {
      margin-right: 1rem;
      margin-bottom: 1rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  totalEmployees = 0;
  activeEmployees = 0;
  monthlyPayroll = 0;
  pendingLeaves = 0;

  ngOnInit(): void {
    // Load dashboard data
    this.totalEmployees = 250;
    this.activeEmployees = 238;
    this.monthlyPayroll = 2450000;
    this.pendingLeaves = 12;
  }
}
