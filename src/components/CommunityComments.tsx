import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Send, User as UserIcon } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';

interface Comment {
  id: string;
  content: string;
  likes: number;
  created_at: string;
  profiles?: {
    full_name: string;
    perfil: string;
  };
  user_id: string;
}

interface CommunityCommentsProps {
  questionId: string;
}

export function CommunityComments({ questionId }: CommunityCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadComments() {
      // Query fetching comments and joining profiles if possible
      const { data, error } = await supabase
        .from('question_comments' as any)
        .select(`
          id, content, likes, created_at, user_id,
          profiles (full_name, perfil)
        `)
        .eq('question_id', questionId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setComments(data as unknown as Comment[]);
      }
      setLoading(false);
    }

    loadComments();
  }, [questionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    
    // Insert into DB
    const insertData = {
      question_id: questionId,
      user_id: user.id,
      content: newComment.trim()
    };

    const { data, error } = await supabase
      .from('question_comments' as any)
      .insert(insertData)
      .select(`
        id, content, likes, created_at, user_id,
        profiles (full_name, perfil)
      `)
      .single();

    if (!error && data) {
      setComments([data as unknown as Comment, ...comments]);
      setNewComment('');
    }
    
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 animate-pulse flex flex-col gap-4">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-6 text-slate-800 dark:text-slate-100">
        <MessageSquare className="w-5 h-5 text-indigo-500" />
        <h3 className="text-lg font-semibold">Comentários da Comunidade</h3>
        <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs px-2 py-0.5 rounded-full font-medium ml-2">
          {comments.length}
        </span>
      </div>

      {/* Form Input */}
      <form onSubmit={handleSubmit} className="mb-8 relative">
        <div className="flex gap-3 items-start">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 text-slate-400">
            <UserIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 relative">
            <textarea
              placeholder="Adicione um mnemônico, dica ou comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full min-h-[80px] p-3 pt-3 pb-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none text-sm text-slate-800 dark:text-slate-200 shadow-sm"
            />
            <Button 
              type="submit" 
              disabled={!newComment.trim() || submitting}
              className="absolute bottom-2 right-2 h-8 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium"
            >
              {submitting ? 'Enviando...' : <span className="flex items-center gap-1.5"><Send className="w-3 h-3"/> Enviar</span>}
            </Button>
          </div>
        </div>
      </form>

      {/* Comment List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 text-sm">Ninguém comentou ainda. Seja o primeiro a criar um mnemônico para esta questão!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center shrink-0 border border-indigo-200/50 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400">
                <UserIcon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-none p-3.5 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {comment.profiles?.full_name || 'Colega de Plantão'}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {comment.profiles?.perfil?.replace('4ano', '4º Ano').replace('concluinte', 'Concluinte 6º Ano').replace('medico', 'Médico') || 'Estudante'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-1.5 ml-1">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {new Date(comment.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </span>
                  <button className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    <ThumbsUp className="w-3 h-3" />
                    {comment.likes > 0 && comment.likes} Curtir
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
