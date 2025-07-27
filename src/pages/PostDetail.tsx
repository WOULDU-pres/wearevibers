import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Share2, User, Calendar, ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { usePost, usePostComments, useCreateComment, useIsPostVibed, useVibePost, useIsCommentVibed, useVibeComment } from "@/hooks/usePosts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useFormStore } from "@/stores";

const CommentItem = ({ comment, postId }: { 
  comment: any; 
  postId: string; 
}) => {
  const { data: isCommentVibed } = useIsCommentVibed(comment.id);
  const vibeCommentMutation = useVibeComment();

  const handleCommentLike = () => {
    vibeCommentMutation.mutate({ 
      commentId: comment.id, 
      postId, 
      isVibed: isCommentVibed || false 
    });
  };

  return (
    <div className="border-l-2 border-border pl-4">
      <div className="flex items-start gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={comment.profiles.avatar_url || ''} alt={comment.profiles.full_name || comment.profiles.username} />
          <AvatarFallback className="bg-gradient-vibe text-white text-sm">
            {(comment.profiles.full_name || comment.profiles.username).slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium">{comment.profiles.full_name || comment.profiles.username}</span>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at!), { addSuffix: true, locale: ko })}
            </span>
          </div>
          
          <p className="text-muted-foreground mb-3">{comment.content}</p>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCommentLike}
            disabled={vibeCommentMutation.isPending}
            className={`flex items-center gap-1 text-xs ${isCommentVibed ? 'text-red-500' : 'hover:text-red-500'}`}
          >
            <Heart className={`w-3 h-3 ${isCommentVibed ? 'fill-current' : ''}`} />
            {comment.vibe_count || 0}
          </Button>
        </div>
      </div>
    </div>
  );
};


const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { commentForm, updateCommentForm, resetCommentForm } = useFormStore();

  const { data: post, isLoading: postLoading, error: postError } = usePost(id!);
  const { data: comments, isLoading: commentsLoading } = usePostComments(id!);
  const { data: isPostVibed, isLoading: vibedLoading } = useIsPostVibed(id!);
  const createCommentMutation = useCreateComment();
  const vibePostMutation = useVibePost();

  const handleLike = () => {
    if (!id) return;
    vibePostMutation.mutate({ postId: id, isVibed: isPostVibed || false });
  };

  const handleCommentSubmit = () => {
    if (commentForm.newComment.trim() && id) {
      createCommentMutation.mutate(
        { postId: id, content: commentForm.newComment },
        {
          onSuccess: () => {
            resetCommentForm();
          }
        }
      );
    }
  };

  if (postLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로 가기
          </Button>
          <Card className="border-border/50 bg-card/50 backdrop-blur mb-8">
            <CardHeader>
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-8 w-3/4 mb-4" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로 가기
          </Button>
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">게시글을 찾을 수 없습니다</h2>
              <p className="text-muted-foreground">요청하신 게시글이 존재하지 않거나 삭제되었습니다.</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          뒤로 가기
        </Button>

        {/* Post Content */}
        <Card className="border-border/50 bg-card/50 backdrop-blur mb-8">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className="text-xs">
                #{post.category}
              </Badge>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={post.profiles.avatar_url || ''} alt={post.profiles.full_name || post.profiles.username} />
                    <AvatarFallback className="bg-gradient-vibe text-white text-sm">
                      {(post.profiles.full_name || post.profiles.username).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{post.profiles.full_name || post.profiles.username}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {formatDistanceToNow(new Date(post.created_at!), { addSuffix: true, locale: ko })}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={vibedLoading || vibePostMutation.isPending}
                  className={`flex items-center gap-1 ${isPostVibed ? 'text-red-500' : 'hover:text-red-500'}`}
                >
                  <Heart className={`w-4 h-4 ${isPostVibed ? 'fill-current' : ''}`} />
                  {post.vibe_count || 0}
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {post.comment_count || 0}
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Share2 className="w-4 h-4" />
                  공유
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              {post.content.split('\n').map((paragraph, index) => {
                if (paragraph.startsWith('## ')) {
                  return <h2 key={index} className="text-2xl font-bold mt-6 mb-4">{paragraph.slice(3)}</h2>;
                } else if (paragraph.startsWith('### ')) {
                  return <h3 key={index} className="text-xl font-semibold mt-4 mb-3">{paragraph.slice(4)}</h3>;
                } else if (paragraph.startsWith('1. ') || paragraph.startsWith('2. ') || paragraph.startsWith('3. ')) {
                  return <p key={index} className="mb-2 ml-4">{paragraph}</p>;
                } else if (paragraph.startsWith('   - ')) {
                  return <p key={index} className="mb-1 ml-8 text-muted-foreground">{paragraph.slice(5)}</p>;
                } else if (paragraph.startsWith('- ')) {
                  return <p key={index} className="mb-1 ml-4">{paragraph.slice(2)}</p>;
                } else {
                  return <p key={index} className="mb-4">{paragraph}</p>;
                }
              })}
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <h2 className="text-xl font-bold">
              댓글 {commentsLoading ? '-' : (comments?.length || 0)}개
            </h2>
          </CardHeader>
          
          <CardContent>
            {/* Comment Form */}
            <div className="mb-6 space-y-4">
              <Textarea
                placeholder="댓글을 작성해주세요..."
                value={commentForm.newComment}
                onChange={(e) => updateCommentForm({ newComment: e.target.value })}
                className="min-h-[100px] bg-muted/30 border-border"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleCommentSubmit}
                  className="bg-gradient-vibe hover:opacity-90 text-white border-0"
                  disabled={!commentForm.newComment.trim() || createCommentMutation.isPending}
                >
                  {createCommentMutation.isPending ? '작성 중...' : '댓글 작성'}
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              {commentsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="border-l-2 border-border pl-4">
                    <div className="flex items-start gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-4 w-full mb-3" />
                        <Skeleton className="h-6 w-12" />
                      </div>
                    </div>
                  </div>
                ))
              ) : comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} postId={id!} />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default PostDetail;