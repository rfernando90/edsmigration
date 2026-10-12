import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Hero block.
 *
 * Content contract (DA): image row + content row (heading, text, CTA), in any order.
 * Authors may also put the image and the text in a single cell, add extra rows,
 * or omit the image or the content entirely. Rendering: full-width image with the
 * content area below it.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const pictures = [...block.querySelectorAll('picture')];
  const looseImgs = [...block.querySelectorAll('img')].filter((img) => !img.closest('picture'));

  const media = document.createElement('div');
  media.className = 'hero-image';
  const content = document.createElement('div');
  content.className = 'hero-content';

  const firstImg = pictures[0]?.querySelector('img') || looseImgs[0];
  if (firstImg && firstImg.src) {
    const isFirstSection = !block.closest('.section')?.previousElementSibling;
    media.append(createOptimizedPicture(firstImg.src, firstImg.alt || '', isFirstSection, [
      { media: '(min-width: 900px)', width: '2000' },
      { width: '900' },
    ]));
  }

  // drop every image (and the paragraph/link that only wrapped it) from the authored cells
  [...pictures, ...looseImgs].forEach((el) => {
    let node = el.closest('picture') || el;
    while (node.parentElement && !cells.includes(node.parentElement)
      && !node.parentElement.textContent.trim()
      && node.parentElement.querySelectorAll('picture, img').length <= 1) {
      node = node.parentElement;
    }
    node.remove();
  });

  cells.forEach((cell) => {
    if (cell.textContent.trim() || cell.querySelector('a, iframe, video')) {
      content.append(...cell.childNodes);
    }
  });
  content.querySelectorAll('p').forEach((p) => {
    if (!p.textContent.trim() && !p.children.length) p.remove();
  });

  const children = [];
  if (media.children.length) children.push(media);
  else block.classList.add('hero-no-image');
  if (content.children.length) children.push(content);
  else block.classList.add('hero-no-content');

  block.replaceChildren(...children);
}
