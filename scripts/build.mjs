import { readFile, readdir, mkdir, writeFile, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { createViews, esc } from '../lib/views.mjs';

export const root = fileURLToPath(new URL('../',import.meta.url));
export async function build({ projectRoot=root, output=path.join(projectRoot,'dist'), basePath=process.env.BASE_PATH || '', siteURL=process.env.SITE_URL || '' }={}) {
  basePath = basePath.replace(/\/$/,'');
  if (basePath && (!/^\/[\w./~-]+$/.test(basePath) || basePath.split('/').some(part=>['.','..'].includes(part)))) throw new Error('BASE_PATH 必须是网站子路径，例如 /ai-notes');
  const site = JSON.parse(await readFile(path.join(projectRoot,'content/site.json'),'utf8'));
  site.url = (siteURL || site.url || '').replace(/\/$/,'');
  if (site.url && !/^https?:\/\//.test(site.url)) throw new Error('网站地址必须以 https:// 或 http:// 开头');
  const readCollection = async folder => {
    const files = (await readdir(path.join(projectRoot,'content',folder))).filter(name=>name.endsWith('.json')).sort();
    return Promise.all(files.map(async name=>({ ...JSON.parse(await readFile(path.join(projectRoot,'content',folder,name),'utf8')), source:name })));
  };
  const rawPosts = await readCollection('posts');
  const seen = new Set();
  for (const post of rawPosts) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug || '')) throw new Error(`文章地址无效：${post.source}`);
    if (seen.has(post.slug)) throw new Error(`文章地址重复：${post.slug}`); seen.add(post.slug);
    const date = new Date(`${post.date}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0,10)!==post.date) throw new Error(`文章日期无效：${post.source}`);
    if (!post.title?.trim() || typeof post.body!=='string' || !post.body.trim()) throw new Error(`文章标题或正文为空：${post.source}`);
    if (typeof post.published!=='boolean') throw new Error(`文章需要发布状态：${post.source}`);
  }
  const prefix = value => value.startsWith('/') && !value.startsWith('//') ? `${basePath}${value}` : value;
  const posts = rawPosts.filter(post=>post.published).sort((a,b)=>b.date.localeCompare(a.date)||a.slug.localeCompare(b.slug)).map(post=>{
    const html = sanitizeHtml(marked.parse(post.body), { allowedTags:[...sanitizeHtml.defaults.allowedTags,'img'],allowedAttributes:{...sanitizeHtml.defaults.allowedAttributes,img:['src','alt','title','width','height'],a:['href','title']},transformTags:{ a:(tag,attrs)=>({tagName:tag,attribs:{...attrs,href:prefix(attrs.href||'')}}), img:(tag,attrs)=>({tagName:tag,attribs:{...attrs,src:prefix(attrs.src||'')}}) } });
    const text = sanitizeHtml(html,{allowedTags:[],allowedAttributes:{}}).replace(/\s+/g,' ').trim();
    return {slug:post.slug,title:post.title,category:post.category||'随笔',date:post.date,pinned:post.pinned===true,sample:post.sample===true,excerpt:post.excerpt||text.slice(0,100),minutes:Math.max(1,Math.ceil(text.length/450)),html,text};
  });
  const thoughts = (await readCollection('thoughts')).filter(note=>note.published===true).sort((a,b)=>b.date.localeCompare(a.date));
  const views = createViews({site,posts,thoughts,basePath});
  // Render and validate before replacing the last successful build.
  const pages = [['/','首页',views.home()],['/blog/','Blog',views.blog()],['/thoughts/','想法',views.thoughts()],['/columns/','专栏',views.columns()],['/reading/','书架',views.reading()],['/about/','关于',views.about()],['/admin/','文章管理',views.admin()]];
  for (const post of posts) pages.push([`/post/${post.slug}/`,post.title,views.article(post),post.excerpt]);
  await rm(output,{recursive:true,force:true}); await mkdir(output,{recursive:true});
  for (const name of ['style.css','app.js','favicon.svg']) await cp(path.join(projectRoot,'public',name),path.join(output,name));
  await cp(path.join(projectRoot,'public/uploads'),path.join(output,'uploads'),{recursive:true});
  for (const [route,title,body,description] of pages) {
    const folder=path.join(output,route.slice(1)); await mkdir(folder,{recursive:true});
    await writeFile(path.join(folder,'index.html'),views.document(route,title,body,description));
  }
  await writeFile(path.join(output,'404.html'),views.document('/404.html','页面不存在',views.notFound()));
  await writeFile(path.join(output,'.nojekyll'),'');
  await writeFile(path.join(output,'search.json'),JSON.stringify(posts.map(({slug,title,category,date,excerpt,minutes,text})=>({slug,title,category,date,excerpt,minutes,text}))));
  const absolute = route => site.url ? site.url+route : `${basePath}${route}`;
  const feed = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(site.title)}</title><link>${esc(absolute('/'))}</link><description>${esc(site.description)}</description>${posts.map(post=>`<item><title>${esc(post.title)}</title><link>${esc(absolute(`/post/${post.slug}/`))}</link><guid>${esc(absolute(`/post/${post.slug}/`))}</guid><pubDate>${new Date(post.date+'T00:00:00Z').toUTCString()}</pubDate><description>${esc(post.excerpt)}</description></item>`).join('')}</channel></rss>`;
  await writeFile(path.join(output,'feed.xml'),feed);
  if(site.url) await writeFile(path.join(output,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.filter(([route])=>route!=='/admin/').map(([route])=>`<url><loc>${esc(absolute(route))}</loc></url>`).join('')}</urlset>`);
  await writeFile(path.join(output,'robots.txt'),`User-agent: *\nAllow: /\nDisallow: ${basePath}/admin/\n${site.url?`Sitemap: ${site.url}/sitemap.xml\n`:''}`);
  console.log(`已生成 ${pages.length} 个静态页面，${posts.length} 篇公开文章。路径：${basePath || '/'}`);
  return {posts,pages,output};
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) await build();
