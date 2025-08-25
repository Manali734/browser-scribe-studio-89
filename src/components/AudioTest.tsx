import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Volume2, VolumeX, Mic, MicOff, CheckCircle, XCircle, ArrowRight, Play, Pause, Keyboard } from 'lucide-react';
import { toast } from 'sonner';

interface AudioTestProps {
  onNext: () => void;
}

export const AudioTest = ({ onNext }: AudioTestProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [testsPassed, setTestsPassed] = useState({
    playback: false,
    microphone: false,
    keyboard: false
  });
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [typedText, setTypedText] = useState('');
  const [mp3Playing, setMp3Playing] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const mp3Ref = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'mr', label: 'मराठी (Marathi)' },
    { value: 'hi', label: 'हिंदी (Hindi)' },
    { value: 'ta', label: 'தமிழ் (Tamil)' },
    { value: 'te', label: 'తెలుగు (Telugu)' },
    { value: 'kn', label: 'ಕನ್ನಡ (Kannada)' }
  ];

  const sampleTexts = {
    en: 'The quick brown fox jumps over the lazy dog. Type this sentence to test your keyboard.',
    mr: 'मराठी भाषेतील लेखन चाचणी. हा वाक्य टाइप करून तुमचा कीबोर्ड तपासा.',
    hi: 'हिंदी भाषा में लेखन परीक्षा। इस वाक्य को टाइप करके अपना कीबोर्ड जांचें।',
    ta: 'தமிழ் மொழியில் எழுதும் சோதனை. இந்த வாக்கியத்தை தட்டச்சு செய்து உங்கள் விசைப்பலகையை சரிபார்க்கவும்.',
    te: 'తెలుగు భాషలో రాయడం పరీక్ష. ఈ వాక్యాన్ని టైప్ చేసి మీ కీబోర్డ్ను తనిఖీ చేయండి.',
    kn: 'ಕನ್ನಡ ಭಾಷೆಯಲ್ಲಿ ಬರೆಯುವ ಪರೀಕ್ಷೆ. ಈ ವಾಕ್ಯವನ್ನು ಟೈಪ್ ಮಾಡಿ ನಿಮ್ಮ ಕೀಬೋರ್ಡ್ ಅನ್ನು ಪರಿಶೀಲಿಸಿ.'
  };

  // Test audio playback
  const testPlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Create a simple audio context for test tone
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        
        oscillator.start();
        setIsPlaying(true);
        
        setTimeout(() => {
          oscillator.stop();
          setIsPlaying(false);
          setTestsPassed(prev => ({ ...prev, playback: true }));
          toast.success('ऑडिओ प्लेबॅक चाचणी यशस्वी! / Audio playback test successful!');
        }, 2000);
      }
    }
  };

  // Test microphone
  const testMicrophone = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && streamRef.current) {
        mediaRecorderRef.current.stop();
        streamRef.current.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        setAudioLevel(0);
        setTestsPassed(prev => ({ ...prev, microphone: true }));
        toast.success('मायक्रोफोन चाचणी यशस्वी! / Microphone test successful!');
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Audio level detection
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      microphone.connect(analyser);
      
      const updateAudioLevel = () => {
        if (isRecording) {
          analyser.getByteTimeDomainData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += Math.abs(dataArray[i] - 128);
          }
          const average = sum / dataArray.length;
          setAudioLevel(Math.min(100, average * 2));
          requestAnimationFrame(updateAudioLevel);
        }
      };
      
      setIsRecording(true);
      updateAudioLevel();
      
      toast.info('बोला आणि मायक्रोफोन चाचणी करा / Speak to test microphone');
      
    } catch (error) {
      toast.error('मायक्रोफोन प्रवेश नाकारला / Microphone access denied');
      console.error('Microphone access error:', error);
    }
  };

  // MP3 Player test
  const toggleMp3Player = () => {
    if (mp3Ref.current) {
      if (mp3Playing) {
        mp3Ref.current.pause();
        setMp3Playing(false);
      } else {
        // Use a sample audio URL or create a test audio
        mp3Ref.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LJeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhDjmH0fPTgjMGHm7A7+OZUR0PUqXh87tnGgg+ltryxnkpBSl+zPLaizsIGGS57OOdTwwOUarm7blmGgg6k9n1uW8gDUCh3viuYh8FJW3C7uSaUhwPU6fg8bllHgg2jdXzzX0vBSF6yO/bjkALElyx6OqmUxkKRJnZ9L9vIAw9n932q2UfBSdt2+zglFIeD1Om4O+5Zh4INozU9cl8LgUie8nw2YtAChJatefrpVMaDESZ2fS/byAMPZ/e9qxmHwUmbdrq4pVSHg9Sp+DuuWYeCDaN1PXJfC4FInvJ8NmLQAoSW7Xn66VTGgxEmdn0v28gDD2f3vasZh8FJm3a6uKVUh4PUqfg7rlmHgg2jdT1yXwuBSJ7yfDZi0AKElu15+ulUxoMRJnZ9L9vIAw9n972rGYfBSZt2urilVIeD1Kn4O65Zh4INo3U9cl8LgUie8nw2YtAChJatefrpVMaDESZ2fS/byAMPZ/e9qxmHwUmbdrq4pVSHg9Sp+DuuWYeCDaN1PXJfC4FInvJ8NmLQAoSW7Xn66VTGgxEmdn0v28gDD2f3vasZh8FJm3a6uKVUh4PUqfg7rlmHgg2jdT1yXwuBSJ7yfDZi0AKElu15+ulUxoMRJnZ9L9vIAw9n972rGYfBSZt2urilVIeD1Kn4O65Zh4INo3U9cl8LgUie8nw2YtAChJatefrpVMaDESZ2fS/byAMPZ/e9qxmHwUmbdrq4pVSHg9Sp+DuuWYeCDaN1PXJfC4FInvJ8NmLQAoSW7Xn66VTGgxEmdn0v28gDD2f3vasZh8FJm3a6uKVUh4PUqfg7rlmHgg2jdT1yXwuBSJ7yfDZi0AKElu15+ulUxoMRJnZ9L9vIAw9n972rGYfBSZt2urilVIeD1Kn4O65Zh4INo3U9cl8LgUie8nw2YtAChJatefrpVMaDESZ2fS/byAMPZ/e9qxmHwUmbdrq4pVSHg9Sp+DuuWYeCDaN1PXJfC4FInvJ8NmLQAoSW7Xn66VTGgxEmdn0v28gDD2f3vasZh8FJm3a6uKVUh4PUqfg7rlmHgg2jdT1yXwuBSJ7yfDZi0AKElu15+ulUxoMRJnZ9L9vIAw9n972rGYfBSZt2urilVIeD1Kn4O65Zh4INo3U9cl8LgUie8nw2YtAChJatefrpVMaDESZ2fS/byAMPZ/e9qxmHwUmbdrq4pVSHg9Sp+DuuWYeCDaN1PXJfC4FInvJ8NmLQAoSW7Xn66VTGgxEmdn0v28gDD2f3vasZh8FJm3a6uKVUh4PUqfg7rlmHgg2jdT1yXwuBSJ7yfDZi0AKElu15+ulUxoMRJnZ9L9vIAw=';
        mp3Ref.current.play().then(() => {
          setMp3Playing(true);
          setTestsPassed(prev => ({ ...prev, playback: true }));
          toast.success('ऑडिओ प्लेबॅक चाचणी यशस्वी! / Audio playback test successful!');
        }).catch(error => {
          toast.error('ऑडिओ प्ले करू शकत नाही / Cannot play audio');
          console.error('Audio play error:', error);
        });
      }
    }
  };

  // Keyboard test
  const handleTextChange = (value: string) => {
    setTypedText(value);
    const sampleText = sampleTexts[selectedLanguage as keyof typeof sampleTexts];
    
    if (value.length >= 10) { // Minimum 10 characters typed
      setTestsPassed(prev => ({ ...prev, keyboard: true }));
      toast.success('कीबोर्ड चाचणी यशस्वी! / Keyboard test successful!');
    }
  };

  const allTestsPassed = testsPassed.playback && testsPassed.microphone && testsPassed.keyboard;

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/10 via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-card/95 backdrop-blur">
        <CardHeader className="text-center border-b border-border/50 pb-6">
          <CardTitle className="text-3xl font-bold text-primary mb-2">
            ऑडिओ चाचणी / Audio Test
          </CardTitle>
          <p className="text-muted-foreground">परीक्षेपूर्वी ऑडिओ सिस्टम तपासा</p>
        </CardHeader>
        
        <CardContent className="p-8 space-y-8">
          {/* MP3 Audio Player Test */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">ऑडिओ प्लेयर चाचणी / Audio Player Test</h3>
                  <p className="text-sm text-muted-foreground">संगीत ऐकू शकता का तपासा</p>
                </div>
              </div>
              {testsPassed.playback && <CheckCircle className="h-6 w-6 text-green-500" />}
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg border">
              <audio ref={mp3Ref} className="w-full" controls onEnded={() => setMp3Playing(false)}>
                Your browser does not support the audio element.
              </audio>
              
              <Button 
                onClick={toggleMp3Player}
                variant={mp3Playing ? "secondary" : "default"}
                className="w-full mt-3"
              >
                {mp3Playing ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    ऑडिओ थांबवा / Pause Audio
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    ऑडिओ प्ले करा / Play Audio
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Microphone Test */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mic className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">मायक्रोफोन चाचणी / Microphone Test</h3>
                  <p className="text-sm text-muted-foreground">बोलून मायक्रोफोन तपासा</p>
                </div>
              </div>
              {testsPassed.microphone && <CheckCircle className="h-6 w-6 text-green-500" />}
            </div>
            
            <Button 
              onClick={testMicrophone}
              variant={isRecording ? "destructive" : "default"}
              className="w-full"
            >
              {isRecording ? (
                <>
                  <MicOff className="mr-2 h-4 w-4" />
                  रेकॉर्डिंग थांबवा / Stop Recording
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  मायक्रोफोन चाचणी / Test Microphone
                </>
              )}
            </Button>
            
            {isRecording && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground text-center">ऑडिओ लेव्हल / Audio Level</p>
                <Progress value={audioLevel} className="w-full" />
              </div>
            )}
          </div>

          {/* Keyboard Test */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Keyboard className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">कीबोर्ड चाचणी / Keyboard Test</h3>
                  <p className="text-sm text-muted-foreground">निवडलेल्या भाषेत टाइप करा</p>
                </div>
              </div>
              {testsPassed.keyboard && <CheckCircle className="h-6 w-6 text-green-500" />}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">भाषा निवडा / Select Language:</label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-48">
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
              
              <div className="p-3 bg-muted/30 rounded border text-sm">
                <strong>Type this text / हा मजकूर टाइप करा:</strong><br />
                {sampleTexts[selectedLanguage as keyof typeof sampleTexts]}
              </div>
              
              <Textarea
                value={typedText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="येथे टाइप करा / Type here..."
                className="min-h-24"
                style={{
                  fontSize: '16px',
                  lineHeight: '1.5'
                }}
              />
              
              <div className="text-xs text-muted-foreground">
                Progress: {typedText.length >= 10 ? '✓ Complete' : `${typedText.length}/10 characters minimum`}
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="border-t border-border/50 pt-6">
            <h3 className="font-semibold mb-4 text-center">चाचणी परिणाम / Test Results</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className={`p-3 rounded-lg border text-center ${
                testsPassed.playback ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200'
              }`}>
                {testsPassed.playback ? <CheckCircle className="h-5 w-5 mx-auto mb-1" /> : <XCircle className="h-5 w-5 mx-auto mb-1 text-gray-400" />}
                <p className="text-sm font-medium">ऑडिओ / Audio</p>
              </div>
              <div className={`p-3 rounded-lg border text-center ${
                testsPassed.microphone ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200'
              }`}>
                {testsPassed.microphone ? <CheckCircle className="h-5 w-5 mx-auto mb-1" /> : <XCircle className="h-5 w-5 mx-auto mb-1 text-gray-400" />}
                <p className="text-sm font-medium">मायक्रोफोन / Microphone</p>
              </div>
              <div className={`p-3 rounded-lg border text-center ${
                testsPassed.keyboard ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200'
              }`}>
                {testsPassed.keyboard ? <CheckCircle className="h-5 w-5 mx-auto mb-1" /> : <XCircle className="h-5 w-5 mx-auto mb-1 text-gray-400" />}
                <p className="text-sm font-medium">कीबोर्ड / Keyboard</p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={onNext}
                size="lg"
                disabled={!allTestsPassed}
                className="px-8 py-3 text-lg font-semibold"
              >
                {allTestsPassed ? (
                  <>
                    परीक्षा सुरू करा / Start Exam
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                ) : (
                  'सर्व चाचण्या पूर्ण करा / Complete All Tests'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};