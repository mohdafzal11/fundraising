'use client';

import React from 'react';
import Link from 'next/link';
import { LinkProps } from 'next/link';

interface CustomLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  is_a?: boolean;
}

/**
 * CustomLink component that extends Next.js Link
 * Automatically adds rel="nofollow" to external links except for droomdroom.com
 * Can be forced to render as <a> tag using is_a prop
 */
export const CustomLink: React.FC<CustomLinkProps> = ({
  href,
  children,
  className,
  target,
  rel,
  is_a,
  ...props
}) => {
  // Check if the link is external
  const isExternal = typeof href === 'string' && 
    (href.startsWith('http://') || href.startsWith('https://'));
  
  // Check if the link is to droomdroom.com
  const isDroomDroomLink = typeof href === 'string' && 
    href.includes('droomdroom.com');
    
  // Check if the link is internal (starts with "/")
  const isInternalLink = typeof href === 'string' && 
    href.startsWith('/');
  
  // Determine the rel attribute
  let relAttribute = rel || '';
  
  // Always add nofollow for non-droomdroom external links
  if (isExternal && !isDroomDroomLink) {
    relAttribute = relAttribute ? `${relAttribute} nofollow` : 'nofollow';
  }
  
  // Add noopener and noreferrer for security when opening in new tab
  if (target === '_blank') {
    relAttribute = relAttribute ? `${relAttribute} noopener noreferrer` : 'noopener noreferrer';
  }

  // Use <a> tag if:
  // 1. is_a prop is true, or
  // 2. it's an external link that's not droomdroom.com and not internal
  if (is_a || (isExternal && !isDroomDroomLink && !isInternalLink)) {
    return (
      <a 
        href={href.toString()}
        className={className}
        target={target}
        rel={relAttribute || undefined}
        {...props}
      >
        {children}
      </a>
    );
  }

  // For internal links or droomdroom links, use Next.js Link
  return (
    <Link 
      href={href}
      className={className}
      {...props}
    >
      {children}
    </Link>
  );
};

// Legacy default export for backward compatibility
export default CustomLink;
