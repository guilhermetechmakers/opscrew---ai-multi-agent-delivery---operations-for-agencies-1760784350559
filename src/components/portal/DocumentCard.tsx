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
    case 'image':
      return Image;
    case 'video':
      return Video;
    case 'audio':
      return Music;
    case 'archive':
      return Archive;
    case 'code':
      return Code;
    default:
      return FileText;
  }
};

const getFileTypeColor = (documentType: string) => {
  switch (documentType) {
    case 'image':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'video':
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'audio':
      return 'bg-pink-500/10 text-pink-500 border-pink-500/20';
    case 'archive':
      return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'code':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
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
      className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${typeColorClass}`}>
              <FileIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-medium truncate">
                {document.title}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {document.description || 'No description'}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handlePreview}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
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
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handlePreview}
            >
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Button>
            <Button 
              size="sm" 
              className="flex-1"
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
