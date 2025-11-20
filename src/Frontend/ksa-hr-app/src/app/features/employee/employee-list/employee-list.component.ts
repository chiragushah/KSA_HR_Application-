import { Component, OnInit } from '@angular/core';
import { Employee } from '../../../core/models/hr.models';
import { EmployeeService } from '../../../core/services/employee.service';

@Component({
  selector: 'app-employee-list',
  template: `
    <div class="employee-list">
      <div class="page-header">
        <h1>Employees | الموظفون</h1>
        <button class="btn btn-primary" routerLink="/employees/new">Add Employee | إضافة موظف</button>
      </div>

      <div class="card">
        <div class="search-bar">
          <input type="text" 
                 class="form-control" 
                 placeholder="Search employees... | بحث الموظفين..." 
                 [(ngModel)]="searchTerm"
                 (input)="onSearch()">
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Code | الرمز</th>
              <th>Name | الاسم</th>
              <th>Nationality | الجنسية</th>
              <th>Department | القسم</th>
              <th>Position | المسمى</th>
              <th>Salary | الراتب</th>
              <th>Status | الحالة</th>
              <th>Actions | إجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let employee of employees">
              <td>{{ employee.employeeCode }}</td>
              <td>{{ employee.fullNameEnglish }} | {{ employee.fullNameArabic }}</td>
              <td>{{ employee.nationality }}</td>
              <td>HR Department</td>
              <td>Manager</td>
              <td>SAR {{ employee.totalSalary | number:'1.0-0' }}</td>
              <td>
                <span class="badge badge-success" *ngIf="employee.employmentStatus === 'Active'">Active</span>
                <span class="badge badge-error" *ngIf="employee.employmentStatus !== 'Active'">Inactive</span>
              </td>
              <td>
                <button class="btn btn-primary" [routerLink]="['/employees', employee.id, 'edit']">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="loading" class="loading">
          <div class="loading-spinner"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .search-bar {
      margin-bottom: 1.5rem;
    }

    .loading {
      text-align: center;
      padding: 2rem;
    }

    td button {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }
  `]
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  searchTerm = '';
  loading = false;

  constructor(private employeeService: EmployeeService) { }

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.employeeService.getAllEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.employeeService.searchEmployees(this.searchTerm).subscribe({
        next: (data) => this.employees = data,
        error: (error) => console.error('Search error:', error)
      });
    } else {
      this.loadEmployees();
    }
  }
}
