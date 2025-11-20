using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KsaHrApi.Models;

public class PayrollRecord
{
    [Key]
    public Guid Id { get; set; }

    public Guid EmployeeId { get; set; }
    [ForeignKey(nameof(EmployeeId))]
    public Employee Employee { get; set; } = null!;

    [Required]
    public int PayrollMonth { get; set; }

    [Required]
    public int PayrollYear { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal BasicSalary { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal HousingAllowance { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TransportationAllowance { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal OtherAllowances { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal OvertimePay { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal GrossSalary { get; set; }

    // GOSI Deductions
    [Column(TypeName = "decimal(18,2)")]
    public decimal GosiEmployeeContribution { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal GosiEmployerContribution { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal GosiTotalContribution { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal GosiCalculationBase { get; set; }

    // Other Deductions
    [Column(TypeName = "decimal(18,2)")]
    public decimal OtherDeductions { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalDeductions { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal NetSalary { get; set; }

    [Required]
    [MaxLength(20)]
    public string PaymentStatus { get; set; } = "Pending"; // Pending, Processed, Paid

    public DateTime? PaymentDate { get; set; }

    [MaxLength(100)]
    public string? WpsReferenceNumber { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }
}
