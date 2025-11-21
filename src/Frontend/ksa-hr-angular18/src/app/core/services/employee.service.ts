// Employee Service - Complete CRUD operations
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Employee, Department, Position, SalaryGrade } from '../models/employee.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/Employees`;

  constructor(private http: HttpClient) {}

  /**
   * Get all employees
   */
  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  /**
   * Get employee by ID
   */
  getEmployeeById(id: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  /**
   * Search employees
   */
  searchEmployees(searchTerm: string): Observable<Employee[]> {
    const params = new HttpParams().set('searchTerm', searchTerm);
    return this.http.get<Employee[]>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Get employees by department
   */
  getEmployeesByDepartment(departmentId: string): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/department/${departmentId}`);
  }

  /**
   * Get employees by manager
   */
  getEmployeesByManager(managerId: string): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/manager/${managerId}`);
  }

  /**
   * Create new employee
   */
  createEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  /**
   * Update employee
   */
  updateEmployee(id: string, employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee);
  }

  /**
   * Delete employee
   */
  deleteEmployee(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get active employees count
   */
  getActiveEmployeesCount(): Observable<number> {
    return this.getAllEmployees().pipe(
      map(employees => employees.filter(e => e.isActive).length)
    );
  }

  /**
   * Get employees by nationality
   */
  getEmployeesByNationality(isSaudiNational: boolean): Observable<Employee[]> {
    return this.getAllEmployees().pipe(
      map(employees => employees.filter(e => e.isSaudiNational === isSaudiNational))
    );
  }

  /**
   * Get new employees (hired in last N days)
   */
  getNewEmployees(days: number = 30): Observable<Employee[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.getAllEmployees().pipe(
      map(employees => employees.filter(e => {
        const hireDate = new Date(e.hireDate);
        return hireDate >= cutoffDate;
      }))
    );
  }

  /**
   * Calculate employee tenure in years
   */
  calculateTenure(hireDate: Date): number {
    const hire = new Date(hireDate);
    const now = new Date();
    const diffTime = now.getTime() - hire.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return Math.max(0, diffDays / 365.25);
  }

  /**
   * Validate employee data
   */
  validateEmployee(employee: Employee): {valid: boolean; errors: string[]} {
    const errors: string[] = [];

    if (!employee.fullNameEn || employee.fullNameEn.trim() === '') {
      errors.push('English name is required');
    }

    if (!employee.fullNameAr || employee.fullNameAr.trim() === '') {
      errors.push('Arabic name is required');
    }

    if (!employee.email || !this.isValidEmail(employee.email)) {
      errors.push('Valid email is required');
    }

    if (!employee.nationalIdNumber || employee.nationalIdNumber.trim() === '') {
      errors.push('National ID number is required');
    }

    if (employee.basicSalary <= 0) {
      errors.push('Basic salary must be greater than zero');
    }

    // KSA minimum wage validation for Saudi nationals
    if (employee.isSaudiNational && employee.basicSalary < 4000) {
      errors.push('Minimum salary for Saudi nationals is SAR 4,000');
    }

    if (!employee.hireDate) {
      errors.push('Hire date is required');
    }

    if (!employee.departmentId) {
      errors.push('Department is required');
    }

    if (!employee.positionId) {
      errors.push('Position is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
