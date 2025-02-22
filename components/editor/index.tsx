'use client';

import { Color } from '@tiptap/extension-color';
import ListItem from '@tiptap/extension-list-item';
import TextStyle from '@tiptap/extension-text-style';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Redo,
  Undo,
  RotateCcw,
  Pilcrow,
  CodeSquare,
  Minus,
  Sparkles,
  Bot,
  Check,
  Wand2,
  Maximize2,
  Minimize2,
  Copy,
  Table as TableIcon,
  Link,
} from 'lucide-react';
import { Separator } from '../ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { aiService } from '@/app/services/ai';
import { toast } from '@/hooks/use-toast';
import { MarkdownPreview } from './markdown-preview';

interface MenuBarProps {
  editor: any;
  isFullscreen: boolean;
  isPreview: boolean;
  onToggleFullscreen: () => void;
  onTogglePreview: () => void;
  onCopyToClipboard: () => void;
}

const MenuBar = ({
  editor,
  isFullscreen,
  isPreview,
  onToggleFullscreen,
  onTogglePreview,
  onCopyToClipboard,
}: MenuBarProps) => {
  if (!editor) {
    return null;
  }

  const onClickHandler = (e: React.MouseEvent, callback: () => boolean) => {
    e.preventDefault();
    callback();
  };

  const handleAIAction = async (action: string) => {
    if (!editor) return;

    // Get the selected text from the editor
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');

    if (!selectedText.trim()) {
      toast({
        title: "No text selected",
        description: "Please select some text to apply AI improvements.",
        variant: "destructive",
      });
      return;
    }

    try {
      let result = '';
      switch (action) {
        case 'enhance':
          result = await aiService.enhanceContent(selectedText);
          break;
        case 'fix':
          result = await aiService.fixSpellingAndGrammar(selectedText);
          break;
        case 'format':
          result = await aiService.improveFormatting(selectedText);
          break;
      }

      if (result) {
        // The result already contains HTML tags for formatting
        // We just need to ensure it's wrapped in a paragraph if it isn't already
        const formattedContent = result.startsWith('<p>') ? result : `<p>${result}</p>`;

        // Replace the selected text with the AI-improved version
        editor
          .chain()
          .focus()
          .deleteRange({ from, to })
          .insertContent(formattedContent)
          .run();

        toast({
          title: "Success",
          description: "Text has been improved with formatting!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process the text. Please try again.",
        variant: "destructive",
      });
    }
  };

  const insertTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b">
      {/* Left side of toolbar */}
      <div className="flex items-center gap-1">
        {/* Text formatting buttons */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => onClickHandler(e, () => editor.chain().focus().toggleBold().run())}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={cn("h-8 w-8", editor.isActive('bold') && "bg-muted")}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => onClickHandler(e, () => editor.chain().focus().toggleItalic().run())}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={cn("h-8 w-8", editor.isActive('italic') && "bg-muted")}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => onClickHandler(e, () => editor.chain().focus().toggleStrike().run())}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={cn("h-8 w-8", editor.isActive('strike') && "bg-muted")}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => onClickHandler(e, () => {
              const url = prompt('Enter the URL');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
                return true;
              }
              return false;
            })}
            className={cn("h-8 w-8")}
          >
            <Link className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => onClickHandler(e, () => editor.chain().focus().toggleHeading({ level: 1 }).run())}
            className={cn("h-8 w-8", editor.isActive('heading', { level: 1 }) && "bg-muted")}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => onClickHandler(e, () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
            className={cn("h-8 w-8", editor.isActive('heading', { level: 2 }) && "bg-muted")}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => onClickHandler(e, () => editor.chain().focus().toggleHeading({ level: 3 }).run())}
            className={cn("h-8 w-8", editor.isActive('heading', { level: 3 }) && "bg-muted")}
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={insertTable}
          className="h-8 w-8"
        >
          <TableIcon className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Sparkles className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleAIAction("enhance")}>
              Enhance Content
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAIAction("fix")}>
              Fix Spelling & Grammar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAIAction("format")}>
              Improve Formatting
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right side of toolbar */}
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onCopyToClipboard}
          className="h-8 w-8"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggleFullscreen}
          className="h-8 w-8"
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onTogglePreview}
          className={cn(isPreview && "bg-muted")}
        >
          Preview
        </Button>
      </div>
    </div>
  );
};

const extensions = [
  Color,
  TextStyle,
  Highlight,
  Typography,
  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableHeader,
  TableCell,
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
    bold: {
      HTMLAttributes: {
        class: 'font-bold text-foreground',
      },
    },
    paragraph: {
      HTMLAttributes: {
        class: 'text-base leading-7 my-4',
      },
    },
    listItem: {
      HTMLAttributes: {
        class: 'ml-4 my-1',
      },
    },
    heading: {
      HTMLAttributes: {
        class: 'font-bold text-foreground tracking-tight mb-2',
      },
    },
  }),
];

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function Editor({ value, onChange }: EditorProps) {
  const [isPreview, setIsPreview] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [editorContent, setEditorContent] = React.useState(value);

  const copyToClipboard = async () => {
    if (editor) {
      const content = editor.getHTML();
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      });
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const editor = useEditor({
    extensions: [
      Color,
      TextStyle,
      Highlight,
      Typography,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'min-h-[350px] w-full rounded-md outline-none',
      },
      handleKeyDown: (view, event) => {
        // Command/Ctrl + / for quick formatting help
        if (event.key === '/' && (event.metaKey || event.ctrlKey)) {
          toast({
            title: "Keyboard Shortcuts",
            description: `
              Ctrl/⌘ + B: Bold
              Ctrl/⌘ + I: Italic
              Ctrl/⌘ + U: Underline
              Ctrl/⌘ + Shift + 1: Heading 1
              Ctrl/⌘ + Shift + 2: Heading 2
              Ctrl/⌘ + Shift + 3: Heading 3
              Ctrl/⌘ + K: Copy to Clipboard
              Ctrl/⌘ + F: Toggle Fullscreen
            `,
          });
          return true;
        }
        // Command/Ctrl + K to copy
        if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
          copyToClipboard();
          return true;
        }
        // Command/Ctrl + F to toggle fullscreen
        if (event.key === 'f' && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          toggleFullscreen();
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      setEditorContent(newContent);
      onChange(newContent);
    },
  });

  return (
    <div className={cn(
      "border border-input bg-background rounded-md transition-all duration-200",
      isFullscreen && "fixed inset-0 z-50 m-0 rounded-none"
    )}>
      <MenuBar
        editor={editor}
        isFullscreen={isFullscreen}
        isPreview={isPreview}
        onToggleFullscreen={toggleFullscreen}
        onTogglePreview={() => setIsPreview(!isPreview)}
        onCopyToClipboard={copyToClipboard}
      />
      <div className={cn(
        "relative",
        isFullscreen && "h-[calc(100vh-4rem)] overflow-auto"
      )}>
        <div className={cn(
          "w-full p-4 transition-opacity duration-200",
          isPreview ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
          <EditorContent editor={editor} />
        </div>
        <div className={cn(
          "w-full p-4 absolute top-0 left-0 transition-opacity duration-200",
          isPreview ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <MarkdownPreview content={editorContent} />
        </div>
      </div>
    </div>
  );
}
