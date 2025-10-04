"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/ui";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <FadeIn>
      <nav
        aria-label="Breadcrumb"
        className={cn(
          "flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 tracking-wider",
          className
        )}
      >
        <ol className="flex items-center space-x-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium text-gray-900 dark:text-white">
                  {item.label}
                </span>
              )}
              {index < items.length - 1 && (
                <ChevronRight className="ml-2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              )}
            </li>
          ))}
        </ol>
      </nav>
    </FadeIn>
  );
}