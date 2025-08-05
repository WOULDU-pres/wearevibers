import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { CommentWithProfile, CommentContentType } from '@/types/comment';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface UseRealtimeCommentsProps {
  contentId: string;
  contentType: CommentContentType;
  enabled?: boolean;
}

// 댓글 프로필 조회 헬퍼 함수
const fetchCommentProfile = async (userId: string) => {
  const { data: profileData, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .eq('id', userId)
    .single();
  
  return { data: profileData, error };
};

// 댓글 트리 업데이트 헬퍼 함수들
const updateCommentTree = (comments: CommentWithProfile[], newComment: CommentWithProfile): CommentWithProfile[] => {
  return comments.map(comment => {
    if (comment.id === newComment.parent_id) {
      return {
        ...comment,
        replies: [...(comment.replies || []), newComment],
      };
    }
    
    if (comment.replies?.length > 0) {
      return {
        ...comment,
        replies: updateCommentTree(comment.replies, newComment),
      };
    }
    
    return comment;
  });
};

const updateCommentInTree = (comments: CommentWithProfile[], updatedComment: CommentWithProfile): CommentWithProfile[] => {
  return comments.map(comment => {
    if (comment.id === updatedComment.id) {
      return {
        ...comment,
        ...updatedComment,
        replies: comment.replies, // 기존 replies 유지
      };
    }
    
    if (comment.replies?.length > 0) {
      return {
        ...comment,
        replies: updateCommentInTree(comment.replies, updatedComment),
      };
    }
    
    return comment;
  });
};

const removeCommentFromTree = (comments: CommentWithProfile[], deletedCommentId: string): CommentWithProfile[] => {
  return comments
    .filter(comment => comment.id !== deletedCommentId)
    .map(comment => {
      if (comment.replies?.length > 0) {
        return {
          ...comment,
          replies: removeCommentFromTree(comment.replies, deletedCommentId),
        };
      }
      return comment;
    });
};

export const useRealtimeComments = ({ 
  contentId, 
  contentType, 
  enabled = true 
}: UseRealtimeCommentsProps) => {
  const queryClient = useQueryClient();

  // 댓글 추가 핸들러
  const handleCommentInsert = useCallback(async (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
    const { data: profileData, error } = await fetchCommentProfile(payload.new.user_id as string);
    
    if (error || !profileData) return;

    const newComment: CommentWithProfile = {
      ...payload.new,
      profiles: profileData,
      replies: [],
      depth: payload.new.parent_id ? 1 : 0,
    };

    // 댓글 목록 캐시 업데이트
    queryClient.setQueryData(
      ['comments', contentType, contentId],
      (old: CommentWithProfile[] = []) => {
        // 중복 방지 체크
        if (old.some(comment => comment.id === newComment.id)) {
          return old;
        }

        // 루트 댓글인 경우 맨 앞에 추가
        if (!newComment.parent_id) {
          return [newComment, ...old];
        }

        // 대댓글인 경우 부모 댓글의 replies에 추가
        return updateCommentTree(old, newComment);
      }
    );

    // 댓글 개수 캐시 업데이트
    queryClient.setQueryData(
      ['comment-count', contentType, contentId],
      (old: number = 0) => old + 1
    );
  }, [contentType, contentId, queryClient]);

  // 댓글 업데이트 핸들러
  const handleCommentUpdate = useCallback(async (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
    const { data: profileData, error } = await fetchCommentProfile(payload.new.user_id as string);
    
    if (error || !profileData) return;

    const updatedComment: CommentWithProfile = {
      ...payload.new,
      profiles: profileData,
    };

    // 댓글 목록 캐시 업데이트
    queryClient.setQueryData(
      ['comments', contentType, contentId],
      (old: CommentWithProfile[] = []) => updateCommentInTree(old, updatedComment)
    );

    // 개별 댓글 캐시 업데이트
    queryClient.setQueryData(['comment', payload.new.id], updatedComment);
  }, [contentType, contentId, queryClient]);

  // 댓글 삭제 핸들러
  const handleCommentDelete = useCallback((payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
    const deletedCommentId = payload.old.id as string;

    // 댓글 목록 캐시에서 제거
    queryClient.setQueryData(
      ['comments', contentType, contentId],
      (old: CommentWithProfile[] = []) => removeCommentFromTree(old, deletedCommentId)
    );

    // 댓글 개수 캐시 업데이트
    queryClient.setQueryData(
      ['comment-count', contentType, contentId],
      (old: number = 0) => Math.max(0, old - 1)
    );

    // 개별 댓글 캐시 제거
    queryClient.removeQueries(['comment', deletedCommentId]);
  }, [contentType, contentId, queryClient]);

  useEffect(() => {
    if (!enabled || !contentId || !contentType) return;

    const channelName = `comments:${contentType}:${contentId}`;
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `content_id=eq.${contentId}`,
      }, handleCommentInsert)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'comments',
        filter: `content_id=eq.${contentId}`,
      }, handleCommentUpdate)
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'comments',
        filter: `content_id=eq.${contentId}`,
      }, handleCommentDelete)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contentId, contentType, enabled, handleCommentInsert, handleCommentUpdate, handleCommentDelete]);
};

// 다중 콘텐츠에 대한 실시간 댓글 (기존 기능 유지)
export const useRealtimeCommentsMultiple = ({ 
  contentItems, 
  enabled = true 
}: { 
  contentItems: Array<{ id: string; type: CommentContentType }>; 
  enabled?: boolean; 
}) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || contentItems.length === 0) return;

    const channels = contentItems.map(({ id, type }) => {
      const channelName = `comments:${type}:${id}`;
      
      return supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `content_id=eq.${id}`,
        }, () => {
          // 해당 콘텐츠의 댓글 무효화
          queryClient.invalidateQueries(['comments', type, id]);
          queryClient.invalidateQueries(['comment-count', type, id]);
        })
        .subscribe();
    });

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [contentItems, enabled, queryClient]);
};

// 댓글 Vibe 실시간 업데이트
export const useRealtimeCommentVibes = ({ 
  commentIds, 
  enabled = true 
}: { 
  commentIds: string[]; 
  enabled?: boolean; 
}) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || commentIds.length === 0) return;

    const channel = supabase
      .channel('comment_vibes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comment_vibes',
        filter: `comment_id=in.(${commentIds.join(',')})`,
      }, () => {
        // 모든 댓글 Vibe 무효화
        commentIds.forEach(commentId => {
          queryClient.invalidateQueries(['comment-vibes', commentId]);
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [commentIds, enabled, queryClient]);
};

// 댓글 작성자들의 실시간 상태 업데이트
export const useRealtimeCommentAuthors = ({ 
  userIds, 
  enabled = true 
}: { 
  userIds: string[]; 
  enabled?: boolean; 
}) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || userIds.length === 0) return;

    const channel = supabase
      .channel('comment_authors')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=in.(${userIds.join(',')})`,
      }, () => {
        // 프로필 정보 무효화
        userIds.forEach(userId => {
          queryClient.invalidateQueries(['profile', userId]);
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userIds, enabled, queryClient]);
};