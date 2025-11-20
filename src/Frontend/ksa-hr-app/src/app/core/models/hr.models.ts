export interface Employee {
  id: string;
  employeeCode: string;
  fullNameEnglish: string;
  fullNameArabic: string;
  email: string;
  phoneNumber?: string;
  nationalIdType: string;
  nationalIdNumber: string;
  gosiNumber?: string;
  nationality: string;
  isSaudiNational: boolean;
  dateOfBirth: Date;
  hireDate: Date;
  terminationDate?: Date;
  employmentStatus: string;
  contractType: string;
  basicSalary: number;
  housingAllowance: number;
  transportationAllowance: number;
  otherAllowances: number;
  totalSalary: number;
  bankName?: string;
  bankAccountNumber?: string;
  ibanNumber?: string;
  departmentId: string;
  positionId: string;
  managerId?: string;
  salaryGradeId: string;
  annualLeaveBalance: number;
  sickLeaveBalance: number;
  gosiRegistrationDate?: Date;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  payrollMonth: number;
  payrollYear: number;
  basicSalary: number;
  housingAllowance: number;
  transportationAllowance: number;
  otherAllowances: number;
  overtimePay: number;
  grossSalary: number;
  gosiEmployeeContribution: number;
  gosiEmployerContribution: number;
  gosiTotalContribution: number;
  gosiCalculationBase: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
  paymentStatus: string;
  paymentDate?: Date;
  wpsReferenceNumber?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  numberOfDays: number;
  reason?: string;
  status: string;
  approvedBy?: string;
  approvedAt?: Date;
  approverComments?: string;
}

export interface EosbCalculation {
  id: string;
  employeeId: string;
  calculationDate: Date;
  hireDate: Date;
  endDate: Date;
  totalYearsOfService: number;
  lastDrawnBasicSalary: number;
  firstPeriodYears: number;
  firstPeriodAmount: number;
  remainingYears: number;
  remainingPeriodAmount: number;
  totalEosbAmount: number;
  terminationType: string;
  notes?: string;
}

export interface Department {
  id: string;
  departmentCode: string;
  nameEnglish: string;
  nameArabic: string;
  descriptionEnglish?: string;
  descriptionArabic?: string;
  parentDepartmentId?: string;
  isActive: boolean;
}

export interface Position {
  id: string;
  positionCode: string;
  titleEnglish: string;
  titleArabic: string;
  departmentId: string;
  salaryGradeId: string;
  level: number;
  isActive: boolean;
}
