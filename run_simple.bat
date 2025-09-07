@echo off
echo 🚀 Starting Campus Event Management Platform (Simple Version)
echo.

echo 📦 Installing Python dependencies...
pip install flask flask-cors qrcode[pil]

echo.
echo 🗄️ Starting Backend Server...
start "Backend Server" cmd /k "python simple_backend.py"

echo.
echo 🌐 Opening Frontend in Browser...
timeout /t 3 /nobreak > nul
start "" "simple_frontend.html"

echo.
echo ✅ Platform is running!
echo 📡 Backend: http://localhost:5000
echo 🌐 Frontend: simple_frontend.html (opened in browser)
echo.
echo 🔑 Default Login Credentials:
echo    Admin: admin / admin123
echo    Student: Register new account
echo.
echo Press any key to exit...
pause > nul
