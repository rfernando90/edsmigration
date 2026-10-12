/**
 * Breadcrumbs block.
 *
 * Content contract (DA): one block table whose cells hold the trail, in order.
 * Accepted authoring shapes (any mix is tolerated):
 *   - one row/cell per crumb, each holding a link (or plain text for the current page)
 *   - a single cell holding a list (ul/ol) of links
 *   - a single cell holding several links in a paragraph
 * The last crumb is treated as the current page.
 */
const OPTION_CLASSES = [];

function collectCrumbs(block) {
  const crumbs = [];
  const list = block.querySelector('ul, ol');
  if (list) {
    [...list.querySelectorAll(':scope > li')].forEach((li) => {
      const link = li.querySelector('a');
      const text = li.textContent.trim();
      if (text) crumbs.push({ text: link ? link.textContent.trim() : text, href: link?.getAttribute('href') });
    });
    return crumbs;
  }

  const cells = [...block.querySelectorAll(':scope > div > div')];
  cells.forEach((cell) => {
    const links = [...cell.querySelectorAll('a')];
    if (links.length) {
      links.forEach((a) => {
        const text = a.textContent.trim();
        if (text) crumbs.push({ text, href: a.getAttribute('href') });
      });
      // keep trailing plain text in the same cell (e.g. "Home / Current page")
      const clone = cell.cloneNode(true);
      clone.querySelectorAll('a').forEach((a) => a.remove());
      const rest = clone.textContent.replace(/[/>|»›]/g, '').trim();
      if (rest) crumbs.push({ text: rest });
      return;
    }
    const text = cell.textContent.trim();
    if (text) crumbs.push({ text });
  });
  return crumbs;
}

export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  const crumbs = collectCrumbs(block);

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  const ol = document.createElement('ol');
  ol.className = 'breadcrumbs-list';

  crumbs.forEach((crumb, i) => {
    const li = document.createElement('li');
    li.className = 'breadcrumbs-item';
    const isCurrent = i === crumbs.length - 1;
    if (crumb.href && !isCurrent) {
      const a = document.createElement('a');
      a.href = crumb.href;
      a.textContent = crumb.text;
      li.append(a);
    } else {
      const span = document.createElement('span');
      span.textContent = crumb.text;
      if (isCurrent) span.setAttribute('aria-current', 'page');
      li.append(span);
    }
    ol.append(li);
  });

  nav.append(ol);
  block.replaceChildren(nav);
}
