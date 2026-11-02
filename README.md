# Javian 的数字花园

记录个人对 AI 的理解与实践的静态博客，保留原有暖白背景、文字列表、细分隔线和阅读排版。网站部署到 GitHub Pages，内容后台使用 [Pages CMS](https://app.pagescms.org/)。

## 在线地址

- 网站：http://www.sunjiabao.cn/ai-notes/
- 写作入口：http://www.sunjiabao.cn/ai-notes/admin/
- 内容后台：https://app.pagescms.org/
- 发布进度：https://github.com/StriveCode/ai-notes/actions

沿用现有用户主页的 www.sunjiabao.cn 域名，新站位于 /ai-notes/，不会替换主页。只有 GitHub Actions 发布成功后，网站地址才会可用。HTTPS 由 GitHub Pages 的域名证书状态决定。

## 首次连接写作后台

1. 打开 Pages CMS，使用 StriveCode 的 GitHub 账号登录。
2. 安装它的 GitHub App，权限范围只选择 `StriveCode/ai-notes` 仓库。
3. 在后台打开 `StriveCode/ai-notes`，选择 `main` 分支。
4. 仓库根目录已有 `.pages.yml`，后台会显示「文章」「想法」「网站设置」和图片管理。

这一步需要仓库所有者亲自登录并授权 GitHub App。网站本身不保存 GitHub 密码、访问令牌或客户端密钥。后台由 Pages CMS 托管，GitHub Pages 只托管公开静态网站。

## 写文章和发布

在「文章」里新建文章，填写标题、地址、分类、日期、摘要与正文。正文使用可视化编辑器，支持格式、链接和图片上传。文章地址使用小写英文、数字和连字符，例如 `what-i-learned-about-ai`。

- 保存且关闭「发布到博客」：文件保存在仓库，不生成公开文章页。
- 打开「发布到博客」再保存：触发 GitHub Actions，构建成功后上线。
- 编辑已发布文章并保存：构建成功后更新公开版本。
- 关闭「发布到博客」再保存：构建成功后从博客、搜索、RSS 和站点地图撤回。

静态发布需要等待 Actions 构建和部署，并非立即更新。日期用于显示和排序，设置未来日期不会延迟发布。更改文章地址后，旧地址会失效。

**公开仓库中的草稿文件与历史版本也公开。**发布开关只控制它是否显示在网站中。私人笔记或敏感草稿请留在本机或私有仓库；撤回公开文章也不会清除 Git 历史。

发布失败时，上一个成功的网站版本会保留。可以在 Actions 查看错误，修正内容后再次保存。文章地址重复或日期无效会导致构建失败，防止发布错误页面。

## 内容与构建

- `content/posts/*.json`：每篇文章一个文件，正文为 Markdown，由后台维护。
- `content/thoughts/*.json`：短想法。
- `content/site.json`：网站名称、作者、首页标题与介绍，可在后台修改。
- `public/uploads/`：后台上传的图片。
- `public/style.css`：保留原有风格的样式。
- `.pages.yml`：内容管理字段与图片目录配置。
- `.github/workflows/pages.yml`：自动检查、构建与发布。
- `scripts/build.mjs`：生成 `dist/`。仅复制指定静态资源，不上传文章源文件或配置。

页面包含完整 HTML 正文，关闭 JavaScript 仍可阅读。分类与全文搜索在浏览器运行。暂不提供 AI 问答、模型调用和评论服务。旧版 Node.js 文章后台及家庭 Mac 部署脚本已从当前项目移除。

## 本地预览

需要 Node.js 24 或更新版本：

```sh
npm ci
npm start
```

打开 http://127.0.0.1:3000/。首次在根路径预览；正式 Pages 发布会自动使用仓库子路径。

检查并模拟正式子路径：

```sh
npm run check
npm test
BASE_PATH=/ai-notes SITE_URL=https://strivecode.github.io/ai-notes npm run build
BASE_PATH=/ai-notes npm run preview
```

打开 http://127.0.0.1:3000/ai-notes/。需要预览源文件修改时重新构建。

## 阿里云域名

阿里云注册的域名可以绑定 GitHub Pages，DNS 也可以继续使用阿里云。按 [域名接入说明](DOMAIN.md) 配置；绑定成功后，构建流程会自动改用自定义域名与根路径，页面、搜索和图片路径无需手工修改。

## 备份

内容和图片保存在 GitHub，可通过提交历史恢复。定期下载或克隆仓库到自己的电脑作为独立备份。不要将旧版 `.env`、密码文件或其他私密资料提交到这个公开仓库。
