rm -rf dist .umi .umi-production .git

git init
git add .
git commit -m '备份'

# 推到你仓库的的 gh-page 分支
# 将 <USERNAME>/<REPO> 替换为你的信息
git push -f git@github.com:ycwdss/zantop.git master

