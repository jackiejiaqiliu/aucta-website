/* Desktop dropdowns and the original mobile folder/back navigation model. */
(() => {
  const scope=window.auctaPage;
  const ResizeObserver=scope ? scope.Observer(window.ResizeObserver) : window.ResizeObserver;
  const IntersectionObserver=scope ? scope.Observer(window.IntersectionObserver) : window.IntersectionObserver;
  const requestAnimationFrame=scope ? scope.frame.bind(scope) : window.requestAnimationFrame.bind(window);
  const setTimeout=scope ? scope.timer.bind(scope) : window.setTimeout.bind(window);
  const scopeOn=(target,...args)=>scope ? scope.on(target,...args) : target.addEventListener(...args);

  const header = document.querySelector('#header');
  if (!header) return;
  const menu = header.querySelector('.header-menu');
  const burgerButtons = [...header.querySelectorAll('.header-burger-btn')];
  const folderButtons = [...header.querySelectorAll('.header-nav-folder-title')];
  const folders = menu ? [...menu.querySelectorAll('.header-menu-nav-folder')] : [];
  // Move nested panels to a common container so each can scroll independently.
  const panelContainer = menu?.querySelector('.header-menu-nav-list');
  folders.filter(folder => folder.dataset.folder !== 'root').forEach(folder => panelContainer.append(folder));
  const root = folders.find(folder => folder.dataset.folder === 'root');
  const showFolder = id => {
    folders.forEach(folder => {
      const active = folder.dataset.folder === id;
      folder.classList.toggle('local-active', active);
      folder.classList.toggle('local-hidden', !active);
      folder.inert = !active;
    });
  };
  showFolder('root');
  const setMenu = open => {
    document.body.classList.toggle('header--menu-open', open);
    burgerButtons.forEach(button => {
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Close Menu' : 'Open Menu');
      button.classList.toggle('burger--active', open);
    });
    if (menu) menu.inert = !open;
    if (!open) showFolder('root');
  };
  setMenu(false);
  burgerButtons.forEach(button => button.addEventListener('click', () => {
    setMenu(!document.body.classList.contains('header--menu-open'));
  }));
  menu?.querySelectorAll('[data-folder-id]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    showFolder(link.dataset.folderId);
    folders.find(folder => folder.dataset.folder === link.dataset.folderId)?.querySelector('a')?.focus();
  }));
  menu?.querySelectorAll('[data-action="back"]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault(); showFolder('root'); root?.querySelector('a')?.focus();
  }));
  folderButtons.forEach(button => {
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      folderButtons.forEach(other => other.setAttribute('aria-expanded', 'false'));
      button.setAttribute('aria-expanded', String(open));
    });
    button.closest('.header-nav-item').addEventListener('mouseleave', () => button.setAttribute('aria-expanded', 'false'));
  });
  scopeOn(document,'click', event => {
    if (!event.target.closest('.header-nav-item--folder')) folderButtons.forEach(button => button.setAttribute('aria-expanded', 'false'));
  });
  scopeOn(document,'keydown', event => {
    if (event.key === 'Escape') {
      if (document.body.classList.contains('header--menu-open')) { setMenu(false); burgerButtons.find(button => button.offsetParent)?.focus(); }
      folderButtons.forEach(button => button.setAttribute('aria-expanded', 'false'));
    }
  });
  const measureHeader = () => {
    const height = header.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--header-height', `${height}px`);
    document.documentElement.style.setProperty('--header-fixed-top-offset', `${height}px`);
    document.documentElement.style.scrollPaddingTop = matchMedia('(pointer: coarse)').matches ? '0px' : `${height}px`;
    if (menu) menu.style.paddingTop = `${height}px`;
    if (window.innerWidth > 799 && !matchMedia('(pointer: coarse)').matches) setMenu(false);
  };
  new ResizeObserver(() => requestAnimationFrame(measureHeader)).observe(header);
  measureHeader();
  // Source fixed-header behavior: solid, compact header after 10px of scrolling.
  let restoreTimer, scrollFrame;
  const updateScrollState = () => {
    scrollFrame = null;
    clearTimeout(restoreTimer);
    if (window.scrollY > 10) header.classList.add('shrink');
    else restoreTimer = setTimeout(() => header.classList.remove('shrink'), 300);
  };
  scopeOn(window,'scroll', () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollState);
  }, {passive:true});
  scopeOn(window,'pageshow', updateScrollState);
  updateScrollState();
})();
