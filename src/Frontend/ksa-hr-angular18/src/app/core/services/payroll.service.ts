// Payroll Service - With GOSI Integration
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PayrollRecord } from '../models/employee.model';
import { GosiCalculationService } from './gosi-calculation.service';
import { environment } from '../../../environments/environment';

export interface PayrollProcessRequest {
  employeeId: string;
  month: number;
  year: number;
}

export interface BulkPayrollProcessRequest {
  month: number;
  year: number;
}

@Injectable({
  providedIn: 'root'
})
export class PayrollService {
  private apiUrl = `${environment.apiUrl}/Payroll`;

  constructor(
    private http: HttpClient,
    private gosiService: GosiCalculationService
  ) {}

  /**
   * Process payroll for single employee
   */
  processPayroll(request: PayrollProcessRequest): Observable<PayrollRecord> {
    return this.http.post<PayrollRecord>(`${this.apiUrl}/process`, request);
  }

  /**
   * Process bulk payroll for all active employees
   */
  processBulkPayroll(request: BulkPayrollProcessRequest): Observable<PayrollRecord[]> {
    return this.http.post<PayrollRecord[]>(`${this.apiUrl}/process-bulk`, request);
  }

  /**
   * Get payroll record
   */
  getPayrollRecord(employeeId: string, month: number, year: number): Observable<PayrollRecord> {
    const params = new HttpParams()
      .set('employeeId', employeeId)
      .set('month', month.toString())
      .set('year', year.toString());
    
    return this.http.get<PayrollRecord>(this.apiUrl, { params });
  }

  /**
   * Get payroll records by employee
   */
  getPayrollRecordsByEmployee(employeeId: string): Observable<PayrollRecord[]> {
    const params = new HttpParams().set('employeeId', employeeId);
    return this.http.get<PayrollRecord[]>(`${this.apiUrl}/employee`, { params });
  }

  /**
   * Get payroll records by month/year
   */
  getPayrollRecordsByPeriod(month: number, year: number): Observable<PayrollRecord[]> {
    const params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString());
    
    return this.http.get<PayrollRecord[]>(`${this.apiUrl}/period`, { params });
  }

  /**
   * Calculate payroll preview (client-side)
   */
  calculatePayrollPreview(
    basicSalary: number,
    housingAllowance: number,
    transportAllowance: number,
    otherAllowances: number,
    overtimePay: number,
    isSaudiNational: boolean,
    isNewEmployee: boolean,
    gosiRegistrationDate: Date | null
  ): {
    grossSalary: number;
    gosiCalculationBase: number;
    gosiEmployeeContribution: number;
    gosiEmployerContribution: number;
    gosiTotalContribution: number;
    totalDeductions: number;
    netSalary: number;
  } {
    // Calculate gross salary
    const grossSalary = basicSalary + housingAllowance + transportAllowance + 
                        otherAllowances + overtimePay;

    // Calculate GOSI contributions
    const currentDate = new Date();
    const gosiContribution = this.gosiService.calculateGosiContributions(
      isSaudiNational,
      isNewEmployee,
      gosiRegistrationDate,
      basicSalary,
      housingAllowance,
      currentDate.getMonth() + 1,
      currentDate.getFullYear()
    );

    // Total deductions
    const totalDeductions = gosiContribution.employeeContribution;

    // Net salary
    const netSalary = grossSalary - totalDeductions;

    return {
      grossSalary: this.roundToTwoDecimals(grossSalary),
      gosiCalculationBase: gosiContribution.calculationBase,
      gosiEmployeeContribution: gosiContribution.employeeContribution,
      gosiEmployerContribution: gosiContribution.employerContribution,
      gosiTotalContribution: gosiContribution.totalContribution,
      totalDeductions: this.roundToTwoDecimals(totalDeductions),
      netSalary: this.roundToTwoDecimals(netSalary)
    };
  }

  /**
   * Generate payslip PDF
   */
  generatePayslipPdf(payrollRecordId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${payrollRecordId}/payslip`, {
      responseType: 'blob'
    });
  }

  /**
   * Export payroll to Excel
   */
  exportPayrollToExcel(month: number, year: number): Observable<Blob> {
    const params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString());
    
    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Get payroll statistics
   */
  getPayrollStatistics(month: number, year: number): Observable<{
    totalEmployees: number;
    totalGrossSalary: number;
    totalNetSalary: number;
    totalGosiEmployee: number;
    totalGosiEmployer: number;
    averageSalary: number;
  }> {
    const params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString());
    
    return this.http.get<any>(`${this.apiUrl}/statistics`, { params });
  }

  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
