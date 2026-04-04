@echo off
REM ATXEP Database Setup Script for Windows
REM Initializes database and runs migrations

setlocal enabledelayedexpansion

echo ================================
echo ATXEP Database Setup
echo ================================

REM Check if .env.local exists
if not exist .env.local (
    echo X .env.local not found
    echo Please copy .env.example to .env.local and fill in your database URL
    exit /b 1
)

echo + Environment configured

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

echo Generating Prisma client...
call npx prisma generate

echo Pushing schema to database...
call npx prisma db push --skip-generate

echo.
echo ================================
echo + Database setup complete!
echo ================================
echo.
echo Next steps:
echo 1. npm run dev          - Start development server
echo 2. Open http://localhost:3000
echo 3. Create an account and test the application
echo.

pause
