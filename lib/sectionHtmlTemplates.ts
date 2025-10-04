export function renderHeading(text: string, level: number = 2) {
  const tag = `h${level}`;
  const classes = level === 2
    ? 'section-title text-xl md:text-2xl font-bold font-sans text-gray-900 dark:text-white'
    : 'font-semibold font-sans my-0 text-gray-900 dark:text-white';
  return `<${tag} class="${classes}">${text}</${tag}>`;
}

export function renderDescription(html: string) {
  return `<div class="section-description prose prose-lg dark:prose-invert max-w-full w-full break-words whitespace-pre-line font-sans text-base md:text-lg text-foreground dark:text-white/80">${html}</div>`;
}

export function renderList(items: string[], ordered: boolean = false) {
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag} class="list-disc pl-6 mb-4 w-full break-words whitespace-normal font-sans text-base md:text-lg">${items.map(item => `<li>${item}</li>`).join('')}</${tag}>`;
}

export function renderTableAsHTML(table: any, sectionIdx: number, tableIdx: number): string {
  if (!table) return '';

  const tableIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-5 h-5">
    <rect width="18" height="18" x="3" y="3" rx="2"/>
    <path d="M3 9h18M3 15h18M9 21V3M15 21V3"/>
  </svg>`;

  let rowsData = (table.rows || []).filter((row: any) => row.some((cell: any) => cell && cell.trim() !== ''));
  if (rowsData.length > 0) {
    const lastRowIdx = rowsData.length - 1;
    rowsData[lastRowIdx] = rowsData[lastRowIdx].map((cell: any) => typeof cell === 'string' ? cell.replace(/\s+$/, '') : cell);
  }

  const headers = (table.headers || []).map((h: any, index: number) =>
    `<th class="px-4 py-3 text-left text-base md:text-lg font-semibold font-sans text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600 last:border-r-0">${h}</th>`
  ).join('');

  const rows = rowsData.map((row: any, rowIndex: number) =>
    `<tr class="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">${row.map((cell: any, cellIndex: number) =>
      `<td class="px-4 py-3 text-base md:text-lg font-sans text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 last:border-r-0 align-top">
        <div class="prose prose-sm max-w-none dark:prose-invert m-0 p-0 font-sans text-base md:text-lg [&>*]:m-0 [&>*:last-child]:mb-0">${cell}</div>
      </td>`
    ).join('')}</tr>`
  ).join('');

  return `
    <div id="table-${sectionIdx}-${tableIdx}">
      <div class="flex items-center gap-2 mt-2">
        <div class="p-2 flex-shrink-0 flex items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300">
          ${tableIcon}
        </div>
        <div class="text-lg md:text-xl font-bold font-sans text-gray-900 dark:text-white leading-tight m-0 p-0">
          ${table.title || ''}
        </div>
      </div>
      <div class="w-full overflow-x-auto">
        <table class="w-full border rounded-md font-sans">
          <thead class="bg-gray-50 dark:bg-gray-800 m-0 !m-0">
            <tr>
              ${headers}
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 m-0 !m-0">
            ${rows}
          </tbody>
          ${table.caption ? `<caption class="caption-bottom text-xs text-gray-500 dark:text-gray-400 mt-2 font-sans text-base m-0 !m-0">${table.caption}</caption>` : ''}
        </table>
      </div>
    </div>
  `;
}

// Section template
export function renderSectionHTML({ title, description, tables }: { title: string, description: string, tables: any[] }) {
  const tablesHTML = tables.map((table, idx) => renderTableAsHTML(table, 0, idx)).join('');
  return `
    <section class="section-content">
      ${renderHeading(title, 2)}
      ${renderDescription(description)}
      <div class="section-tables">${tablesHTML}</div>
    </section>
  `;
} 