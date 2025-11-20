using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KsaHrApi.Services;
using KsaHrApi.Data;
using Microsoft.EntityFrameworkCore;

namespace KsaHrApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EosbController : ControllerBase
{
    private readonly IEosbCalculationService _eosbService;
    private readonly HrDbContext _context;
    private readonly ILogger<EosbController> _logger;

    public EosbController(IEosbCalculationService eosbService, HrDbContext context, ILogger<EosbController> logger)
    {
        _eosbService = eosbService;
        _context = context;
        _logger = logger;
    }

    [HttpPost("calculate")]
    [Authorize(Policy = "TeamManager")]
    public async Task<ActionResult<EosbCalculationResult>> CalculateEosb([FromQuery] Guid employeeId, [FromQuery] DateTime? endDate)
    {
        try
        {
            var employee = await _context.Employees.FindAsync(employeeId);
            if (employee == null)
                return NotFound($"Employee with ID {employeeId} not found");

            var calculationDate = endDate ?? DateTime.UtcNow;
            var result = _eosbService.CalculateEosb(employee, calculationDate, employee.BasicSalary);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating EOSB for employee {EmployeeId}", employeeId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("calculate-quick")]
    [Authorize(Policy = "Employee")]
    public ActionResult<EosbCalculationResult> CalculateEosbQuick([FromQuery] DateTime hireDate, [FromQuery] DateTime endDate, [FromQuery] decimal basicSalary)
    {
        try
        {
            var result = _eosbService.CalculateEosb(hireDate, endDate, basicSalary);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating EOSB");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("save-calculation")]
    [Authorize(Policy = "HRAdministrator")]
    public async Task<ActionResult> SaveEosbCalculation([FromQuery] Guid employeeId, [FromQuery] DateTime endDate, [FromQuery] string terminationType, [FromQuery] string? notes)
    {
        try
        {
            var employee = await _context.Employees.FindAsync(employeeId);
            if (employee == null)
                return NotFound($"Employee with ID {employeeId} not found");

            var result = _eosbService.CalculateEosb(employee, endDate, employee.BasicSalary);

            var calculation = new Models.EosbCalculation
            {
                Id = Guid.NewGuid(),
                EmployeeId = employeeId,
                CalculationDate = DateTime.UtcNow,
                HireDate = employee.HireDate,
                EndDate = endDate,
                TotalYearsOfService = result.TotalYearsOfService,
                LastDrawnBasicSalary = employee.BasicSalary,
                FirstPeriodYears = result.FirstPeriodYears,
                FirstPeriodAmount = result.FirstPeriodAmount,
                RemainingYears = result.RemainingYears,
                RemainingPeriodAmount = result.RemainingPeriodAmount,
                TotalEosbAmount = result.TotalEosbAmount,
                TerminationType = terminationType,
                Notes = notes,
                CreatedAt = DateTime.UtcNow
            };

            _context.EosbCalculations.Add(calculation);
            await _context.SaveChangesAsync();

            return Ok(calculation);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving EOSB calculation");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("history/{employeeId}")]
    [Authorize(Policy = "TeamManager")]
    public async Task<ActionResult> GetEosbHistory(Guid employeeId)
    {
        try
        {
            var history = await _context.EosbCalculations
                .Where(e => e.EmployeeId == employeeId)
                .OrderByDescending(e => e.CalculationDate)
                .ToListAsync();

            return Ok(history);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving EOSB history for employee {EmployeeId}", employeeId);
            return StatusCode(500, "Internal server error");
        }
    }
}
