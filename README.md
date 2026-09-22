# AI Infra Notes

基于 Docusaurus 的 AI Infra 学习知识库。文章、学习路线和日志均使用 Markdown 编写。

## 本地运行

需要 Node.js 20 或更高版本。

```bash
npm install
npm start
```

默认访问地址为 `http://localhost:3000`。

## 内容目录

- `docs/`：系统化知识库。
- `blog/`：按日期记录学习过程和阶段复盘。
- `templates/article-template.md`：新文章模板。
- `static/img/`：无需构建处理的图片。

在对应目录创建 `.md` 或 `.mdx` 文件后，Docusaurus 会自动生成页面和侧边栏。

## Markdown 能力

### 数学公式

行内公式使用 `$...$`，块级公式使用 `$$...$$`。

### Mermaid

````markdown
```mermaid
flowchart LR
  Markdown --> GitHub
  GitHub --> Pages
```
````

### 代码高亮

代码块标记语言即可，例如 `python`、`cpp`、`bash`、`json` 或 `yaml`。

## 生产构建

```bash
npm run typecheck
npm run build
npm run serve
```

## 发布到 GitHub Pages

1. 在 GitHub 创建仓库，例如 `ai-infra-notes`。
2. 将当前目录提交并推送到仓库的 `main` 分支。
3. 打开仓库的 `Settings → Pages`，将 Source 设为 `GitHub Actions`。
4. 推送后，`.github/workflows/deploy.yml` 会自动构建并发布。

构建配置会从 GitHub Actions 的 `GITHUB_REPOSITORY` 自动识别用户名、仓库名和站点基础路径，因此普通项目站和 `<username>.github.io` 用户站都可以使用。
