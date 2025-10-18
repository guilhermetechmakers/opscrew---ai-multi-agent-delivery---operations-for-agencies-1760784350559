import { useState } from 'react';
import { Download, Eye, FileText, Image, Video, Music, Archive, Code, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import type { PortalDocument } from '@/types/database/portal-documents';

interface DocumentCardProps {
  document: PortalDocument;
}

const getFileIcon = (documentType: string) => {
  switch (documentType) {
    case 'proposal':
      return FileText;
    case 'sow':
      return FileText;
    case 'design':
      return Image;
    case 'tutorial':
      return Video;
    case 'report':
      return FileText;
    case 'other':
      return FileText;
    default:
      return FileText;
  }
};

const getFileTypeColor = (documentType: string) => {
  switch (documentType) {
    case 'proposal':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'sow':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'design':
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'tutorial':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'report':
      return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'other':
      return 'bg-secondary/50 text-muted-foreground border-border';
    default:
      return 'bg-secondary/50 text-muted-foreground border-border';
  }
};

export function DocumentCard({ document }: DocumentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const FileIcon = getFileIcon(document.document_type);
  const typeColorClass = getFileTypeColor(document.document_type);

  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log('Downloading document:', document.id);
  };

  const handlePreview = () => {
    // TODO: Implement preview functionality
    console.log('Previewing document:', document.id);
  };

  return (
    <Card 
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 hover:scale-[1.02] card-hover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl border-2 shadow-sm ${typeColorClass} transition-all duration-200 group-hover:shadow-md`}>
              <FileIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-semibold truncate gradient-text">
                {document.title}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                {document.description || 'No description available'}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-secondary/50`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border shadow-xl">
              <DropdownMenuItem onClick={handlePreview} className="hover:bg-secondary/50">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload} className="hover:bg-secondary/50">
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* File info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{document.file_size ? `${(document.file_size / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'}</span>
            <span>{formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}</span>
          </div>

          {/* Status and type badges */}
          <div className="flex items-center gap-2">
            <Badge 
              variant={document.is_public ? "default" : "secondary"}
              className="text-xs"
            >
              {document.is_public ? 'Public' : 'Private'}
            </Badge>
            <Badge 
              variant="outline" 
              className={`text-xs ${typeColorClass}`}
            >
              {document.document_type}
            </Badge>
          </div>

          {/* Download count */}
          {document.download_count > 0 && (
            <div className="text-xs text-muted-foreground">
              Downloaded {document.download_count} time{document.download_count !== 1 ? 's' : ''}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 hover:bg-secondary/50 transition-all duration-200 hover:scale-105"
              onClick={handlePreview}
            >
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Button>
            <Button 
              size="sm" 
              className="flex-1 btn-primary transition-all duration-200 hover:scale-105"
              onClick={handleDownload}
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
