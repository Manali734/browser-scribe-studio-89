import { useState, useRef, useCallback, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DocumentToolbar } from './DocumentToolbar';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { toast } from 'sonner';
import { ArrowLeft, Clock, CheckCircle } from 'lucide-react';

interface DocumentEditorProps {
  onBack?: () => void;
}

export const DocumentEditor = ({ onBack }: DocumentEditorProps) => {
  const [value, setValue] = useState('');
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [examEnded, setExamEnded] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('mr');
  
  const quillRef = useRef<ReactQuill>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const languageOptions = [
    { value: 'mr', label: 'मराठी (Marathi)', font: 'devanagari' },
    { value: 'hi', label: 'हिंदी (Hindi)', font: 'devanagari' },
    { value: 'en', label: 'English', font: 'latin' },
    { value: 'ta', label: 'தமிழ் (Tamil)', font: 'tamil' },
    { value: 'te', label: 'తెలుగు (Telugu)', font: 'telugu' }
  ];

  // Timer management
  useEffect(() => {
    // Start countdown timer immediately
    if (!examEnded && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setExamEnded(true);
            toast.success('परीक्षा संपली! तुमचे उत्तर यशस्वीरित्या सबमिट झाले! / Exam completed! Your answers have been successfully submitted!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [examEnded, timeRemaining]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getEditorStyle = () => {
    const selectedLang = languageOptions.find(lang => lang.value === selectedLanguage);
    switch (selectedLang?.font) {
      case 'devanagari':
        return {
          fontFamily: '"Noto Sans Devanagari", "Arial Unicode MS", Arial, sans-serif',
          fontSize: '16px',
          lineHeight: '1.6'
        };
      case 'tamil':
        return {
          fontFamily: '"Noto Sans Tamil", "Arial Unicode MS", Arial, sans-serif',
          fontSize: '16px',
          lineHeight: '1.6'
        };
      case 'telugu':
        return {
          fontFamily: '"Noto Sans Telugu", "Arial Unicode MS", Arial, sans-serif',
          fontSize: '16px',
          lineHeight: '1.6'
        };
      default:
        return {
          fontSize: '16px',
          lineHeight: '1.6'
        };
    }
  };

  const modules = {
    toolbar: examEnded ? false : {
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
          प्रश्न 1 - मराठी संपादक / Question 1 - Marathi Editor
        </h1>
        
        {/* Timer Display */}
        <div className="flex items-center gap-3 ml-auto">
          <Clock className="h-5 w-5 text-primary" />
          <div className="text-right">
            <div className="text-lg font-mono font-bold text-primary">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-xs text-muted-foreground">बाकी वेळ / Time Left</div>
          </div>
        </div>
      </div>

      {/* Exam Ended Message */}
      {examEnded && (
        <div className="p-8 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-border">
          <div className="max-w-4xl mx-auto text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-green-700 mb-2">
              परीक्षा पूर्ण! / Exam Completed!
            </h2>
            <p className="text-lg text-green-600 mb-2">
              तुमचे उत्तर यशस्वीरित्या सबमिट झाले आहेत!
            </p>
            <p className="text-green-600">
              Your answers have been successfully submitted!
            </p>
          </div>
        </div>
      )}

      {/* Language Selection and Editor */}
      <div className="p-4">
        {!examEnded && (
          <div className="mb-4 flex items-center gap-4">
            <label className="text-sm font-medium">भाषा निवडा / Select Language:</label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="भाषा निवडा" />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {!examEnded && (
          <DocumentToolbar
            documentTitle={documentTitle}
            onTitleChange={setDocumentTitle}
            onSave={handleSave}
            onLoad={handleLoad}
            onNew={handleNewDocument}
            onDownloadText={downloadAsText}
            onDownloadDocx={downloadAsDocx}
          />
        )}
        
        <div className="flex justify-center">          
          <div className={`w-full max-w-document bg-editor border border-editor-border shadow-editor rounded-lg overflow-hidden ${
            examEnded ? 'opacity-50 cursor-not-allowed' : ''
          }`}>
            {examEnded ? (
              <div className="h-96 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-600 mb-2">
                    परीक्षा संपली / Exam Ended
                  </h3>
                  <p className="text-green-500">
                    तुमचे उत्तर सेव्ह झाले आहेत / Your answers have been saved
                  </p>
                </div>
              </div>
            ) : (
              <div style={getEditorStyle()}>
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={value}
                  onChange={setValue}
                  modules={modules}
                  formats={formats}
                  placeholder={`Start writing in ${languageOptions.find(l => l.value === selectedLanguage)?.label || 'selected language'}...`}
                  readOnly={examEnded}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};