@echo off
cd client
call npm run build

cd build
git init
git add .
git commit -m "deploy frontend"
git remote add origin https://gitee.com/shizhenhao001/emenu-client.git
git push -f origin master

pause
