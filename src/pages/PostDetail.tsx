import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Share2, User, Calendar, ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

// Mock data - 실제로는 API에서 가져올 데이터
const mockPost = {
  id: 1,
  title: "밤샘 코딩을 위한 완벽한 플레이리스트 🎵",
  author: "VibeSeeker",
  authorAvatar: "/placeholder.svg",
  category: "코딩플레이리스트",
  time: "2시간 전",
  likes: 24,
  isLiked: false,
  content: `로파이 힙합부터 앰비언트까지, 집중력을 극대화하는 음악 리스트를 공유합니다.

## 밤샘 코딩을 위한 플레이리스트

개발자로 일하면서 가장 어려운 것 중 하나가 깊은 밤까지 집중력을 유지하는 것이라고 생각합니다. 특히 중요한 데드라인이 있거나 복잡한 버그를 해결해야 할 때는 더욱 그렇죠.

저는 지난 5년간 다양한 음악을 들으며 코딩해왔고, 그 경험을 바탕으로 정말 효과적인 플레이리스트를 만들었습니다.

### 🎵 추천 곡 목록

1. **Lofi Hip Hop**
   - Chillhop Essentials
   - StudyMusic Project
   - Nujabes - Aruarian Dance

2. **Ambient**
   - Brian Eno - Music for Airports
   - Stars of the Lid - The Tired Sounds of

3. **Post-Rock**
   - Godspeed You! Black Emperor
   - Explosions in the Sky

### 💡 팁

- 가사가 있는 음악은 피하세요
- 볼륨은 적당히 낮게
- 2-3시간마다 플레이리스트 변경

이 플레이리스트로 여러분도 효율적인 밤샘 코딩을 경험해보세요!`,
  tags: ["음악", "플레이리스트", "생산성", "코딩"]
};

const mockComments = [
  {
    id: 1,
    author: "MusicLover",
    authorAvatar: "/placeholder.svg",
    time: "1시간 전",
    content: "정말 좋은 플레이리스트네요! Nujabes는 정말 코딩할 때 최고입니다 ✨",
    likes: 5,
    isLiked: false
  },
  {
    id: 2,
    author: "DevNinja",
    authorAvatar: "/placeholder.svg",
    time: "30분 전",
    content: "Brian Eno는 처음 들어보는데 정말 집중이 잘되네요. 감사합니다!",
    likes: 3,
    isLiked: true
  },
  {
    id: 3,
    author: "CodeViber",
    authorAvatar: "/placeholder.svg",
    time: "15분 전",
    content: "저도 비슷한 취향이에요! Explosions in the Sky 추가로 추천드립니다 🎵",
    likes: 2,
    isLiked: false
  }
];

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(mockComments);
  const [isLiked, setIsLiked] = useState(mockPost.isLiked);
  const [likesCount, setLikesCount] = useState(mockPost.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      const newCommentObj = {
        id: comments.length + 1,
        author: "CurrentUser",
        authorAvatar: "/placeholder.svg",
        time: "방금 전",
        content: newComment,
        likes: 0,
        isLiked: false
      };
      setComments([...comments, newCommentObj]);
      setNewComment("");
    }
  };

  const handleCommentLike = (commentId: number) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { 
            ...comment, 
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
          }
        : comment
    ));
  };

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
                #{mockPost.category}
              </Badge>
              {mockPost.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <h1 className="text-3xl font-bold mb-4">{mockPost.title}</h1>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={mockPost.authorAvatar} alt={mockPost.author} />
                    <AvatarFallback className="bg-gradient-vibe text-white text-sm">
                      {mockPost.author.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{mockPost.author}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {mockPost.time}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  {likesCount}
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {comments.length}
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
              {mockPost.content.split('\n').map((paragraph, index) => {
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
            <h2 className="text-xl font-bold">댓글 {comments.length}개</h2>
          </CardHeader>
          
          <CardContent>
            {/* Comment Form */}
            <div className="mb-6 space-y-4">
              <Textarea
                placeholder="댓글을 작성해주세요..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px] bg-muted/30 border-border"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleCommentSubmit}
                  className="bg-gradient-vibe hover:opacity-90 text-white border-0"
                  disabled={!newComment.trim()}
                >
                  댓글 작성
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="border-l-2 border-border pl-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.authorAvatar} alt={comment.author} />
                      <AvatarFallback className="bg-gradient-vibe text-white text-sm">
                        {comment.author.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{comment.author}</span>
                        <span className="text-sm text-muted-foreground">{comment.time}</span>
                      </div>
                      
                      <p className="text-muted-foreground mb-3">{comment.content}</p>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCommentLike(comment.id)}
                        className={`flex items-center gap-1 text-xs ${comment.isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                      >
                        <Heart className={`w-3 h-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                        {comment.likes}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default PostDetail;