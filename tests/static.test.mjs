import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,cp,writeFile,readFile,readdir,rm } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { build,root } from '../scripts/build.mjs';

test('静态发布：正文直出、子路径、草稿隔离和后台配置',async t=>{
  const fixture=await mkdtemp(path.join(tmpdir(),'ai-notes-static-'));
  t.after(()=>rm(fixture,{recursive:true,force:true}));
  for(const name of ['content','public'])await cp(path.join(root,name),path.join(fixture,name),{recursive:true});
  const draft={title:'PRIVATE-DRAFT-736',slug:'private-draft',published:false,date:'2026-11-02',body:'PRIVATE-BODY-736',category:'秘密',pinned:true};
  await writeFile(path.join(fixture,'content/posts/draft.json'),JSON.stringify(draft));
  const sample={title:'测试 Markdown',slug:'markdown-test',published:true,date:'2026-11-02',body:'**加粗**\n\n![插图](/uploads/example.png)\n\n[站内文章](/blog/)\n\n<script>alert(1)</script>\n\n[危险](javascript:alert(1))',category:'测试'};
  await writeFile(path.join(fixture,'content/posts/markdown.json'),JSON.stringify(sample));
  const output=path.join(fixture,'dist');
  await build({projectRoot:fixture,output,basePath:'/ai-notes',siteURL:'https://strivecode.github.io/ai-notes'});
  const article=await readFile(path.join(output,'post/markdown-test/index.html'),'utf8');
  assert.ok(article.includes('<strong>加粗</strong>'));
  assert.ok(article.includes('src="/ai-notes/uploads/example.png"'));
  assert.ok(article.includes('href="/ai-notes/blog/"'));
  assert.equal(article.includes('<script>alert(1)</script>'),false);
  assert.equal(article.includes('href="javascript:'),false);
  assert.ok(article.includes('rel="canonical" href="https://strivecode.github.io/ai-notes/post/markdown-test/"'));
  for(const file of ['index.html','blog/index.html','search.json','feed.xml','sitemap.xml']){
    const text=await readFile(path.join(output,file),'utf8');
    assert.equal(text.includes('PRIVATE-DRAFT-736'),false,file);
    assert.equal(text.includes('PRIVATE-BODY-736'),false,file);
  }
  assert.equal((await readdir(path.join(output,'post'))).includes('private-draft'),false);
  const home=await readFile(path.join(output,'index.html'),'utf8');
  assert.ok(home.includes('在互联网，留一块自己的地方'));
  assert.equal(home.includes('问问 AI'),false);
  assert.equal(home.includes('/api/'),false);
  const admin=await readFile(path.join(output,'admin/index.html'),'utf8');
  assert.ok(admin.includes('https://app.pagescms.org/'));
  assert.ok(admin.includes('StriveCode/ai-notes'));
  for(const name of ['.env','data','content','node_modules','server.mjs','cms.mjs','.pages.yml'])assert.equal((await readdir(output)).includes(name),false);
  await build({projectRoot:fixture,output,basePath:'',siteURL:'https://notes.example.com'});
  assert.ok((await readFile(path.join(output,'index.html'),'utf8')).includes('href="/style.css"'));
  await writeFile(path.join(fixture,'content/posts/duplicate.json'),JSON.stringify(sample));
  await assert.rejects(build({projectRoot:fixture,output}),/文章地址重复/);
  assert.ok((await readFile(path.join(output,'index.html'),'utf8')).includes('思考与构建'));
});
