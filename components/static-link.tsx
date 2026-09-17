import type { AnchorHTMLAttributes } from 'react';

type StaticLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  prefetch?: boolean;
};

export default function StaticLink({
  prefetch,
  children,
  ...props
}: StaticLinkProps) {
  void prefetch;
  return <a {...props}>{children}</a>;
}
