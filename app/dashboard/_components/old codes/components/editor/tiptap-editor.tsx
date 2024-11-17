'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Typography from '@tiptap/extension-typography'
import TextAlign from '@tiptap/extension-text-align'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Bold, Italic, Heading2, List, Quote, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { forwardRef, useImperativeHandle } from 'react'

interface TiptapEditorProps {
    content: string;
    onContentChange: (newContent: string) => void;
}

interface EditorRef {
    clearContent: () => void;
}

const TiptapEditor = forwardRef<EditorRef, TiptapEditorProps>(({ content, onContentChange }, ref) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Typography,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: content || '',
        onUpdate: ({ editor }) => {
            onContentChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[200px] max-w-none',
            },
        },
    })

    useImperativeHandle(ref, () => ({
        clearContent: () => {
            editor?.commands.clearContent();
        },
    }), [editor]);

    if (!editor) return null

    return (
        <Card className="w-full max-w-4xl mx-auto my-8">
            <div className="border-b p-2 flex items-center gap-2 flex-wrap">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive('bold') ? 'bg-muted' : ''}
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive('italic') ? 'bg-muted' : ''}
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
                >
                    <Heading2 className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive('bulletList') ? 'bg-muted' : ''}
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={editor.isActive('blockquote') ? 'bg-muted' : ''}
                >
                    <Quote className="h-4 w-4" />
                </Button>

                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    >
                        <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    >
                        <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    >
                        <AlignRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <EditorContent editor={editor} />
        </Card>
    )
})

TiptapEditor.displayName = 'TiptapEditor';

export default TiptapEditor;