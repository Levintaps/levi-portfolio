import '@testing-library/jest-dom/vitest';

// jsdom defines window.scrollTo but routes it through its "not implemented"
// reporter (there is no real layout engine to scroll), which logs a console
// error on every call. App's route-change scroll reset calls it on every
// render, so silence it with a real no-op; individual tests still spy on it
// when they need to assert it was called.
if (typeof window !== 'undefined') {
  window.scrollTo = () => {};
}

// jsdom has no layout engine and never implemented matchMedia; ThemeProvider
// reads it on mount to resolve the initial color scheme.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList;
}
