# Script para verificar se os arquivos estáticos estão sendo servidos corretamente
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERIFICANDO ARQUIVOS ESTÁTICOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Verificar se o servidor Django está rodando
$serverRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000" -UseBasicParsing -TimeoutSec 5
    $serverRunning = $true
    Write-Host "✅ Servidor Django está rodando" -ForegroundColor Green
} catch {
    Write-Host "❌ Servidor Django não está rodando" -ForegroundColor Red
    Write-Host "Por favor, inicie o servidor com 'python manage.py runserver'" -ForegroundColor Yellow
    exit
}

# Verificar arquivos estáticos
$staticFiles = @(
    "http://127.0.0.1:8000/static/js/dist/react-services.bundle.js",
    "http://127.0.0.1:8000/static/js/dist/home.bundle.js"
)

foreach ($url in $staticFiles) {
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $url - OK ($(($response.Content.Length / 1024).ToString('F2')) KB)" -ForegroundColor Green
        } else {
            Write-Host "❌ $url - Status: $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ $url - Erro: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Verificar se o template está sendo servido
$templateUrl = "http://127.0.0.1:8000/accounts/home/"
try {
    $response = Invoke-WebRequest -Uri $templateUrl -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Template home - OK" -ForegroundColor Green
        
        # Verificar se o template contém o container React
        if ($response.Content -match "home-react-root") {
            Write-Host "✅ Container React encontrado no template" -ForegroundColor Green
        } else {
            Write-Host "❌ Container React não encontrado no template" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Template home - Status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Template home - Erro: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nRecomendações:" -ForegroundColor Yellow
Write-Host "1. Verifique se os arquivos estáticos estão sendo servidos corretamente" -ForegroundColor Cyan
Write-Host "2. Verifique se o template está carregando os scripts corretamente" -ForegroundColor Cyan
Write-Host "3. Verifique o console do navegador para erros específicos" -ForegroundColor Cyan