git branch -d prepare_deploy
git fetch origin
git checkout origin/master
git checkout -b prepare_deploy
# The `prepare_deploy` branch should merge cleanly into `deploy`,
# but not contain any of its unmerged changes:
git merge -m "Discard old builds" --strategy=ours deploy
git checkout deploy
git merge prepare_deploy
npm run build
cd build
ln -s index.html 404.html
cd ..
# --force needed because the `build` directory is in the .gitignore
git add --force build
git commit --no-verify -am"build"
git push 5apps deploy:master
git checkout master
