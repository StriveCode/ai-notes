export const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export function createViews({ site, posts, thoughts, basePath }) {
  const url = route => `${basePath}${route}`;
  const postURL = post => url(`/post/${post.slug}/`);
  const more = (route, text = '查看全部') => `<a class="more" href="${url(route)}">${text}<span>↗</span></a>`;
  const intro = (eyebrow, title, text) => `<section class="page-intro"><div class="eyebrow">${esc(eyebrow)}</div><h1>${esc(title)}</h1><p>${esc(text)}</p></section>`;
  const head = (label, title, route) => `<div class="section-heading"><div><div class="eyebrow">${esc(label)}</div><h2>${esc(title)}</h2></div>${route ? more(route) : ''}</div>`;
  const sample = '<span class="sample-label">示例内容</span>';
  function row(post, compact = false) {
    return `<a class="post-row" href="${postURL(post)}"><div class="post-top"><h3>${esc(post.title)}</h3><time class="post-date" datetime="${post.date}">${post.date}</time></div><p>${esc(post.excerpt)}</p>${compact ? '' : `<div class="post-meta"><span>${esc(post.category)}</span><span>${post.minutes} 分钟阅读</span></div>`}</a>`;
  }
  function home() {
    const pinned = posts.filter(post => post.pinned);
    return `<section class="hero"><div class="hero-eyebrow"><span class="small-line"></span> NOTES ON THINKING & BUILDING</div><h1>${esc(site.heading)}</h1><p>${esc(site.description)}<br>把零散的想法，慢慢种成一座数字花园。</p><div class="hero-bottom"><span class="hero-caption">${esc(site.tagline)}</span><a class="quiet-link" href="${url('/about/')}">关于这座花园 ↗</a></div></section>
    ${pinned.length ? `<section class="section">${head('置顶 · START HERE','值得先读的几篇','/blog/')}<div class="post-list">${pinned.map(post => row(post,true)).join('')}</div></section>` : ''}
    <section class="section">${head('最新 · RECENT WRITING','最近写下的','/blog/')}<div class="post-list">${posts.length ? posts.slice(0,4).map(post => row(post)).join('') : '<p class="empty">第一篇文字，正在路上。</p>'}</div></section>
    <section class="home-columns"><div class="column-story"><div class="eyebrow">专栏 · AN ONGOING EXPLORATION</div><h2>关于 AI，持续思考</h2><p>把实践里的观察和阅读中的问题，慢慢连接起来。</p>${more('/columns/','进入专栏')}</div><div><div class="eyebrow">想法 · A SMALL NOTE</div><div class="mini-thought"><p>${esc(thoughts[0]?.text || '给正在生长的想法，留一点空间。')}</p><time>${esc(thoughts[0]?.date || '')}</time></div>${more('/thoughts/','更多片刻')}</div></section><div class="home-end"><span>${posts.some(post=>post.sample) ? `${sample} &nbsp; 部分文字为示例，可在后台编辑或撤回。` : '文字慢慢写，花园慢慢长。'}</span><a href="${url('/about/')}">认识这个数字花园 ↗</a></div>`;
  }
  function blog() {
    const categories = ['全部',...new Set(posts.map(post=>post.category))];
    return `${intro('BLOG · 写作','文字，是思考的痕迹。','关于 AI 的理解、构建的过程，和生活里值得停留的片刻。')}<div class="toolbar"><div class="filters" role="group" aria-label="按文章分类筛选">${categories.map((category,index)=>`<button class="filter ${index===0?'active':''}" data-filter="${esc(category)}" aria-pressed="${index===0}">${esc(category)}</button>`).join('')}</div><span class="list-count" id="list-count">${posts.length} 篇文章</span></div><label class="inline-search"><span aria-hidden="true">⌕</span><span class="sr-only">搜索当前分类文章</span><input id="blog-search" type="search" placeholder="在文章中搜索…" autocomplete="off"></label><div id="blog-results" aria-live="polite">${posts.map(post=>row(post)).join('')}</div>`;
  }
  function article(post) {
    const related = posts.filter(other=>other.slug!==post.slug && other.category===post.category).slice(0,2);
    return `<article class="article"><a class="back" href="${url('/blog/')}">← 返回文章列表</a><div class="eyebrow">${esc(post.category)} ${post.sample ? sample : ''}</div><h1>${esc(post.title)}</h1><div class="post-meta"><span>${esc(site.author)}</span><span><time datetime="${post.date}">${post.date}</time></span><span>${post.minutes} 分钟阅读</span></div><div class="article-body">${post.html}</div><div class="article-end"><span>谢谢你读到这里。</span><a href="${url('/blog/')}">继续探索 ↗</a></div>${related.length?`<section class="related">${head('接着读 · KEEP EXPLORING','另一片叶子')}${related.map(other=>row(other,true)).join('')}</section>`:''}</article>`;
  }
  function thoughtsPage() {
    return `${intro('THOUGHTS · 片刻','想法，先放在这里。','还没长成文章的念头，也值得被认真留下。')}<div class="thoughts-list">${thoughts.map(thought=>`<article class="thought"><time datetime="${thought.date}">${thought.date}</time><div><p>${esc(thought.text)}</p><span class="thought-tag"># ${esc(thought.tag)}</span></div></article>`).join('')}</div>`;
  }
  function columns() {
    return `${intro('COLUMNS · 长线探索','沿着一条线，慢慢走。','把相互关联的文章放在一起，让一次探索有迹可循。')}${[...new Set(posts.map(post=>post.category))].map((category,index)=>`<section class="column-card"><div class="column-number">${String(index+1).padStart(2,'0')} / 专栏</div><h2>${esc(category)}</h2><div class="post-list">${posts.filter(post=>post.category===category).map(post=>row(post,true)).join('')}</div></section>`).join('')}`;
  }
  function reading() {
    return `${intro('BOOKSHELF · 阅读','在别人的文字里，遇见问题。','一个留给阅读与重读的角落。这里先放两本示例书目。')}<div class="reading-list"><article class="book"><div class="book-cover" aria-hidden="true">禅与<br>摩托车<br>维修艺术</div><div><h2>禅与摩托车维修艺术</h2><span class="author">罗伯特 · M. 波西格</span><p>一段旅途，也是一场关于技术、生活与价值的追问。适合带着自己的问题慢慢阅读。</p><span class="book-tag">哲学 · 生活 · 技术</span></div></article><article class="book"><div class="book-cover second" aria-hidden="true">设计<br>心理学</div><div><h2>设计心理学</h2><span class="author">唐纳德 · A. 诺曼</span><p>从日常物品出发，重新观察设计如何影响人的理解和行动。做产品时，也试着站到使用者的那一边。</p><span class="book-tag">设计 · 认知 · 产品</span></div></article></div>`;
  }
  function about() {
    return `${intro('ABOUT · 关于',`你好，这里是 ${site.author}。`,'一座关于思考与构建的数字花园。')}<div class="about-copy"><h2>这个地方，记录什么？</h2><p>${esc(site.description)}完整的思考放在 Blog，零散的念头留在想法，长线的探索整理成专栏。</p><h2>像种花园一样写作</h2><p>这里的内容可以慢慢生长。今天写下一个问题，明天补上一段经历，过一段时间再把它们连接起来。希望每次回来看，都能多发现一点东西。</p><h2>关于这个博客</h2><p>这是一个记录个人对 AI 理解的文字博客。专注阅读与写作，保留每一次认真思考的痕迹。</p><p><a href="${url('/blog/')}">从一篇文章开始 ↗</a></p></div>`;
  }
  function admin() {
    return `${intro('WRITING DESK · 写作后台','留下一段新的思考。','在 Pages CMS 登录 GitHub 后，就可以直接编辑文章、上传图片和发布。')}<div class="about-copy"><p><a class="primary-link" href="https://app.pagescms.org/" target="_blank" rel="noopener">打开写作后台 ↗</a></p><h2>写作与发布</h2><p>选择 <strong>${esc(site.repository)}</strong> 仓库的 <strong>${esc(site.branch)}</strong> 分支，在「文章」里新建或编辑。打开「发布到博客」并保存后，GitHub 会自动构建新版本。取消该开关再保存，就会从网站撤回文章。</p><h2>首次连接</h2><p>使用你的 GitHub 账户登录 Pages CMS，将它的 GitHub App 仅安装到这个博客仓库，然后打开该仓库。文章字段与图片目录已经配好。</p><h2>关于草稿</h2><p>未发布文章不会进入博客页面、搜索或订阅。如果仓库公开，草稿的源文件与历史版本也能被读到；私人笔记请保存在本地或私有仓库。</p><p><a href="https://github.com/${esc(site.repository)}/actions" target="_blank" rel="noopener">查看发布进度 ↗</a></p></div>`;
  }
  const notFound = () => `${intro('404','这条小径，暂时还没铺好。','文章可能已经移动，回首页看看其他文字吧。')}<a class="back" href="${url('/')}">← 返回首页</a>`;
  function document(route, title, body, description = site.description) {
    const active = route.startsWith('/post/') ? '/blog/' : route;
    const canonical = site.url ? `<link rel="canonical" href="${esc(site.url.replace(/\/$/,'')+route)}">` : '';
    return `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${esc(description)}"><meta name="theme-color" content="#f9f9f6">${route==='/admin/'?'<meta name="robots" content="noindex,nofollow">':''}<title>${esc(title)} · ${esc(site.title)}</title>${canonical}<link rel="icon" href="${url('/favicon.svg')}" type="image/svg+xml"><link rel="stylesheet" href="${url('/style.css')}"><link rel="alternate" type="application/rss+xml" title="${esc(site.title)}" href="${url('/feed.xml')}"><script type="module" src="${url('/app.js')}"></script></head><body data-base="${esc(basePath)}"><a class="skip" href="#main">跳至正文</a><header class="header"><a class="brand" href="${url('/')}"><span class="monogram">J<span>·</span></span><span>${esc(site.title)}</span></a><nav aria-label="主导航">${[['/','首页'],['/blog/','Blog'],['/thoughts/','想法'],['/columns/','专栏'],['/reading/','书架'],['/about/','关于']].map(([link,label])=>`<a href="${url(link)}" ${active===link?'class="active" aria-current="page"':''}>${label}</a>`).join('')}</nav><div class="header-actions"><button id="search-toggle" class="icon-button" aria-label="搜索文章" title="搜索文章（⌘ K）"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg></button><a class="ask-link" href="${url('/admin/')}">写作后台 ↗</a></div></header><main id="main" tabindex="-1">${body}</main><footer class="footer"><a class="footer-brand" href="${url('/')}">J<span>·</span> <span>保持好奇，持续构建。</span></a><div><span>© ${new Date().getFullYear()} ${esc(site.author)}</span><a href="${url('/feed.xml')}">RSS ↗</a><a href="${url('/admin/')}">文章管理</a></div></footer><dialog id="search-dialog" aria-labelledby="search-title"><div class="search-heading"><h2 id="search-title">搜索花园</h2><button class="icon-button close-search" aria-label="关闭搜索">×</button></div><label class="sr-only" for="global-search">搜索文章标题、分类或内容</label><input id="global-search" type="search" placeholder="搜索文章标题、分类或内容…" autocomplete="off"><div id="search-results" aria-live="polite"></div><div class="search-footer"><span>输入关键词，发现相关的文字</span><kbd>ESC 关闭</kbd></div></dialog></body></html>`;
  }
  return { home,blog,article,thoughts:thoughtsPage,columns,reading,about,admin,notFound,document };
}
