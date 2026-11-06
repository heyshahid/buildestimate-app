# BuildEstimate Pro - Windows PowerShell Setup & Launcher
# Copyright (c) 2026 Shahid Akram

param(
    [switch]$DesktopShortcut,
    [switch]$RunLocalServer,
    [int]$Port = 8080
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " 🏗️  BuildEstimate Pro - Automated Setup Suite" -ForegroundColor Yellow
Write-Host " Author: Shahid Akram | https://github.com/heyshahid" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Create Desktop Shortcut if requested
if ($DesktopShortcut) {
    Write-Host "`n[*] Creating Windows Desktop Shortcut..." -ForegroundColor Green
    $WshShell = New-Object -ComObject WScript.Shell
    $DesktopPath = [System.Environment]::GetFolderPath('Desktop')
    $Shortcut = $WshShell.CreateShortcut("$DesktopPath\BuildEstimate Pro.lnk")
    $Shortcut.TargetPath = "$ScriptDir\index.html"
    $Shortcut.IconLocation = "$ScriptDir\icons\icon-192.png"
    $Shortcut.Description = "BuildEstimate Pro Construction Estimator"
    $Shortcut.Save()
    Write-Host "[+] Desktop Shortcut created successfully!" -ForegroundColor Green
}

# 2. Launch Local HTTP Server or Open directly in browser
if ($RunLocalServer) {
    Write-Host "`n[*] Starting offline HTTP local server on port $Port..." -ForegroundColor Cyan
    Write-Host "[*] Open http://localhost:$Port in your browser." -ForegroundColor Yellow
    Write-Host "[*] Press Ctrl+C to terminate." -ForegroundColor Gray
    python -m http.server $Port --directory "$ScriptDir"
} else {
    Write-Host "`n[*] Launching BuildEstimate Pro in your default browser..." -ForegroundColor Green
    Start-Process "$ScriptDir\index.html"
}

Write-Host "`n[✓] Setup Complete. Happy Estimating!" -ForegroundColor Cyan
