import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  language?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  setCode,
  language = 'javascript'
}) => {
  return (
    <Editor
      height="400px"
      defaultLanguage={language}
      theme="vs-dark"
      value={code}
      onChange={(value) => setCode(value || '')}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        tabSize: 2,
      }}
    />
  );
};

export default CodeEditor;
