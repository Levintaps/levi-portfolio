import { act } from '@testing-library/react';

interface Watcher {
  callback: IntersectionObserverCallback;
  instance: IntersectionObserver;
  targets: Set<Element>;
}

export interface ViewportStub {
  /** Tells every observer watching `target` that it has come into or gone out of view. */
  setVisible(target: Element, visible: boolean): void;
  /** Whether anything is still watching `target`. */
  isWatched(target: Element): boolean;
}

/**
 * jsdom has no IntersectionObserver. This one does nothing on its own: a test
 * moves elements in and out of view by hand with `setVisible`.
 */
export function stubIntersectionObserver(): ViewportStub {
  const watchers: Watcher[] = [];

  class StubIntersectionObserver {
    root = null;
    rootMargin = '';
    thresholds = [];
    private watcher: Watcher;

    constructor(callback: IntersectionObserverCallback) {
      this.watcher = {
        callback,
        instance: this as unknown as IntersectionObserver,
        targets: new Set(),
      };
      watchers.push(this.watcher);
    }

    observe(target: Element) {
      this.watcher.targets.add(target);
    }

    unobserve(target: Element) {
      this.watcher.targets.delete(target);
    }

    disconnect() {
      this.watcher.targets.clear();
    }

    takeRecords() {
      return [];
    }
  }

  vi.stubGlobal('IntersectionObserver', StubIntersectionObserver);

  return {
    setVisible(target, visible) {
      act(() => {
        for (const watcher of watchers) {
          if (!watcher.targets.has(target)) continue;
          watcher.callback(
            [{ target, isIntersecting: visible } as IntersectionObserverEntry],
            watcher.instance,
          );
        }
      });
    },
    isWatched(target) {
      return watchers.some((watcher) => watcher.targets.has(target));
    },
  };
}
