// EOSB (End of Service Benefits) Calculation Service
// Implements Saudi Labor Law Article 84 compliance

import { Injectable } from '@angular/core';
import { EosbCalculation, TerminationType } from '../models/employee.model';

export interface EosbQuickCalculation {
  hireDate: Date;
  endDate: Date;
  basicSalary: number;
  yearsOfService: number;
  firstFiveYearsService: number;
  firstFiveYearsAmount: number;
  remainingYearsService: number;
  remainingYearsAmount: number;
  totalEosb: number;
  breakdown: string;
  resignationProrata?: number;
  prorataTotalEosb?: number;
}

@Injectable({
  providedIn: 'root'
})
export class EosbService {
  private readonly MIN_SERVICE_MONTHS = 12; // Minimum 1 year for eligibility

  constructor() {}

  /**
   * Calculate EOSB per Saudi Labor Law Article 84
   * Formula:
   * - First 5 years: (Basic Salary ÷ 2) × Years of Service
   * - After 5 years: (Basic Salary × Remaining Years)
   */
  calculateEosb(
    hireDate: Date,
    endDate: Date,
    basicSalary: number,
    terminationType: TerminationType = TerminationType.Resignation
  ): EosbQuickCalculation {
    const hire = new Date(hireDate);
    const end = new Date(endDate);

    // Calculate years of service
    const yearsOfService = this.calculateYearsOfService(hire, end);

    // Check minimum service period
    if (yearsOfService < 1) {
      return {
        hireDate: hire,
        endDate: end,
        basicSalary,
        yearsOfService: 0,
        firstFiveYearsService: 0,
        firstFiveYearsAmount: 0,
        remainingYearsService: 0,
        remainingYearsAmount: 0,
        totalEosb: 0,
        breakdown: 'Service period less than 1 year - No EOSB entitlement'
      };
    }

    // Calculate EOSB amounts
    let firstFiveYearsService: number;
    let firstFiveYearsAmount: number;
    let remainingYearsService: number;
    let remainingYearsAmount: number;

    if (yearsOfService <= 5) {
      // Service ≤ 5 years
      firstFiveYearsService = yearsOfService;
      firstFiveYearsAmount = (basicSalary / 2) * yearsOfService;
      remainingYearsService = 0;
      remainingYearsAmount = 0;
    } else {
      // Service > 5 years
      firstFiveYearsService = 5;
      firstFiveYearsAmount = (basicSalary / 2) * 5;
      remainingYearsService = yearsOfService - 5;
      remainingYearsAmount = basicSalary * remainingYearsService;
    }

    const totalEosb = firstFiveYearsAmount + remainingYearsAmount;

    // Generate breakdown text
    const breakdown = this.generateBreakdown(
      yearsOfService,
      basicSalary,
      firstFiveYearsService,
      firstFiveYearsAmount,
      remainingYearsService,
      remainingYearsAmount,
      totalEosb
    );

    // Calculate resignation prorata if applicable
    const result: EosbQuickCalculation = {
      hireDate: hire,
      endDate: end,
      basicSalary,
      yearsOfService: this.roundToTwoDecimals(yearsOfService),
      firstFiveYearsService: this.roundToTwoDecimals(firstFiveYearsService),
      firstFiveYearsAmount: this.roundToTwoDecimals(firstFiveYearsAmount),
      remainingYearsService: this.roundToTwoDecimals(remainingYearsService),
      remainingYearsAmount: this.roundToTwoDecimals(remainingYearsAmount),
      totalEosb: this.roundToTwoDecimals(totalEosb),
      breakdown
    };

    // Apply resignation prorata if applicable
    if (terminationType === TerminationType.Resignation) {
      const prorata = this.getResignationProrata(yearsOfService);
      if (prorata < 1) {
        result.resignationProrata = prorata;
        result.prorataTotalEosb = this.roundToTwoDecimals(totalEosb * prorata);
      }
    }

    return result;
  }

  /**
   * Calculate years of service (including fractional years)
   */
  private calculateYearsOfService(hireDate: Date, endDate: Date): number {
    const diffTime = endDate.getTime() - hireDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const years = diffDays / 365.25; // Account for leap years
    return Math.max(0, years);
  }

  /**
   * Get resignation prorata multiplier
   * - < 2 years: 0 (no EOSB)
   * - 2-5 years: 1/3
   * - 5-10 years: 2/3
   * - > 10 years: Full (1)
   */
  private getResignationProrata(yearsOfService: number): number {
    if (yearsOfService < 2) {
      return 0;
    } else if (yearsOfService < 5) {
      return 1 / 3;
    } else if (yearsOfService < 10) {
      return 2 / 3;
    } else {
      return 1;
    }
  }

