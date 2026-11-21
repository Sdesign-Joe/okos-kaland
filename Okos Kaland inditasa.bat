@echo off
rem Okos Kaland - helyi inditas weboldalkent (igy telepitheto alkalmazaskent is)
cd /d "%~dp0"
where python >nul 2>nul || (echo A Python nincs telepitve ezen a gepen. & echo Nyisd meg inkabb az index.html fajlt, vagy hasznald a feltoltott weboldalt. & pause & exit /b)
echo Okos Kaland fut: http://127.0.0.1:8765  (ezt az ablakot bezarva leall)
start "" "http://127.0.0.1:8765/index.html"
python -m http.server 8765 --bind 127.0.0.1
