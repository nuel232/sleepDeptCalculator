@echo off
echo Pushing to GitHub...
git add .
git commit -m "Updated README and prepared for GitHub push"
git push -u origin main
echo Done!
pause 