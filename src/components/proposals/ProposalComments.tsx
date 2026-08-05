import React, { useState, useEffect, useCallback } from 'react';
import { ProposalComment } from '@/types/proposal';
import { proposalService } from '@/services/proposals/proposalService';
import { useSession } from '@/hooks/useSession';
import { useCouple } from '@/hooks/useCouple';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Trash2, Edit2, CornerDownRight, Check, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ProposalCommentsProps {
  proposalId: string;
  className?: string;
}

export const ProposalComments: React.FC<ProposalCommentsProps> = ({ proposalId, className }) => {
  const { user } = useSession();
  const { partner } = useCouple();
  const userId = user?.id;

  const [comments, setComments] = useState<ProposalComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const data = await proposalService.getComments(proposalId);
      setComments(data);
    } catch (err) {
      console.error('[ProposalComments] Fetch failed:', err);
    }
  }, [proposalId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSendComment = async (parentId?: string) => {
    if (!userId || !newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await proposalService.addComment(proposalId, userId, newComment.trim(), parentId);
      setNewComment('');
      setReplyParentId(null);
      await fetchComments();
    } catch (err) {
      console.error('[ProposalComments] Add failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await proposalService.updateComment(commentId, editContent.trim());
      setEditingCommentId(null);
      setEditContent('');
      await fetchComments();
    } catch (err) {
      console.error('[ProposalComments] Update failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await proposalService.deleteComment(commentId);
      await fetchComments();
    } catch (err) {
      console.error('[ProposalComments] Delete failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Separate root comments and replies
  const rootComments = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) => comments.filter((c) => c.parentId === parentId);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b border-border/40 pb-2">
        <MessageSquare className="w-4 h-4 text-pink-400" />
        <span>Discussion ({comments.length})</span>
      </div>

      {/* Main Comment Input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
          placeholder="Leave a message or thought..."
          className="flex-1 bg-accent/40 border border-border/50 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
        />
        <button
          onClick={() => handleSendComment()}
          disabled={!newComment.trim() || isSubmitting}
          className="p-2.5 rounded-xl bg-pink-500 text-white hover:bg-pink-600 disabled:opacity-50 transition-colors shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Comments List */}
      <div className="space-y-3 pt-2">
        <AnimatePresence initial={false}>
          {rootComments.map((comment) => {
            const isMine = comment.userId === userId;
            const displayName = isMine ? 'You' : partner?.displayName || 'Partner';
            const replies = getReplies(comment.id);

            return (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-card/40 border border-border/40 rounded-2xl p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{displayName}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {comment.isEdited && <span className="text-[10px] text-muted-foreground italic">(edited)</span>}
                  </div>

                  {isMine && !comment.isDeleted && (
                    <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                      <button
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditContent(comment.content);
                        }}
                        className="p-1 hover:text-pink-400 transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-1 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {editingCommentId === comment.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="flex-1 bg-accent/60 border border-border rounded-lg px-2.5 py-1 text-xs"
                    />
                    <button
                      onClick={() => handleUpdateComment(comment.id)}
                      className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingCommentId(null)}
                      className="p-1.5 bg-accent text-muted-foreground rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <p className={cn('text-xs text-foreground/90 leading-relaxed', comment.isDeleted && 'italic text-muted-foreground')}>
                    {comment.content}
                  </p>
                )}

                {/* Reply action trigger */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                  <button
                    onClick={() => setReplyParentId(replyParentId === comment.id ? null : comment.id)}
                    className="flex items-center gap-1 hover:text-pink-400 transition-colors"
                  >
                    <CornerDownRight className="w-3 h-3" />
                    <span>Reply</span>
                  </button>
                </div>

                {/* Inline Reply input */}
                {replyParentId === comment.id && (
                  <div className="flex items-center gap-2 pl-4 pt-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a reply..."
                      className="flex-1 bg-accent/40 border border-border/50 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-pink-500"
                    />
                    <button
                      onClick={() => handleSendComment(comment.id)}
                      className="p-1.5 rounded-lg bg-pink-500 text-white text-xs font-medium"
                    >
                      Send
                    </button>
                  </div>
                )}

                {/* Nested Replies */}
                {replies.length > 0 && (
                  <div className="pl-4 border-l-2 border-pink-500/20 space-y-2 pt-2">
                    {replies.map((reply) => (
                      <div key={reply.id} className="bg-accent/20 rounded-xl p-2.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-foreground">
                            {reply.userId === userId ? 'You' : partner?.displayName || 'Partner'}
                          </span>
                          <span className="text-[9px] text-muted-foreground">
                            {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-foreground/80">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
