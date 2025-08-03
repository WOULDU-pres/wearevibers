import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores';
import { toast } from 'sonner';
import { isAuthError, handleAuthError, authAwareRetry, createAuthAwareMutationErrorHandler as _createAuthAwareMutationErrorHandler } from '@/lib/authErrorHandler';
import type { 
  CommentWithProfile, 
  CommentContentType, 
  CreateCommentRequest, 
  UpdateCommentRequest,
  CommentQueryOptions,
} from '@/types/comment';

const COMMENTS_PER_PAGE = 20;

// 댓글 목록 조회 (중첩 구조로)
export const useComments = (contentId: string, contentType: CommentContentType) => {
  return useQuery({
    queryKey: ['comments', contentType, contentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url,
          )
        `)
        .eq('content_id', contentId)
        .eq('content_type', contentType)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error);
        
        if (isAuthError(error)) {
          await handleAuthError(error);
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        
        throw error;
      }

      // 댓글을 트리 구조로 변환
      const commentsMap = new Map<string, CommentWithProfile>();
      const rootComments: CommentWithProfile[] = [];

      // 먼저 모든 댓글을 맵에 저장
      data.forEach((comment) => {
        const commentWithProfile: CommentWithProfile = {
          ...comment,
          profiles: comment.profiles,
          replies: [],
          depth: 0
        };
        commentsMap.set(comment.id, commentWithProfile);
      });

      // 부모-자식 관계 설정 및 깊이 계산
      data.forEach((comment) => {
        const commentWithProfile = commentsMap.get(comment.id)!;
        
        if (comment.parent_id) {
          const parent = commentsMap.get(comment.parent_id);
          if (parent) {
            parent.replies = parent.replies || [];
            parent.replies.push(commentWithProfile);
            commentWithProfile.depth = (parent.depth || 0) + 1;
          }
        } else {
          rootComments.push(commentWithProfile);
        }
      });

      // 각 레벨에서 생성 시간순으로 정렬
      const sortCommentsByDate = (comments: CommentWithProfile[]) => {
        comments.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        comments.forEach(comment => {
          if (comment.replies && comment.replies.length > 0) {
            sortCommentsByDate(comment.replies);
          }
        });
      };

      sortCommentsByDate(rootComments);

      return rootComments;
    },
    enabled: !!contentId && !!contentType,
    retry: authAwareRetry,
  });
};

// 특정 댓글 조회
export const useComment = (commentId: string) => {
  return useQuery({
    queryKey: ['comment', commentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url,
          )
        `)
        .eq('id', commentId)
        .single();

      if (error) {
        console.error('Error fetching comment:', error);
        
        if (isAuthError(error)) {
          await handleAuthError(error);
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        
        throw error;
      }

      return {
        ...data,
        profiles: data.profiles,
      } as CommentWithProfile;
    },
    enabled: !!commentId,
    retry: authAwareRetry,
  });
};

// 댓글 개수 조회
export const useCommentCount = (contentId: string, contentType: CommentContentType) => {
  return useQuery({
    queryKey: ['comment-count', contentType, contentId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('content_id', contentId)
        .eq('content_type', contentType);

      if (error) {
        console.error('Error fetching comment count:', error);
        throw error;
      }

      return count || 0;
    },
    enabled: !!contentId && !!contentType,
    retry: authAwareRetry,
  });
};

// 댓글 작성
export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (commentData: CreateCommentRequest) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('comments')
        .insert({
          ...commentData,
          user_id: user.id,
        })
        .select(`
          *,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url,
          )
        `)
        .single();

      if (error) {
        console.error('Error creating comment:', error);
        throw error;
      }

      return {
        ...data,
        profiles: data.profiles,
        replies: [],
        depth: commentData.parent_id ? 1 : 0
      } as CommentWithProfile;
    },
    onSuccess: (data, variables) => {
      // 댓글 목록 갱신
      queryClient.invalidateQueries({ 
        queryKey: ['comments', variables.content_type, variables.content_id] 
      });
      
      // 댓글 개수 갱신
      queryClient.invalidateQueries({ 
        queryKey: ['comment-count', variables.content_type, variables.content_id] 
      });

      // 콘텐츠의 댓글 개수 업데이트 (프로젝트, 팁, 포스트)
      if (variables.content_type === 'project') {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        queryClient.invalidateQueries({ queryKey: ['project', variables.content_id] });
      } else if (variables.content_type === 'tip') {
        queryClient.invalidateQueries({ queryKey: ['tips'] });
        queryClient.invalidateQueries({ queryKey: ['tip', variables.content_id] });
      } else if (variables.content_type === 'post') {
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        queryClient.invalidateQueries({ queryKey: ['post', variables.content_id] });
      }

      toast.success('댓글이 작성되었습니다!');
    },
    onError: createAuthAwareMutationErrorHandler as _createAuthAwareMutationErrorHandler('댓글 작성에 실패했습니다.'),
  });
};

