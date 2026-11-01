@echo off
REM Abre TechCare en el navegador. Hace falta un servidor local porque las
REM paginas importan firebase.js y sesion.js, y el navegador lo bloquea con file://
cd /d "%~dp0"

where python >nul 2>nul
if errorlevel 1 (
    echo No se encontro Python. Instalalo desde https://www.python.org/downloads/
    echo o abre la app en linea: https://uxuedev.github.io/Proyecto-Integrador-1/
    pause
    exit /b
)

echo TechCare corriendo en http://localhost:5500
echo Cierra esta ventana para detener la app.
start "" cmd /c "timeout /t 2 >nul & start http://localhost:5500"
python -m http.server 5500
