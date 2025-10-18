import { useState, useRef, useEffect } from 'react';
import { Reply, ThumbsUp, ThumbsDown, MoreVertical, Edit, Trash2, Flag, Heart, Star, Sparkles, Zap, ArrowRight } from 'lucide-react';
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
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection observer for animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleReply = () => {
    if (replyText.trim()) {
      // TODO: Implement reply functionality
      console.log('Replying to comment:', comment.id, replyText);
      setReplyText('');
      setIsReplying(false);
    }
  };

  const handleLike = () => {
    setIsAnimating(true);
    setIsLiked(!isLiked);
    if (isDisliked) setIsDisliked(false);
    setTimeout(() => setIsAnimating(false), 300);
    // TODO: Implement like functionality
  };

  const handleDislike = () => {
    setIsAnimating(true);
    setIsDisliked(!isDisliked);
    if (isLiked) setIsLiked(false);
    setTimeout(() => setIsAnimating(false), 300);
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
    <Card 
      ref={cardRef}
      className={`group hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 card-hover ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${isAnimating ? 'scale-105' : ''}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                  {comment.author_name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-semibold text-base gradient-text group-hover:text-primary transition-colors duration-200">
                  {comment.author_name || 'Anonymous'}
                </span>
                <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl group-hover:scale-110 transition-transform duration-200">
                  {getCommentTypeIcon(comment.comment_type)}
                </span>
                <Badge 
                  variant="outline" 
                  className={`text-xs transition-all duration-200 hover:scale-105 ${getStatusColor(comment.status)}`}
                >
                  {comment.status === 'open' && <Sparkles className="h-3 w-3 mr-1" />}
                  {comment.status === 'resolved' && <Star className="h-3 w-3 mr-1" />}
                  {comment.status}
                </Badge>
                <Badge variant="outline" className="text-xs bg-secondary/50 text-muted-foreground border-border hover:bg-secondary/80 transition-colors duration-200">
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
                className="h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:scale-110"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border shadow-xl w-48">
              <DropdownMenuItem onClick={handleEdit} className="hover:bg-secondary/50 transition-colors duration-200">
                <Edit className="mr-2 h-4 w-4" />
                Edit Comment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleFlag} className="hover:bg-orange-500/10 text-orange-500 transition-colors duration-200">
                <Flag className="mr-2 h-4 w-4" />
                Flag Comment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive hover:bg-destructive/10 transition-colors duration-200">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Comment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-6">
          {/* Enhanced Comment content */}
          <div className="prose prose-sm max-w-none">
            <p className="text-sm leading-relaxed whitespace-pre-wrap group-hover:text-foreground transition-colors duration-200">
              {comment.content}
            </p>
          </div>

          {/* Enhanced Action buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`h-9 px-4 transition-all duration-200 hover:bg-primary/10 hover:scale-105 ${
                  isLiked ? 'text-primary bg-primary/10 ring-2 ring-primary/20' : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <ThumbsUp className={`h-4 w-4 mr-2 ${isLiked ? 'animate-bounce' : ''}`} />
                {comment.like_count || 0}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDislike}
                className={`h-9 px-4 transition-all duration-200 hover:bg-destructive/10 hover:scale-105 ${
                  isDisliked ? 'text-destructive bg-destructive/10 ring-2 ring-destructive/20' : 'text-muted-foreground hover:text-destructive'
                }`}
              >
                <ThumbsDown className={`h-4 w-4 mr-2 ${isDisliked ? 'animate-bounce' : ''}`} />
                {comment.dislike_count || 0}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(!isReplying)}
                className="h-9 px-4 transition-all duration-200 hover:bg-secondary/50 hover:scale-105 hover:text-primary"
              >
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </Button>
            </div>

            {/* Enhanced Priority indicator */}
            {comment.priority && comment.priority !== 'normal' && (
              <Badge 
                variant={comment.priority === 'high' ? 'destructive' : 'secondary'}
                className={`text-xs transition-all duration-200 hover:scale-105 ${
                  comment.priority === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/20' : ''
                }`}
              >
                <Zap className="h-3 w-3 mr-1" />
                {comment.priority} priority
              </Badge>
            )}
          </div>

          {/* Enhanced Reply form */}
          {isReplying && (
            <div className="space-y-4 pt-4 border-t border-border/50 animate-fade-in">
              <div className="relative">
                <Textarea
                  placeholder="Write your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-[100px] resize-none bg-secondary/20 border-border/50 focus:border-primary/50 transition-all duration-200"
                />
                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                  {replyText.length}/500
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyText('');
                  }}
                  className="hover:bg-secondary/50 transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </Button>
              </div>
            </div>
          )}

          {/* Enhanced Replies section - TODO: Implement nested replies */}
          {comment.reply_count && comment.reply_count > 0 && (
            <div className="pt-4 border-t border-border/50">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 group"
              >
                <Heart className="h-4 w-4 mr-2 group-hover:fill-current" />
                View {comment.reply_count} repl{comment.reply_count === 1 ? 'y' : 'ies'}
                <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
