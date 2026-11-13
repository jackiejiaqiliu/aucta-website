/* Accordion state is local. No account, analytics or platform runtime is loaded. */
(() => {
  const scope=window.auctaPage;
  const ResizeObserver=scope ? scope.Observer(window.ResizeObserver) : window.ResizeObserver;
  const IntersectionObserver=scope ? scope.Observer(window.IntersectionObserver) : window.IntersectionObserver;
  const requestAnimationFrame=scope ? scope.frame.bind(scope) : window.requestAnimationFrame.bind(window);
  const setTimeout=scope ? scope.timer.bind(scope) : window.setTimeout.bind(window);
  const scopeOn=(target,...args)=>scope ? scope.on(target,...args) : target.addEventListener(...args);

  document.querySelectorAll('.accordion-items-container').forEach(container => {
    const multiple = container.dataset.shouldAllowMultipleOpenItems === 'true';
    const buttons = [...container.querySelectorAll('.accordion-item__click-target')];
    const setExpanded = (button, expanded) => {
      button.setAttribute('aria-expanded', String(expanded));
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      panel?.classList.toggle('accordion-item__dropdown--open', expanded);
      button.closest('.accordion-item').classList.toggle('accordion-item--open', expanded);
    };
    buttons.forEach((button, index) => {
      setExpanded(button, index === 0 && container.dataset.isExpandedFirstItem === 'true');
      button.addEventListener('click', () => {
        const expanded = button.getAttribute('aria-expanded') !== 'true';
        if (!multiple) buttons.filter(other => other !== button).forEach(other => setExpanded(other, false));
        setExpanded(button, expanded);
      });
    });
  });
  // Source Flex choreography, using the original retained preFlex/flexIn CSS.
  document.body.dataset.animationState='booted';
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && typeof IntersectionObserver === 'function') {
    const flexSelectors=['h1','h2','h3','h4','p','.grid-item','.sqs-block-form:not(.sqs-block-form-lightbox) .form-wrapper','.menu-wrapper','.acuity-block-wrapper','.sqs-block-soundcloud iframe','.sqs-video-wrapper','.sqs-block-calendar .sqs-block-content','.chart-block-container','.tweet-list .tweet','.list-item-rich-animation','.sqs-block-marquee','.sqs-block-accordion','.sqs-block.sqs-background-enabled','.sqs-block-shape','[data-animation-role="image"]:not([data-animation-override])','[data-animation-role="header-element"]','[data-animation-role="button"]','.image-button-wrapper'];
    const fadeSelectors=['h5','footer .sqs-block-content','[data-animation-role="content"]','[data-animation-role="date"]','[data-animation-role="section"]','[data-animation-role="quote"]:not([data-animation-override])','[data-animation-role="video"]','.list-item-basic-animation'];
    const targets=[...document.body.querySelectorAll([...flexSelectors,...fadeSelectors].join(','))].filter(el=>!el.closest('[data-has-block-animations],.form-wrapper.hidden,.Marquee-measure')&&!el.querySelector('[data-has-block-animations]')&&!el.closest('.header-menu'));
    const segments=new Map();
    const directTargets=targets.filter(el=>!(el.matches("h1,h2,h3")&&!el.children.length&&el.textContent.trim()));
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      const el=entry.target;observer.unobserve(el);
      const segment=segments.get(el);
      if(segment){
        const original=el.innerHTML,words=el.textContent.replace(/\u00a0/g,' ').trim().split(/\s+/);
        el.replaceChildren();
        words.forEach((word,index)=>{
          if(index)el.append(' ');
          const wrapper=document.createElement('span'),interior=document.createElement('span');
          wrapper.className='animation-segment-wrapper animation-segmented-flex-primed';
          interior.className='animation-segment-interior';interior.textContent=word;
          Object.assign(interior.style,{transitionDuration:'650ms',transitionTimingFunction:'ease',transitionDelay:`${index*20}ms`});
          wrapper.append(interior);el.append(wrapper);
        });
        el.classList.remove('animation-segment-parent-hidden');
        void el.offsetTop;
        requestAnimationFrame(()=>{
          el.querySelectorAll('.animation-segment-wrapper').forEach(word=>word.classList.add('animation-segmented-flex-fired'));
          setTimeout(()=>{el.innerHTML=original},650+Math.max(0,words.length-1)*20+50);
        });
      }else requestAnimationFrame(()=>el.classList.add(el.classList.contains('preFade')?'fadeIn':'flexIn'));
    }),{threshold:0});
    targets.forEach((el,index)=>{
      if(el.matches('h1,h2,h3')&&!el.children.length&&el.textContent.trim()){
        segments.set(el,true);el.classList.add('animation-segment-parent-hidden');
      }else{
        const fade=!el.matches(flexSelectors.join(','));
        el.classList.add(fade?'preFade':'preFlex');
        el.style.transitionDuration='650ms';
        el.style.transitionTimingFunction=fade?'ease':'cubic-bezier(0.19, 1, 0.22, 1)';
        if(el.matches('[data-animation-role="header-element"],.grid-item,.tweet-list .tweet'))el.style.transitionDelay=`${directTargets.indexOf(el)/Math.max(1,directTargets.length)}s`;
      }
      observer.observe(el);
    });
  }
})();

/* Match homepage section rhythm to About Us at the current font and viewport. */
(() => {
  if (document.body.dataset.auctaPage !== 'home') return;
  const about = document.querySelector('[data-section-id="6577919e3123e24bc42e920e"]');
  if (!about) return;
  const wrapper = about.querySelector(':scope > .content-wrapper');
  const title = about.querySelector('h2');
  const paragraph = about.querySelector('.fe-block:last-child .sqs-html-content p');
  if (!wrapper || !title || !paragraph) return;
  const scope = window.auctaPage;
  const Observer = scope ? scope.Observer(window.ResizeObserver) : window.ResizeObserver;
  const frame = callback => scope ? scope.frame(callback) : requestAnimationFrame(callback);
  // Offset coordinates ignore the site's temporary entrance-animation transforms.
  const layoutTop = element => {
    let top = 0;
    for (let node = element; node; node = node.offsetParent) top += node.offsetTop;
    return top;
  };
  const update = () => {
    const style = getComputedStyle(wrapper);
    const gap = Math.max(0, layoutTop(paragraph) - layoutTop(title) - title.offsetHeight);
    document.body.style.setProperty('--home-about-padding-top', style.paddingTop);
    document.body.style.setProperty('--home-about-padding-bottom', style.paddingBottom);
    document.body.style.setProperty('--home-about-title-gap', `${gap}px`);
  };
  if (Observer) new Observer(() => frame(update)).observe(about);
  if (scope) scope.on(window, 'resize', () => frame(update));
  else window.addEventListener('resize', () => frame(update));
  document.fonts.ready.then(() => { if (!scope?.disposed) frame(update); });
  update();
})();
