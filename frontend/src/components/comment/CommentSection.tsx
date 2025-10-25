import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import { commentService } from '../../services/comment.service';
import { BackgroundGradient } from '../ui/background-gradient';
import { Button } from '../ui/button';
import { 
  MessageCircle, 
  Heart, 
  Reply, 
  Trash2, 
  Edit2, 
  Send,
  MoreVertical 
} from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface CommentSectionProps {
  videoId: string;
}

interface CommentItemProps {
  comment: any;
  onReply: (commentId: string, username: string) => void;
  onDelete: (commentId: string) => void;
  onEdit: (commentId: string, text: string) => void;
  onLike: (commentId: string) => void;
  currentUserId?: string;
  level?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  onReply, 
  onDelete, 
  onEdit,
  onLike,
  currentUserId,
  level = 0 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [showMenu, setShowMenu] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const isOwner = currentUserId === comment.userId?._id;
  const hasReplies = comment.replies && comment.replies.length > 0;

  const handleEdit = () => {
    onEdit(comment._id, editText);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${level > 0 ? 'ml-12 mt-3' : 'mb-4'}`}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <img
          src={comment.userId?.picture || '/default-avatar.png'}
          alt={comment.userId?.name}
          className="w-10 h-10 rounded-full border-2 border-purple-500/30"
        />

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-slate-800/50 rounded-lg p-3 backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{comment.userId?.name}</span>
                  {comment.userId?.role === 'faculty' && (
                    <span className="text-xs bg-purple-600 px-2 py-0.5 rounded-full">
                      Faculty
                    </span>
                  )}
                  {comment.isEdited && (
                    <span className="text-xs text-gray-500">(edited)</span>
                  )}
                </div>
                <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
              </div>

              {/* Menu */}
              {isOwner && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 hover:bg-slate-700 rounded transition-colors"
                  >
                    <MoreVertical size={16} className="text-gray-400" />
                  </button>
                  
                  {showMenu && (
                    <div className="absolute right-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-10 min-w-[120px]">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          onDelete(comment._id);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-800 text-red-400 flex items-center gap-2"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Comment Text */}
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 resize-none"
                  rows={2}
                  maxLength={1000}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleEdit}>Save</Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => {
                      setIsEditing(false);
                      setEditText(comment.text);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-200 whitespace-pre-wrap break-words">
                {comment.text}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2 text-xs">
            <button
              onClick={() => onLike(comment._id)}
              className="flex items-center gap-1 hover:text-red-400 transition-colors"
            >
              <Heart 
                size={14} 
                className={comment.likes?.includes(currentUserId) ? 'fill-red-400 text-red-400' : ''}
              />
              <span>{comment.likes?.length || 0}</span>
            </button>

            {level < 2 && (
              <button
                onClick={() => onReply(comment._id, comment.userId?.name)}
                className="flex items-center gap-1 hover:text-purple-400 transition-colors"
              >
                <Reply size={14} />
                Reply
              </button>
            )}

            {hasReplies && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                {showReplies ? 'Hide' : 'View'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>

          {/* Replies */}
          {hasReplies && showReplies && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply: any) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  onReply={onReply}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onLike={onLike}
                  currentUserId={currentUserId}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const CommentSection: React.FC<CommentSectionProps> = ({ videoId }) => {
  const { user } = useAuth0();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);

  // Fetch comments
  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', videoId],
    queryFn: () => commentService.getCommentsByVideoId(videoId),
  });

  // Create comment mutation
  const createMutation = useMutation({
    mutationFn: commentService.createComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
      setCommentText('');
      setReplyTo(null);
    },
  });

  // Delete comment mutation
  const deleteMutation = useMutation({
    mutationFn: commentService.deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
    },
  });

  // Update comment mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      commentService.updateComment(id, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
    },
  });

  // Like comment mutation
  const likeMutation = useMutation({
    mutationFn: commentService.toggleLike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    createMutation.mutate({
      videoId,
      text: commentText,
      parentComment: replyTo?.id,
    });
  };

  const handleReply = (commentId: string, username: string) => {
    setReplyTo({ id: commentId, username });
    // Focus on textarea
    document.getElementById('comment-input')?.focus();
  };

  return (
    <div className="space-y-6">
      <BackgroundGradient className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="text-purple-400" size={24} />
          <h3 className="text-xl font-semibold">
            Comments ({comments?.length || 0})
          </h3>
        </div>

        {/* Comment Input */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <img
              src={user?.picture || '/default-avatar.png'}
              alt={user?.name}
              className="w-10 h-10 rounded-full border-2 border-purple-500/30"
            />
            <div className="flex-1">
              {replyTo && (
                <div className="mb-2 text-sm text-purple-400 flex items-center gap-2">
                  <Reply size={14} />
                  Replying to <span className="font-semibold">{replyTo.username}</span>
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className="relative">
                <textarea
                  id="comment-input"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-purple-500 resize-none"
                  rows={3}
                  maxLength={1000}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || createMutation.isPending}
                  className="absolute bottom-3 right-3 p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-full transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {commentText.length}/1000
              </div>
            </div>
          </div>
        </form>

        {/* Comments List */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading comments...</p>
          </div>
        ) : comments && comments.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence>
              {comments.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  onReply={handleReply}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  onEdit={(id, text) => updateMutation.mutate({ id, text })}
                  onLike={(id) => likeMutation.mutate(id)}
                  currentUserId={user?.sub}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageCircle size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </BackgroundGradient>
    </div>
  );
};

export default CommentSection;
