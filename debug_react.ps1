# Script para diagnosticar problemas de carregamento React
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DIAGNÓSTICO DE PROBLEMAS REACT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n1. Verificando estrutura de arquivos..." -ForegroundColor Yellow

# Verificar arquivos de entrada
$entryFiles = @(
    "static\js\entries\home.js",
    "static\js\entries\react-services.js"
)

foreach ($file in $entryFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file existe" -ForegroundColor Green
    } else {
        Write-Host "❌ $file não existe" -ForegroundColor Red
    }
}

# Verificar componentes
$componentFiles = @(
    "static\js\components\HomeReact.js",
    "static\js\components\ReactErrorBoundary.js"
)

foreach ($file in $componentFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file existe" -ForegroundColor Green
    } else {
        Write-Host "❌ $file não existe" -ForegroundColor Red
    }
}

# Verificar serviços
$serviceFiles = @(
    "static\js\services\ReactDebugger.js",
    "static\js\services\SafeComponentLoader.js",
    "static\js\services\ReactInitializer.js",
    "static\js\services\ReactErrorHandling.js"
)

foreach ($file in $serviceFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file existe" -ForegroundColor Green
    } else {
        Write-Host "❌ $file não existe" -ForegroundColor Red
    }
}

# Verificar bundles
Write-Host "`n2. Verificando bundles gerados..." -ForegroundColor Yellow
$bundleFiles = @(
    "static\js\dist\home.bundle.js",
    "static\js\dist\react-services.bundle.js"
)

foreach ($file in $bundleFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file existe" -ForegroundColor Green
    } else {
        Write-Host "❌ $file não existe" -ForegroundColor Red
    }
}

# Verificar arquivos estáticos coletados
Write-Host "`n3. Verificando arquivos estáticos coletados..." -ForegroundColor Yellow
$staticFiles = @(
    "staticfiles\js\dist\home.bundle.js",
    "staticfiles\js\dist\react-services.bundle.js"
)

foreach ($file in $staticFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file existe" -ForegroundColor Green
    } else {
        Write-Host "❌ $file não existe" -ForegroundColor Red
    }
}

# Verificar configuração do Django
Write-Host "`n4. Verificando configuração do Django..." -ForegroundColor Yellow
$settingsFile = "app\settings.py"
if (Test-Path $settingsFile) {
    $settings = Get-Content $settingsFile -Raw
    
    if ($settings -match "STATIC_URL\s*=\s*['\"](.+)['\"]") {
        Write-Host "✅ STATIC_URL = $($matches[1])" -ForegroundColor Green
    } else {
        Write-Host "❌ STATIC_URL não encontrado" -ForegroundColor Red
    }
    
    if ($settings -match "STATICFILES_DIRS") {
        Write-Host "✅ STATICFILES_DIRS configurado" -ForegroundColor Green
    } else {
        Write-Host "❌ STATICFILES_DIRS não encontrado" -ForegroundColor Red
    }
    
    if ($settings -match "STATIC_ROOT") {
        Write-Host "✅ STATIC_ROOT configurado" -ForegroundColor Green
    } else {
        Write-Host "❌ STATIC_ROOT não encontrado" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Arquivo de configuração do Django não encontrado" -ForegroundColor Red
}

Write-Host "`n5. Recomendações:" -ForegroundColor Yellow
Write-Host "1. Execute 'npm run build' para gerar os bundles" -ForegroundColor Cyan
Write-Host "2. Execute 'python manage.py collectstatic --noinput' para coletar arquivos estáticos" -ForegroundColor Cyan
Write-Host "3. Reinicie o servidor Django com 'python manage.py runserver'" -ForegroundColor Cyan
Write-Host "4. Limpe o cache do navegador (Ctrl+F5)" -ForegroundColor Cyan
Write-Host "5. Verifique o console do navegador para erros específicos" -ForegroundColor Cyan