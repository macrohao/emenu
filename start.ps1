# 电子菜单系统一键启动脚本
Write-Host "🍽️  电子菜单系统启动中..." -ForegroundColor Cyan
Write-Host ""

# 启动后端
Write-Host "📦 启动后端服务 (http://localhost:5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

# 启动前端
Write-Host "⚛️  启动前端服务 (http://localhost:3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\client'; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "✅ 两个服务已在独立窗口中启动" -ForegroundColor Cyan
Write-Host "   前端: http://localhost:3000" -ForegroundColor White
Write-Host "   后端: http://localhost:5000/api" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  注意：请确保 MongoDB 正在运行 (默认连接 localhost:27017)" -ForegroundColor Red
