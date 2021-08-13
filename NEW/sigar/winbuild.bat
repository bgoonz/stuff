@echo off

set TOOLKIT=%1
set TARGET=%2
set CONFIG=%3

call:toolkitsetup
call:main
goto:eof

REM ===== TOOLKIT SETUP =====

:toolkitsetup

if X%TOOLKIT%==Xvs2010 goto vs2010
if X%TOOLKIT%==Xvs2005 goto vs2005

echo ** error ** invalid toolkit!
call:error
goto:eof

:vs2010

set GENERATOR="Visual Studio 10"
set BUILD="%VS100COMNTOOLS%\..\IDE\devenv.exe"
goto:eof

:vs2005

REM XXX completely untested: based upon the old, broken winbuild.bat
set GENERATOR="Visual Studio 8 2005"
set BUILD="%VS90COMNTOOLS%\..\IDE\VCExpress.exe"
goto:eof

REM ===== main =====

:main

if X%TARGET%==Xbuild goto build
if X%TARGET%==Xclean goto clean
if X%TARGET%==Xtest  goto test
if X%TARGET%==Xdist  goto dist

echo **error ** invalid target!
call:error
goto:eof

REM ===== clean =====

:clean

@echo on
%BUILD% sigar.sln /Clean
@echo off
goto:eof

REM ===== build =====

:build

if X%CONFIG%==X goto error

@echo on
cmake -G %GENERATOR% -DBUILD_NUMBER=%BUILD_NUMBER% -DCMAKE_INSTALL_PREFIX=%INST_PREFIX% -DCMAKE_BUILD_TYPE=RelWithDebInfo -DCMAKE_C_FLAGS_RELWITHDEBINFO:STRING="/MD /Zi /O2 /Ob1" .
%BUILD% sigar.sln /Build %CONFIG%
@echo off
goto:eof

REM ===== test =====

:test

if X%CONFIG%==X goto error

call:build
@echo on
%BUILD% sigar.sln /Build %CONFIG% /Project RUN_TESTS
@echo off
goto:eof

REM ===== dist =====

:dist

if X%CONFIG%==X goto error

call:build
@echo on
%BUILD% sigar.sln /Build %CONFIG% /Project PACKAGE
@echo off
goto:eof

:error

echo.
echo usage: %0 (toolkit) (target) (config)
echo e.g. %0 vs2010 build Release
echo.
echo Targets:
echo    build   --  Compile and link SIGAR
echo    clean   --  Clean up build artifacts
echo    test    --  Run tests
echo    dist    --  Build SIGAR installer using CPack/NSIS
echo
echo Toolkits:
echo    vs2010  --  Visual Studio 2010
echo    vs2005  --  Visual Studio 2005
echo.
echo Configurations
echo    Debug
echo    Release
echo.

goto:eof
