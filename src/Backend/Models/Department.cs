using System.ComponentModel.DataAnnotations;

namespace KsaHrApi.Models;

public class Department
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string DepartmentCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string NameEnglish { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string NameArabic { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? DescriptionEnglish { get; set; }

    [MaxLength(500)]
    public string? DescriptionArabic { get; set; }

    public Guid? ParentDepartmentId { get; set; }
    public Department? ParentDepartment { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    public ICollection<Position> Positions { get; set; } = new List<Position>();
}
