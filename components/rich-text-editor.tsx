"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  Strikethrough,
  Type,
  MoreHorizontal,
  Paintbrush,
  Link,
  Unlink
} from "lucide-react";
import { cn } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minWords?: number;
  maxWords?: number;
  className?: string;
  error?: boolean;
}

const TEXT_COLORS = [
  { name: "Default", value: "inherit" },
  { name: "Black", value: "#000000" },
  { name: "Gray", value: "#6b7280" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
  { name: "Green", value: "#22c55e" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter text here...",
  minWords = 15,
  maxWords = 500,
  className,
  error
}: RichTextEditorProps) {
   
  const [localContent, setLocalContent] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const isUpdatingRef = useRef(false);
  const selectedTextRef = useRef<string>("");
  const savedSelectionRef = useRef<Range | null>(null);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      if (!initializedRef.current || value === "") {
        editorRef.current.innerHTML = value || "";
        setLocalContent(value || "");
        calculateWordCount(value || "");
        if (!initializedRef.current) {
          initializedRef.current = true;
        }
      } else {
        editorRef.current.innerHTML = value;
        setLocalContent(value);
        calculateWordCount(value);
      }
    }
  }, [value]);

  const calculateWordCount = (text: string) => {
    const words = text?.trim().split(/\s+/)?.filter(Boolean)?.length;
    setWordCount(words || 0);
  };

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    if (isUpdatingRef.current) return;
    
    const newContent = e.currentTarget.innerHTML;
    setLocalContent(newContent);
    calculateWordCount(newContent);
    onChange(newContent);
  };

  const applyFormat = (format: string) => {
    if (!editorRef.current) return;
    
    if (!isFocused) {
      editorRef.current.focus();
    }
    
    isUpdatingRef.current = true;
    
    try {
      if (format.includes(':')) {
        const [cmd, val] = format.split(':');
        document.execCommand(cmd, false, val);
      } else {
        document.execCommand(format, false);
      }
      
      if (editorRef.current) {
        const newContent = editorRef.current.innerHTML;
        setLocalContent(newContent);
        calculateWordCount(newContent);
        onChange(newContent);
      }
    } finally {
      isUpdatingRef.current = false;
    }
  };

  const applyColor = (color: string) => {
    if (!editorRef.current) return;
    
    if (!isFocused) {
      editorRef.current.focus();
    }
    
    isUpdatingRef.current = true;
    
    try {
      document.execCommand('foreColor', false, color);
      
      if (editorRef.current) {
        const newContent = editorRef.current.innerHTML;
        setLocalContent(newContent);
        calculateWordCount(newContent);
        onChange(newContent);
      }
    } finally {
      isUpdatingRef.current = false;
      setShowColorPicker(false);
    }
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
      return selection.toString();
    }
    return "";
  };

  const restoreSelection = () => {
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
      }
    }
  };

  const handleLinkClick = () => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    
    const selectedText = saveSelection();
    
    if (selectedText) {
      selectedTextRef.current = selectedText;
      setLinkText(selectedText);
    } else {
      selectedTextRef.current = "";
      setLinkText("");
    }
    
    setLinkUrl("");
    setShowLinkDialog(true);
  };

  const insertLink = () => {
    if (!editorRef.current) return;

    if (!linkUrl.trim()) return;


    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    const fullUrl = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;

    if (!urlPattern.test(fullUrl)) {
      alert('Please enter a valid URL');
      return;
    }

    isUpdatingRef.current = true;

    try {
      editorRef.current.focus();
      

      restoreSelection();
      
      if (selectedTextRef.current && savedSelectionRef.current) {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(savedSelectionRef.current);
          
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const selectedContent = range.extractContents();
            

            const linkElement = document.createElement('a');
            linkElement.href = fullUrl;
            linkElement.target = '_blank';
            linkElement.rel = 'noopener noreferrer';
            linkElement.style.textDecoration = 'underline';
            linkElement.style.background = 'transparent !important';
            

            linkElement.appendChild(selectedContent);
            

            range.insertNode(linkElement);
            
            selection.removeAllRanges();
          }
        }
      } else if (linkText.trim()) {
        const linkHTML = `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration: underline; background: transparent;">${linkText}</a>`;
        document.execCommand('insertHTML', false, linkHTML);
      } else {
        const linkHTML = `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration: underline; background: transparent;">${fullUrl}</a>`;
        document.execCommand('insertHTML', false, linkHTML);
      }

      if (editorRef.current) {
        const newContent = editorRef.current.innerHTML;
        setLocalContent(newContent);
        calculateWordCount(newContent);
        onChange(newContent);
      }
    } finally {
      isUpdatingRef.current = false;
      setShowLinkDialog(false);
      setLinkUrl("");
      setLinkText("");
      selectedTextRef.current = "";
      savedSelectionRef.current = null;
    }
  };

  const removeLink = () => {
    if (!editorRef.current) return;
    
    if (!isFocused) {
      editorRef.current.focus();
    }
    
    isUpdatingRef.current = true;
    
    try {
      document.execCommand('unlink', false);
      
      if (editorRef.current) {
        const newContent = editorRef.current.innerHTML;
        setLocalContent(newContent);
        calculateWordCount(newContent);
        onChange(newContent);
      }
    } finally {
      isUpdatingRef.current = false;
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const showPlaceholder = localContent === '' && !isFocused;

  return (
    <div className={cn("border rounded-md overflow-hidden", 
      error ? "border-red-500" : "border-input",
      className
    )}>
      {/* Toolbar */}
      <div className="flex items-center p-2 border-b bg-background gap-1 flex-wrap">
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-sm" 
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('undo');
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>
        </Button>
        
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-sm" 
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('redo');
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"></path></svg>
        </Button>
        
        <span className="w-px h-6 bg-border mx-1" />
        
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-sm" 
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('bold');
          }}
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-sm" 
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('italic');
          }}
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-sm" 
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('underline');
          }}
        >
          <Underline className="h-4 w-4" />
        </Button>
        
        <span className="w-px h-6 bg-border mx-1" />
        
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-sm" 
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('insertUnorderedList');
          }}
        >
          <List className="h-4 w-4" />
        </Button>
        
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-sm" 
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('insertOrderedList');
          }}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        
        <span className="w-px h-6 bg-border mx-1" />
        

        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-sm" 
          onMouseDown={(e) => {
            e.preventDefault();
            handleLinkClick();
          }}
          title="Add Link"
        >
          <Link className="h-4 w-4" />
        </Button>
        
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-sm" 
          onMouseDown={(e) => {
            e.preventDefault();
            removeLink();
          }}
          title="Remove Link"
        >
          <Unlink className="h-4 w-4" />
        </Button>
        
        <span className="w-px h-6 bg-border mx-1" />
        
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-sm" 
          onMouseDown={(e) => {
            e.preventDefault(); 
            applyFormat('strikeThrough');
          }}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        
        {/* Color Picker */}
        <div className="relative">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-sm" 
            onMouseDown={(e) => {
              e.preventDefault(); 
              setShowColorPicker(!showColorPicker);
            }}
          >
            <Paintbrush className="h-4 w-4" />
          </Button>
          
          {showColorPicker && (
            <div className="absolute top-full left-0 z-50 mt-1 bg-background border rounded-md shadow-md p-2 w-60">
              <div className="grid grid-cols-5 gap-1">
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className="w-8 h-8 rounded-md border flex items-center justify-center hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: color.value }}
                    onMouseDown={(e) => {
                      e.preventDefault(); 
                      applyColor(color.value);
                    }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="relative group">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-sm"
            onMouseDown={(e) => {
              e.preventDefault();
            }}
          >
            <Type className="h-4 w-4" />
          </Button>
          <div className="hidden group-hover:block absolute top-full left-0 z-50 bg-background border rounded-md shadow-md p-2">
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start"
              onMouseDown={(e) => {
                e.preventDefault();
                applyFormat('formatBlock:p');
              }}
            >
              Paragraph
            </Button>
          </div>
        </div>
        
        <div className="relative group ml-auto">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-sm"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4">Add Link</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="linkText">Link Text</Label>
                <Input
                  id="linkText"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Enter link text"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="linkUrl">URL</Label>
                <Input
                  id="linkUrl"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowLinkDialog(false);
                  setLinkUrl("");
                  setLinkText("");
                  selectedTextRef.current = "";
                  savedSelectionRef.current = null;
                  if (editorRef.current) {
                    editorRef.current.focus();
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={insertLink}
                disabled={!linkUrl.trim()}
              >
                Add Link
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Editor Area */}
      <div className="relative min-h-[200px]">
        {showPlaceholder && (
          <div className="absolute top-0 left-0 p-3 text-muted-foreground pointer-events-none">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          className="min-h-[200px] p-3 focus:outline-none [&_a]:underline [&_a]:bg-transparent hover:[&_a]:opacity-80"
          contentEditable={true}
          onInput={handleContentChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          suppressContentEditableWarning={true}
          style={{
            wordBreak: 'break-word'
          }}
        />
      </div>
      
      {/* Word Count */}
      <div className="text-xs text-right p-2 text-muted-foreground border-t">
        {wordCount}/{maxWords} Words{minWords > 0 ? ` (Min ${minWords} Words)` : ''}
      </div>
    </div>
  );
}