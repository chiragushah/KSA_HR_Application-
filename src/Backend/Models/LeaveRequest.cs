using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KsaHrApi.Models;

public class LeaveRequest
{
    [Key]
    public Guid Id { get; set; }

    public Guid EmployeeId { get; set; }
    [ForeignKey(nameof(EmployeeId))]
    public Employee Employee { get; set; } = null!;

    [Required]
    [MaxLength(50)]
    public string LeaveType { get; set; } = string.Empty;
    // Types: Annual, Sick, Maternity, Paternity, Bereavement, Marriage, Hajj, Unpaid

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    public int NumberOfDays { get; set; }

    [MaxLength(1000)]
    public string? Reason { get; set; }

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Cancelled

    public Guid? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }

    [MaxLength(500)]
    public string? ApproverComments { get; set; }

    [MaxLength(500)]
    public string? MedicalCertificatePath { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
