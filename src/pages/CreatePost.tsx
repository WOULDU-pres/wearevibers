import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PostCreateForm from '@/components/PostCreateForm';
import { useCreatePost } from '@/hooks/usePosts';
import { useAuthStore } from '@/stores';
import { toast } from 'sonner';

const CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const createPostMutation = useCreatePost();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!user) {
      toast.error('로그인이 필요합니다.');
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleSubmit = async (data: {
    title: string;
    content: string;
    category: string;
    image_urls: string[];
  }) => {
    try {
      await createPostMutation.mutateAsync(data);
      toast.success('게시글이 성공적으로 작성되었습니다!');
      navigate('/lounge');
    } catch (error) {
      console.error('Post creation error:', error);
      toast.error('게시글 작성에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    navigate('/lounge');
  };

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <PostCreateForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createPostMutation.isPending}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default CreatePost;