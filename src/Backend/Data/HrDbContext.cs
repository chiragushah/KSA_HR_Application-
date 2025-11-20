using Microsoft.EntityFrameworkCore;
using KsaHrApi.Models;

namespace KsaHrApi.Data;

public class HrDbContext : DbContext
{
    public HrDbContext(DbContextOptions<HrDbContext> options) : base(options)
    {
    }

    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Position> Positions => Set<Position>();
    public DbSet<SalaryGrade> SalaryGrades => Set<SalaryGrade>();
    public DbSet<PayrollRecord> PayrollRecords => Set<PayrollRecord>();
    public DbSet<LeaveRequest> LeaveRequests => Set<LeaveRequest>();
    public DbSet<EosbCalculation> EosbCalculations => Set<EosbCalculation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Employee entity
        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasIndex(e => e.EmployeeCode).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.NationalIdNumber).IsUnique();
            entity.HasIndex(e => e.GosiNumber);

            entity.HasOne(e => e.Manager)
                .WithMany()
                .HasForeignKey(e => e.ManagerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Department)
                .WithMany(d => d.Employees)
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Position)
                .WithMany(p => p.Employees)
                .HasForeignKey(e => e.PositionId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.SalaryGrade)
                .WithMany(sg => sg.Employees)
                .HasForeignKey(e => e.SalaryGradeId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure Department entity
        modelBuilder.Entity<Department>(entity =>
        {
            entity.HasIndex(e => e.DepartmentCode).IsUnique();

            entity.HasOne(d => d.ParentDepartment)
                .WithMany()
                .HasForeignKey(d => d.ParentDepartmentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure Position entity
        modelBuilder.Entity<Position>(entity =>
        {
            entity.HasIndex(e => e.PositionCode).IsUnique();
        });

        // Configure SalaryGrade entity
        modelBuilder.Entity<SalaryGrade>(entity =>
        {
            entity.HasIndex(e => e.GradeCode).IsUnique();
        });

        // Configure PayrollRecord entity
        modelBuilder.Entity<PayrollRecord>(entity =>
        {
            entity.HasIndex(e => new { e.EmployeeId, e.PayrollYear, e.PayrollMonth }).IsUnique();
        });

        // Seed initial data
        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        // Seed Salary Grades
        var salaryGrades = new[]
        {
            new SalaryGrade { Id = Guid.NewGuid(), GradeCode = "G1", GradeName = "Grade 1", MinimumSalary = 4000, MaximumSalary = 6000, MidpointSalary = 5000, Level = 1 },
            new SalaryGrade { Id = Guid.NewGuid(), GradeCode = "G2", GradeName = "Grade 2", MinimumSalary = 6000, MaximumSalary = 9000, MidpointSalary = 7500, Level = 2 },
            new SalaryGrade { Id = Guid.NewGuid(), GradeCode = "G3", GradeName = "Grade 3", MinimumSalary = 9000, MaximumSalary = 13000, MidpointSalary = 11000, Level = 3 },
            new SalaryGrade { Id = Guid.NewGuid(), GradeCode = "G4", GradeName = "Grade 4", MinimumSalary = 13000, MaximumSalary = 18000, MidpointSalary = 15500, Level = 4 },
            new SalaryGrade { Id = Guid.NewGuid(), GradeCode = "G5", GradeName = "Grade 5", MinimumSalary = 18000, MaximumSalary = 25000, MidpointSalary = 21500, Level = 5 }
        };
        modelBuilder.Entity<SalaryGrade>().HasData(salaryGrades);

        // Seed Departments
        var hrDeptId = Guid.NewGuid();
        var itDeptId = Guid.NewGuid();
        var financeDeptId = Guid.NewGuid();

        modelBuilder.Entity<Department>().HasData(
            new Department { Id = hrDeptId, DepartmentCode = "HR", NameEnglish = "Human Resources", NameArabic = "الموارد البشرية" },
            new Department { Id = itDeptId, DepartmentCode = "IT", NameEnglish = "Information Technology", NameArabic = "تقنية المعلومات" },
            new Department { Id = financeDeptId, DepartmentCode = "FIN", NameEnglish = "Finance", NameArabic = "المالية" }
        );

        // Seed Positions
        modelBuilder.Entity<Position>().HasData(
            new Position { Id = Guid.NewGuid(), PositionCode = "HR-MGR", TitleEnglish = "HR Manager", TitleArabic = "مدير الموارد البشرية", DepartmentId = hrDeptId, SalaryGradeId = salaryGrades[3].Id, Level = 4 },
            new Position { Id = Guid.NewGuid(), PositionCode = "IT-MGR", TitleEnglish = "IT Manager", TitleArabic = "مدير تقنية المعلومات", DepartmentId = itDeptId, SalaryGradeId = salaryGrades[3].Id, Level = 4 },
            new Position { Id = Guid.NewGuid(), PositionCode = "FIN-MGR", TitleEnglish = "Finance Manager", TitleArabic = "مدير المالية", DepartmentId = financeDeptId, SalaryGradeId = salaryGrades[4].Id, Level = 5 }
        );
    }
}
