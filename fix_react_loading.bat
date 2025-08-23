@echo off
echo ========================================
echo CORRIGINDO PROBLEMA DE CARREGAMENTO REACT
echo ========================================

echo.
echo 1. Ativando ambiente virtual...
call venv\Scripts\activate.bat

echo.
echo 2. Verificando se Django esta instalado...
python -c "import django; print('Django version:', django.get_version())"

echo.
echo 3. Executando collectstatic...
python manage.py collectstatic --noinput

echo.
echo 4. Verificando se bundles foram copiados...
dir staticfiles\js\dist\

echo.
echo 5. Iniciando servidor Django...
echo Acesse: http://127.0.0.1:8000
echo Pressione Ctrl+C para parar o servidor
python manage.py runserver

pause