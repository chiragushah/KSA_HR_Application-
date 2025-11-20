using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KsaHrApi.Models;
using KsaHrApi.Services;

namespace KsaHrApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PayrollController : ControllerBase
{
    private readonly IPayrollService _payrollService;
    private readonly ILogger<PayrollController> _logger;

    public PayrollController(IPayrollService payrollService, ILogger<PayrollController> logger)
    {
        _payrollService = payrollService;
        _logger = logger;
    }

    [HttpPost("process")]
    [Authorize(Policy = "HRAdministrator")]
    public async Task<ActionResult<PayrollRecord>> ProcessPayroll([FromQuery] Guid employeeId, [FromQuery] int month, [FromQuery] int year)
    {
        try
        {
            var record = await _payrollService.ProcessPayroll(employeeId, month, year);
            return Ok(record);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing payroll for employee {EmployeeId}", employeeId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("process-bulk")]
    [Authorize(Policy = "HRAdministrator")]
    public async Task<ActionResult<IEnumerable<PayrollRecord>>> ProcessBulkPayroll([FromQuery] int month, [FromQuery] int year)
    {
        try
        {
            var records = await _payrollService.ProcessBulkPayroll(month, year);
            return Ok(records);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing bulk payroll for {Month}/{Year}", month, year);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet]
    [Authorize(Policy = "HRAdministrator")]
    public async Task<ActionResult<PayrollRecord>> GetPayrollRecord([FromQuery] Guid employeeId, [FromQuery] int month, [FromQuery] int year)
    {
        try
        {
            var record = await _payrollService.GetPayrollRecord(employeeId, month, year);
            if (record == null)
                return NotFound($"Payroll record not found for employee {employeeId} in {month}/{year}");

            return Ok(record);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving payroll record");
            return StatusCode(500, "Internal server error");
        }
    }
}
