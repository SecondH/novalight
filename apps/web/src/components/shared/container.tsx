import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** Consistent max-width + horizontal gutter used by every section on the site. */
export function Container({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('mx-auto w-full max-w-6xl px-6 sm:px-8', className)} {...props} />;
}
