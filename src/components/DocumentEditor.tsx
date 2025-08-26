import { useState, useRef, useCallback, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DocumentToolbar } from './DocumentToolbar';
import { AudioPlayer } from './AudioPlayer';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { toast } from 'sonner';
import { ArrowLeft, Clock, Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface DocumentEditorProps {
  onBack?: () => void;
}

export const DocumentEditor = ({ onBack }: DocumentEditorProps) => {
  const [value, setValue] = useState('');
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [timeRemaining, setTimeRemaining] = useState(240); // 4 minutes in seconds
  const [isListeningPeriod, setIsListeningPeriod] = useState(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('mr');
  const [audioPlaybackRate, setAudioPlaybackRate] = useState(1.0);
  
  const quillRef = useRef<ReactQuill>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const languageOptions = [
    { value: 'mr', label: 'मराठी (Marathi)', font: 'devanagari' },
    { value: 'hi', label: 'हिंदी (Hindi)', font: 'devanagari' },
    { value: 'en', label: 'English', font: 'latin' },
    { value: 'ta', label: 'தமிழ் (Tamil)', font: 'tamil' },
    { value: 'te', label: 'తెలుగు (Telugu)', font: 'telugu' }
  ];

  // Timer and audio management
  useEffect(() => {
    // Start audio automatically when component mounts
    if (audioRef.current && isListeningPeriod) {
      // Create a test audio or use a sample
      audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LJeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhDjmH0fPTgjMGHm7A7+OZUR0PUqXh87tnGgg+ltryxnkpBSl+zPLaizsIGGS57OOdTwwOUarm7blmGgg6k9n1uW8gDUCh3viuYh8FJW3C7uSaUhwPU6fg8bllHgg2jdXzzX0vBSF6yO/bjkALElyx6OqmUxkKRJnZ9L9vIAw9n932q2UfBSdt2+zglFIeD1Om4O+5Zh4INozU9cl8LgUie8nw2YtAChJatefrpVMaDESZ2fS/byAMPZ/e9qxmHwUmbdrq4pVSHg9Sp+DuuWYeCDaN1PXJfC4FInvJ8NmLQAoSW7Xn66VTGgxEmdn0v28gDD2f3vasZh8FJm3a6uKVUh4PUqfg7rlmHgg2jdT1yXwuBSJ7yfDZi0AKElu15+ulUxoMRJnZ9L9vIAw9n972rGYfBSZt2urilVIeD1Kn4O65Zh4INo3U9cl8LgUie8nw2YtAChJatefrpVMaDESZ2fS/byAMPZ/e9qxmHwUmbdrq4pVSHg9Sp+DuuWYeCDaN1PXJfC4FInvJ8NmLQAoSW7Xn66VTGgxEmdn0v28gDD2f3vasZh8FJm3a6uKVUh4PUqfg7rlmHgg2jdT1yXwuBSJ7yfDZi0AKElu15+ulUxoMRJnZ9L9vIAw9n972rGYfBSZt2urilVIeD1Kn4O65Zh4INo3U9cl8LgUie8nw2YtAChJatefrpVMaDESZ2fS/byAMPZ/e9qxmHwUmbdrq4pVSHg9Sp+DuuWYeCDaN1PXJfC4FInvJ8NmLQAoSW7Xn66VTGgxEmdn0v28gDD2f3vasZh8FJm3a6uKVUh4PUqfg7rlmHgg2jdT1yXwuBSJ7yfDZi0AKElu15+ulUxoMRJnZ9L9vIAw9n972rGYfBSZt2urilVIeD1Kn4O65Zh4INo3U9cl8LgUie8nw2YtAChJatefrpVMaDESZ2fS/byAMPZ/e9qxmHwUmbdrq4pVSHg9Sp+DuuWYeCDaN1PXJfC4FInvJ8NmLQAoSW7Xn66VTGgxEmdn0v28gDD2f3vasZh8FJm3a6uKVUh4PUqfg7rlmHgg2jdT1yXwuBSJ7yfDZi0AKElu15+ulUxoMRJnZ9L9vIAw=';
      audioRef.current.loop = true;
      audioRef.current.play().then(() => {
        setIsAudioPlaying(true);
        toast.success('ऑडिओ सुरू झाले! 4 मिनिटे ऐका / Audio started! Listen for 4 minutes');
      }).catch(error => {
        console.error('Audio play error:', error);
        toast.error('ऑडिओ प्ले करू शकत नाही / Cannot play audio');
      });
    }

    // Start countdown timer
    if (isListeningPeriod && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsListeningPeriod(false);
            setIsAudioPlaying(false);
            if (audioRef.current) {
              audioRef.current.pause();
            }
            toast.success('आता तुम्ही टाइप करू शकता! / Now you can start typing!');
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
  }, [isListeningPeriod, timeRemaining]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
        setIsAudioPlaying(false);
      } else {
        audioRef.current.play();
        setIsAudioPlaying(true);
      }
    }
  };

  const changePlaybackSpeed = (speed: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
      setAudioPlaybackRate(speed);
    }
  };

  const skipAudio = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime + seconds);
    }
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
    toolbar: isListeningPeriod ? false : {
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

      {/* Listening Period UI */}
      {isListeningPeriod && (
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-border">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Clock className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold text-primary">श्रवण कालावधी / Listening Period</h2>
                  <p className="text-muted-foreground">कृपया ऑडिओ ऐका, एडिटर 4 मिनिटानंतर सक्रिय होईल</p>
                  <p className="text-sm text-muted-foreground">Please listen to the audio, editor will activate after 4 minutes</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-mono font-bold text-primary mb-2">
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-sm text-muted-foreground">बाकी वेळ / Time Remaining</p>
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <audio ref={audioRef} className="hidden" />
              
              {/* Main Audio Controls */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={toggleAudio}
                  variant={isAudioPlaying ? "secondary" : "default"}
                  size="lg"
                  className="flex items-center gap-2"
                >
                  {isAudioPlaying ? (
                    <>
                      <Pause className="h-5 w-5" />
                      ऑडिओ थांबवा / Pause Audio
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      ऑडिओ चालू करा / Play Audio
                    </>
                  )}
                </Button>
                
                <div className="flex-1 bg-white rounded-lg p-4 border">
                  <p className="text-sm text-muted-foreground mb-2">ऑडिओ स्थिती / Audio Status:</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isAudioPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    <span className="text-sm">{isAudioPlaying ? 'Playing' : 'Paused'}</span>
                    <span className="text-xs text-muted-foreground ml-2">({audioPlaybackRate}x speed)</span>
                  </div>
                </div>
              </div>

              {/* Advanced Audio Controls */}
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => skipAudio(-5)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <SkipBack className="h-4 w-4" />
                      -5s
                    </Button>
                    
                    <Button
                      onClick={() => skipAudio(5)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <SkipForward className="h-4 w-4" />
                      +5s
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">गती / Speed:</span>
                    <Button
                      onClick={() => changePlaybackSpeed(1.0)}
                      variant={audioPlaybackRate === 1.0 ? "default" : "outline"}
                      size="sm"
                    >
                      1x
                    </Button>
                    <Button
                      onClick={() => changePlaybackSpeed(2.0)}
                      variant={audioPlaybackRate === 2.0 ? "default" : "outline"}
                      size="sm"
                    >
                      2x
                    </Button>
                    <Button
                      onClick={() => changePlaybackSpeed(3.0)}
                      variant={audioPlaybackRate === 3.0 ? "default" : "outline"}
                      size="sm"
                    >
                      3x
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Language Selection and Editor */}
      <div className="p-4">
        {!isListeningPeriod && (
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

        {!isListeningPeriod && (
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
        
        <div className="flex gap-6">
          {!isListeningPeriod && (
            <div className="w-80 flex-shrink-0">
              <AudioPlayer />
            </div>
          )}
          
          <div className="flex-1 flex justify-center">
            <div className={`w-full max-w-document bg-editor border border-editor-border shadow-editor rounded-lg overflow-hidden ${
              isListeningPeriod ? 'opacity-50 cursor-not-allowed' : ''
            }`}>
              {isListeningPeriod ? (
                <div className="h-96 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      एडिटर अक्षम आहे / Editor Disabled
                    </h3>
                    <p className="text-gray-500">
                      कृपया ऑडिओ ऐका, {formatTime(timeRemaining)} नंतर एडिटर सक्रिय होईल
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Please listen to audio, editor will activate in {formatTime(timeRemaining)}
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
                    readOnly={isListeningPeriod}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};