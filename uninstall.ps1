# BuildEstimate Pro - Windows Desktop Cleaner
# Copyright (c) 2026 Shahid Akram

$DesktopPath = [System.Environment]::GetFolderPath('Desktop')
$ShortcutPath = "$DesktopPath\BuildEstimate Pro.lnk"

if (Test-Path $ShortcutPath) {
    Remove-Item $ShortcutPath -Force
    Write-Host "[✓] Removed Desktop shortcut: BuildEstimate Pro" -ForegroundColor Green
} else {
    Write-Host "[i] No Desktop shortcut found to remove." -ForegroundColor Yellow
}
