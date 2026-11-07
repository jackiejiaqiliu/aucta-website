/* Standalone progressive navigation. Every URL remains an independently usable HTML page. */
(() => {
  if (window.auctaNavigation) return;
  window.auctaNavigation = true;
  const base = document.createElement('base'); base.href = location.href; document.head.prepend(base);
  document.querySelectorAll("head link[href]").forEach(link=>link.href=link.href);
  const sources = new Map();
  const newScope = () => {
    const controller = new AbortController(), observers = [], frames = new Set(), timers = new Set();
    return {
      disposed:false,
      on(target,type,callback,options={}) { target.addEventListener(type,callback,{...(typeof options==='boolean'?{capture:options}:options),signal:controller.signal}); },
      Observer(Type) { if(!Type)return Type;return class extends Type { constructor(callback,options) {super(callback,options);observers.push(this);} }; },
      frame(callback) { const id=requestAnimationFrame(time=>{frames.delete(id);if(!this.disposed)callback(time)});frames.add(id);return id; },
      timer(callback,delay) { const id=setTimeout(()=>{timers.delete(id);if(!this.disposed)callback()},delay);timers.add(id);return id; },
      dispose() {this.disposed=true;controller.abort();observers.forEach(o=>o.disconnect());frames.forEach(cancelAnimationFrame);timers.forEach(clearTimeout);}
    };
  };
  window.auctaPage = newScope();
  let pending, sequence=0;
  const scriptText = async url => {
    if (!sources.has(url)) sources.set(url,fetch(url).then(response=>{if(!response.ok)throw Error('Script request failed');return response.text()}).catch(error=>{sources.delete(url);throw error}));
    return sources.get(url);
  };
  const navigate = async (url,push=true) => {
    const current=++sequence;
    pending?.abort();pending=new AbortController();
    document.documentElement.setAttribute('aria-busy','true');
    try {
      const response=await fetch(url,{signal:pending.signal});
      if(!response.ok)throw Error('Page request failed');
      const next=new DOMParser().parseFromString(await response.text(),'text/html');
      if(!next.querySelector('#page')||!next.querySelector('#header'))throw Error('Unexpected page');
      const scripts=[...next.querySelectorAll('script[src]')].map(s=>new URL(s.getAttribute('src'),url).href).filter(src=>/\/js\//.test(src)&&!new URL(src).pathname.endsWith('/loading.js'));
      const code=await Promise.all(scripts.map(scriptText));
      // Shared styles stay attached throughout navigation: no unstyled or blank interval.
      const existing=new Set([...document.querySelectorAll('head link[rel=stylesheet]')].map(l=>l.href));
      await Promise.all([...next.querySelectorAll('head link[rel=stylesheet]')].map(link=>{
        const href=new URL(link.getAttribute('href'),url).href;
        if(existing.has(href))return;
        return new Promise((resolve,reject)=>{const added=document.createElement('link');added.rel='stylesheet';added.href=href;added.onload=resolve;added.onerror=reject;document.head.append(added)});
      }));
      if(current!==sequence)return;
      const old=window.auctaPage;old.dispose();
      next.querySelectorAll('script').forEach(s=>s.remove());
      if(push)history.pushState({aucta:true},'',url);
      base.href=url;
      document.title=next.title;
      document.querySelectorAll('head style[data-page-style]').forEach(s=>s.remove());
      next.head.querySelectorAll('style').forEach(style=>{style.dataset.pageStyle='';document.head.append(style)});
      document.body.replaceWith(next.body);
      window.auctaPage=newScope();
      code.forEach((text,index)=>{const script=document.createElement('script');script.textContent=text+'\n//# sourceURL='+scripts[index];document.body.append(script);script.remove()});
      window.scrollTo({top:0,left:0,behavior:'instant'});
      if(url.hash)document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView();
      document.dispatchEvent(new CustomEvent('aucta:navigated',{detail:{url:url.href}}));
    } catch(error) {
      if(error.name!=='AbortError'&&current===sequence)location.assign(url.href);
    } finally {if(current===sequence)document.documentElement.removeAttribute('aria-busy');}
  };
  document.querySelectorAll('head style').forEach(style=>style.dataset.pageStyle='');
  document.addEventListener('click',event=>{
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const link=event.target.closest('a[href]');
    if(!link||link.hasAttribute('download')||link.target&&link.target!=='_self'||link.hasAttribute('data-folder-id')||link.dataset.action==='back')return;
    const url=new URL(link.href);
    if(url.origin!==location.origin||!(/\/index\.html$/.test(url.pathname)||url.pathname.endsWith('/')))return;
    if(url.pathname===location.pathname&&url.hash)return;
    event.preventDefault();navigate(url);
  });
  window.addEventListener('popstate',()=>navigate(new URL(location.href),false));
})();
