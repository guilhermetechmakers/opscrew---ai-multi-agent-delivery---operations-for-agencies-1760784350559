import { useState } from 'react';
import { Reply, ThumbsUp, ThumbsDown, MoreVertical, Edit, Trash2, Flag } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import type { PortalComment } from '@/types/database/portal-comments';

interface CommentThreadProps {
  comment: PortalComment;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'resolved':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'closed':
      return 'bg-secondary/50 text-muted-foreground border-border';
    default:
      return 'bg-secondary/50 text-muted-foreground border-border';
  }
};

const getCommentTypeIcon = (commentType: string) => {
  switch (commentType) {
    case 'feedback':
      return '💬';
    case 'question':
      return '❓';
    case 'suggestion':
      return '💡';
    case 'issue':
      return '🐛';
    case 'praise':
      return '⭐';
    default:
      return '💬';
  }
};

export function CommentThread({ comment }: CommentThreadProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  const handleReply = () => {
    if (replyText.trim()) {
      // TODO: Implement reply functionality
      console.log('Replying to comment:', comment.id, replyText);
      setReplyText('');
      setIsReplying(false);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (isDisliked) setIsDisliked(false);
    // TODO: Implement like functionality
  };

  const handleDislike = () => {
    setIsDisliked(!isDisliked);
    if (isLiked) setIsLiked(false);
    // TODO: Implement dislike functionality
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log('Editing comment:', comment.id);
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log('Deleting comment:', comment.id);
  };

  const handleFlag = () => {
    // TODO: Implement flag functionality
    console.log('Flagging comment:', comment.id);
  };

  return (
    <Card className="group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                {comment.author_name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm gradient-text">
                  {comment.author_name || 'Anonymous'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg">
                  {getCommentTypeIcon(comment.comment_type)}
                </span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getStatusColor(comment.status)}`}
                >
                  {comment.status}
                </Badge>
                <Badge variant="outline" className="text-xs bg-secondary/50 text-muted-foreground border-border">
                  {comment.comment_type}
                </Badge>
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-secondary/50"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border shadow-xl">
              <DropdownMenuItem onClick={handleEdit} className="hover:bg-secondary/50">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleFlag} className="hover:bg-secondary/50">
                <Flag className="mr-2 h-4 w-4" />
                Flag
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive hover:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Comment content */}
          <div className="prose prose-sm max-w-none">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`h-8 px-3 transition-all duration-200 hover:bg-secondary/50 hover:scale-105 ${isLiked ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                {comment.like_count || 0}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDislike}
                className={`h-8 px-3 transition-all duration-200 hover:bg-secondary/50 hover:scale-105 ${isDisliked ? 'text-destructive bg-destructive/10' : 'text-muted-foreground'}`}
              >
                <ThumbsDown className="h-3 w-3 mr-1" />
                {comment.dislike_count || 0}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(!isReplying)}
                className="h-8 px-3 transition-all duration-200 hover:bg-secondary/50 hover:scale-105"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            </div>

            {/* Priority indicator */}
            {comment.priority && comment.priority !== 'normal' && (
              <Badge 
                variant={comment.priority === 'high' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {comment.priority} priority
              </Badge>
            )}
          </div>

          {/* Reply form */}
          {isReplying && (
            <div className="space-y-3 pt-3 border-t border-border">
              <Textarea
                placeholder="Write your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyText('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                >
                  Reply
                </Button>
              </div>
            </div>
          )}

          {/* Replies section - TODO: Implement nested replies */}
          {comment.reply_count && comment.reply_count > 0 && (
            <div className="pt-3 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
              >
                View {comment.reply_count} repl{comment.reply_count === 1 ? 'y' : 'ies'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
