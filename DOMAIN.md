# 绑定阿里云购买的域名

## 当前使用的域名

当前沿用用户主页的 `www.sunjiabao.cn`，博客路径为 `/ai-notes/`。检查时 `www.sunjiabao.cn` 返回 NXDOMAIN，阿里云 DNS 需要添加 `www` → `strivecode.github.io` 的 CNAME 记录。新博客仓库不单独设置相同 CNAME，以保留 GitHub 用户主页域名的继承关系。恢复解析后再检查 GitHub 用户主页的 HTTPS 证书状态。

以下为未来更换域名时的通用说明。

域名可以在阿里云注册并继续由阿里云提供 DNS；网站由 GitHub Pages 托管。这里使用 `www.example.com` 作为演示，实际操作时替换成购买的域名。

## 先在 GitHub 配置，再添加 DNS

1. 在 GitHub 账户设置的 Pages 中验证域名所有权，按页面给出的 TXT 记录在阿里云添加验证记录。
2. 打开 `StriveCode/ai-notes` → Settings → Pages。
3. Custom domain 填写自己的域名，例如 `www.example.com`，保存。
4. 再进入阿里云 DNS 添加以下记录。

GitHub 建议先验证域名，并先在 Pages 中保存域名再配置 DNS，避免域名被其他站点绑定。

## 方案一：使用 www 子域名

在阿里云的云解析 DNS 中，为对应域名添加：

| 类型 | 主机记录 | 记录值 |
|---|---|---|
| CNAME | `www` | `strivecode.github.io` |

CNAME 值不含 `https://`，也不含 `/ai-notes/`。已有冲突的同名 A、AAAA 或 CNAME 记录需要根据实际用途调整。

## 方案二：使用根域名

如果选择 `example.com`，在 GitHub Pages 的 Custom domain 中填写根域名，在阿里云设置 GitHub 官方的 A 记录：

| 类型 | 主机记录 | 记录值 |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

这些地址来自下方 GitHub 官方文档，实施时再次核对。如果同时使用 `www`，额外设置前述 `www` CNAME 记录。

## 等待校验并启用 HTTPS

返回 GitHub Pages，等待 DNS 检查通过和 HTTPS 证书签发，然后开启 Enforce HTTPS。DNS 更新可能需要最多 24 小时。

接着在 Actions 手动运行一次「发布静态博客」，确保构建读取新域名信息。工作流通过 configure-pages 自动获取域名与 base_path，搜索、文章和图片地址会同步适配。使用这个 Actions 发布方式时，不需要手动添加 CNAME 文件。

## 官方参考

- [GitHub Pages 自定义域名配置](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [GitHub Pages 验证域名](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
- [阿里云：添加 CNAME 记录](https://help.aliyun.com/zh/dns/add-a-cname-record)
