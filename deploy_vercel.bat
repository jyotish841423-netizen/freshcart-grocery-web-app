@echo off
title FreshCart - Deploy to Vercel
echo ========================================================
echo   FreshCart - Automated Vercel Deployment
echo ========================================================
echo.
echo 1. Making sure PATH includes Node and Vercel CLI...
set PATH=C:\Users\Admin\.nodejs;%PATH%

echo 2. Running Vercel deployment...
echo (If this is your first time, Vercel will ask you to log in in your browser)
echo.
call vercel.cmd --prod

echo.
echo ========================================================
echo   Deployment Finished!
echo ========================================================
pause
