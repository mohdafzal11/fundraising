"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ChevronDown,
  Loader2,
  FileText,
  Table,
  Bookmark,
  TrendingUp,
} from "lucide-react";
import { getPageUrl } from "@/lib/utils";
import { Section } from "@/lib/types/section";
import { Container } from "./ui";

const SectionSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="space-y-4 border rounded-lg p-6">
      <div className="h-8 rounded-lg w-3/4 bg-gray-200 dark:bg-gray-700"></div>
      <div className="space-y-2">
        <div className="h-4 rounded-lg w-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-4 rounded-lg w-4/5 bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-4 rounded-lg w-3/5 bg-gray-200 dark:bg-gray-700"></div>
      </div>

      {/* Table skeleton */}
      <div className="mt-6 space-y-4">
        <div className="h-6 rounded-lg w-1/2 bg-gray-200 dark:bg-gray-700"></div>
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
          {/* Table header */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-4 rounded bg-gray-200 dark:bg-gray-600"
              ></div>
            ))}
          </div>
          {/* Table rows */}
          {[1, 2].map((row) => (
            <div
              key={row}
              className="p-4 grid grid-cols-3 gap-4 border-t border-gray-200 dark:border-gray-600"
            >
              {[1, 2, 3].map((col) => (
                <div key={col} className="space-y-2">
                  <div className="h-3 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-3 rounded w-4/5 bg-gray-200 dark:bg-gray-700"></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const TableRenderer = ({
  table,
  sectionIdx,
  tableIdx,
}: {
  table: any;
  sectionIdx: number;
  tableIdx: number;
}) => {
  if (!table.headers || !table.rows) return null;

  const getTableAnchor = (table: any, sectionIdx: number, tableIdx: number) => {
    const base =
      table.tableOfContent || table.title || `table-${sectionIdx}-${tableIdx}`;
    return base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  return (
    <div className="mt-6" id={getTableAnchor(table, sectionIdx, tableIdx)}>
      <div className="flex items-center gap-2 mt-2 mb-4">
        <div className="p-2 flex-shrink-0 flex items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
            className="w-5 h-5"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M3 9h18M3 15h18M9 21V3M15 21V3" />
          </svg>
        </div>
        <div className="text-lg md:text-xl font-bold font-sans text-gray-900 dark:text-white leading-tight m-0 p-0">
          {table.title}
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full border font-sans">
          <thead className="bg-gray-50 dark:bg-gray-800 m-0 !m-0">
            <tr>
              {table.headers.map((header: string, index: number) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-base md:text-lg font-semibold font-sans text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600 last:border-r-0"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 m-0 !m-0">
            {table.rows.map((row: string[], rowIndex: number) => (
              <tr
                key={rowIndex}
                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
              >
                {row.map((cell: string, cellIndex: number) => (
                  <td
                    key={cellIndex}
                    className="px-4 py-3 text-base md:text-lg font-sans text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 last:border-r-0 align-top"
                  >
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert m-0 p-0 font-sans text-base md:text-lg [&>*]:m-0 [&>*:last-child]:mb-0"
                      dangerouslySetInnerHTML={{ __html: cell }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function Sections({ sections }: { sections: Section[] }) {
  
  const [activeSection, setActiveSection] = useState(0);

  const getSectionAnchor = (section: Section, idx: number) => {
    const base = section.tableOfContent || section.title || `section-${idx}`;
    return base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const getTableAnchor = (
    section: Section,
    table: any,
    sectionIdx: number,
    tableIdx: number
  ) => {
    const base =
      table.tableOfContent || table.title || `table-${sectionIdx}-${tableIdx}`;
    return base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTocClick = (anchor: string) => {
    const el = document.getElementById(anchor);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const offsets = sections.map((section, idx) => {
        const el = document.getElementById(getSectionAnchor(section, idx));
        return el ? el.getBoundingClientRect().top : Infinity;
      });
      const threshold = 120;
      const activeIdx = offsets.findIndex(
        (top, idx) => top > threshold && idx > 0
      );
      setActiveSection(
        activeIdx === -1 ? sections.length - 1 : Math.max(0, activeIdx - 1)
      );
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <Container>
      <div className="mx-auto flex flex-col md:flex-row items-start gap-2">
        {/* Main Content: Sections */}
        <div className="w-full flex-1 min-w-0 space-y-12">
          {sections.map((section, idx) => (
            <div
              key={section.id}
              className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 ease-out"
              style={{
                animationDelay: `${idx * 150}ms`,
                animationFillMode: "both",
              }}
              id={getSectionAnchor(section, idx)}
            >
              <div
                className="group space-y-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:p-6 
                                          transition-all duration-500 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600
                                          bg-card"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 
                                                  text-purple-600 dark:text-purple-300 group-hover:from-purple-200 group-hover:to-blue-200 
                                                  dark:group-hover:from-purple-800/50 dark:group-hover:to-blue-800/50 transition-all duration-300"
                  >
                    <FileText className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold font-sans text-gray-900 dark:text-white">
                    {section.title}
                  </h2>
                </div>
                <div
                  className="text-base md:text-lg font-sans text-gray-600 dark:text-gray-300 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: section.description }}
                />
                {section.tables && section.tables.length > 0 && (
                  <div className="space-y-6">
                    {section.tables.map((table, tableIdx) => (
                      <TableRenderer
                        key={table.id}
                        table={table}
                        sectionIdx={idx}
                        tableIdx={tableIdx}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {sections.length > 1 && (
          <nav className="toc-nav w-full md:w-80 flex-shrink-0 mt-8 md:mt-0">
            <div
              className="md:sticky md:top-48 md:mt-0 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 
                                      bg-card shadow-lg backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50">
                  <Bookmark className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                </div>
                <h2 className="text-base md:text-lg lg:text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Table of Contents
                </h2>
              </div>
              <ul className="space-y-1">
                {sections.map((section, idx) => {
                  // Only show section in TOC if isTableOfContentVisible is true
                  if (!section.isTableOfContentVisible) return null;

                  return (
                    <li key={section.id}>
                      <button
                        className={`w-full text-left px-0 py-2 transition-all duration-200 font-semibold focus:outline-none text-sm md:text-base lg:text-lg rounded-lg
                                                    ${
                                                      activeSection === idx
                                                        ? "border-l-4 border-blue-500 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30 shadow-sm"
                                                        : "border-l-4 border-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-300 hover:border-l-blue-300 dark:hover:border-l-blue-600"
                                                    }`}
                        onClick={() =>
                          handleTocClick(getSectionAnchor(section, idx))
                        }
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                              activeSection === idx
                                ? "bg-blue-500"
                                : "bg-gray-300 dark:bg-gray-600"
                            }`}
                          />
                          {section.tableOfContent ||
                            section.title ||
                            `Section ${idx + 1}`}
                        </div>
                      </button>

                      {/* Show tables in TOC if they have isTableOfContentVisible set to true */}
                      {section.tables && section.tables.length > 0 && (
                        <ul className="ml-4 mt-1 space-y-1">
                          {section.tables.map((table, tableIdx) => {
                            if (!table.isTableOfContentVisible) return null;

                            return (
                              <li key={table.id}>
                                <button
                                  className="w-full text-left px-3 py-1.5 transition-all duration-200 text-sm focus:outline-none rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-300"
                                  onClick={() =>
                                    handleTocClick(
                                      getTableAnchor(
                                        section,
                                        table,
                                        idx,
                                        tableIdx
                                      )
                                    )
                                  }
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500" />
                                    {table.tableOfContent ||
                                      table.title ||
                                      `Table ${tableIdx + 1}`}
                                  </div>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
        )}
      </div>
    </Container>
  );
}
