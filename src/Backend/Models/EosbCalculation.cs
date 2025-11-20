using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KsaHrApi.Models;

public class EosbCalculation
{
    [Key]
    public Guid Id { get; set; }

    public Guid EmployeeId { get; set; }
    [ForeignKey(nameof(EmployeeId))]
    public Employee Employee { get; set; } = null!;

    [Required]
    public DateTime CalculationDate { get; set; } = DateTime.UtcNow;

    [Required]
    public DateTime HireDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    public double TotalYearsOfService { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal LastDrawnBasicSalary { get; set; }

    // First 5 years calculation
    public double FirstPeriodYears { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal FirstPeriodAmount { get; set; }

    // Remaining years calculation
    public double RemainingYears { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal RemainingPeriodAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalEosbAmount { get; set; }

    [MaxLength(50)]
    public string TerminationType { get; set; } = "Resignation"; // Resignation, Termination, Retirement

    [MaxLength(1000)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }
}
