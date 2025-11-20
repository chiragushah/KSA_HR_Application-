using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KsaHrApi.Models;
using KsaHrApi.Services;

namespace KsaHrApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LeaveController : ControllerBase
{
    private readonly ILeaveService _leaveService;
    private readonly ILogger<LeaveController> _logger;

    public LeaveController(ILeaveService leaveService, ILogger<LeaveController> logger)
    {
        _leaveService = leaveService;
        _logger = logger;
    }

    [HttpPost]
    [Authorize(Policy = "Employee")]
    public async Task<ActionResult<LeaveRequest>> CreateLeaveRequest([FromBody] LeaveRequest request)
    {
        try
        {
            var created = await _leaveService.CreateLeaveRequest(request);
            return Ok(created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating leave request");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("{requestId}/approve")]
    [Authorize(Policy = "TeamManager")]
    public async Task<ActionResult<LeaveRequest>> ApproveLeaveRequest(Guid requestId, [FromQuery] Guid approverId, [FromBody] string? comments)
    {
        try
        {
            var approved = await _leaveService.ApproveLeaveRequest(requestId, approverId, comments);
            return Ok(approved);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving leave request {RequestId}", requestId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("{requestId}/reject")]
    [Authorize(Policy = "TeamManager")]
    public async Task<ActionResult<LeaveRequest>> RejectLeaveRequest(Guid requestId, [FromQuery] Guid approverId, [FromBody] string? comments)
    {
        try
        {
            var rejected = await _leaveService.RejectLeaveRequest(requestId, approverId, comments);
            return Ok(rejected);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting leave request {RequestId}", requestId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("employee/{employeeId}")]
    [Authorize(Policy = "Employee")]
    public async Task<ActionResult<IEnumerable<LeaveRequest>>> GetEmployeeLeaveRequests(Guid employeeId)
    {
        try
        {
            var requests = await _leaveService.GetEmployeeLeaveRequests(employeeId);
            return Ok(requests);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving leave requests for employee {EmployeeId}", employeeId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("pending")]
    [Authorize(Policy = "TeamManager")]
    public async Task<ActionResult<IEnumerable<LeaveRequest>>> GetPendingLeaveRequests()
    {
        try
        {
            var requests = await _leaveService.GetPendingLeaveRequests();
            return Ok(requests);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving pending leave requests");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("balance/{employeeId}")]
    [Authorize(Policy = "Employee")]
    public async Task<ActionResult<LeaveBalance>> GetLeaveBalance(Guid employeeId)
    {
        try
        {
            var balance = await _leaveService.GetLeaveBalance(employeeId);
            return Ok(balance);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving leave balance for employee {EmployeeId}", employeeId);
            return StatusCode(500, "Internal server error");
        }
    }
}
