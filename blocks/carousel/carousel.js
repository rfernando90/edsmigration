import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Carousel block.
 *
 * Content contract (DA): one row per slide.
 *   - cell 1: slide image (optional)
 *   - cell 2: slide content — heading, text, CTA links (optional)
 * Authors may put the image and content in a single cell; pictures are split out automatically.
 * Rendering: full-width image, content below it, and a control bar with dot indicators
 * (centered) and previous/next arrows (right).
 */
const OPTION_CLASSES = [];

let carouselId = 0;

function updateActiveSlide(block, slideIndex) {
  block.dataset.activeSlide = slideIndex;
  block.querySelectorAll('.carousel-slide').forEach((slide, idx) => {
    const isActive = idx === slideIndex;
    slide.setAttribute('aria-hidden', !isActive);
    slide.querySelectorAll('a, button').forEach((el) => {
      if (isActive) el.removeAttribute('tabindex');
      else el.setAttribute('tabindex', '-1');
    });
  });
  block.querySelectorAll('.carousel-slide-indicator button').forEach((button, idx) => {
    if (idx === slideIndex) {
      button.setAttribute('aria-current', 'true');
      button.disabled = true;
    } else {
      button.removeAttribute('aria-current');
      button.disabled = false;
    }
  });
}

function showSlide(block, slideIndex) {
  const slides = block.querySelectorAll('.carousel-slide');
  if (!slides.length) return;
  let index = slideIndex;
  if (index < 0) index = slides.length - 1;
  if (index >= slides.length) index = 0;
  const target = slides[index];
  block.querySelector('.carousel-slides').scrollTo({ top: 0, left: target.offsetLeft, behavior: 'smooth' });
  updateActiveSlide(block, index);
}

function createSlide(row, idx, id) {
  const slide = document.createElement('li');
  slide.className = 'carousel-slide';
  slide.dataset.slideIndex = idx;
  slide.id = `carousel-${id}-slide-${idx}`;

  const imageWrap = document.createElement('div');
  imageWrap.className = 'carousel-slide-image';
  const content = document.createElement('div');
  content.className = 'carousel-slide-content';

  [...row.children].forEach((cell) => {
    const pictures = [...cell.querySelectorAll('picture')];
    pictures.forEach((pic) => {
      const p = pic.parentElement;
      imageWrap.append(pic);
      if (p && p !== cell && p.tagName === 'P' && !p.textContent.trim() && !p.children.length) p.remove();
    });
    if (cell.textContent.trim() || cell.querySelector('a, h1, h2, h3, h4, h5, h6')) {
      content.append(...cell.childNodes);
    }
  });

  imageWrap.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, idx === 0, [{ media: '(min-width: 900px)', width: '2000' }, { width: '750' }]));
  });

  if (imageWrap.children.length) slide.append(imageWrap);
  if (content.textContent.trim() || content.children.length) {
    slide.append(content);
    const heading = content.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) {
      if (!heading.id) heading.id = `${slide.id}-title`;
      slide.setAttribute('aria-labelledby', heading.id);
    }
  }
  return slide;
}

export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  carouselId += 1;
  const id = carouselId;
  block.id = `carousel-${id}`;

  const placeholders = {};

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const rows = [...block.querySelectorAll(':scope > div')]
    .filter((row) => row.textContent.trim() || row.querySelector('picture, img'));

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.className = 'carousel-slides';
  rows.forEach((row, idx) => slidesWrapper.append(createSlide(row, idx, id)));

  const container = document.createElement('div');
  container.className = 'carousel-slides-container';
  container.append(slidesWrapper);

  // control bar: indicators centered, prev/next on the right
  const controls = document.createElement('div');
  controls.className = 'carousel-controls';

  const indicatorsNav = document.createElement('nav');
  indicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
  const indicators = document.createElement('ol');
  indicators.className = 'carousel-slide-indicators';
  rows.forEach((_, idx) => {
    const li = document.createElement('li');
    li.className = 'carousel-slide-indicator';
    li.dataset.targetSlide = idx;
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}`);
    button.addEventListener('click', () => showSlide(block, idx));
    li.append(button);
    indicators.append(li);
  });
  indicatorsNav.append(indicators);

  const navButtons = document.createElement('div');
  navButtons.className = 'carousel-navigation-buttons';
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'slide-prev';
  prev.setAttribute('aria-label', placeholders.previousSlide || 'Previous Slide');
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'slide-next';
  next.setAttribute('aria-label', placeholders.nextSlide || 'Next Slide');
  prev.addEventListener('click', () => showSlide(block, parseInt(block.dataset.activeSlide || '0', 10) - 1));
  next.addEventListener('click', () => showSlide(block, parseInt(block.dataset.activeSlide || '0', 10) + 1));
  navButtons.append(prev, next);

  controls.append(indicatorsNav, navButtons);
  block.replaceChildren(container, controls);
  if (rows.length < 2) block.classList.add('carousel-single');

  updateActiveSlide(block, 0);

  if (rows.length > 1) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          updateActiveSlide(block, parseInt(entry.target.dataset.slideIndex, 10));
        }
      });
    }, { root: slidesWrapper, threshold: 0.5 });
    slidesWrapper.querySelectorAll('.carousel-slide').forEach((slide) => observer.observe(slide));
  }
}
