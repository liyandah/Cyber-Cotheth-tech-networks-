@echo off
REM Regenerate style.min.css and script.min.js after editing style.css or script.js.
cd /d "%~dp0"
npx --yes clean-css-cli -o style.min.css style.css
npx --yes terser script.js -c -m -o script.min.js
echo Done.
