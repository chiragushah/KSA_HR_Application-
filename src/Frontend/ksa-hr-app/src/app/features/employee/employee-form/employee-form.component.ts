import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee.service';

@Component({
  selector: 'app-employee-form',
  template: `
    <div class="employee-form">
      <h1>{{ isEditMode ? 'Edit Employee' : 'Add New Employee' }} | {{ isEditMode ? 'تعديل موظف' : 'إضافة موظف جديد' }}</h1>

      <div class="card">
        <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-2">
            <div class="form-group">
              <label class="form-label">Employee Code | رمز الموظف</label>
              <input type="text" class="form-control" formControlName="employeeCode" required>
            </div>

            <div class="form-group">
              <label class="form-label">National ID Type | نوع الهوية</label>
              <select class="form-control" formControlName="nationalIdType">
                <option value="SaudiNationalId">Saudi National ID | الهوية الوطنية</option>
                <option value="Iqama">Iqama | الإقامة</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Full Name (English) | الاسم الكامل (إنجليزي)</label>
              <input type="text" class="form-control" formControlName="fullNameEnglish" required>
            </div>

            <div class="form-group">
              <label class="form-label">Full Name (Arabic) | الاسم الكامل (عربي)</label>
              <input type="text" class="form-control" formControlName="fullNameArabic" required>
            </div>

            <div class="form-group">
              <label class="form-label">Email | البريد الإلكتروني</label>
              <input type="email" class="form-control" formControlName="email" required>
            </div>

            <div class="form-group">
              <label class="form-label">Phone Number | رقم الهاتف</label>
              <input type="tel" class="form-control" formControlName="phoneNumber">
            </div>

            <div class="form-group">
              <label class="form-label">National ID Number | رقم الهوية</label>
              <input type="text" class="form-control" formControlName="nationalIdNumber" required>
            </div>

            <div class="form-group">
              <label class="form-label">GOSI Number | رقم التأمينات</label>
              <input type="text" class="form-control" formControlName="gosiNumber">
            </div>

            <div class="form-group">
              <label class="form-label">Basic Salary (SAR) | الراتب الأساسي</label>
              <input type="number" class="form-control" formControlName="basicSalary" required min="4000">
              <small *ngIf="employeeForm.get('isSaudiNational')?.value">Minimum SAR 4,000 for Saudi nationals</small>
            </div>

            <div class="form-group">
              <label class="form-label">Housing Allowance (SAR) | بدل السكن</label>
              <input type="number" class="form-control" formControlName="housingAllowance">
            </div>

            <div class="form-group">
              <label class="form-label">Hire Date | تاريخ التعيين</label>
              <input type="date" class="form-control" formControlName="hireDate" required>
            </div>

            <div class="form-group">
              <label class="form-label">
                <input type="checkbox" formControlName="isSaudiNational">
                Saudi National | مواطن سعودي
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="!employeeForm.valid">
              {{ isEditMode ? 'Update' : 'Create' }} | {{ isEditMode ? 'تحديث' : 'إنشاء' }}
            </button>
            <button type="button" class="btn btn-secondary" (click)="onCancel()">
              Cancel | إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .employee-form {
      max-width: 1200px;
    }

    .form-actions {
      margin-top: 2rem;
      display: flex;
      gap: 1rem;
    }
  `]
})
export class EmployeeFormComponent implements OnInit {
  employeeForm: FormGroup;
  isEditMode = false;
  employeeId?: string;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.employeeForm = this.fb.group({
      employeeCode: ['', Validators.required],
      fullNameEnglish: ['', Validators.required],
      fullNameArabic: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      nationalIdType: ['SaudiNationalId', Validators.required],
      nationalIdNumber: ['', Validators.required],
      gosiNumber: [''],
      nationality: ['Saudi'],
      isSaudiNational: [true],
      basicSalary: [4000, [Validators.required, Validators.min(4000)]],
      housingAllowance: [0],
      transportationAllowance: [0],
      otherAllowances: [0],
      hireDate: ['', Validators.required],
      departmentId: [''],
      positionId: [''],
      salaryGradeId: ['']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.employeeId = params['id'];
        this.loadEmployee(this.employeeId);
      }
    });
  }

  loadEmployee(id: string): void {
    this.employeeService.getEmployee(id).subscribe({
      next: (employee) => {
        this.employeeForm.patchValue(employee);
      },
      error: (error) => console.error('Error loading employee:', error)
    });
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      const employeeData = this.employeeForm.value;
      
      if (this.isEditMode && this.employeeId) {
        this.employeeService.updateEmployee(this.employeeId, employeeData).subscribe({
          next: () => this.router.navigate(['/employees']),
          error: (error) => console.error('Update error:', error)
        });
      } else {
        this.employeeService.createEmployee(employeeData).subscribe({
          next: () => this.router.navigate(['/employees']),
          error: (error) => console.error('Create error:', error)
        });
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/employees']);
  }
}
