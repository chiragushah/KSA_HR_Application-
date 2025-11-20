using KsaHrApi.Models;

namespace KsaHrApi.Services;

public interface IEosbCalculationService
{
    EosbCalculationResult CalculateEosb(Employee employee, DateTime endDate, decimal lastBasicSalary);
    EosbCalculationResult CalculateEosb(DateTime hireDate, DateTime endDate, decimal lastBasicSalary);
}

public class EosbCalculationResult
{
    public DateTime HireDate { get; set; }
    public DateTime EndDate { get; set; }
    public double TotalYearsOfService { get; set; }
    public decimal LastBasicSalary { get; set; }
    
    public double FirstPeriodYears { get; set; }
    public decimal FirstPeriodAmount { get; set; }
    
    public double RemainingYears { get; set; }
    public decimal RemainingPeriodAmount { get; set; }
    
    public decimal TotalEosbAmount { get; set; }
    
    public string CalculationBreakdown { get; set; } = string.Empty;
    public bool IsEligible { get; set; }
    public string EligibilityReason { get; set; } = string.Empty;
}

public class EosbCalculationService : IEosbCalculationService
{
    private const int MINIMUM_SERVICE_MONTHS = 12; // 1 year minimum
    private const double FIRST_PERIOD_YEARS = 5.0;
    private const decimal FIRST_PERIOD_RATE = 0.5m; // Half month per year
    private const decimal REMAINING_PERIOD_RATE = 1.0m; // One month per year

    public EosbCalculationResult CalculateEosb(Employee employee, DateTime endDate, decimal lastBasicSalary)
    {
        return CalculateEosb(employee.HireDate, endDate, lastBasicSalary);
    }

    public EosbCalculationResult CalculateEosb(DateTime hireDate, DateTime endDate, decimal lastBasicSalary)
    {
        var result = new EosbCalculationResult
        {
            HireDate = hireDate,
            EndDate = endDate,
            LastBasicSalary = lastBasicSalary
        };

        // Calculate total service period
        TimeSpan servicePeriod = endDate - hireDate;
        int totalMonths = (int)((endDate.Year - hireDate.Year) * 12 + endDate.Month - hireDate.Month);
        
        // Add extra days as fraction of month
        if (endDate.Day >= hireDate.Day)
        {
            totalMonths += (endDate.Day - hireDate.Day) >= 15 ? 1 : 0;
        }

        result.TotalYearsOfService = totalMonths / 12.0;

        // Check eligibility (minimum 1 year service)
        if (totalMonths < MINIMUM_SERVICE_MONTHS)
        {
            result.IsEligible = false;
            result.EligibilityReason = $"Employee must complete at least 1 year of service. Current service: {totalMonths} months";
            result.TotalEosbAmount = 0m;
            return result;
        }

        result.IsEligible = true;
        result.EligibilityReason = "Employee meets minimum service requirement";

        // Calculate EOSB based on Saudi Labor Law Article 84
        if (result.TotalYearsOfService <= FIRST_PERIOD_YEARS)
        {
            // For service <= 5 years: (Basic Salary / 2) × Years of Service
            result.FirstPeriodYears = result.TotalYearsOfService;
            result.FirstPeriodAmount = (lastBasicSalary * FIRST_PERIOD_RATE) * (decimal)result.FirstPeriodYears;
            result.RemainingYears = 0;
            result.RemainingPeriodAmount = 0m;
            result.TotalEosbAmount = result.FirstPeriodAmount;

            result.CalculationBreakdown = $"Service period: {result.TotalYearsOfService:F2} years (≤ 5 years)\n" +
                                         $"Calculation: (SAR {lastBasicSalary:N2} ÷ 2) × {result.FirstPeriodYears:F2} years\n" +
                                         $"EOSB Amount: SAR {result.TotalEosbAmount:N2}";
        }
        else
        {
            // For service > 5 years: (Basic Salary / 2) × 5 + (Basic Salary × Remaining Years)
            result.FirstPeriodYears = FIRST_PERIOD_YEARS;
            result.FirstPeriodAmount = (lastBasicSalary * FIRST_PERIOD_RATE) * (decimal)FIRST_PERIOD_YEARS;
            
            result.RemainingYears = result.TotalYearsOfService - FIRST_PERIOD_YEARS;
            result.RemainingPeriodAmount = lastBasicSalary * REMAINING_PERIOD_RATE * (decimal)result.RemainingYears;
            
            result.TotalEosbAmount = result.FirstPeriodAmount + result.RemainingPeriodAmount;

            result.CalculationBreakdown = $"Service period: {result.TotalYearsOfService:F2} years (> 5 years)\n" +
                                         $"First 5 years: (SAR {lastBasicSalary:N2} ÷ 2) × 5 = SAR {result.FirstPeriodAmount:N2}\n" +
                                         $"Remaining {result.RemainingYears:F2} years: SAR {lastBasicSalary:N2} × {result.RemainingYears:F2} = SAR {result.RemainingPeriodAmount:N2}\n" +
                                         $"Total EOSB: SAR {result.TotalEosbAmount:N2}";
        }

        return result;
    }
}
