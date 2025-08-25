import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CalendarIcon, UserIcon, HashIcon } from 'lucide-react';

interface HallTicketProps {
  onNext: () => void;
}

export const HallTicket = ({ onNext }: HallTicketProps) => {
  // Sample data - in real app this would come from props or API
  const ticketData = {
    name: "राज कुमार शर्मा", // Sample Marathi name
    rollNumber: "EX2024001",
    examDate: "२५ डिसेंबर २०२४", // Date in Marathi
    examTime: "सकाळी १० वाजता",
    examCenter: "मुंबई परीक्षा केंद्र",
    subject: "मराठी भाषा परीक्षा"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-card/95 backdrop-blur">
        <CardHeader className="text-center border-b border-border/50 pb-6">
          <CardTitle className="text-3xl font-bold text-primary mb-2">
            प्रवेशपत्र / Hall Ticket
          </CardTitle>
          <p className="text-muted-foreground">परीक्षा प्रवेशपत्र</p>
        </CardHeader>
        
        <CardContent className="p-8 space-y-6">
          <div className="grid gap-6">
            {/* Student Name */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <UserIcon className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">विद्यार्थ्याचे नाव / Student Name</p>
                <p className="text-xl font-semibold">{ticketData.name}</p>
              </div>
            </div>

            {/* Roll Number */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <HashIcon className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">अनुक्रमांक / Roll Number</p>
                <p className="text-xl font-semibold font-mono">{ticketData.rollNumber}</p>
              </div>
            </div>

            {/* Exam Date */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <CalendarIcon className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">परीक्षेची तारीख व वेळ / Exam Date & Time</p>
                <p className="text-xl font-semibold">{ticketData.examDate}</p>
                <p className="text-lg text-muted-foreground">{ticketData.examTime}</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-accent/50">
                <p className="text-sm text-muted-foreground">परीक्षा केंद्र / Exam Center</p>
                <p className="font-semibold">{ticketData.examCenter}</p>
              </div>
              <div className="p-4 rounded-lg bg-accent/50">
                <p className="text-sm text-muted-foreground">विषय / Subject</p>
                <p className="font-semibold">{ticketData.subject}</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="border-t border-border/50 pt-6">
            <h3 className="font-semibold mb-3">महत्वाच्या सूचना / Important Instructions:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>परीक्षेच्या वेळेपूर्वी ३० मिनिटे येणे आवश्यक</li>
              <li>Report 30 minutes before exam time</li>
              <li>वैध ओळखपत्र सोबत आणणे आवश्यक</li>
              <li>Valid ID proof required</li>
            </ul>
          </div>

          <div className="flex justify-center pt-4">
            <Button 
              onClick={onNext}
              size="lg"
              className="px-8 py-3 text-lg font-semibold bg-primary hover:bg-primary/90"
            >
              पुढे जा / Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};