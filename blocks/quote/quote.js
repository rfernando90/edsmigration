import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Quote block.
 *
 * Content contract (DA), rows in any order:
 *   - optional image row (a picture on its own) — rendered where the author placed it
 *   - quotation row (required) — the quoted text
 *   - optional attribution row — e.g. "- Sofia Sjöberg"; <em> is converted to <cite>
 * Rows are classified by content, so authors can omit the image or attribution.
 */
const OPTION_CLASSES = [];

function isImageOnly(cell) {
  return cell.querySelector('picture, img') && !cell.textContent.trim();
}

export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const cells = [...block.querySelectorAll(':scope > div > div')];
  const blockquote = document.createElement('blockquote');
  const parts = [];
  let quotation;
  let attribution;

  cells.forEach((cell) => {
    if (isImageOnly(cell)) {
      const media = document.createElement('div');
      media.className = 'quote-image';
      cell.querySelectorAll('picture > img').forEach((img) => {
        img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '1600' }, { width: '750' }]));
      });
      media.append(...cell.childNodes);
      parts.push(media);
      return;
    }
    if (!cell.textContent.trim()) return;
    if (!quotation) {
      quotation = document.createElement('div');
      quotation.className = 'quote-quotation';
      quotation.append(...cell.childNodes);
      blockquote.append(quotation);
      if (!parts.includes(blockquote)) parts.push(blockquote);
      return;
    }
    if (!attribution) {
      attribution = document.createElement('div');
      attribution.className = 'quote-attribution';
      attribution.append(...cell.childNodes);
      attribution.querySelectorAll('em').forEach((em) => {
        const cite = document.createElement('cite');
        cite.innerHTML = em.innerHTML;
        em.replaceWith(cite);
      });
      blockquote.append(attribution);
      return;
    }
    // extra text cells: keep them with the quotation
    quotation.append(...cell.childNodes);
  });

  block.replaceChildren(...parts);
}
