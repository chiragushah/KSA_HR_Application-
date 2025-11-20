using KsaHrApi.Models;

namespace KsaHrApi.Services;

public interface IGosiCalculationService
{
    GosiCalculationResult CalculateGosiContributions(Employee employee, decimal calculationBase);
    decimal GetEmployeeRate(Employee employee);
    decimal GetEmployerRate(Employee employee);
}

public class GosiCalculationResult
{
    public decimal CalculationBase { get; set; }
    public decimal EmployeeRate { get; set; }
    public decimal EmployerRate { get; set; }
    public decimal EmployeeContribution { get; set; }
    public decimal EmployerContribution { get; set; }
    public decimal TotalContribution { get; set; }
    public bool IsSaudiNational { get; set; }
    public bool IsNewEmployee { get; set; }
    public string CalculationDetails { get; set; } = string.Empty;
}

public class GosiCalculationService : IGosiCalculationService
{
    private readonly IConfiguration _configuration;

    // GOSI Contribution Rates
    private const decimal SAUDI_EMPLOYEE_RATE = 0.0975m; // 9.75%
    private const decimal SAUDI_EMPLOYER_RATE = 0.1175m; // 11.75%
    private const decimal EXPAT_EMPLOYER_RATE = 0.02m;   // 2%

    // New Saudi employee rates (registered after July 3, 2024)
    private static readonly Dictionary<int, decimal> NewSaudiRates = new()
    {
        { 2024, 0.1025m }, // 10.25%
        { 2025, 0.1075m }, // 10.75%
        { 2026, 0.1125m }, // 11.25%
        { 2027, 0.1175m }, // 11.75%
        { 2028, 0.1100m }  // 11.00%
    };

    private static readonly DateTime NewRateEffectiveDate = new DateTime(2024, 7, 3);

    public GosiCalculationService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public GosiCalculationResult CalculateGosiContributions(Employee employee, decimal calculationBase)
    {
        var result = new GosiCalculationResult
        {
            CalculationBase = calculationBase,
            IsSaudiNational = employee.IsSaudiNational
        };

        if (employee.IsSaudiNational)
        {
            // Check if new employee (registered after July 3, 2024)
            bool isNewEmployee = employee.GosiRegistrationDate.HasValue && 
                                employee.GosiRegistrationDate.Value >= NewRateEffectiveDate;
            
            result.IsNewEmployee = isNewEmployee;

            if (isNewEmployee)
            {
                // Use graduated rate based on current year
                int currentYear = DateTime.UtcNow.Year;
                result.EmployeeRate = NewSaudiRates.ContainsKey(currentYear) 
                    ? NewSaudiRates[currentYear] 
                    : SAUDI_EMPLOYER_RATE; // Default to standard rate after 2028

                result.EmployerRate = SAUDI_EMPLOYER_RATE;
                result.CalculationDetails = $"New Saudi employee rate for {currentYear}: {result.EmployeeRate:P2}";
            }
            else
            {
                // Standard Saudi rates
                result.EmployeeRate = SAUDI_EMPLOYEE_RATE;
                result.EmployerRate = SAUDI_EMPLOYER_RATE;
                result.CalculationDetails = "Standard Saudi national rates";
            }

            result.EmployeeContribution = calculationBase * result.EmployeeRate;
            result.EmployerContribution = calculationBase * result.EmployerRate;
        }
        else
        {
            // Expatriate - employer contribution only
            result.EmployeeRate = 0m;
            result.EmployerRate = EXPAT_EMPLOYER_RATE;
            result.EmployeeContribution = 0m;
            result.EmployerContribution = Math.Min(Math.Max(calculationBase * result.EmployerRate, 400m), 45000m);
            result.CalculationDetails = "Expatriate rate - employer contribution only (SAR 400-45,000)";
        }

        result.TotalContribution = result.EmployeeContribution + result.EmployerContribution;

        return result;
    }

    public decimal GetEmployeeRate(Employee employee)
    {
        if (!employee.IsSaudiNational)
            return 0m;

        bool isNewEmployee = employee.GosiRegistrationDate.HasValue && 
                           employee.GosiRegistrationDate.Value >= NewRateEffectiveDate;

        if (isNewEmployee)
        {
            int currentYear = DateTime.UtcNow.Year;
            return NewSaudiRates.ContainsKey(currentYear) 
                ? NewSaudiRates[currentYear] 
                : SAUDI_EMPLOYER_RATE;
        }

        return SAUDI_EMPLOYEE_RATE;
    }

    public decimal GetEmployerRate(Employee employee)
    {
        return employee.IsSaudiNational ? SAUDI_EMPLOYER_RATE : EXPAT_EMPLOYER_RATE;
    }
}
