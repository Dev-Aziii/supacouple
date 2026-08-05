import React, { useState } from 'react';
import { Send, Trash2, CornerDownRight } from 'lucide-react';
import type { MemoryComment } from '../../types/memory';

interface MemoryCommentsProps {
  comments: MemoryComment[];
  currentUserId?: string;
  onAddComment: (content: string, parentCommentId?: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
}

export const MemoryComments: React.FC<MemoryCommentsProps> = ({
  comments,
  currentUserId,
  onAddComment,
  onDeleteComment,
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rootComments = comments.filter((c) => !c.parentCommentId);
  const getReplies = (parentId: string) => comments.filter((c) => c.parentCommentId === parentId);

  const handleSubmitRoot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await onAddComment(newComment.trim());
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyText.trim() || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await onAddComment(replyText.trim(), parentId);
      setReplyText('');
      setReplyToId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
        Comments ({comments.length})
      </h4>

      {/* Input */}
      <form onSubmit={handleSubmitRoot} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a sweet comment..."
          className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
        />
        <button
          type="submit"
          disabled={!newComment.trim() || isSubmitting}
          className="px-3.5 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-medium text-xs shadow-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          Send
        </button>
      </form>

      {/* List */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {rootComments.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">No comments yet. Be the first to leave a message!</p>
        ) : (
          rootComments.map((comment) => {
            const replies = getReplies(comment.id);
            return (
              <div key={comment.id} className="space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex justify-between items-start gap-2">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {comment.userId === currentUserId ? 'You' : 'Partner'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {comment.edited && <span className="text-[9px] text-slate-400 italic">(edited)</span>}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{comment.content}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Reply"
                    >
                      <CornerDownRight className="w-3.5 h-3.5" />
                    </button>
                    {comment.userId === currentUserId && (
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Nested Replies */}
                {replies.length > 0 && (
                  <div className="pl-5 space-y-1.5 border-l-2 border-slate-200 dark:border-slate-700">
                    {replies.map((reply) => (
                      <div key={reply.id} className="p-2 rounded-lg bg-slate-100/50 dark:bg-slate-800/20 text-xs flex justify-between items-start">
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {reply.userId === currentUserId ? 'You' : 'Partner'}
                          </span>
                          <p className="text-slate-600 dark:text-slate-300 mt-0.5">{reply.content}</p>
                        </div>
                        {reply.userId === currentUserId && (
                          <button
                            onClick={() => onDeleteComment(reply.id)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                {replyToId === comment.id && (
                  <div className="pl-5 flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70"
                    />
                    <button
                      onClick={() => handleSubmitReply(comment.id)}
                      className="px-2.5 py-1 bg-rose-500 text-white rounded-lg text-xs hover:bg-rose-600"
                    >
                      Reply
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
