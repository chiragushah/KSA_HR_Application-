using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KsaHrApi.Models;

public class Position
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string PositionCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string TitleEnglish { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string TitleArabic { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? DescriptionEnglish { get; set; }

    [MaxLength(1000)]
    public string? DescriptionArabic { get; set; }

    public Guid DepartmentId { get; set; }
    [ForeignKey(nameof(DepartmentId))]
    public Department Department { get; set; } = null!;

    public Guid SalaryGradeId { get; set; }
    [ForeignKey(nameof(SalaryGradeId))]
    public SalaryGrade SalaryGrade { get; set; } = null!;

    public int Level { get; set; } = 1;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
}
