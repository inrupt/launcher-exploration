git checkout deploy
git fetch origin
git merge origin/master
npm run build
cd build
ln -s index.html 404.html
cd ..
# --force needed because the `build` directory is in the .gitignore
git add --force build
git commit --no-verify -am"build"
git push 5apps deploy:master
git checkout -
