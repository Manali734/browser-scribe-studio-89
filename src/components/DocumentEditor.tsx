import { useState, useRef, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from './ui/button';
import { DocumentToolbar } from './DocumentToolbar';
import { AudioPlayer } from './AudioPlayer';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

interface DocumentEditorProps {
  onBack?: () => void;
}

export const DocumentEditor = ({ onBack }: DocumentEditorProps) => {
  const [value, setValue] = useState('');
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const quillRef = useRef<ReactQuill>(null);

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
      ]
    },
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'align', 'color', 'background',
    'script'
  ];

  const handleSave = useCallback(() => {
    localStorage.setItem('document-content', value);
    localStorage.setItem('document-title', documentTitle);
    toast('Document saved successfully!');
  }, [value, documentTitle]);

  const handleLoad = useCallback(() => {
    const savedContent = localStorage.getItem('document-content');
    const savedTitle = localStorage.getItem('document-title');
    
    if (savedContent) {
      setValue(savedContent);
      setDocumentTitle(savedTitle || 'Untitled Document');
      toast('Document loaded successfully!');
    } else {
      toast('No saved document found.');
    }
  }, []);

  const handleNewDocument = useCallback(() => {
    setValue('');
    setDocumentTitle('Untitled Document');
    toast('New document created!');
  }, []);

  const downloadAsText = useCallback(() => {
    const plainText = quillRef.current?.getEditor()?.getText() || '';
    const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${documentTitle}.txt`);
    toast('Document downloaded as text file!');
  }, [documentTitle]);

  const downloadAsDocx = useCallback(async () => {
    try {
      const plainText = quillRef.current?.getEditor()?.getText() || '';
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: plainText.split('\n').map(line => 
            new Paragraph({
              children: [new TextRun(line || ' ')],
            })
          ),
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${documentTitle}.docx`);
      toast('Document downloaded as Word file!');
    } catch (error) {
      console.error('Error creating docx:', error);
      toast('Error creating Word document. Please try downloading as text instead.');
    }
  }, [documentTitle]);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex items-center gap-4 p-4 bg-background border-b border-border">
        {onBack && (
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            मागे जा / Back
          </Button>
        )}
        <h1 className="text-xl font-semibold text-foreground">
          मराठी संपादक / Marathi Editor
        </h1>
      </div>
      
      <DocumentToolbar
        documentTitle={documentTitle}
        onTitleChange={setDocumentTitle}
        onSave={handleSave}
        onLoad={handleLoad}
        onNew={handleNewDocument}
        onDownloadText={downloadAsText}
        onDownloadDocx={downloadAsDocx}
      />
      
      <div className="flex gap-6 px-4 py-6">
        <div className="w-80 flex-shrink-0">
          <AudioPlayer />
        </div>
        
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-document bg-editor border border-editor-border shadow-editor rounded-lg overflow-hidden">
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={value}
              onChange={setValue}
              modules={modules}
              formats={formats}
              placeholder="Start writing your document..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};