using KsaHrApi.Models;
using KsaHrApi.Data;
using Microsoft.EntityFrameworkCore;

namespace KsaHrApi.Services;

public interface ILeaveService
{
    Task<LeaveRequest> CreateLeaveRequest(LeaveRequest request);
    Task<LeaveRequest> ApproveLeaveRequest(Guid requestId, Guid approverId, string? comments);
    Task<LeaveRequest> RejectLeaveRequest(Guid requestId, Guid approverId, string? comments);
    Task<IEnumerable<LeaveRequest>> GetEmployeeLeaveRequests(Guid employeeId);
    Task<IEnumerable<LeaveRequest>> GetPendingLeaveRequests();
    Task<LeaveBalance> GetLeaveBalance(Guid employeeId);
    int CalculateAnnualLeaveEntitlement(DateTime hireDate);
}

public class LeaveBalance
{
    public int AnnualLeaveBalance { get; set; }
    public int SickLeaveBalance { get; set; }
    public int AnnualLeaveUsed { get; set; }
    public int SickLeaveUsed { get; set; }
    public int AnnualLeaveEntitlement { get; set; }
}

public class LeaveService : ILeaveService
{
    private readonly HrDbContext _context;

    public LeaveService(HrDbContext context)
    {
        _context = context;
    }

    public async Task<LeaveRequest> CreateLeaveRequest(LeaveRequest request)
    {
        // Validate leave balance
        var employee = await _context.Employees.FindAsync(request.EmployeeId);
        if (employee == null)
            throw new InvalidOperationException("Employee not found");

        // Calculate number of days (excluding weekends if needed)
        request.NumberOfDays = CalculateWorkingDays(request.StartDate, request.EndDate);

        // Validate balance for annual and sick leave
        if (request.LeaveType == "Annual" && employee.AnnualLeaveBalance < request.NumberOfDays)
            throw new InvalidOperationException($"Insufficient annual leave balance. Available: {employee.AnnualLeaveBalance} days");

        if (request.LeaveType == "Sick" && employee.SickLeaveBalance < request.NumberOfDays)
            throw new InvalidOperationException($"Insufficient sick leave balance. Available: {employee.SickLeaveBalance} days");

        request.Id = Guid.NewGuid();
        request.Status = "Pending";
        request.CreatedAt = DateTime.UtcNow;

        _context.LeaveRequests.Add(request);
        await _context.SaveChangesAsync();

        return request;
    }

    public async Task<LeaveRequest> ApproveLeaveRequest(Guid requestId, Guid approverId, string? comments)
    {
        var request = await _context.LeaveRequests
            .Include(lr => lr.Employee)
            .FirstOrDefaultAsync(lr => lr.Id == requestId);

        if (request == null)
            throw new InvalidOperationException("Leave request not found");

        if (request.Status != "Pending")
            throw new InvalidOperationException($"Cannot approve request with status: {request.Status}");

        request.Status = "Approved";
        request.ApprovedBy = approverId;
        request.ApprovedAt = DateTime.UtcNow;
        request.ApproverComments = comments;
        request.UpdatedAt = DateTime.UtcNow;

        // Deduct from employee leave balance
        var employee = request.Employee;
        if (request.LeaveType == "Annual")
        {
            employee.AnnualLeaveBalance -= request.NumberOfDays;
        }
        else if (request.LeaveType == "Sick")
        {
            employee.SickLeaveBalance -= request.NumberOfDays;
        }

        employee.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return request;
    }

    public async Task<LeaveRequest> RejectLeaveRequest(Guid requestId, Guid approverId, string? comments)
    {
        var request = await _context.LeaveRequests.FindAsync(requestId);

        if (request == null)
            throw new InvalidOperationException("Leave request not found");

        if (request.Status != "Pending")
            throw new InvalidOperationException($"Cannot reject request with status: {request.Status}");

        request.Status = "Rejected";
        request.ApprovedBy = approverId;
        request.ApprovedAt = DateTime.UtcNow;
        request.ApproverComments = comments;
        request.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return request;
    }

    public async Task<IEnumerable<LeaveRequest>> GetEmployeeLeaveRequests(Guid employeeId)
    {
        return await _context.LeaveRequests
            .Where(lr => lr.EmployeeId == employeeId)
            .OrderByDescending(lr => lr.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<LeaveRequest>> GetPendingLeaveRequests()
    {
        return await _context.LeaveRequests
            .Include(lr => lr.Employee)
            .Where(lr => lr.Status == "Pending")
            .OrderBy(lr => lr.CreatedAt)
            .ToListAsync();
    }

    public async Task<LeaveBalance> GetLeaveBalance(Guid employeeId)
    {
        var employee = await _context.Employees.FindAsync(employeeId);
        if (employee == null)
            throw new InvalidOperationException("Employee not found");

        var currentYear = DateTime.UtcNow.Year;
        var annualLeaveUsed = await _context.LeaveRequests
            .Where(lr => lr.EmployeeId == employeeId && 
                        lr.LeaveType == "Annual" && 
                        lr.Status == "Approved" &&
                        lr.StartDate.Year == currentYear)
            .SumAsync(lr => lr.NumberOfDays);

        var sickLeaveUsed = await _context.LeaveRequests
            .Where(lr => lr.EmployeeId == employeeId && 
                        lr.LeaveType == "Sick" && 
                        lr.Status == "Approved" &&
                        lr.StartDate.Year == currentYear)
            .SumAsync(lr => lr.NumberOfDays);

        var entitlement = CalculateAnnualLeaveEntitlement(employee.HireDate);

        return new LeaveBalance
        {
            AnnualLeaveBalance = employee.AnnualLeaveBalance,
            SickLeaveBalance = employee.SickLeaveBalance,
            AnnualLeaveUsed = annualLeaveUsed,
            SickLeaveUsed = sickLeaveUsed,
            AnnualLeaveEntitlement = entitlement
        };
    }

    public int CalculateAnnualLeaveEntitlement(DateTime hireDate)
    {
        var yearsOfService = (DateTime.UtcNow - hireDate).TotalDays / 365.25;
        
        // Saudi Labor Law: 21 days for 1-5 years, 30 days for 5+ years
        return yearsOfService >= 5 ? 30 : 21;
    }

    private int CalculateWorkingDays(DateTime startDate, DateTime endDate)
    {
        int days = 0;
        for (var date = startDate; date <= endDate; date = date.AddDays(1))
        {
            // Exclude Fridays and Saturdays (Saudi weekend)
            if (date.DayOfWeek != DayOfWeek.Friday && date.DayOfWeek != DayOfWeek.Saturday)
                days++;
        }
        return days;
    }
}
