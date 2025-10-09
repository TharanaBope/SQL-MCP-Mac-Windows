# Check installed ODBC drivers for SQL Server
Write-Host "=== Checking ODBC Drivers for SQL Server ===" -ForegroundColor Cyan
Write-Host ""

# Get all ODBC drivers
$drivers = Get-OdbcDriver

# Filter for SQL Server related drivers
$sqlDrivers = $drivers | Where-Object { $_.Name -like "*SQL*" }

if ($sqlDrivers) {
    Write-Host "Found SQL Server ODBC Drivers:" -ForegroundColor Green
    Write-Host ""

    foreach ($driver in $sqlDrivers) {
        Write-Host "  - $($driver.Name)" -ForegroundColor Yellow
        Write-Host "    Platform: $($driver.Platform)" -ForegroundColor Gray
        Write-Host ""
    }
} else {
    Write-Host "No SQL Server ODBC drivers found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "You need to install an ODBC driver. Download from:" -ForegroundColor Yellow
    Write-Host "https://go.microsoft.com/fwlink/?linkid=2249004" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=== Recommended Connection String ===" -ForegroundColor Cyan
Write-Host ""

if ($sqlDrivers) {
    $recommended = $sqlDrivers | Where-Object { $_.Name -like "*ODBC Driver 1*" } | Select-Object -First 1

    if ($recommended) {
        $driverName = $recommended.Name
        Write-Host "Driver={$driverName};Server=THARANA;Database=MWVGDB;Trusted_Connection=yes;TrustServerCertificate=yes;" -ForegroundColor Green
    } else {
        $firstDriver = $sqlDrivers | Select-Object -First 1
        $driverName = $firstDriver.Name
        Write-Host "Driver={$driverName};Server=THARANA;Database=MWVGDB;Trusted_Connection=yes;TrustServerCertificate=yes;" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
