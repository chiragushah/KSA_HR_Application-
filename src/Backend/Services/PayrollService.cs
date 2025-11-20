using KsaHrApi.Models;
using KsaHrApi.Data;
using Microsoft.EntityFrameworkCore;

namespace KsaHrApi.Services;

public interface IPayrollService
{
    Task<PayrollRecord> ProcessPayroll(Guid employeeId, int month, int year);
    Task<IEnumerable<PayrollRecord>> ProcessBulkPayroll(int month, int year);
    Task<PayrollRecord?> GetPayrollRecord(Guid employeeId, int month, int year);
}

public class PayrollService : IPayrollService
{
    private readonly HrDbContext _context;
    private readonly IGosiCalculationService _gosiService;

    public PayrollService(HrDbContext context, IGosiCalculationService gosiService)
    {
        _context = context;
        _gosiService = gosiService;
    }

    public async Task<PayrollRecord> ProcessPayroll(Guid employeeId, int month, int year)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == employeeId && e.EmploymentStatus == "Active");

        if (employee == null)
            throw new InvalidOperationException($"Active employee not found with ID: {employeeId}");

        // Check if payroll already exists
        var existing = await _context.PayrollRecords
            .FirstOrDefaultAsync(p => p.EmployeeId == employeeId && p.PayrollMonth == month && p.PayrollYear == year);

        if (existing != null)
            return existing;

        // Calculate GOSI base (Basic Salary + Housing Allowance)
        decimal gosiBase = employee.BasicSalary + employee.HousingAllowance;

        // Calculate GOSI contributions
        var gosiResult = _gosiService.CalculateGosiContributions(employee, gosiBase);

        // Calculate gross salary
        decimal grossSalary = employee.TotalSalary;

        // Calculate total deductions
        decimal totalDeductions = gosiResult.EmployeeContribution;

        // Calculate net salary
        decimal netSalary = grossSalary - totalDeductions;

        var payrollRecord = new PayrollRecord
        {
            Id = Guid.NewGuid(),
            EmployeeId = employeeId,
            PayrollMonth = month,
            PayrollYear = year,
            BasicSalary = employee.BasicSalary,
            HousingAllowance = employee.HousingAllowance,
            TransportationAllowance = employee.TransportationAllowance,
            OtherAllowances = employee.OtherAllowances,
            OvertimePay = 0m, // To be calculated separately
            GrossSalary = grossSalary,
            GosiCalculationBase = gosiBase,
            GosiEmployeeContribution = gosiResult.EmployeeContribution,
            GosiEmployerContribution = gosiResult.EmployerContribution,
            GosiTotalContribution = gosiResult.TotalContribution,
            OtherDeductions = 0m,
            TotalDeductions = totalDeductions,
            NetSalary = netSalary,
            PaymentStatus = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _context.PayrollRecords.Add(payrollRecord);
        await _context.SaveChangesAsync();

        return payrollRecord;
    }

    public async Task<IEnumerable<PayrollRecord>> ProcessBulkPayroll(int month, int year)
    {
        var activeEmployees = await _context.Employees
            .Where(e => e.EmploymentStatus == "Active")
            .ToListAsync();

        var payrollRecords = new List<PayrollRecord>();

        foreach (var employee in activeEmployees)
        {
            try
            {
                var record = await ProcessPayroll(employee.Id, month, year);
                payrollRecords.Add(record);
            }
            catch (Exception ex)
            {
                // Log error but continue processing
                Console.WriteLine($"Error processing payroll for employee {employee.EmployeeCode}: {ex.Message}");
            }
        }

        return payrollRecords;
    }

    public async Task<PayrollRecord?> GetPayrollRecord(Guid employeeId, int month, int year)
    {
        return await _context.PayrollRecords
            .Include(p => p.Employee)
            .FirstOrDefaultAsync(p => p.EmployeeId == employeeId && p.PayrollMonth == month && p.PayrollYear == year);
    }
}
