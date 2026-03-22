/** Minimal classNames utility — avoids adding clsx as a dependency. */
export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
