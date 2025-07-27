import React, { forwardRef } from 'react';
import { MDXEditor, headingsPlugin, listsPlugin, quotePlugin, thematicBreakPlugin, markdownShortcutPlugin, codeBlockPlugin, codeMirrorPlugin, tablePlugin, linkPlugin, linkDialogPlugin, imagePlugin, BoldItalicUnderlineToggles, UndoRedo, CodeToggle, ListsToggle, BlockTypeSelect, CreateLink, InsertImage, InsertTable, InsertThematicBreak, toolbarPlugin, diffSourcePlugin, sandpackPlugin } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

interface MarkdownEditorProps {
  markdown: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  className?: string;
}

const MarkdownEditor = forwardRef<MDXEditor, MarkdownEditorProps>(
  ({ markdown, onChange, placeholder, className }, ref) => {
    return (
      <div className={`border border-border rounded-md overflow-hidden ${className}`}>
        <MDXEditor
          ref={ref}
          markdown={markdown}
          onChange={onChange}
          placeholder={placeholder || "팁을 작성해주세요..."}
          plugins={[
            // Essential plugins for text editing
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            markdownShortcutPlugin(),
            
            // Code highlighting
            codeBlockPlugin({
              defaultCodeBlockLanguage: 'javascript',
            }),
            codeMirrorPlugin({
              codeBlockLanguages: {
                javascript: 'JavaScript',
                typescript: 'TypeScript',
                jsx: 'JSX',
                tsx: 'TSX',
                python: 'Python',
                java: 'Java',
                cpp: 'C++',
                c: 'C',
                css: 'CSS',
                html: 'HTML',
                json: 'JSON',
                yaml: 'YAML',
                sql: 'SQL',
                bash: 'Bash',
                shell: 'Shell',
                markdown: 'Markdown',
                php: 'PHP',
                ruby: 'Ruby',
                go: 'Go',
                rust: 'Rust',
              },
            }),
            
            // Additional plugins
            tablePlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            imagePlugin(),
            
            // Toolbar
            toolbarPlugin({
              toolbarContents: () => (
                <div className="flex flex-wrap items-center gap-2 p-2 bg-muted/30">
                  <UndoRedo />
                  <div className="w-px h-6 bg-border mx-2" />
                  <BoldItalicUnderlineToggles />
                  <div className="w-px h-6 bg-border mx-2" />
                  <BlockTypeSelect />
                  <div className="w-px h-6 bg-border mx-2" />
                  <CodeToggle />
                  <CreateLink />
                  <InsertImage />
                  <div className="w-px h-6 bg-border mx-2" />
                  <ListsToggle />
                  <InsertTable />
                  <InsertThematicBreak />
                </div>
              ),
            }),
          ]}
          contentEditableClassName="prose prose-sm dark:prose-invert max-w-none p-4 min-h-[300px] focus:outline-none"
        />
      </div>
    );
  }
);

MarkdownEditor.displayName = 'MarkdownEditor';

export default MarkdownEditor;