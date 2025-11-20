using KsaHrApi.Models;
using KsaHrApi.Data;
using Microsoft.EntityFrameworkCore;

namespace KsaHrApi.Services;

public interface IEmployeeService
{
    Task<Employee> CreateEmployee(Employee employee);
    Task<Employee> UpdateEmployee(Employee employee);
    Task<Employee?> GetEmployee(Guid id);
    Task<IEnumerable<Employee>> GetAllEmployees();
    Task<IEnumerable<Employee>> SearchEmployees(string searchTerm);
    Task<bool> DeleteEmployee(Guid id);
    Task<IEnumerable<Employee>> GetEmployeesByDepartment(Guid departmentId);
    Task<IEnumerable<Employee>> GetEmployeesByManager(Guid managerId);
}

public class EmployeeService : IEmployeeService
{
    private readonly HrDbContext _context;

    public EmployeeService(HrDbContext context)
    {
        _context = context;
    }

    public async Task<Employee> CreateEmployee(Employee employee)
    {
        // Validate unique constraints
        if (await _context.Employees.AnyAsync(e => e.EmployeeCode == employee.EmployeeCode))
            throw new InvalidOperationException($"Employee code {employee.EmployeeCode} already exists");

        if (await _context.Employees.AnyAsync(e => e.Email == employee.Email))
            throw new InvalidOperationException($"Email {employee.Email} already exists");

        if (await _context.Employees.AnyAsync(e => e.NationalIdNumber == employee.NationalIdNumber))
            throw new InvalidOperationException($"National ID {employee.NationalIdNumber} already exists");

        // Validate minimum wage for Saudi nationals
        if (employee.IsSaudiNational && employee.BasicSalary < 4000)
            throw new InvalidOperationException("Minimum wage for Saudi nationals is SAR 4,000");

        // Calculate total salary
        employee.TotalSalary = employee.BasicSalary + employee.HousingAllowance + 
                              employee.TransportationAllowance + employee.OtherAllowances;

        // Set initial leave balances based on service period
        var yearsOfService = (DateTime.UtcNow - employee.HireDate).TotalDays / 365.25;
        employee.AnnualLeaveBalance = yearsOfService >= 5 ? 30 : 21;
        employee.SickLeaveBalance = 120;

        employee.Id = Guid.NewGuid();
        employee.CreatedAt = DateTime.UtcNow;

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        return employee;
    }

    public async Task<Employee> UpdateEmployee(Employee employee)
    {
        var existing = await _context.Employees.FindAsync(employee.Id);
        if (existing == null)
            throw new InvalidOperationException("Employee not found");

        // Update fields
        existing.FullNameEnglish = employee.FullNameEnglish;
        existing.FullNameArabic = employee.FullNameArabic;
        existing.Email = employee.Email;
        existing.PhoneNumber = employee.PhoneNumber;
        existing.BasicSalary = employee.BasicSalary;
        existing.HousingAllowance = employee.HousingAllowance;
        existing.TransportationAllowance = employee.TransportationAllowance;
        existing.OtherAllowances = employee.OtherAllowances;
        existing.TotalSalary = employee.BasicSalary + employee.HousingAllowance + 
                              employee.TransportationAllowance + employee.OtherAllowances;
        existing.DepartmentId = employee.DepartmentId;
        existing.PositionId = employee.PositionId;
        existing.ManagerId = employee.ManagerId;
        existing.SalaryGradeId = employee.SalaryGradeId;
        existing.EmploymentStatus = employee.EmploymentStatus;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return existing;
    }

    public async Task<Employee?> GetEmployee(Guid id)
    {
        return await _context.Employees
            .Include(e => e.Department)
            .Include(e => e.Position)
            .Include(e => e.Manager)
            .Include(e => e.SalaryGrade)
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<IEnumerable<Employee>> GetAllEmployees()
    {
        return await _context.Employees
            .Include(e => e.Department)
            .Include(e => e.Position)
            .Include(e => e.Manager)
            .Include(e => e.SalaryGrade)
            .OrderBy(e => e.EmployeeCode)
            .ToListAsync();
    }

    public async Task<IEnumerable<Employee>> SearchEmployees(string searchTerm)
    {
        return await _context.Employees
            .Include(e => e.Department)
            .Include(e => e.Position)
            .Where(e => e.EmployeeCode.Contains(searchTerm) ||
                       e.FullNameEnglish.Contains(searchTerm) ||
                       e.FullNameArabic.Contains(searchTerm) ||
                       e.Email.Contains(searchTerm) ||
                       e.NationalIdNumber.Contains(searchTerm))
            .ToListAsync();
    }

    public async Task<bool> DeleteEmployee(Guid id)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null)
            return false;

        _context.Employees.Remove(employee);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<IEnumerable<Employee>> GetEmployeesByDepartment(Guid departmentId)
    {
        return await _context.Employees
            .Include(e => e.Position)
            .Include(e => e.Manager)
            .Where(e => e.DepartmentId == departmentId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Employee>> GetEmployeesByManager(Guid managerId)
    {
        return await _context.Employees
            .Include(e => e.Department)
            .Include(e => e.Position)
            .Where(e => e.ManagerId == managerId)
            .ToListAsync();
    }
}
