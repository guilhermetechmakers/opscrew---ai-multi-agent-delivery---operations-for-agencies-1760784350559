import { useState, useRef } from 'react';
import { Download, Eye, FileText, Image, Video, Music, Archive, Code, MoreVertical, Star, Heart, Share2, Copy, Trash2 } from 'lucide-react';
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
  const [isDragging, setIsDragging] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
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

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Sharing document:', document.id);
  };

  const handleCopy = () => {
    // TODO: Implement copy link functionality
    console.log('Copying link for document:', document.id);
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log('Deleting document:', document.id);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', document.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <Card 
      ref={dragRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 hover:scale-[1.02] card-hover ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${isFavorited ? 'ring-2 ring-yellow-500/30' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`p-3 rounded-xl border-2 shadow-sm ${typeColorClass} transition-all duration-200 group-hover:shadow-md group-hover:scale-110`}>
              <FileIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-semibold truncate gradient-text group-hover:text-primary transition-colors duration-200">
                {document.title}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {document.description || 'No description available'}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-yellow-500/10 hover:text-yellow-500 transition-all duration-200"
              onClick={handleFavorite}
            >
              <Star className={`h-4 w-4 ${isFavorited ? 'fill-yellow-500 text-yellow-500' : ''}`} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-secondary/50 transition-all duration-200"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border shadow-xl w-48">
                <DropdownMenuItem onClick={handlePreview} className="hover:bg-secondary/50">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload} className="hover:bg-secondary/50">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare} className="hover:bg-secondary/50">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopy} className="hover:bg-secondary/50">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="hover:bg-destructive/10 text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* File info with enhanced styling */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-muted-foreground">
                {document.file_size ? `${(document.file_size / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'}
              </span>
            </div>
            <span className="text-muted-foreground">
              {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
            </span>
          </div>

          {/* Status and type badges with enhanced styling */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge 
              variant={document.is_public ? "default" : "secondary"}
              className={`text-xs transition-all duration-200 ${
                document.is_public 
                  ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20' 
                  : 'hover:bg-secondary/80'
              }`}
            >
              {document.is_public ? 'Public' : 'Private'}
            </Badge>
            <Badge 
              variant="outline" 
              className={`text-xs transition-all duration-200 hover:scale-105 ${typeColorClass}`}
            >
              {document.document_type}
            </Badge>
            {isFavorited && (
              <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Favorited
              </Badge>
            )}
          </div>

          {/* Download count with enhanced styling */}
          {document.download_count > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Download className="h-3 w-3" />
              <span>
                Downloaded {document.download_count} time{document.download_count !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Enhanced action buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 hover:bg-secondary/50 transition-all duration-200 hover:scale-105 hover:border-primary/30"
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

          {/* Drag indicator */}
          <div className="text-center text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Drag to reorder
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
