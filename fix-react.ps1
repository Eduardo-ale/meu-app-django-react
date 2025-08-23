# Script para corrigir problemas de carregamento React
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CORRIGINDO PROBLEMA DE CARREGAMENTO REACT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n1. Verificando ambiente virtual..." -ForegroundColor Yellow
if (-not (Test-Path ".\venv\Scripts\Activate.ps1")) {
    Write-Host "Ambiente virtual não encontrado. Verifique se está no diretório correto." -ForegroundColor Red
    exit
}

Write-Host "`n2. Verificando se Node.js está instalado..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js não está instalado ou não está no PATH." -ForegroundColor Red
    Write-Host "Por favor, instale Node.js de https://nodejs.org/" -ForegroundColor Red
    exit
}

Write-Host "`n3. Instalando dependências do projeto..." -ForegroundColor Yellow
npm install

Write-Host "`n4. Executando build dos componentes React..." -ForegroundColor Yellow
npm run build

Write-Host "`n5. Verificando se bundles foram gerados..." -ForegroundColor Yellow
if (-not (Test-Path ".\static\js\dist\home.bundle.js")) {
    Write-Host "Bundles não foram gerados corretamente." -ForegroundColor Red
    exit
}
Write-Host "Bundles gerados com sucesso!" -ForegroundColor Green

Write-Host "`n6. Executando collectstatic..." -ForegroundColor Yellow
python manage.py collectstatic --noinput

Write-Host "`n7. Verificando se bundles foram copiados..." -ForegroundColor Yellow
if (-not (Test-Path ".\staticfiles\js\dist\home.bundle.js")) {
    Write-Host "Bundles não foram copiados para staticfiles." -ForegroundColor Red
    exit
}
Write-Host "Bundles copiados com sucesso!" -ForegroundColor Green

Write-Host "`n8. Iniciando servidor Django..." -ForegroundColor Yellow
Write-Host "Acesse: http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "Pressione Ctrl+C para parar o servidor" -ForegroundColor Cyan
python manage.py runserver