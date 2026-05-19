using Autoservice.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = false;
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

// HTTPS-редирект только в разработке — в Docker работаем по HTTP
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthorization();

app.MapControllers();

// Авто-применение миграций при старте (retry — SQL Server в Docker поднимается ~20 сек)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var retries = 6;
    while (retries > 0)
    {
        try
        {
            db.Database.Migrate();
            break;
        }
        catch
        {
            retries--;
            if (retries == 0) throw;
            Console.WriteLine($"БД не готова, повтор через 5 сек... (осталось попыток: {retries})");
            Thread.Sleep(5000);
        }
    }

    // Начальные данные (seed) — заполняем только если таблицы пустые
    if (!db.Roles.Any())
    {
        db.Roles.AddRange(
            new Autoservice.Models.Role { Id = 1, RoleName = "Администратор" },
            new Autoservice.Models.Role { Id = 2, RoleName = "Мастер" },
            new Autoservice.Models.Role { Id = 3, RoleName = "Бухгалтер" },
            new Autoservice.Models.Role { Id = 4, RoleName = "Клиент" },
            new Autoservice.Models.Role { Id = 5, RoleName = "Директор" }
        );
        db.SaveChanges();
    }

    if (!db.Statuses.Any())
    {
        db.Statuses.AddRange(
            new Autoservice.Models.Status { Id = 1, StatusName = "В очереди" },
            new Autoservice.Models.Status { Id = 2, StatusName = "Назначена" },
            new Autoservice.Models.Status { Id = 3, StatusName = "Принята" },
            new Autoservice.Models.Status { Id = 4, StatusName = "В работе" },
            new Autoservice.Models.Status { Id = 5, StatusName = "Выполнена" },
            new Autoservice.Models.Status { Id = 6, StatusName = "Завершена" },
            new Autoservice.Models.Status { Id = 7, StatusName = "Отменена" }
        );
        db.SaveChanges();
    }

    if (!db.Services.Any())
    {
        db.Services.AddRange(
            new Autoservice.Models.Service { ServiceName = "Замена масла", BasePrice = 1500, DurationHours = 1 },
            new Autoservice.Models.Service { ServiceName = "Диагностика двигателя", BasePrice = 2000, DurationHours = 2 },
            new Autoservice.Models.Service { ServiceName = "Замена шин", BasePrice = 1000, DurationHours = 1 },
            new Autoservice.Models.Service { ServiceName = "Ремонт тормозной системы", BasePrice = 3500, DurationHours = 3 },
            new Autoservice.Models.Service { ServiceName = "Кузовной ремонт", BasePrice = 8000, DurationHours = 8 },
            new Autoservice.Models.Service { ServiceName = "Замена фильтров", BasePrice = 800, DurationHours = 1 },
            new Autoservice.Models.Service { ServiceName = "Развал-схождение", BasePrice = 1200, DurationHours = 1 }
        );
        db.SaveChanges();
    }

    if (!db.Users.Any())
    {
        db.Users.Add(new Autoservice.Models.User
        {
            RoleId = 1,
            FullName = "Главный администратор",
            Email = "admin@autoservice.ru",
            PhoneNumber = "+7 000 000 00 00",
            Login = "admin",
            PasswordHash = "admin123"
        });
        db.SaveChanges();
    }
}

app.Run();