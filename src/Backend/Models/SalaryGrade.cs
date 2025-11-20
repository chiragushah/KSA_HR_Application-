using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KsaHrApi.Models;

public class SalaryGrade
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string GradeCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string GradeName { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal MinimumSalary { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal MaximumSalary { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal MidpointSalary { get; set; }

    public int Level { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    public ICollection<Position> Positions { get; set; } = new List<Position>();
}
