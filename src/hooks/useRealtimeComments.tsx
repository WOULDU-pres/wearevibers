import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { CommentWithProfile, CommentContentType } from '@/types/comment';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface UseRealtimeCommentsProps {
  contentId: string;
  contentType: CommentContentType;
  enabled?: boolean;
}

export const useRealtimeComments = ({ 
  contentId, 
  contentType, 
  enabled = true 
}: UseRealtimeCommentsProps) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !contentId || !contentType) return;

    const channelName = `comments:${contentType}:${contentId}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `content_id=eq.${contentId}`,
        },
        async (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          console.log('New comment:', payload);
          
          // 새 댓글의 프로필 정보를 가져오기
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .eq('id', payload.new.user_id)
            .single();

          if (!error && profileData) {
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
                const updateCommentTree = (comments: CommentWithProfile[]): CommentWithProfile[] => {
                  return comments.map(comment => {
                    if (comment.id === newComment.parent_id) {
                      return {
                        ...comment,
                        replies: [...(comment.replies || []), newComment],
                      };
                    }
                    
                    if (comment.replies && comment.replies.length > 0) {
                      return {
                        ...comment,
                        replies: updateCommentTree(comment.replies),
                      };
                    }
                    
                    return comment;
                  });
                };

                return updateCommentTree(old);
              }
            );

            // 댓글 개수 캐시 업데이트
            queryClient.setQueryData(
              ['comment-count', contentType, contentId],
              (old: number = 0) => old + 1
            );
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'comments',
          filter: `content_id=eq.${contentId}`,
        },
        async (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          console.log('Updated comment:', payload);

          // 프로필 정보 포함하여 댓글 업데이트
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .eq('id', payload.new.user_id)
            .single();

          if (!error && profileData) {
            const updatedComment: CommentWithProfile = {
              ...payload.new,
              profiles: profileData,
            };

            // 댓글 목록 캐시 업데이트
            queryClient.setQueryData(
              ['comments', contentType, contentId],
              (old: CommentWithProfile[] = []) => {
                const updateCommentInTree = (comments: CommentWithProfile[]): CommentWithProfile[] => {
                  return comments.map(comment => {
                    if (comment.id === updatedComment.id) {
                      return {
                        ...comment,
                        ...updatedComment,
                        replies: comment.replies, // 기존 replies 유지
                      };
                    }
                    
                    if (comment.replies && comment.replies.length > 0) {
                      return {
                        ...comment,
                        replies: updateCommentInTree(comment.replies),
                      };
                    }
                    
                    return comment;
                  });
                };

                return updateCommentInTree(old);
              }
            );

            // 개별 댓글 캐시 업데이트
            queryClient.setQueryData(['comment', payload.new.id], updatedComment);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'comments',
          filter: `content_id=eq.${contentId}`,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          console.log('Deleted comment:', payload);

          const deletedCommentId = payload.old.id;

          // 댓글 목록 캐시에서 제거
          queryClient.setQueryData(
            ['comments', contentType, contentId],
            (old: CommentWithProfile[] = []) => {
              const removeCommentFromTree = (comments: CommentWithProfile[]): CommentWithProfile[] => {
                return comments
                  .filter(comment => comment.id !== deletedCommentId)
                  .map(comment => {
                    if (comment.replies && comment.replies.length > 0) {
                      return {
                        ...comment,
                        replies: removeCommentFromTree(comment.replies),
                      };
                    }
                    return comment;
                  });
              };

              return removeCommentFromTree(old);
            }
          );

          // 댓글 개수 캐시 업데이트
          queryClient.setQueryData(
            ['comment-count', contentType, contentId],
            (old: number = 0) => Math.max(0, old - 1)
          );

          // 개별 댓글 캐시 제거
          queryClient.removeQueries(['comment', deletedCommentId]);
        }
      )
      .subscribe();

    // Cleanup 함수
    return () => {
      supabase.removeChannel(channel);
    };
  }, [contentId, contentType, enabled, queryClient]);
};

// 다중 콘텐츠의 댓글 실시간 업데이트 (예: 피드에서 여러 게시물)
export const useRealtimeCommentsMultiple = (
  contentItems: Array<{ contentId: string; contentType: CommentContentType }>,
  enabled = true
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || contentItems.length === 0) return;

    const channels = contentItems.map(({ contentId, contentType }) => {
      const channelName = `comments:${contentType}:${contentId}`;
      
      return supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'comments',
            filter: `content_id=eq.${contentId}`,
          },
          () => {
            // 단순히 해당 댓글 목록 무효화
            queryClient.invalidateQueries(['comments', contentType, contentId]);
            queryClient.invalidateQueries(['comment-count', contentType, contentId]);
          }
        )
        .subscribe();
    });

    // Cleanup 함수
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [contentItems, enabled, queryClient]);
};

// Vibe(좋아요) 실시간 업데이트
export const useRealtimeCommentVibes = (commentIds: string[], enabled = true) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || commentIds.length === 0) return;

    const channel = supabase
      .channel('comment-vibes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vibes',
          filter: `content_type=eq.comment`,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          const contentId = payload.new?.content_id || payload.old?.content_id;
          
          if (commentIds.includes(contentId)) {
            // 댓글의 vibe 상태 캐시 무효화
            queryClient.invalidateQueries(['comment-vibe-status', contentId]);
            
            // 댓글 데이터 무효화 (vibe_count 업데이트를 위해)
            queryClient.invalidateQueries(['comment', contentId]);
            queryClient.invalidateQueries(['comments']);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [commentIds, enabled, queryClient]);
};

// 온라인 사용자 실시간 업데이트 (댓글 작성자들의 온라인 상태)
export const useRealtimeCommentAuthors = (userIds: string[], enabled = true) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || userIds.length === 0) return;

    const channel = supabase
      .channel('comment-authors-presence')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          if (userIds.includes(payload.new.id) && 
              payload.old.is_online !== payload.new.is_online) {
            // 해당 사용자가 포함된 댓글 목록 무효화
            queryClient.invalidateQueries(['comments']);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userIds, enabled, queryClient]);
};