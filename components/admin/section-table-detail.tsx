import { formLabelClasses } from "@/lib/constant";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import * as React from "react";
import { PlusIcon, Trash2, X, ClipboardPaste } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Section, Table } from "@/lib/types/section";
import { generateTableID } from "@/lib/utils";


function SectionTableDetail({ 
  formData, 
  setFormData, 
  formErrors 
}: { 
  formData: Section, 
  setFormData: (formData: Section) => void, 
  formErrors: any 
}) {
  const { toast } = useToast();
  const [currentTableIdx, setCurrentTableIdx] = useState(0);

  useEffect(() => {
    if (!formData.tables || formData.tables.length === 0) {
      const newTable = {
        id: Math.random().toString(36).substr(2, 9),
        title: "",
        tableOfContent: "",
        headers: [],
        rows: [],
        isActive: true,
        isTableOfContentVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setFormData({ ...formData, tables: [newTable] });
      setCurrentTableIdx(0);
    }
  }, [formData, setFormData]);

  const tables = formData.tables || [];
  const table = tables[currentTableIdx] || tables[0];

  const [newHeader, setNewHeader] = useState("");
  const [newRow, setNewRow] = useState<string[]>([]);
  const [pasteData, setPasteData] = useState("");


  if (!table) {
    return <div className="text-center text-muted-foreground py-8">No table found. Please add a table.</div>;
  }

  const updateTable = (updates: Partial<Table>) => {
    const updatedTable = {
      ...table,
      ...updates,
      updatedAt: new Date()
    };
    setFormData({
      ...formData,
      tables: tables.map((t, i) => i === currentTableIdx ? updatedTable : t)
    });
  };

  const parsePastedData = (data: string) => {
    const lines = data.trim().split('\n').filter(line => line.trim());
    if (lines.length === 0) return null;

    const linesWithTabs = lines.filter(line => line.includes('\t'));
    const linesWithMultipleSpaces = lines.filter(line => line.match(/\s{3,}/));
    
    const hasTabsOrMultipleSpaces = linesWithTabs.length > lines.length * 0.5 || 
                                    linesWithMultipleSpaces.length > lines.length * 0.5;

    if (hasTabsOrMultipleSpaces) {
      const parsedLines = lines.map(line => {
        if (line.includes('\t')) {
          return line.split('\t').map(cell => cell.trim()).filter(cell => cell.length > 0);
        }
        
        if (line.match(/\s{2,}/)) {
          return line.split(/\s{2,}/).map(cell => cell.trim()).filter(cell => cell.length > 0);
        }

        return line.split(/\s+/).map(cell => cell.trim()).filter(cell => cell.length > 0);
      });

      const validLines = parsedLines.filter(line => line.length > 1);
      
      if (validLines.length === 0) return null;

      const headers = validLines[0];
      const rows = validLines.slice(1);

      const normalizedRows = rows.map(row => {
        const normalizedRow = [...row];
        while (normalizedRow.length < headers.length) {
          normalizedRow.push('');
        }
        return normalizedRow.slice(0, headers.length);
      });

      return { headers, rows: normalizedRows };
    } else {
      let columnCount = 4;
      const possibleCounts = [];
      
      if (lines.length >= 8) {
        for (let cols = 2; cols <= Math.min(8, Math.floor(lines.length / 2)); cols++) {
          if (lines.length % cols === 0) {
            possibleCounts.push(cols);
          }
        }
        
        console.log("Possible column counts with perfect divisibility:", possibleCounts);

        // Prefer counts between 3-6, then 4, then others
        if (possibleCounts.includes(4)) {
          columnCount = 4;
        } else if (possibleCounts.find(c => c >= 3 && c <= 6)) {
          columnCount = possibleCounts.find(c => c >= 3 && c <= 6)!;
        } else if (possibleCounts.length > 0) {
          columnCount = possibleCounts.find(c => c > 2) || possibleCounts[0];
        }
      }
      
      if (lines.length % columnCount !== 0) {
        let bestFit = columnCount;
        let minRemainder = lines.length % columnCount;
        
        for (let cols = 2; cols <= 8; cols++) {
          const remainder = lines.length % cols;
          if (remainder < minRemainder && remainder < cols) {
            bestFit = cols;
            minRemainder = remainder;
          }
        }
        columnCount = bestFit;
      }
      
      const headers = lines.slice(0, columnCount);
      const remainingLines = lines.slice(columnCount);
      
      const rows: string[][] = [];
      for (let i = 0; i < remainingLines.length; i += columnCount) {
        const row = remainingLines.slice(i, i + columnCount);
        if (row.length === columnCount) {
          rows.push(row);
        } else if (row.length > 0) {
          const paddedRow = [...row];
          while (paddedRow.length < columnCount) {
            paddedRow.push('');
          }
          rows.push(paddedRow);
        }
      }
      
      if (headers.length > 0 && rows.length > 0) {
        return { headers, rows };
      }
      
      for (let tryColumns = 2; tryColumns <= 6; tryColumns++) {
        if (lines.length >= tryColumns * 2) {
          const testHeaders = lines.slice(0, tryColumns);
          const testRemaining = lines.slice(tryColumns);
          const testRows: string[][] = [];
          
          for (let i = 0; i < testRemaining.length; i += tryColumns) {
            const row = testRemaining.slice(i, i + tryColumns);
            if (row.length === tryColumns) {
              testRows.push(row);
            }
          }
          
          if (testRows.length > 0) {
            return { headers: testHeaders, rows: testRows };
          }
        }
      }
      
      return null;
    }
  };

  const handlePasteData = () => {
    if (!pasteData.trim()) {
      toast({
        title: "Validation Error",
        description: "Please paste some data first",
        variant: "destructive",
      });
      return;
    }

    const parsed = parsePastedData(pasteData);
    
    if (!parsed) {
      toast({
        title: "Parse Error",
        description: "Could not parse the pasted data. Please ensure it's properly formatted with tabs or multiple spaces as separators.",
        variant: "destructive",
      });
      return;
    }

    const { headers, rows } = parsed;

    updateTable({
      headers,
      rows
    });

    setNewRow(new Array(headers.length).fill(""));
    setPasteData("");

    toast({
      title: "Success",
      description: `Imported ${headers.length} columns and ${rows.length} rows`,
      variant: "default",
    });
  };

  const addHeader = () => {
    if (!newHeader.trim()) {
      toast({
        title: "Validation Error",
        description: "Header name is required",
        variant: "destructive",
      });
      return;
    }

    if (table.headers.includes(newHeader.trim())) {
      toast({
        title: "Validation Error",
        description: "Header already exists",
        variant: "destructive",
      });
      return;
    }

    updateTable({
      headers: [...table.headers, newHeader.trim()],
      rows: table.rows.map(row => [...row, ""]) // Add empty cell to all existing rows
    });
    
    setNewHeader("");
    setNewRow([...newRow, ""]);
  };

  const removeHeader = (index: number) => {
    updateTable({
      headers: table.headers.filter((_: string, i: number) => i !== index),
      rows: table.rows.map((row: any[]) => row.filter((_: any, i: number) => i !== index))
    });
    
    const newRowData = newRow.filter((_: string, i: number) => i !== index);
    setNewRow(newRowData);
  };

  const addRow = () => {
    if (table.headers.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add headers first",
        variant: "destructive",
      });
      return;
    }

    if (newRow.some((cell: string) => !cell?.trim())) {
      toast({
        title: "Validation Error",
        description: "Please fill all cells in the row",
        variant: "destructive",
      });
      return;
    }

    updateTable({
      rows: [...table.rows, [...newRow]]
    });
    
    setNewRow(new Array(table.headers.length).fill(""));
  };

  const removeRow = (index: number) => {
    updateTable({
      rows: table.rows.filter((_: any[], i: number) => i !== index)
    });
  };

  const updateCellValue = (rowIndex: number, cellIndex: number, value: string) => {
    const newRows = [...table.rows];
    newRows[rowIndex] = [...newRows[rowIndex]];
    newRows[rowIndex][cellIndex] = value;

    updateTable({ rows: newRows });
  };

  const updateRowInProgress = (cellIndex: number, value: string) => {
    const newRowData = [...newRow];
    newRowData[cellIndex] = value;
    setNewRow(newRowData);
  };

  const clearTable = () => {
    updateTable({
      title: "",
      headers: [],
      rows: []
    });
    setNewRow([]);
    setPasteData("");
    
    toast({
      title: "Table Cleared",
      description: "All table data has been cleared",
      variant: "default",
    });
  };

  const addNewTable = () => {
    if (table.headers.length === 0 || table.rows.length === 0) {
      toast({ title: 'Cannot add empty table', description: 'Please add at least one header and one row before adding a new table.', variant: 'destructive' });
      return;
    }
    const newTable = {
      title: "",
      tableOfContent: "",
      headers: [],
      rows: [],
      isActive: true,
      isTableOfContentVisible: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setFormData({ ...formData, tables: [...tables, newTable] });
    setCurrentTableIdx(tables.length); 
  };

  const removeTable = (idx: number) => {
    if (tables.length === 1) {
      toast({ title: "At least one table required", variant: "destructive" });
      return;
    }
    const newTables = tables.filter((_, i) => i !== idx);
    setFormData({ ...formData, tables: newTables });
    setCurrentTableIdx(idx === 0 ? 0 : idx - 1);
  };

  return (
    <div className="space-y-6">
      {/* Table Tabs UI */}
      <div className="flex items-center gap-2 mb-4">
        {tables.map((t, idx) => (
          <button
            key={t.id}
            className={`px-4 py-2 rounded-md border ${idx === currentTableIdx ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-border'}`}
            onClick={() => setCurrentTableIdx(idx)}
            type="button"
          >
            {t.title || `Table ${idx + 1}`}
            {tables.length > 1 && (
              <span
                className="ml-2 text-destructive cursor-pointer"
                onClick={e => { e.stopPropagation(); removeTable(idx); }}
                title="Remove table"
              >
                ×
              </span>
            )}
          </button>
        ))}
        <button
          type="button"
          className="ml-2 px-3 py-2 rounded-md bg-green-100 text-green-800 border border-green-300 hover:bg-green-200"
          onClick={addNewTable}
        >
          + Add Table
        </button>
      </div>
      <div className="space-y-6">
        {/* Paste Data Section */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-md border border-blue-200 dark:border-blue-800">
          <h3 className="font-medium mb-2 text-blue-900 dark:text-blue-100 flex items-center">
            <ClipboardPaste className="h-4 w-4 mr-2" />
            Quick Import from Clipboard
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
            Paste tabular data to quickly populate your table. Supports both formats:
            <br />• <strong>Horizontal:</strong> Tab-separated or space-separated (first row = headers)
            <br />• <strong>Vertical:</strong> Each line is a cell (first N lines = headers, then data in groups)
          </p>
          
          <div className="space-y-3">
            <textarea
              placeholder="Paste your table data here... (e.g., from Excel, Google Sheets, or formatted text)"
              value={pasteData}
              onChange={(e) => setPasteData(e.target.value)}
              className="w-full h-32 p-3 border rounded-md resize-none text-sm font-mono bg-background"
              rows={6}
            />
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePasteData}
                disabled={!pasteData.trim()}
                className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
              >
                <ClipboardPaste className="h-4 w-4 mr-2" />
                Import Data
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPasteData("")}
                disabled={!pasteData.trim()}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-md">
          <h3 className="font-medium mb-2 text-foreground">Manual Table Configuration</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Or manually configure your table by adding a title, headers, and rows of data.
          </p>

          <div className="space-y-6">
            {/* Table Title */}
            <div>
              <label htmlFor="tableTitle" className={`${formLabelClasses} text-foreground`}>
                Table Title <span className="text-destructive">*</span>
              </label>
              <Input
                id="tableTitle"
                placeholder="e.g., Pricing Plans, Features Comparison"
                value={table.title}
                onChange={(e) => updateTable({ title: e.target.value })}
                className="h-12"
              />
              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                <span>Table ID:</span>
                <>
                  <code className="bg-muted px-2 py-1 rounded">{generateTableID(formData.title || 'section', currentTableIdx + 1)}</code>
                  <button
                    type="button"
                    className="text-blue-600 underline text-xs"
                    onClick={() => { navigator.clipboard.writeText(generateTableID(formData.title || 'section', currentTableIdx + 1)); toast({ title: 'Copied!', description: 'Table ID copied to clipboard.' }); }}
                  >
                    Copy
                  </button>
                </>
              </div>
            </div>

            {/* Table of Content */}
            <div>
              <label htmlFor="tableOfContent" className={`${formLabelClasses} text-foreground`}>
                Table of Content
              </label>
              <Input
                id="tableOfContent"
                placeholder="Enter table of content for this table"
                value={table.tableOfContent || ""}
                onChange={(e) => updateTable({ tableOfContent: e.target.value })}
                className="h-12"
              />
            </div>

            {/* Table of Content Visibility */}
            <div className="flex items-center space-x-2">
              <Switch
                id="tableIsTableOfContentVisible"
                checked={table.isTableOfContentVisible ?? true}
                onCheckedChange={(checked) => updateTable({ isTableOfContentVisible: checked })}
              />
              <label htmlFor="tableIsTableOfContentVisible" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Show Table of Content
              </label>
            </div>
            <p className="text-sm text-muted-foreground">
              Toggle to show or hide the table of content for this table.
            </p>

            {/* Headers Section */}
            <div>
              <label className={`${formLabelClasses} text-foreground`}>
                Table Headers <span className="text-destructive">*</span>
              </label>
              <div className="flex space-x-2 mt-2">
                <Input
                  placeholder="Enter header name"
                  value={newHeader}
                  onChange={(e) => setNewHeader(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addHeader()}
                  className="h-10"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addHeader}
                  disabled={!newHeader.trim()}
                >
                  Add Header
                </Button>
              </div>
              
              {table.headers.length > 0 && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-2">
                    {table.headers.map((header, index) => (
                      <div key={index} className="flex items-center bg-secondary px-3 py-2 rounded-md">
                        <span className="text-sm font-medium">{header}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHeader(index)}
                          className="ml-2 h-4 w-4 p-0 hover:bg-destructive/20"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Add Row Section */}
            {table.headers.length > 0 && (
              <div>
                <label className={`${formLabelClasses} text-foreground`}>
                  Add Row Data
                </label>
                <div className="space-y-3 mt-2">
                  <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${table.headers.length}, 1fr)` }}>
                    {table.headers.map((header, index) => (
                      <div key={index}>
                        <label className="text-xs text-muted-foreground mb-1 block">{header}</label>
                        <Input
                          placeholder={`Enter ${header.toLowerCase()}`}
                          value={newRow[index] || ""}
                          onChange={(e) => updateRowInProgress(index, e.target.value)}
                          className="h-10"
                        />
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addRow}
                    disabled={newRow.some((cell: string) => !cell?.trim())}
                    className="w-full"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Row
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table Preview */}
        {table.headers.length > 0 && (
          <div className="bg-card p-4 rounded-md border">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-medium text-foreground">
                  {table.title || "Untitled Table"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {table.rows.length} row{table.rows.length !== 1 ? 's' : ''} • {table.headers.length} column{table.headers.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={clearTable}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Table
              </Button>
            </div>

            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    {table.headers.map((header, index) => (
                      <th key={index} className="text-left p-3 font-medium">
                        {header}
                      </th>
                    ))}
                    {table.rows.length > 0 && (
                      <th className="text-right p-3 font-medium w-20">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b hover:bg-muted/25 transition-colors">
                      {row.map((cell: any, cellIndex: number) => (
                        <td key={cellIndex} className="p-1">
                          <Input
                            value={cell || ""}
                            onChange={(e) => updateCellValue(rowIndex, cellIndex, e.target.value)}
                            className="h-8 text-sm border-none bg-transparent hover:bg-background focus:bg-background"
                            placeholder="Enter value"
                          />
                        </td>
                      ))}
                      <td className="p-1 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRow(rowIndex)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {table.rows.length === 0 && (
                    <tr>
                      <td colSpan={table.headers.length} className="p-8 text-center text-muted-foreground">
                        No rows added yet. Add your first row above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {table.headers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-md border-border bg-muted/20">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <PlusIcon className="h-6 w-6" />
            </div>
            <h3 className="font-medium text-foreground mb-2">Create Your Table</h3>
            <p className="text-sm mb-4">Start by adding a table title and headers</p>
            <p className="text-xs text-muted-foreground">
              Headers define your table columns, then you can add multiple rows of data
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SectionTableDetail; 