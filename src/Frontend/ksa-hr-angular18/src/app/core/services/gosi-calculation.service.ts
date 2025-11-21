// GOSI Calculation Service - KSA 2025 Compliance
// Implements dual-model GOSI calculations per July 2025 reforms

import { Injectable } from '@angular/core';
import { GosiContribution, GosiModel } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class GosiCalculationService {
  // GOSI Rates Configuration (2025)
  private readonly GOSI_RATES = {
    // Legacy Model (Pre-July 2024)
    legacy: {
      saudiEmployee: 0.0975,      // 9.75%
      saudiEmployer: 0.1175,      // 11.75%
      expatEmployer: 0.02          // 2%
    },
    
    // New Model (Post-July 3, 2024 - First-time employees)
    new2025: {
      // Graduated employee rates by year
      employeeRates: {
        2024: 0.1025,  // 10.25%
        2025: 0.1075,  // 10.75%
        2026: 0.1125,  // 11.25%
        2027: 0.1175,  // 11.75%
        2028: 0.1100   // 11.00%
      },
      saudiEmployer: 0.1175,  // 11.75%
      expatEmployer: 0.02      // 2%
    },
    
    // Wage caps
    minWage: 1500,
    maxWage: 45000
  };

  constructor() {}

  /**
   * Calculate GOSI contributions for an employee
   * Implements 2025 dual-model system
   */
  calculateGosiContributions(
    isSaudiNational: boolean,
    isNewEmployee: boolean,
    registrationDate: Date | null,
    basicSalary: number,
    housingAllowance: number,
    month: number,
    year: number
  ): GosiContribution {
    // Calculate GOSI base (basic salary + housing allowance)
    const calculationBase = this.calculateGosiBase(
      basicSalary + housingAllowance
    );

    let employeeRate = 0;
    let employerRate = 0;
    let contributionModel: GosiModel;

    if (isSaudiNational) {
      // Determine model based on registration date
      const isNew2025Model = this.isNew2025Model(
        isNewEmployee,
        registrationDate
      );

      if (isNew2025Model) {
        // New 2025 model with graduated rates
        contributionModel = GosiModel.New2025;
        employeeRate = this.getNew2025EmployeeRate(year);
        employerRate = this.GOSI_RATES.new2025.saudiEmployer;
      } else {
        // Legacy model
        contributionModel = GosiModel.Legacy;
        employeeRate = this.GOSI_RATES.legacy.saudiEmployee;
        employerRate = this.GOSI_RATES.legacy.saudiEmployer;
      }
    } else {
      // Expatriate - employer contribution only
      contributionModel = GosiModel.Legacy;
      employeeRate = 0;
      employerRate = this.GOSI_RATES.legacy.expatEmployer;
    }

    // Calculate contributions
    const employeeContribution = calculationBase * employeeRate;
    const employerContribution = calculationBase * employerRate;
    const totalContribution = employeeContribution + employerContribution;

    return {
      employeeId: '',
      month,
      year,
      isSaudiNational,
      isNewEmployee,
      calculationBase,
      employeeRate,
      employeeContribution: this.roundToTwoDecimals(employeeContribution),
      employerRate,
      employerContribution: this.roundToTwoDecimals(employerContribution),
      totalContribution: this.roundToTwoDecimals(totalContribution),
      contributionModel
    };
  }

  /**
   * Calculate GOSI base with wage caps
   */
  private calculateGosiBase(totalWage: number): number {
    if (totalWage < this.GOSI_RATES.minWage) {
      return this.GOSI_RATES.minWage;
    }
    if (totalWage > this.GOSI_RATES.maxWage) {
      return this.GOSI_RATES.maxWage;
    }
    return totalWage;
  }

  /**
   * Determine if employee falls under new 2025 model
   * New model applies to first-time employees registered after July 3, 2024
   */
  private isNew2025Model(
    isNewEmployee: boolean,
    registrationDate: Date | null
  ): boolean {
    if (!isNewEmployee || !registrationDate) {
      return false;
    }

    const cutoffDate = new Date('2024-07-03');
    const regDate = new Date(registrationDate);
    
    return regDate >= cutoffDate;
  }

  /**
   * Get employee contribution rate for new 2025 model
   * Graduated rates by year (2024-2028)
   */
  private getNew2025EmployeeRate(year: number): number {
    const rates = this.GOSI_RATES.new2025.employeeRates;
    
    if (year >= 2028) {
      return rates[2028];
    }
    
    return rates[year as keyof typeof rates] || rates[2024];
  }

  /**
   * Get employee contribution rate (legacy or new model)
   */
  getEmployeeRate(
    isSaudiNational: boolean,
    isNewEmployee: boolean,
    registrationDate: Date | null,
    year: number
  ): number {
    if (!isSaudiNational) {
      return 0; // Expatriates don't contribute
    }

    if (this.isNew2025Model(isNewEmployee, registrationDate)) {
      return this.getNew2025EmployeeRate(year);
    }

    return this.GOSI_RATES.legacy.saudiEmployee;
  }

  /**
   * Get employer contribution rate
   */
  getEmployerRate(
    isSaudiNational: boolean,
    isNewEmployee: boolean,
    registrationDate: Date | null
  ): number {
    if (isSaudiNational) {
      if (this.isNew2025Model(isNewEmployee, registrationDate)) {
        return this.GOSI_RATES.new2025.saudiEmployer;
      }
      return this.GOSI_RATES.legacy.saudiEmployer;
    }

    return this.GOSI_RATES.legacy.expatEmployer;
  }

  /**
   * Validate salary change (annual window restrictions)
   * Salary changes allowed only in January/Muharram
   * For employees 50+, max 10% increase
   */
  validateSalaryChange(
    currentMonth: number,
    employeeAge: number,
    currentSalary: number,
    newSalary: number
  ): {valid: boolean; reason?: string} {
    // Check if in allowed month (January)
    if (currentMonth !== 1) {
      return {
        valid: false,
        reason: 'Salary changes are only allowed in January (or Muharram)'
      };
    }

    // Check 10% cap for employees 50+
    if (employeeAge >= 50) {
      const increasePercent = ((newSalary - currentSalary) / currentSalary) * 100;
      
      if (increasePercent > 10) {
        return {
          valid: false,
          reason: 'Salary increase for employees 50+ is capped at 10%'
        };
      }
    }

    return { valid: true };
  }

  /**
   * Calculate monthly GOSI contribution for payroll
   */
  calculateMonthlyContribution(
    employeeId: string,
    isSaudiNational: boolean,
    isNewEmployee: boolean,
    registrationDate: Date | null,
    basicSalary: number,
    housingAllowance: number
  ): GosiContribution {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const contribution = this.calculateGosiContributions(
      isSaudiNational,
      isNewEmployee,
      registrationDate,
      basicSalary,
      housingAllowance,
      month,
      year
    );

    contribution.employeeId = employeeId;
    return contribution;
  }

  /**
   * Round to two decimal places for currency
   */
  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }

  /**
   * Get GOSI rates summary for display
   */
  getGosiRatesSummary(
    isSaudiNational: boolean,
    isNewEmployee: boolean,
    registrationDate: Date | null,
    year: number
  ): {
    model: string;
    employeeRate: number;
    employerRate: number;
    totalRate: number;
    description: string;
  } {
    const model = this.isNew2025Model(isNewEmployee, registrationDate)
      ? 'New 2025 Model'
      : 'Legacy Model';

    const employeeRate = this.getEmployeeRate(
      isSaudiNational,
      isNewEmployee,
      registrationDate,
      year
    );

    const employerRate = this.getEmployerRate(
      isSaudiNational,
      isNewEmployee,
      registrationDate
    );

    const totalRate = employeeRate + employerRate;

    let description = '';
    if (isSaudiNational) {
      if (this.isNew2025Model(isNewEmployee, registrationDate)) {
        description = `Graduated employee rate for ${year}: ${(employeeRate * 100).toFixed(2)}%`;
      } else {
        description = 'Standard Saudi national rates';
      }
    } else {
      description = 'Expatriate - employer contribution only';
    }

    return {
      model,
      employeeRate,
      employerRate,
      totalRate,
      description
    };
  }
}
