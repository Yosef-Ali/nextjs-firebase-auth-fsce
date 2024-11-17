import { Editor } from 'novel';
import type { Editor as TipTapEditor, JSONContent } from '@tiptap/core';
import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';

export type EditorContent = string | JSONContent;

export const defaultValue: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [{ type: "text", text: "This is an example for the editor" }],
    },
    // ... (rest of the defaultValue structure remains the same)
  ],
};

interface NovelEditorProps {
  onContentChange: (content: EditorContent) => void;
  content?: JSONContent;
}

const NovelEditor = forwardRef<{ clearContent: () => void }, NovelEditorProps>(
  ({ onContentChange, content = defaultValue }, ref) => {
    const editorRef = useRef<TipTapEditor | null>(null);

    useImperativeHandle(ref, () => ({
      clearContent: () => {
        if (editorRef.current) {
          editorRef.current.commands.setContent('');
        }
      }
    }));

    useEffect(() => {
      if (editorRef.current && content !== editorRef.current.getJSON()) {
        editorRef.current.commands.setContent(content);
      }
    }, [content]);

    return (
      <Editor
        className='novel-min-h-[500px] novel-w-full novel-max-w-screen-lg novel-bg-white sm:novel-rounded-lg sm:novel-border mb-8 max-h-96 overflow-y-auto novel-prose'
        disableLocalStorage={true}
        defaultValue={content}
        editorProps={{
          attributes: {
            class: `prose prose-lg prose-headings:font-title font-default focus:outline-none max-w-full`,
          },
        }}
        onDebouncedUpdate={(editor?: TipTapEditor) => {
          if (editor) {
            editorRef.current = editor;
            const newContent = editor.getJSON();
            onContentChange(newContent);
          }
        }}
      />
    );
  }
);

NovelEditor.displayName = 'NovelEditor';

export default NovelEditor;