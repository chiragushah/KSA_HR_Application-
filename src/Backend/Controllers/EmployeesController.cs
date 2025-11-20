using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KsaHrApi.Models;
using KsaHrApi.Services;

namespace KsaHrApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _employeeService;
    private readonly ILogger<EmployeesController> _logger;

    public EmployeesController(IEmployeeService employeeService, ILogger<EmployeesController> logger)
    {
        _employeeService = employeeService;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Policy = "Employee")]
    public async Task<ActionResult<IEnumerable<Employee>>> GetAllEmployees()
    {
        try
        {
            var employees = await _employeeService.GetAllEmployees();
            return Ok(employees);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving employees");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "Employee")]
    public async Task<ActionResult<Employee>> GetEmployee(Guid id)
    {
        try
        {
            var employee = await _employeeService.GetEmployee(id);
            if (employee == null)
                return NotFound($"Employee with ID {id} not found");

            return Ok(employee);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving employee {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("search")]
    [Authorize(Policy = "Employee")]
    public async Task<ActionResult<IEnumerable<Employee>>> SearchEmployees([FromQuery] string searchTerm)
    {
        try
        {
            var employees = await _employeeService.SearchEmployees(searchTerm);
            return Ok(employees);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching employees");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("department/{departmentId}")]
    [Authorize(Policy = "TeamManager")]
    public async Task<ActionResult<IEnumerable<Employee>>> GetEmployeesByDepartment(Guid departmentId)
    {
        try
        {
            var employees = await _employeeService.GetEmployeesByDepartment(departmentId);
            return Ok(employees);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving employees for department {DepartmentId}", departmentId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("manager/{managerId}")]
    [Authorize(Policy = "TeamManager")]
    public async Task<ActionResult<IEnumerable<Employee>>> GetEmployeesByManager(Guid managerId)
    {
        try
        {
            var employees = await _employeeService.GetEmployeesByManager(managerId);
            return Ok(employees);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving employees for manager {ManagerId}", managerId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost]
    [Authorize(Policy = "HRAdministrator")]
    public async Task<ActionResult<Employee>> CreateEmployee([FromBody] Employee employee)
    {
        try
        {
            var created = await _employeeService.CreateEmployee(employee);
            return CreatedAtAction(nameof(GetEmployee), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating employee");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "HRAdministrator")]
    public async Task<ActionResult<Employee>> UpdateEmployee(Guid id, [FromBody] Employee employee)
    {
        if (id != employee.Id)
            return BadRequest("ID mismatch");

        try
        {
            var updated = await _employeeService.UpdateEmployee(employee);
            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating employee {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "HRAdministrator")]
    public async Task<ActionResult> DeleteEmployee(Guid id)
    {
        try
        {
            var result = await _employeeService.DeleteEmployee(id);
            if (!result)
                return NotFound($"Employee with ID {id} not found");

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting employee {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}
