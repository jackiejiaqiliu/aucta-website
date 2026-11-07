/* Optional QA tool, not a website dependency.
   Install Playwright in a separate folder, then set NODE_PATH to its node_modules.
   Run a local server from the project root before invoking this script. */
const {chromium}=require('playwright');
const fs=require('node:fs'); const path=require('node:path');
const root=path.resolve(__dirname,'..');
const inventory=JSON.parse(fs.readFileSync(path.join(root,'audit/page-inventory.json')));
const widths=[1440,1280,1024,768,390,375];
(async()=>{
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  const results=[];
  try {
    for(const [route,entry] of Object.entries(inventory)) {
      const name=route.replace(/^\//,'').replaceAll('/','__')||'home';
      for(const width of widths) {
        const height=1000;
        for(const [kind,base] of [['original','https://en.auctaedu.org'],['local',process.env.LOCAL_BASE||'http://127.0.0.1:8000']]) {
          const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
          const errors=[];page.on('pageerror',e=>errors.push(e.message));
          if(kind==='local')await page.route('**/*',async request=>{
            const url=request.request().url();
            if(/^https?:/.test(url)&&new URL(url).origin!==new URL(base).origin){errors.push('Remote runtime request: '+url);await request.abort();}else await request.continue();
          });
          try {
            await page.goto(base+(route==='/'?'/':route+'/'),{waitUntil:'networkidle',timeout:60000});
            await page.evaluate(()=>document.fonts.ready);
            await page.evaluate(async()=>{
              const pause=()=>new Promise(resolve=>setTimeout(resolve,180));
              for(let y=0;y<document.documentElement.scrollHeight;y+=700){window.scrollTo(0,y);await pause();}
              window.scrollTo(0,0);await pause();
            });
            const dir=path.join(root,'audit/screenshots',kind);fs.mkdirSync(dir,{recursive:true});
            await page.screenshot({path:path.join(dir,`${name}-${width}.png`),fullPage:true});
            results.push({route,width,height,kind,errors});
          }catch(error){results.push({route,width,kind,error:error.message});}
          finally{await page.close();}
        }
      }
    }
  }finally{await browser.close();fs.writeFileSync(path.join(root,'audit/screenshot-results.json'),JSON.stringify(results,null,2));}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
