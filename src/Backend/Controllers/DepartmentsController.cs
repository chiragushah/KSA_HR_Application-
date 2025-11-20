using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KsaHrApi.Models;
using KsaHrApi.Data;
using Microsoft.EntityFrameworkCore;

namespace KsaHrApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DepartmentsController : ControllerBase
{
    private readonly HrDbContext _context;
    private readonly ILogger<DepartmentsController> _logger;

    public DepartmentsController(HrDbContext context, ILogger<DepartmentsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Policy = "Employee")]
    public async Task<ActionResult<IEnumerable<Department>>> GetAllDepartments()
    {
        try
        {
            var departments = await _context.Departments
                .Include(d => d.ParentDepartment)
                .Where(d => d.IsActive)
                .ToListAsync();
            return Ok(departments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving departments");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "Employee")]
    public async Task<ActionResult<Department>> GetDepartment(Guid id)
    {
        try
        {
            var department = await _context.Departments
                .Include(d => d.ParentDepartment)
                .Include(d => d.Employees)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (department == null)
                return NotFound($"Department with ID {id} not found");

            return Ok(department);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving department {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost]
    [Authorize(Policy = "HRAdministrator")]
    public async Task<ActionResult<Department>> CreateDepartment([FromBody] Department department)
    {
        try
        {
            department.Id = Guid.NewGuid();
            department.CreatedAt = DateTime.UtcNow;

            _context.Departments.Add(department);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDepartment), new { id = department.Id }, department);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating department");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "HRAdministrator")]
    public async Task<ActionResult<Department>> UpdateDepartment(Guid id, [FromBody] Department department)
    {
        if (id != department.Id)
            return BadRequest("ID mismatch");

        try
        {
            var existing = await _context.Departments.FindAsync(id);
            if (existing == null)
                return NotFound($"Department with ID {id} not found");

            existing.NameEnglish = department.NameEnglish;
            existing.NameArabic = department.NameArabic;
            existing.DescriptionEnglish = department.DescriptionEnglish;
            existing.DescriptionArabic = department.DescriptionArabic;
            existing.ParentDepartmentId = department.ParentDepartmentId;
            existing.IsActive = department.IsActive;

            await _context.SaveChangesAsync();

            return Ok(existing);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating department {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}
