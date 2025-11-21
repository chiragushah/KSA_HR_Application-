// Leave Service - Request and Approval Workflows
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeaveRequest, LeaveBalance, LeaveType, LeaveStatus } from '../models/employee.model';
import { environment } from '../../../environments/environment';

export interface LeaveRequestCreate {
  employeeId: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  medicalCertificatePath?: string;
}

export interface LeaveApprovalRequest {
  approverComments?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private apiUrl = `${environment.apiUrl}/Leave`;

  constructor(private http: HttpClient) {}

  /**
   * Create leave request
   */
  createLeaveRequest(request: LeaveRequestCreate): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(this.apiUrl, request);
  }

  /**
   * Approve leave request
   */
  approveLeaveRequest(requestId: string, approval: LeaveApprovalRequest): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(`${this.apiUrl}/${requestId}/approve`, approval);
  }

  /**
   * Reject leave request
   */
  rejectLeaveRequest(requestId: string, rejection: LeaveApprovalRequest): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(`${this.apiUrl}/${requestId}/reject`, rejection);
  }

  /**
   * Get employee leave requests
   */
  getEmployeeLeaveRequests(employeeId: string): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/employee/${employeeId}`);
  }

  /**
   * Get pending leave requests (for managers)
   */
  getPendingLeaveRequests(): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/pending`);
  }

  /**
   * Get leave balance
   */
  getLeaveBalance(employeeId: string): Observable<LeaveBalance> {
    return this.http.get<LeaveBalance>(`${this.apiUrl}/balance/${employeeId}`);
  }

  /**
   * Calculate working days between dates (excluding Fri/Sat)
   * KSA weekend: Friday and Saturday
   */
  calculateWorkingDays(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let workingDays = 0;
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      // 5 = Friday, 6 = Saturday
      if (dayOfWeek !== 5 && dayOfWeek !== 6) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
  }

  /**
   * Calculate annual leave entitlement based on tenure
   * KSA Labor Law: 21 days (1-5 years), 30 days (5+ years)
   */
  calculateAnnualLeaveEntitlement(yearsOfService: number): number {
    if (yearsOfService < 1) {
      return 0;
    }
    return yearsOfService >= 5 ? 30 : 21;
  }

  /**
   * Validate leave request
   */
  validateLeaveRequest(
    leaveType: LeaveType,
    startDate: Date,
    endDate: Date,
    currentBalance: LeaveBalance
  ): {valid: boolean; errors: string[]} {
    const errors: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check dates
    if (start > end) {
      errors.push('Start date must be before end date');
    }

    // Check if start date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      errors.push('Start date cannot be in the past');
    }

    // Calculate working days
    const workingDays = this.calculateWorkingDays(start, end);

    // Check balance for annual and sick leave
    if (leaveType === LeaveType.Annual) {
      if (workingDays > currentBalance.annualLeaveRemaining) {
        errors.push(`Insufficient annual leave balance. Available: ${currentBalance.annualLeaveRemaining} days`);
      }
    }

    if (leaveType === LeaveType.Sick) {
      if (workingDays > currentBalance.sickLeaveRemaining) {
        errors.push(`Insufficient sick leave balance. Available: ${currentBalance.sickLeaveRemaining} days`);
      }
    }

    // Specific leave type validations
    if (leaveType === LeaveType.Maternity && workingDays > 84) {
      errors.push('Maternity leave cannot exceed 84 days (12 weeks)');
    }

    if (leaveType === LeaveType.Paternity && workingDays > 3) {
      errors.push('Paternity leave cannot exceed 3 days');
    }

    if (leaveType === LeaveType.Bereavement && workingDays > 5) {
      errors.push('Bereavement leave cannot exceed 5 days');
    }

    if (leaveType === LeaveType.Marriage && workingDays > 3) {
      errors.push('Marriage leave cannot exceed 3 days');
    }

    if (leaveType === LeaveType.Hajj && workingDays > 15) {
      errors.push('Hajj leave cannot exceed 15 days');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get leave type information
   */
  getLeaveTypeInfo(leaveType: LeaveType): {
    nameEn: string;
    nameAr: string;
    maxDays: number;
    requiresApproval: boolean;
    requiresEvidence: boolean;
  } {
    const leaveTypes: {[key in LeaveType]: any} = {
      [LeaveType.Annual]: {
        nameEn: 'Annual Leave',
        nameAr: 'إجازة سنوية',
        maxDays: 30,
        requiresApproval: true,
        requiresEvidence: false
      },
      [LeaveType.Sick]: {
        nameEn: 'Sick Leave',
        nameAr: 'إجازة مرضية',
        maxDays: 120,
        requiresApproval: false,
        requiresEvidence: true
      },
      [LeaveType.Maternity]: {
        nameEn: 'Maternity Leave',
        nameAr: 'إجازة أمومة',
        maxDays: 84,
        requiresApproval: false,
        requiresEvidence: true
      },
      [LeaveType.Paternity]: {
        nameEn: 'Paternity Leave',
        nameAr: 'إجازة أبوة',
        maxDays: 3,
        requiresApproval: false,
        requiresEvidence: true
      },
      [LeaveType.Bereavement]: {
        nameEn: 'Bereavement Leave',
        nameAr: 'إجازة حداد',
        maxDays: 5,
        requiresApproval: false,
        requiresEvidence: true
      },
      [LeaveType.Marriage]: {
        nameEn: 'Marriage Leave',
        nameAr: 'إجازة زواج',
        maxDays: 3,
        requiresApproval: false,
        requiresEvidence: true
      },
      [LeaveType.Hajj]: {
        nameEn: 'Hajj Leave',
        nameAr: 'إجازة حج',
        maxDays: 15,
        requiresApproval: true,
        requiresEvidence: false
      },
      [LeaveType.Unpaid]: {
        nameEn: 'Unpaid Leave',
        nameAr: 'إجازة بدون أجر',
        maxDays: 0,
        requiresApproval: true,
        requiresEvidence: false
      }
    };

    return leaveTypes[leaveType];
  }

  /**
   * Cancel leave request (only if pending)
   */
  cancelLeaveRequest(requestId: string): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(`${this.apiUrl}/${requestId}/cancel`, {});
  }

  /**
   * Get leave calendar data
   */
  getLeaveCalendar(startDate: Date, endDate: Date): Observable<LeaveRequest[]> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/calendar`, { params });
  }
}
