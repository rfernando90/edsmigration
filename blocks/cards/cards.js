import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Cards block.
 *
 * Content contract (DA): one row per card — an image cell and a body cell
 * (heading, description, optional link). Authors may omit either cell, leave cells
 * empty, wrap the image in a paragraph/link, or put the image inside the body cell.
 * @param {Element} block The block element
 */
function isImageOnly(cell) {
  return !!cell.querySelector('picture, img') && !cell.textContent.trim();
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const cells = [...row.children]
      .filter((cell) => cell.textContent.trim() || cell.querySelector('picture, img, a'));
    if (!cells.length) return;

    const li = document.createElement('li');
    cells.forEach((cell) => {
      if (isImageOnly(cell)) {
        cell.className = 'cards-card-image';
        li.append(cell);
        return;
      }
      // body cell: split a leading picture out into its own image cell
      const pic = cell.querySelector('picture');
      if (pic && !li.querySelector('.cards-card-image')) {
        const imageCell = document.createElement('div');
        imageCell.className = 'cards-card-image';
        const wrapper = pic.parentElement;
        imageCell.append(pic);
        if (wrapper !== cell && wrapper.tagName === 'P' && !wrapper.textContent.trim()) wrapper.remove();
        li.append(imageCell);
      }
      cell.className = 'cards-card-body';
      li.append(cell);
    });
    // image always precedes body, whatever order the author used
    const image = li.querySelector(':scope > .cards-card-image');
    if (image) li.prepend(image);
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);
}