  /**
   * Generate detailed breakdown text
   */
  private generateBreakdown(
    yearsOfService: number,
    basicSalary: number,
    firstFiveYears: number,
    firstFiveAmount: number,
    remainingYears: number,
    remainingAmount: number,
    total: number
  ): string {
    let breakdown = `Total Service: ${yearsOfService.toFixed(2)} years\n\n`;

    if (yearsOfService <= 5) {
      breakdown += `Calculation (≤ 5 years):\n`;
      breakdown += `  (SAR ${basicSalary.toLocaleString()} ÷ 2) × ${firstFiveYears.toFixed(2)} years\n`;
      breakdown += `  = SAR ${firstFiveAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n\n`;
    } else {
      breakdown += `Calculation (> 5 years):\n`;
      breakdown += `  First 5 years:\n`;
      breakdown += `    (SAR ${basicSalary.toLocaleString()} ÷ 2) × 5 years = SAR ${firstFiveAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n\n`;
      breakdown += `  Remaining ${remainingYears.toFixed(2)} years:\n`;
      breakdown += `    SAR ${basicSalary.toLocaleString()} × ${remainingYears.toFixed(2)} years = SAR ${remainingAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n\n`;
    }

    breakdown += `Total EOSB: SAR ${total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

    return breakdown;
  }

  /**
   * Calculate EOSB with full details for employee record
   */
  calculateEosbForEmployee(
    employeeId: string,
    hireDate: Date,
    endDate: Date,
    basicSalary: number,
    terminationType: TerminationType,
    notes?: string
  ): EosbCalculation {
    const quickCalc = this.calculateEosb(
      hireDate,
      endDate,
      basicSalary,
      terminationType
    );

    const finalAmount = quickCalc.prorataTotalEosb !== undefined
      ? quickCalc.prorataTotalEosb
      : quickCalc.totalEosb;

    return {
      id: '',
      employeeId,
      hireDate: quickCalc.hireDate,
      endDate: quickCalc.endDate,
      yearsOfService: quickCalc.yearsOfService,
      basicSalary: quickCalc.basicSalary,
      firstFiveYearsService: quickCalc.firstFiveYearsService,
      firstFiveYearsAmount: quickCalc.firstFiveYearsAmount,
      remainingYearsService: quickCalc.remainingYearsService,
      remainingYearsAmount: quickCalc.remainingYearsAmount,
      totalEosb: finalAmount,
      terminationType,
      notes: notes || quickCalc.breakdown,
      calculatedAt: new Date()
    };
  }

  /**
   * Validate EOSB eligibility
   */
  validateEligibility(hireDate: Date, endDate: Date): {
    eligible: boolean;
    reason?: string;
    yearsOfService: number;
  } {
    const years = this.calculateYearsOfService(hireDate, endDate);

    if (years < 1) {
      return {
        eligible: false,
        reason: 'Minimum service period of 1 year required for EOSB',
        yearsOfService: years
      };
    }

    return {
      eligible: true,
      yearsOfService: years
    };
  }

  /**
   * Get EOSB entitlement summary
   */
  getEntitlementSummary(
    yearsOfService: number,
    terminationType: TerminationType
  ): string {
    if (yearsOfService < 1) {
      return 'No entitlement (service < 1 year)';
    }

    if (terminationType === TerminationType.Resignation) {
      const prorata = this.getResignationProrata(yearsOfService);
      
      if (prorata === 0) {
        return 'No entitlement (resignation with service < 2 years)';
      } else if (prorata === 1/3) {
        return '1/3 of calculated EOSB (resignation with 2-5 years service)';
      } else if (prorata === 2/3) {
        return '2/3 of calculated EOSB (resignation with 5-10 years service)';
      } else {
        return 'Full calculated EOSB (resignation with 10+ years service)';
      }
    }

    return 'Full calculated EOSB (employer termination/retirement/other)';
  }

  /**
   * Round to two decimal places
   */
  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }

  /**
   * Generate EOSB certificate text
   */
  generateCertificate(calculation: EosbQuickCalculation, employeeName: string): string {
    const cert = `
END OF SERVICE BENEFITS CERTIFICATE
شهادة مكافأة نهاية الخدمة

Employee Name / اسم الموظف: ${employeeName}
Hire Date / تاريخ التعيين: ${calculation.hireDate.toLocaleDateString('en-GB')}
End Date / تاريخ الانتهاء: ${calculation.endDate.toLocaleDateString('en-GB')}
Years of Service / سنوات الخدمة: ${calculation.yearsOfService.toFixed(2)} years

Basic Salary / الراتب الأساسي: SAR ${calculation.basicSalary.toLocaleString('en-US', {minimumFractionDigits: 2})}

CALCULATION / الحساب:
${calculation.breakdown}

${calculation.prorataTotalEosb !== undefined ? `
Resignation Prorata Applied / تطبيق النسبة للاستقالة: ${(calculation.resignationProrata! * 100).toFixed(0)}%
Final EOSB Amount / المبلغ النهائي: SAR ${calculation.prorataTotalEosb.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
` : `
Total EOSB Amount / مبلغ مكافأة نهاية الخدمة: SAR ${calculation.totalEosb.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
`}

Calculated on / محسوب في: ${new Date().toLocaleDateString('en-GB')}

This certificate is issued in accordance with Saudi Labor Law Article 84.
تصدر هذه الشهادة وفقاً للمادة 84 من نظام العمل السعودي.
    `;

    return cert.trim();
  }
}
