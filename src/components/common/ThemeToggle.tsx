import { useScheme } from '../../theme/ThemeProvider';
import { Icon } from './icons';

/**
 * The light and dark switch, shared by every page's top bar. The icon shows
 * the theme that is on; the label says what a press will do.
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const { scheme, toggle } = useScheme();

  return (
    <button
      type="button"
      className={className}
      // The middle of the button, not the pointer, so a press from the
      // keyboard starts the button reveal in the same place.
      onClick={(event) => {
        const box = event.currentTarget.getBoundingClientRect();
        toggle({ x: box.left + box.width / 2, y: box.top + box.height / 2 });
      }}
      aria-label={`Switch to ${scheme === 'light' ? 'dark' : 'light'} theme`}
    >
      <Icon name={scheme === 'light' ? 'sun' : 'moon'} />
    </button>
  );
}
