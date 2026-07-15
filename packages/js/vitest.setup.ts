// SPDX-License-Identifier: MIT

// jsdom has no layout engine, so scrolling is a no-op. Several behaviors call
// scrollIntoView to keep the highlighted option in view; without a stub jsdom
// throws "Not implemented: Element.prototype.scrollIntoView".
Element.prototype.scrollIntoView = function scrollIntoView(): void {}