// 댓글 수정
export const useUpdateComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ 
      commentId, 
      updates,
    }: { 
      commentId: string; 
      updates: UpdateCommentRequest 
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('comments')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', commentId)
        .eq('user_id', user.id) // 본인 댓글만 수정 가능
        .select(`
          *,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url,
          )
        `)
        .single();

      if (error) {
        console.error('Error updating comment:', error);
        throw error;
      }

      return {
        ...data,
        profiles: data.profiles,
      } as CommentWithProfile;
    },
    onSuccess: (data) => {
      // 해당 댓글이 속한 콘텐츠의 댓글 목록 갱신
      queryClient.invalidateQueries({ 
        queryKey: ['comments', data.content_type, data.content_id] 
      });
      
      // 개별 댓글 갱신
      queryClient.invalidateQueries({ 
        queryKey: ['comment', data.id] 
      });

      toast.success('댓글이 수정되었습니다!');
    },
    onError: createAuthAwareMutationErrorHandler as _createAuthAwareMutationErrorHandler('댓글 수정에 실패했습니다.'),
  });
};

// 댓글 삭제
export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error('User not authenticated');

      // 먼저 댓글 정보를 가져와서 어떤 콘텐츠의 댓글인지 확인
      const { data: commentData, error: fetchError } = await supabase
        .from('comments')
        .select('content_id, content_type, user_id')
        .eq('id', commentId)
        .single();

      if (fetchError || !commentData) {
        throw new Error('댓글을 찾을 수 없습니다.');
      }

      // 본인 댓글인지 확인
      if (commentData.user_id !== user.id) {
        throw new Error('본인의 댓글만 삭제할 수 있습니다.');
      }

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id); // 이중 확인

      if (error) {
        console.error('Error deleting comment:', error);
        throw error;
      }

      return commentData;
    },
    onSuccess: (commentData) => {
      // 댓글 목록 갱신
      queryClient.invalidateQueries({ 
        queryKey: ['comments', commentData.content_type, commentData.content_id] 
      });
      
      // 댓글 개수 갱신
      queryClient.invalidateQueries({ 
        queryKey: ['comment-count', commentData.content_type, commentData.content_id] 
      });

      // 콘텐츠의 댓글 개수 업데이트
      if (commentData.content_type === 'project') {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        queryClient.invalidateQueries({ queryKey: ['project', commentData.content_id] });
      } else if (commentData.content_type === 'tip') {
        queryClient.invalidateQueries({ queryKey: ['tips'] });
        queryClient.invalidateQueries({ queryKey: ['tip', commentData.content_id] });
      } else if (commentData.content_type === 'post') {
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        queryClient.invalidateQueries({ queryKey: ['post', commentData.content_id] });
      }

      toast.success('댓글이 삭제되었습니다.');
    },
    onError: createAuthAwareMutationErrorHandler as _createAuthAwareMutationErrorHandler('댓글 삭제에 실패했습니다.'),
  });
};

// 댓글 좋아요
export const useVibeComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ commentId, isVibed }: { commentId: string; isVibed: boolean }) => {
      if (!user) throw new Error('User not authenticated');

      if (isVibed) {
        // 좋아요 취소
        const { error } = await supabase
          .from('vibes')
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', commentId)
          .eq('content_type', 'comment');

        if (error) {
          console.error('Error removing comment vibe:', error);
          throw error;
        }

        // 댓글의 좋아요 수 감소
        const { error: updateError } = await supabase
          .from('comments')
          .update({ vibe_count: supabase.rpc('decrement', { current_count: 'vibe_count' }) })
          .eq('id', commentId);

        if (updateError) {
          console.error('Error updating comment vibe count:', updateError);
          throw updateError;
        }
      } else {
        // 좋아요 추가
        const { error } = await supabase
          .from('vibes')
          .insert({
            user_id: user.id,
            content_id: commentId,
            content_type: 'comment',
          });

        if (error && error.code !== '23505') { // 중복 삽입 무시
          console.error('Error adding comment vibe:', error);
          throw error;
        }

        // 댓글의 좋아요 수 증가
        const { error: updateError } = await supabase
          .from('comments')
          .update({ vibe_count: supabase.rpc('increment', { current_count: 'vibe_count' }) })
          .eq('id', commentId);

        if (updateError) {
          console.error('Error updating comment vibe count:', updateError);
          throw updateError;
        }
      }

      return !isVibed;
    },
    onSuccess: (newVibeState, variables) => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['comment', variables.commentId] });
      
      if (!newVibeState) {
        toast.success('좋아요가 취소되었습니다.');
      } else {
        toast.success('댓글에 좋아요를 눌렀습니다! 💝');
      }
    },
    onError: createAuthAwareMutationErrorHandler as _createAuthAwareMutationErrorHandler('좋아요 처리에 실패했습니다.'),
  });
};

// 사용자의 특정 댓글에 대한 좋아요 상태 확인
export const useCommentVibeStatus = (commentId: string) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['comment-vibe-status', commentId, user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from('vibes')
        .select('id')
        .eq('user_id', user.id)
        .eq('content_id', commentId)
        .eq('content_type', 'comment')
        .maybeSingle();

      if (error) {
        console.error('Error checking comment vibe status:', error);
        return false;
      }

      return !!data;
    },
    enabled: !!user && !!commentId,
    retry: authAwareRetry,
  });
};