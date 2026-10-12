import { createOptimizedPicture, toClassName } from '../../scripts/aem.js';

/**
 * Tabs block.
 *
 * Content contract (DA): one row per tab.
 *   - cell 1: tab label (e.g. "Overview")
 *   - cell 2: tab panel content (headings, text, images, lists, links)
 * Single-cell rows are tolerated: the first heading/paragraph becomes the label and the
 * rest of the cell becomes the panel. Rows without a label are skipped.
 * Rendering: horizontal tab strip; one visible panel below it.
 */
const OPTION_CLASSES = [];

let tabsId = 0;

function splitRow(row) {
  const cells = [...row.children];
  if (cells.length >= 2) {
    const [labelCell, ...rest] = cells;
    const panel = document.createElement('div');
    rest.forEach((cell) => panel.append(...cell.childNodes));
    return { label: labelCell.textContent.trim(), labelHTML: labelCell.innerHTML, panel };
  }
  const cell = cells[0] || row;
  const first = cell.querySelector(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6, :scope > p');
  const panel = document.createElement('div');
  if (first) {
    const label = first.textContent.trim();
    const labelHTML = first.innerHTML;
    first.remove();
    panel.append(...cell.childNodes);
    return { label, labelHTML, panel };
  }
  return { label: cell.textContent.trim(), labelHTML: cell.innerHTML, panel };
}

function selectTab(block, button) {
  block.querySelectorAll('.tabs-tab').forEach((btn) => {
    const selected = btn === button;
    btn.setAttribute('aria-selected', selected);
    btn.tabIndex = selected ? 0 : -1;
  });
  block.querySelectorAll('.tabs-panel').forEach((panel) => {
    panel.setAttribute('aria-hidden', panel.id !== button.getAttribute('aria-controls'));
  });
}

export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  tabsId += 1;
  const prefix = `tabs-${tabsId}`;

  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');

  const panels = [];
  const used = new Set();
  [...block.children].forEach((row) => {
    const { label, labelHTML, panel } = splitRow(row);
    if (!label) return;
    const i = panels.length;
    let slug = toClassName(label) || `tab-${i + 1}`;
    if (used.has(slug)) slug = `${slug}-${i + 1}`;
    used.add(slug);

    panel.className = 'tabs-panel';
    panel.id = `${prefix}-panel-${slug}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `${prefix}-tab-${slug}`);
    panel.setAttribute('aria-hidden', i !== 0);
    panel.querySelectorAll('picture > img').forEach((img) => {
      img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '1200' }, { width: '750' }]));
    });

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tabs-tab';
    button.id = `${prefix}-tab-${slug}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', panel.id);
    button.setAttribute('aria-selected', i === 0);
    button.tabIndex = i === 0 ? 0 : -1;
    button.innerHTML = labelHTML;
    button.querySelectorAll('p').forEach((p) => p.replaceWith(...p.childNodes));
    button.addEventListener('click', () => selectTab(block, button));
    tablist.append(button);
    panels.push(panel);
  });

  // arrow-key navigation between tabs
  tablist.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    const buttons = [...tablist.querySelectorAll('.tabs-tab')];
    const current = buttons.indexOf(document.activeElement);
    if (current < 0) return;
    let next = current;
    if (e.key === 'ArrowRight') next = (current + 1) % buttons.length;
    if (e.key === 'ArrowLeft') next = (current - 1 + buttons.length) % buttons.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = buttons.length - 1;
    e.preventDefault();
    buttons[next].focus();
    selectTab(block, buttons[next]);
  });

  block.replaceChildren(tablist, ...panels);
}
