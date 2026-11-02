const base = document.body.dataset.base || '';
const dialog = document.querySelector('#search-dialog');
const searchInput = document.querySelector('#global-search');
const searchResults = document.querySelector('#search-results');
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let indexPromise;
let category = '全部';
let requestVersion = 0;
const loadIndex = () => indexPromise ||= fetch(`${base}/search.json`).then(response=>{if(!response.ok)throw new Error('搜索索引暂时无法加载');return response.json();}).catch(error=>{indexPromise=null;throw error;});
const matches = (post, query) => query.trim().toLowerCase().split(/\s+/).every(word=>`${post.title} ${post.category} ${post.excerpt} ${post.text}`.toLowerCase().includes(word));
const postURL = post => `${base}/post/${encodeURIComponent(post.slug)}/`;
async function search() {
  const version = ++requestVersion;
  const query = searchInput.value.trim();
  if(!query){searchResults.innerHTML='<div class="empty">试着搜索「AI」「写作」或「思考」。</div>';return;}
  searchResults.innerHTML='<div class="empty">正在查找…</div>';
  try {
    const posts = (await loadIndex()).filter(post=>matches(post,query));
    if(version!==requestVersion)return;
    searchResults.innerHTML=posts.length?posts.map(post=>`<a class="search-result" href="${postURL(post)}"><strong>${esc(post.title)}</strong><p>${esc(post.category)} · ${post.date}</p></a>`).join(''):'<div class="empty">没有找到相关文章，换个关键词试试。</div>';
  } catch(error){if(version===requestVersion)searchResults.innerHTML=`<div class="empty">${esc(error.message)}，请稍后再试。</div>`;}
}
function openSearch(){dialog.showModal();searchInput.focus();search();}
document.querySelector('#search-toggle').addEventListener('click',openSearch);
document.querySelector('.close-search').addEventListener('click',()=>dialog.close());
searchInput.addEventListener('input',search);
dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();});
document.addEventListener('keydown',event=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();if(!dialog.open)openSearch();}});
async function filterPosts(){
  const results=document.querySelector('#blog-results');if(!results)return;
  const currentCategory=category;
  const query=document.querySelector('#blog-search').value;
  try{
    const posts=(await loadIndex()).filter(post=>(currentCategory==='全部'||post.category===currentCategory)&&matches(post,query));
    if(currentCategory!==category||query!==document.querySelector('#blog-search').value)return;
    document.querySelector('#list-count').textContent=`${posts.length} 篇文章`;
    results.innerHTML=posts.length?posts.map(post=>`<a class="post-row" href="${postURL(post)}"><div class="post-top"><h3>${esc(post.title)}</h3><time class="post-date" datetime="${post.date}">${post.date}</time></div><p>${esc(post.excerpt)}</p><div class="post-meta"><span>${esc(post.category)}</span><span>${post.minutes} 分钟阅读</span></div></a>`).join(''):'<div class="empty">没有找到相关文章。<br><button id="reset-search">重置筛选</button></div>';
  }catch(error){results.innerHTML=`<div class="empty">${esc(error.message)}，刷新后重试。</div>`;}
}
document.querySelector('#blog-search')?.addEventListener('input',filterPosts);
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-filter]');
  if(button){category=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(element=>{element.classList.toggle('active',element===button);element.setAttribute('aria-pressed',String(element===button));});filterPosts();}
  if(event.target.closest('#reset-search')){category='全部';document.querySelector('#blog-search').value='';document.querySelector('[data-filter="全部"]').click();}
});
