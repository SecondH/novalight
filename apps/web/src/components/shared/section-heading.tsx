import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  children?: ReactNode;
}

/** Eyebrow + title + optional description, used at the top of every marketing section. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  children,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' ? 'items-center text-center' : 'items-start text-start',
      )}
    >
      {eyebrow ? (
        <span className="text-xs font-semibold tracking-[0.08em] text-primary uppercase">
          {eyebrow}
        </span>
      ) : null}
      <h2
        className={cn(
          'text-balance font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl',
          align === 'center' ? 'max-w-2xl' : 'max-w-xl',
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            'text-pretty text-base text-muted-foreground sm:text-lg',
            align === 'center' ? 'max-w-xl' : 'max-w-lg',
          )}
        >
          {description}
        </p>
      ) : null}
      {children}
    </div>
  );
}
