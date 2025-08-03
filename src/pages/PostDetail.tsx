import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommentSection } from "@/components/CommentSection";
import { Heart, MessageCircle, Share2, Calendar, ArrowLeft, Edit } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { usePost, useIsPostVibed, useVibePost, useUpdatePost, useDeletePost } from "@/hooks/usePosts";
import { useAuthStore } from "@/stores";
import { PostEditDialog } from "@/components/PostEditDialog";
import { PostDeleteDialog } from "@/components/PostDeleteDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";


const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: post, isLoading: postLoading, error: postError } = usePost(id!);
  const { data: isPostVibed, isLoading: vibedLoading } = useIsPostVibed(id!);
  const vibePostMutation = useVibePost();
  const updatePostMutation = useUpdatePost();
  const deletePostMutation = useDeletePost();

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleLike = () => {
    if (!id) return;
    vibePostMutation.mutate({ postId: id, isVibed: isPostVibed || false });
  };

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleSaveEdit = async (postId: string, updates: { title?: string; content?: string; category?: string }) => {
    await updatePostMutation.mutateAsync({ postId, postData: updates });
  };

  const handleConfirmDelete = async (postId: string) => {
    await deletePostMutation.mutateAsync(postId);
    navigate('/lounge'); // Redirect to lounge after deletion
  };

  // Check if current user can edit/delete this post
  const canModifyPost = user && post && post.user_id === user.id;

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
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
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
                
                {/* More actions menu */}
                {canModifyPost && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-muted"
                      >
                        <span className="sr-only">메뉴 열기</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem onClick={handleEdit}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>편집</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-400">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>삭제</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
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
        <CommentSection
          contentId={id!}
          contentType="post"
          title="댓글"
          className="border-border/50 bg-card/50 backdrop-blur"
          enableRealtime={true}
          showStats={true}
        />
      </div>
      
      <Footer />

      {/* Edit Dialog */}
      {post && (
        <PostEditDialog
          isOpen={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          post={post}
          onSave={handleSaveEdit}
          isLoading={updatePostMutation.isPending}
        />
      )}

      {/* Delete Dialog */}
      {post && (
        <PostDeleteDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          post={post}
          onDelete={handleConfirmDelete}
          isLoading={deletePostMutation.isPending}
        />
      )}
    </div>
  );
};

export default PostDetail;