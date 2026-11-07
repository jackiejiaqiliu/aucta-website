/* Local reel movement, swipe/drag, and gallery enlargement. */
(() => {
  const scope=window.auctaPage;
  const ResizeObserver=scope ? scope.Observer(window.ResizeObserver) : window.ResizeObserver;
  const IntersectionObserver=scope ? scope.Observer(window.IntersectionObserver) : window.IntersectionObserver;
  const requestAnimationFrame=scope ? scope.frame.bind(scope) : window.requestAnimationFrame.bind(window);
  const setTimeout=scope ? scope.timer.bind(scope) : window.setTimeout.bind(window);
  const scopeOn=(target,...args)=>scope ? scope.on(target,...args) : target.addEventListener(...args);

  let dialog, image, images = [], current = 0, previousFocus;
  const render = () => { image.src = images[current].dataset.fullSrc || images[current].src; image.alt = images[current].alt || ''; };
  const step = delta => { current = (current + delta + images.length) % images.length; render(); };
  const open = (collection, index) => {
    if (!dialog) {
      dialog = document.createElement('dialog'); dialog.className = 'local-lightbox';
      dialog.setAttribute('aria-label', 'Image gallery');
      dialog.innerHTML = '<button type="button" class="lightbox-close" aria-label="Close gallery">×</button><button type="button" class="lightbox-previous" aria-label="Previous image">‹</button><img alt=""><button type="button" class="lightbox-next" aria-label="Next image">›</button>';
      document.body.append(dialog); image = dialog.querySelector('img');
      dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
      dialog.querySelector('.lightbox-previous').addEventListener('click', () => step(-1));
      dialog.querySelector('.lightbox-next').addEventListener('click', () => step(1));
      dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
      dialog.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
        if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
      });
      dialog.addEventListener('close', () => { document.body.style.overflow = ''; previousFocus?.focus(); });
    }
    images = collection; current = index; previousFocus = document.activeElement;
    render(); document.body.style.overflow = 'hidden'; dialog.showModal();
  };
  document.querySelectorAll('.gallery-grid,.gallery-reel').forEach(gallery => {
    const items = [...gallery.querySelectorAll('.gallery-grid-item,.gallery-reel-item')];
    const collection = items.map(item => item.querySelector('img')).filter(Boolean);
    items.forEach((item, index) => {
      const trigger = item.querySelector('a');
      if (trigger && (trigger.classList.contains('gallery-grid-lightbox-link') || trigger.classList.contains('gallery-reel-lightbox-link'))) {
        trigger.setAttribute('aria-label', `Enlarge image ${index + 1}`);
        trigger.addEventListener('click', event => { event.preventDefault(); if (!gallery.dataset.dragging) open(collection, index); });
      }
    });
    const reel = gallery.querySelector('.gallery-reel-list');
    if (!reel) return;
    // The source reel starts with the first letter centered, with the final letters
    // continuing on its left. Three local cycles provide the same circular ordering.
    const cloneCycle = () => items.map((item,index) => {
      const clone = item.cloneNode(true);
      clone.dataset.reelIndex = String(index);
      const link = clone.querySelector('.gallery-reel-lightbox-link');
      link?.addEventListener('click', event => {
        event.preventDefault(); if (!gallery.dataset.dragging) open(collection,index);
      });
      return clone;
    });
    items.forEach((item,index) => item.dataset.reelIndex = String(index));
    const allItems = [...cloneCycle(), ...items, ...cloneCycle()];
    reel.replaceChildren(...allItems);
    let activeIndex = 0, cycleWidth = 0, resetting = false, scrollTimer;
    const center = item => item.offsetLeft + item.offsetWidth / 2 - reel.clientWidth / 2;
    const nearest = () => {
      const position = reel.scrollLeft + reel.clientWidth / 2;
      return allItems.reduce((best,item,index) => Math.abs(item.offsetLeft+item.offsetWidth/2-position) < Math.abs(allItems[best].offsetLeft+allItems[best].offsetWidth/2-position) ? index : best, 0);
    };
    const sizeItems = () => {
      const height = reel.clientHeight;
      allItems.forEach(item => {
        const img = item.querySelector('img');
        const width = Number(img.getAttribute('width')) || img.naturalWidth || 1;
        const originalHeight = Number(img.getAttribute('height')) || img.naturalHeight || 1;
        item.style.width = `${Math.round(height * width / originalHeight)}px`;
        item.style.height = `${height}px`;
      });
      cycleWidth = items.reduce((sum,item) => sum+item.offsetWidth,0);
      resetting = true;
      reel.scrollLeft = center(items[activeIndex]);
      requestAnimationFrame(() => resetting = false);
    };
    new ResizeObserver(() => requestAnimationFrame(sizeItems)).observe(reel); sizeItems();
    reel.addEventListener('scroll', () => {
      if (resetting) return;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const index = nearest(); activeIndex = index % items.length;
        if (index < items.length || index >= items.length * 2) {
          resetting = true;
          reel.scrollLeft += index < items.length ? cycleWidth : -cycleWidth;
          requestAnimationFrame(() => resetting = false);
        }
      }, 180);
    });
    const move = direction => {
      const target = allItems[Math.max(0,Math.min(allItems.length-1,nearest()+direction))];
      activeIndex = Number(target.dataset.reelIndex);
      reel.scrollTo({left:center(target),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    };
    gallery.querySelector('[data-next]')?.addEventListener('click', () => move(1));
    gallery.querySelector('[data-previous]')?.addEventListener('click', () => move(-1));
    let startX, startScroll;
    reel.addEventListener('pointerdown', event => { if (event.pointerType !== 'mouse') return; startX = event.clientX; startScroll = reel.scrollLeft; });
    scopeOn(window,'pointermove', event => {
      if (startX === undefined) return;
      if (Math.abs(event.clientX - startX) > 5) { gallery.dataset.dragging = 'true'; reel.scrollLeft = startScroll - (event.clientX - startX); }
    });
    scopeOn(window,'pointerup', () => { startX = undefined; setTimeout(() => delete gallery.dataset.dragging, 0); });
    reel.addEventListener('dragstart', event => event.preventDefault());
  });
})();
