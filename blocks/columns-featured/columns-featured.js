import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

/**
 * Featured article teaser: image cell + content panel cell
 * (pretitle, heading, body text, CTA).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const rows = [...block.children];
  if (!rows.length) return;

  // All authored cells, across rows (authors may split content over extra rows/cells).
  const cells = rows.flatMap((row) => [...row.children]);

  const imageCell = cells.find((cell) => cell.querySelector('picture, img'));
  const contentCells = cells.filter((cell) => cell !== imageCell);

  // Image and text authored in one cell: keep the text by moving it to the content panel.
  if (imageCell && imageCell.textContent.trim()) {
    const textCell = document.createElement('div');
    [...imageCell.childNodes].forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && node.querySelector('picture, img')
        && !node.textContent.trim()) return;
      if (node.nodeType === Node.ELEMENT_NODE && node.matches('picture, img')) return;
      textCell.append(node);
    });
    // pictures nested in a moved text wrapper go back to the image cell
    textCell.querySelectorAll('picture, img').forEach((pic) => {
      if (pic.tagName === 'IMG' && pic.closest('picture')) return;
      imageCell.append(pic);
    });
    textCell.querySelectorAll('p').forEach((p) => {
      if (!p.textContent.trim() && !p.children.length) p.remove();
    });
    contentCells.unshift(textCell);
  }

  const inner = document.createElement('div');
  inner.className = 'columns-featured-inner';

  if (imageCell) {
    const media = document.createElement('div');
    media.className = 'columns-featured-image';
    const img = imageCell.querySelector('img');
    if (img && img.src) {
      const picture = createOptimizedPicture(img.src, img.alt || '', true, [
        { media: '(min-width: 900px)', width: '1600' },
        { width: '900' },
      ]);
      media.append(picture);
    } else {
      media.append(...imageCell.childNodes);
    }
    inner.append(media);
  }

  const panel = document.createElement('div');
  panel.className = 'columns-featured-content';
  contentCells.forEach((cell) => panel.append(...cell.childNodes));

  // Pretitle: a paragraph that precedes the first heading.
  const heading = panel.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    let prev = heading.previousElementSibling;
    while (prev) {
      if (prev.tagName === 'P' && !prev.querySelector('a, picture')) {
        prev.classList.add('columns-featured-pretitle');
      }
      prev = prev.previousElementSibling;
    }
    heading.classList.add('columns-featured-title');
  }

  // CTA: the last link in the panel becomes the call-to-action button.
  const links = [...panel.querySelectorAll('a')];
  const cta = links[links.length - 1];
  if (cta) {
    const ctaParent = cta.closest('p');
    if (ctaParent && ctaParent.textContent.trim() === cta.textContent.trim()) {
      ctaParent.classList.add('columns-featured-cta');
    }
    cta.classList.add('columns-featured-cta-link');
  }

  if (panel.childElementCount) inner.append(panel);
  if (!imageCell) block.classList.add('columns-featured-no-image');

  block.replaceChildren(inner);
}
