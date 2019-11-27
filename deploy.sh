git checkout deploy
git fetch origin
git merge origin/master
npm run build
cd build
ln -s index.html 404.html
cd ..
git add build
# --force needed because the `build` directory is in the .gitignore
git commit --no-verify --force -am"build"
git push 5apps deploy:master
git checkout -
