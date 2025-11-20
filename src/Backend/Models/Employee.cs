using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KsaHrApi.Models;

public class Employee
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string EmployeeCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string FullNameEnglish { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string FullNameArabic { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? PhoneNumber { get; set; }

    [Required]
    [MaxLength(50)]
    public string NationalIdType { get; set; } = string.Empty; // "SaudiNationalId" or "Iqama"

    [Required]
    [MaxLength(50)]
    public string NationalIdNumber { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? GosiNumber { get; set; }

    [Required]
    [MaxLength(20)]
    public string Nationality { get; set; } = "Saudi";

    public bool IsSaudiNational { get; set; } = true;

    [Required]
    public DateTime DateOfBirth { get; set; }

    [Required]
    public DateTime HireDate { get; set; }

    public DateTime? TerminationDate { get; set; }

    [Required]
    [MaxLength(20)]
    public string EmploymentStatus { get; set; } = "Active"; // Active, Terminated, Suspended

    [Required]
    [MaxLength(50)]
    public string ContractType { get; set; } = "Unlimited"; // Unlimited, Fixed-Term

    // Salary Information
    [Column(TypeName = "decimal(18,2)")]
    public decimal BasicSalary { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal HousingAllowance { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TransportationAllowance { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal OtherAllowances { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalSalary { get; set; }

    // Bank Information
    [MaxLength(100)]
    public string? BankName { get; set; }

    [MaxLength(50)]
    public string? BankAccountNumber { get; set; }

    [MaxLength(50)]
    public string? IbanNumber { get; set; }

    // Organizational Structure
    public Guid DepartmentId { get; set; }
    [ForeignKey(nameof(DepartmentId))]
    public Department Department { get; set; } = null!;

    public Guid PositionId { get; set; }
    [ForeignKey(nameof(PositionId))]
    public Position Position { get; set; } = null!;

    public Guid? ManagerId { get; set; }
    [ForeignKey(nameof(ManagerId))]
    public Employee? Manager { get; set; }

    public Guid SalaryGradeId { get; set; }
    [ForeignKey(nameof(SalaryGradeId))]
    public SalaryGrade SalaryGrade { get; set; } = null!;

    // Leave Balances
    public int AnnualLeaveBalance { get; set; } = 21;
    public int SickLeaveBalance { get; set; } = 120;

    // GOSI Registration Date (for new employee rate calculation)
    public DateTime? GosiRegistrationDate { get; set; }

    // Audit Fields
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }

    // Navigation Properties
    public ICollection<LeaveRequest> LeaveRequests { get; set; } = new List<LeaveRequest>();
    public ICollection<PayrollRecord> PayrollRecords { get; set; } = new List<PayrollRecord>();
    public ICollection<EosbCalculation> EosbCalculations { get; set; } = new List<EosbCalculation>();
}
