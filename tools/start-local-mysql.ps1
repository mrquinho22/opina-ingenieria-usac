# Reutiliza únicamente la instancia aislada preparada para este proyecto.
$ErrorActionPreference = 'Stop'
$projectDirectory = Split-Path -Parent $PSScriptRoot
$mysqlData = Join-Path $projectDirectory '.local\mysql-data'
$mysqlExecutable = 'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe'
if (!(Test-Path -LiteralPath $mysqlData)) { throw 'Esta instancia no está preparada. Sigue la instalación de MySQL del README.' }
if (Get-NetTCPConnection -LocalPort 3307 -State Listen -ErrorAction SilentlyContinue) { Write-Host 'Ya hay un servidor escuchando en 3307.'; exit 0 }
$mysqlArgs = @('--no-defaults', ('--datadir="' + $mysqlData + '"'), '--port=3307', '--bind-address=127.0.0.1', '--mysqlx=OFF', '--console')
Start-Process -FilePath $mysqlExecutable -ArgumentList $mysqlArgs -WindowStyle Hidden -RedirectStandardOutput (Join-Path $projectDirectory '.local\mysql.log') -RedirectStandardError (Join-Path $projectDirectory '.local\mysql-error.log')
Write-Host 'MySQL local iniciado en 127.0.0.1:3307. Espera unos segundos antes de iniciar la API.'
