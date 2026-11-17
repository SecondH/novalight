import type { ComponentProps } from 'react';

/** Screen-reader-only content -- visually hidden without removing it from the accessibility tree. */
export function VisuallyHidden({ className, ...props }: ComponentProps<'span'>) {
  return <span className={`sr-only ${className ?? ''}`} {...props} />;
}
