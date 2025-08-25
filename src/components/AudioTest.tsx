import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Volume2, VolumeX, Mic, MicOff, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
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
    microphone: false
  });
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  const allTestsPassed = testsPassed.playback && testsPassed.microphone;

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
          {/* Playback Test */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">स्पीकर चाचणी / Speaker Test</h3>
                  <p className="text-sm text-muted-foreground">चाचणी टोन ऐकू शकता का तपासा</p>
                </div>
              </div>
              {testsPassed.playback && <CheckCircle className="h-6 w-6 text-green-500" />}
            </div>
            
            <Button 
              onClick={testPlayback}
              variant={isPlaying ? "secondary" : "default"}
              className="w-full"
              disabled={isPlaying}
            >
              {isPlaying ? (
                <>
                  <VolumeX className="mr-2 h-4 w-4" />
                  चाचणी टोन वाजत आहे... / Playing Test Tone...
                </>
              ) : (
                <>
                  <Volume2 className="mr-2 h-4 w-4" />
                  स्पीकर चाचणी / Test Speaker
                </>
              )}
            </Button>
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

          {/* Results Summary */}
          <div className="border-t border-border/50 pt-6">
            <h3 className="font-semibold mb-4 text-center">चाचणी परिणाम / Test Results</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`p-3 rounded-lg border text-center ${
                testsPassed.playback ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200'
              }`}>
                {testsPassed.playback ? <CheckCircle className="h-5 w-5 mx-auto mb-1" /> : <XCircle className="h-5 w-5 mx-auto mb-1 text-gray-400" />}
                <p className="text-sm font-medium">स्पीकर / Speaker</p>
              </div>
              <div className={`p-3 rounded-lg border text-center ${
                testsPassed.microphone ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200'
              }`}>
                {testsPassed.microphone ? <CheckCircle className="h-5 w-5 mx-auto mb-1" /> : <XCircle className="h-5 w-5 mx-auto mb-1 text-gray-400" />}
                <p className="text-sm font-medium">मायक्रोफोन / Microphone</p>
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