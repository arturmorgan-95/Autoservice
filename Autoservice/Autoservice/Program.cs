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
}

app.Run();