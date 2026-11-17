import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** Vertical rhythm unit for full-width page sections -- consistent spacing scale site-wide. */
export function Section({ className, ...props }: ComponentProps<'section'>) {
  return <section className={cn('py-20 sm:py-28', className)} {...props} />;
}
