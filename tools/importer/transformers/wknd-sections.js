/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND section breaks.
 * Uses payload.template.sections[].selector (DOM-verified in page analysis).
 * - Inserts <hr> before every section after the first (beforeTransform, while
 *   section elements still exist and before parsers replace them).
 * - Where a WKND core-component separator (div.separator > .cmp-separator > hr)
 *   immediately precedes a section boundary, that separator is replaced by the
 *   section break instead of producing a duplicate break.
 * - Section Metadata is only added for sections with a style (none currently).
 */
const SECTION_MARKER_ATTR = 'data-excat-section-id';

function querySection(root, selectors) {
  const list = Array.isArray(selectors) ? selectors : [selectors];
  for (const sel of list) {
    if (!sel) continue;
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue;
      const sectionEl = querySection(element, section.selector);
      if (!sectionEl) continue;

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);

      const prev = sectionEl.previousElementSibling;
      if (i > 0 && prev && prev.matches('div.separator') && prev.querySelector('hr.cmp-separator__horizontal-rule')) {
        // Replace the source separator with the section break
        prev.replaceWith(hr);
      } else {
        sectionEl.before(hr);
      }
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || querySection(element, section.selector);
      if (!anchor) continue;

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove();
      }
    }
  }
}
