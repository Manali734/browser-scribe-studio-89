import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { 
  FileText, 
  Save, 
  FolderOpen, 
  Download,
  FileDown,
  PlusCircle
} from 'lucide-react';

interface DocumentToolbarProps {
  documentTitle: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onLoad: () => void;
  onNew: () => void;
  onDownloadText: () => void;
  onDownloadDocx: () => void;
}

export const DocumentToolbar = ({
  documentTitle,
  onTitleChange,
  onSave,
  onLoad,
  onNew,
  onDownloadText,
  onDownloadDocx,
}: DocumentToolbarProps) => {
  return (
    <div className="bg-background border-b border-border px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg">Scribe Studio</span>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onNew}>
              <PlusCircle className="h-4 w-4 mr-2" />
              New
            </Button>
            <Button variant="ghost" size="sm" onClick={onSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="ghost" size="sm" onClick={onLoad}>
              <FolderOpen className="h-4 w-4 mr-2" />
              Open
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onDownloadText}>
              <Download className="h-4 w-4 mr-2" />
              Text
            </Button>
            <Button variant="ghost" size="sm" onClick={onDownloadDocx}>
              <FileDown className="h-4 w-4 mr-2" />
              Word
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Input
            value={documentTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-64 text-center font-medium"
            placeholder="Document title..."
          />
        </div>
      </div>
    </div>
  );
};