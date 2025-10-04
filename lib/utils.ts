import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns';
import getConfig from 'next/config';
import { Currency } from '@prisma/client/edge';
import { Link } from "./types/projects";


let publicRuntimeConfig: any = null
try {
  publicRuntimeConfig = getConfig().publicRuntimeConfig
} catch (error) {
  publicRuntimeConfig = {
    basePath: '/fundraising'
  }
  console.error("Error getting config:", error)
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(dateString: string | undefined | null): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy, hh:mm a');
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
}

export function generateSlug(title: string, id: string) {
  return `${title.toLowerCase().replace(/\s+/g, '-')}-${id.substring(0, 8)}`;
}

export function generateFundraisingUrl(slug: string) {
  return `https://droomdroom.com/fundraising/${slug}`;
}

export function getPageUrl(path: string) {
  if (typeof window === 'undefined') {
    // const normalized = `${path.startsWith('/') ? '' : '/'}${path}`;
    // return normalized.replace(/([^:]\/)\/+/g, '$1');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://droomdroom.com/fundraising';
    const fullPath = `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    return fullPath.replace(/([^:]\/)\/+/g, '$1');
  }
  const basePath = '/fundraising';
  return `${basePath}${path.startsWith('/') ? '' : '/'}${path}`;
}


export function generateTableID(str: string, tableNo: number): string {
  if (!str || typeof str !== 'string') {
    return `table-${tableNo}`;
  }

  const slug = str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  const baseSlug = slug || 'table';

  return `${baseSlug}-${tableNo}`;
}


export function cleanHtmlStyles(html: string): string {
  if (!html) return '';

  let cleaned = html.replace(/style="[^"]*"/gi, (styleMatch) => {
    let newStyle = styleMatch
      .replace(/color:[^;\"]*;?/gi, '')
      .replace(/font-family:[^;\"]*;?/gi, '')
      .replace(/font-size:[^;\"]*;?/gi, '');
    return newStyle === 'style=""' ? '' : newStyle;
  });

  cleaned = cleaned.replace(/class="([^"]*)"/gi, (match: string, classList: string) => {
    const colors = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'gray', 'orange', 'purple', 'pink', 'brown', 'teal', 'indigo', 'violet'];
    const colorClasses = colors.map(c => `text-${c}`).concat(colors);
    const classes = classList
      .split(' ')
      .filter((cls: string) => !colorClasses.includes(cls.toLowerCase()) && !/^text-(?:[a-z]+-)?[0-9]{1,3}$/i.test(cls))
      .join(' ');
    return classes ? `class="${classes}"` : '';
  });

  cleaned = cleaned.replace(/<\/?font[^>]*>/gi, '');

  cleaned = cleaned.replace(/\n{2,}/g, '\n');

  return cleaned;
}

export function sanitizeHtml(html: string): string {

  if (!html) return '';

  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  cleaned = cleaned.replace(/<[^>]+>/g, '');

  const entities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&euro;': '€',
    '&pound;': '£',
    '&yen;': '¥',
  };

  cleaned = cleaned.replace(/&[a-zA-Z0-9#]+;/g, (match) => entities[match] || match);

  cleaned = cleaned.trim().replace(/\s+/g, ' ');

  return cleaned;
}


export function cleanSEOIMAGEURL(fullUrl: string, width?: number): string | null {
  if (!fullUrl || typeof fullUrl !== 'string') return null;
  if (!/^https?:\/\//i.test(fullUrl)) return null;
  try {
    const url = new URL(fullUrl);
    const cleanUrl = `${url.origin}${url.pathname}`;
    if (width) {
      const resizedUrl = new URL(cleanUrl);
      resizedUrl.searchParams.set('w', width.toString());
      return resizedUrl.toString();
    }
    return cleanUrl;
  } catch {
    return null;
  }
}


export function getImageContentType(url: string): string {
  const extension = url.split('.').pop()?.split('?')[0].toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    case 'avif':
      return 'image/avif';
    case 'webp':
      return 'image/webp';
    default:
      return 'image/png';
  }
}

export function sanitizeHtmlForSEO(html: string | null | undefined): string {
  if (!html) return '';

  const withoutTags = html.replace(/<[^>]*>/g, '');

  const withoutEntities = withoutTags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '...');

  const cleaned = withoutEntities
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length > 160) {
    const truncated = cleaned.substring(0, 157);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 120 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  }

  return cleaned;
}

/**
 * Create a canonical, URL-safe slug:
 * - Lowercase, trims whitespace
 * - Unicode normalized and diacritics removed
 * - Space and any non [a-z0-9-] becomes '-'
 * - Collapse multiple '-' and trim leading/trailing '-'
 * - Fallback to 'item' if empty
 */
export const slugifyStrict = (text: string): string => {
  if (!text) return 'item';
  const trimmed = text.trim().toLowerCase();
  // Normalize unicode and remove diacritics
  const normalized = trimmed
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');
  const replaced = normalized
    .replace(/[^a-z0-9\-\s]/g, '-') // non safe chars to '-'
    .replace(/[\s_]+/g, '-') // spaces/underscores to '-'
    .replace(/-+/g, '-') // collapse
    .replace(/^-+|-+$/g, ''); // trim dashes
  return replaced || 'item';
};

// Backwards-compatible export used across the app
export const slugify = (text: string) => slugifyStrict(text);


export const currencyFormatter = (currency: string) => {
  if (currency === 'USD') {
    return Currency.USD
  } else if (currency === 'EUR') {
    return Currency.EUR
  } else if (currency === 'ETH') {
    return Currency.ETH
  } else if (currency === 'BTC') {
    return Currency.BTC
  } else {
    return Currency.USD
  }
}


export const getInvestorType = (name: string) => {
  if (name.toLowerCase().includes('vc') || name.toLowerCase().includes('venture') || name.toLowerCase().includes('capital')) {
    return 'Venture Capitalist'
  } else if (name.toLowerCase().includes('angel')) {
    return 'Angel Investor'
  } else {
    return 'Other Investor'
  }
}


export const getLinks = (links: any[]) => {
  const formattedLinks: Link[] = [];

  for (const link of links) {
    if (link.url.includes("twitter")) {
      formattedLinks.push({ type: "twitter", url: link.url });
    } else if (link.url.includes("facebook")) {
      formattedLinks.push({ type: "facebook", url: link.url });
    } else if (link.url.includes("telegram")) {
      formattedLinks.push({ type: "telegram", url: link.url });
    } else if (link.url.includes("linkedin")) {
      formattedLinks.push({ type: "linkedin", url: link.url });
    } else {
      formattedLinks.push({ type: "website", url: link.url });
    }
  }
  return formattedLinks;
};


  export const formatAmount = (amount: string | number) => {
    const num = parseInt(amount?.toString() || "0");
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}K`;
    }
    return `$${num.toLocaleString()}`;
  };

  
  export const truncateName = (name: string, maxLength: number = 20) => {
    if (!name) return "Unknown";
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength) + "...";
  };