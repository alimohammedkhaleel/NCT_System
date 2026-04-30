# Clear Vite Cache and Restart Dev Server
Write-Host "🧹 Clearing Vite cache..." -ForegroundColor Yellow

# Clear Vite cache
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite"
    Write-Host "✅ Vite cache cleared" -ForegroundColor Green
}

# Clear dist folder
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✅ Dist folder cleared" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Starting dev server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "📌 IMPORTANT: In Chrome, do the following:" -ForegroundColor Yellow
Write-Host "   1. Press Ctrl + Shift + Delete" -ForegroundColor White
Write-Host "   2. Select 'All time' and check 'Cached images and files'" -ForegroundColor White
Write-Host "   3. Click 'Clear data'" -ForegroundColor White
Write-Host "   4. Press Ctrl + Shift + R to hard refresh" -ForegroundColor White
Write-Host ""

# Start dev server
npm run dev
