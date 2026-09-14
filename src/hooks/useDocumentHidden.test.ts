import { act, renderHook } from '@testing-library/react';
import { useDocumentHidden } from './useDocumentHidden';
import { useMediaQuery } from './useMediaQuery';

function setHidden(hidden: boolean) {
  Object.defineProperty(document, 'hidden', { configurable: true, value: hidden });
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
}

describe('useDocumentHidden', () => {
  afterEach(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  });

  it('follows the tab going into the background and coming back', () => {
    const { result } = renderHook(() => useDocumentHidden());
    expect(result.current).toBe(false);

    setHidden(true);
    expect(result.current).toBe(true);

    setHidden(false);
    expect(result.current).toBe(false);
  });
});

describe('useMediaQuery', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reports whether the query matches, and follows changes', () => {
    let listener: ((event: MediaQueryListEvent) => void) | undefined;
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: false,
          media: query,
          addEventListener: (_: string, handler: (event: MediaQueryListEvent) => void) => {
            listener = handler;
          },
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    );

    const { result } = renderHook(() => useMediaQuery('(max-width: 47.999rem)'));
    expect(result.current).toBe(false);

    act(() => {
      listener?.({ matches: true } as MediaQueryListEvent);
    });
    expect(result.current).toBe(true);
  });
});
