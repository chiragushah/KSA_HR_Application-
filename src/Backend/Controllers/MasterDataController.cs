using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KsaHrApi.Models;
using KsaHrApi.Data;
using Microsoft.EntityFrameworkCore;

namespace KsaHrApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MasterDataController : ControllerBase
{
    private readonly HrDbContext _context;
    private readonly ILogger<MasterDataController> _logger;

    public MasterDataController(HrDbContext context, ILogger<MasterDataController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // Positions
    [HttpGet("positions")]
    [Authorize(Policy = "Employee")]
    public async Task<ActionResult<IEnumerable<Position>>> GetPositions()
    {
        try
        {
            var positions = await _context.Positions
                .Include(p => p.Department)
                .Include(p => p.SalaryGrade)
                .Where(p => p.IsActive)
                .ToListAsync();
            return Ok(positions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving positions");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("positions")]
    [Authorize(Policy = "HRAdministrator")]
    public async Task<ActionResult<Position>> CreatePosition([FromBody] Position position)
    {
        try
        {
            position.Id = Guid.NewGuid();
            position.CreatedAt = DateTime.UtcNow;

            _context.Positions.Add(position);
            await _context.SaveChangesAsync();

            return Ok(position);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating position");
            return StatusCode(500, "Internal server error");
        }
    }

    // Salary Grades
    [HttpGet("salary-grades")]
    [Authorize(Policy = "Employee")]
    public async Task<ActionResult<IEnumerable<SalaryGrade>>> GetSalaryGrades()
    {
        try
        {
            var grades = await _context.SalaryGrades
                .Where(g => g.IsActive)
                .OrderBy(g => g.Level)
                .ToListAsync();
            return Ok(grades);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving salary grades");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("salary-grades")]
    [Authorize(Policy = "HRAdministrator")]
    public async Task<ActionResult<SalaryGrade>> CreateSalaryGrade([FromBody] SalaryGrade grade)
    {
        try
        {
            grade.Id = Guid.NewGuid();
            grade.CreatedAt = DateTime.UtcNow;

            _context.SalaryGrades.Add(grade);
            await _context.SaveChangesAsync();

            return Ok(grade);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating salary grade");
            return StatusCode(500, "Internal server error");
        }
    }

    // Leave Types
    [HttpGet("leave-types")]
    [Authorize(Policy = "Employee")]
    public ActionResult<IEnumerable<object>> GetLeaveTypes()
    {
        var leaveTypes = new[]
        {
            new { Code = "Annual", NameEn = "Annual Leave", NameAr = "إجازة سنوية", MaxDays = 30 },
            new { Code = "Sick", NameEn = "Sick Leave", NameAr = "إجازة مرضية", MaxDays = 120 },
            new { Code = "Maternity", NameEn = "Maternity Leave", NameAr = "إجازة أمومة", MaxDays = 70 },
            new { Code = "Paternity", NameEn = "Paternity Leave", NameAr = "إجازة أبوة", MaxDays = 3 },
            new { Code = "Bereavement", NameEn = "Bereavement Leave", NameAr = "إجازة حداد", MaxDays = 2 },
            new { Code = "Marriage", NameEn = "Marriage Leave", NameAr = "إجازة زواج", MaxDays = 3 },
            new { Code = "Hajj", NameEn = "Hajj Leave", NameAr = "إجازة حج", MaxDays = 15 },
            new { Code = "Unpaid", NameEn = "Unpaid Leave", NameAr = "إجازة بدون أجر", MaxDays = 0 }
        };

        return Ok(leaveTypes);
    }
}
