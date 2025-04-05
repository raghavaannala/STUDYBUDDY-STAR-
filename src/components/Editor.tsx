import React, { useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

declare global {
  interface Window {
    monaco: any; // Simplify with any type to avoid TypeScript errors
  }
}

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  readOnlyRanges: Array<[number, number]>;
  template: string;
  startingLine: number;
  endLine: number;
}

export default function Editor({ value, onChange, language, readOnlyRanges, template, startingLine, endLine }: EditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      // Define custom theme
      const monaco = window.monaco;
      monaco.editor.defineTheme('leetcode-theme', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '#6b737c', fontStyle: 'italic' },
          { token: 'keyword', foreground: '#c678dd' },
          { token: 'string', foreground: '#98c379' },
          { token: 'number', foreground: '#d19a66' },
          { token: 'operator', foreground: '#56b6c2' },
          { token: 'function', foreground: '#61afef', fontStyle: 'bold' },
          { token: 'class', foreground: '#e5c07b', fontStyle: 'bold' }
        ],
        colors: {
          'editor.background': '#000000',
          'editor.foreground': '#f8f8f8',
          'editor.lineHighlightBackground': '#121212',
          'editorCursor.foreground': '#528bff',
          'editorWhitespace.foreground': '#3b4048',
          'editorLineNumber.foreground': '#495162',
          'editorLineNumber.activeForeground': '#abb2bf',
          'editor.selectionBackground': '#3e4451',
          'editor.inactiveSelectionBackground': '#3e4451'
        }
      });

      // Apply theme
      editorRef.current.updateOptions({
        theme: 'leetcode-theme'
      });

      // Add read-only decorations
      const decorations = readOnlyRanges.map(([start, end]) => ({
        range: new monaco.Range(start, 1, end, 1),
        options: {
          inlineClassName: 'readonly-code',
          isWholeLine: true,
          linesDecorationsClassName: 'readonly-line-decoration'
        }
      }));

      editorRef.current.createDecorationsCollection(decorations);
    }
  }, [readOnlyRanges]);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    const monaco = window.monaco;

    // Add custom CSS for read-only regions
    const style = document.createElement('style');
    style.textContent = `
      .readonly-code {
        background-color: #121212 !important;
        opacity: 0.8;
        cursor: not-allowed !important;
      }
      .readonly-line-decoration {
        background-color: #121212 !important;
        border-left: 2px solid #3e4451;
        margin-left: 3px;
      }
      .editable-region {
        background-color: #0a0a0a;
        border-left: 2px solid #528bff;
        margin-left: 3px;
      }
    `;
    document.head.appendChild(style);

    // Add editable region decoration
    editor.deltaDecorations([], [{
      range: new monaco.Range(startingLine, 1, endLine, 1),
      options: {
        isWholeLine: true,
        linesDecorationsClassName: 'editable-region'
      }
    }]);

    editor.updateOptions({
      readOnly: false,
      minimap: { enabled: false },
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      renderLineHighlight: 'all',
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
      tabSize: 4,
      wordWrap: 'off',
      formatOnPaste: true,
      formatOnType: true,
      autoIndent: 'full',
      scrollbar: {
        vertical: 'visible',
        horizontal: 'visible',
        useShadows: false,
        verticalScrollbarSize: 16,
        horizontalScrollbarSize: 16,
        alwaysConsumeMouseWheel: false
      }
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      // Only allow editing within the editable region
      const lines = value.split('\n');
      const editableLines = lines.slice(startingLine - 1, endLine);
      onChange(editableLines.join('\n'));
    }
  };

  return (
    <div className="h-full relative">
      <MonacoEditor
        height="100%"
        defaultLanguage={language === 'python' ? 'python' : 'javascript'}
        value={template}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          readOnly: false,
          minimap: { enabled: false },
          theme: 'vs-dark',
          wordWrap: 'off',
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            verticalScrollbarSize: 16,
            horizontalScrollbarSize: 16
          }
        }}
      />
    </div>
  );
} 