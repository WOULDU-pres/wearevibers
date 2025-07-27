import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Bookmark, Share2, Clock, User, ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

const mockTip = {
  id: 1,
  title: "CSS Grid로 완벽한 반응형 레이아웃 만들기",
  author: "GridMaster",
  authorAvatar: "/placeholder.svg",
  category: "CSS_Trick",
  difficulty: "초급",
  readTime: "5분",
  vibes: 89,
  isLiked: false,
  isBookmarked: false,
  content: `CSS Grid는 현대 웹 개발에서 레이아웃을 만드는 가장 강력한 도구 중 하나입니다. 오늘은 Grid의 핵심 기능들을 활용해서 모든 화면 크기에 완벽하게 대응하는 반응형 레이아웃을 만드는 방법을 알아보겠습니다.

## 기본 Grid 설정

먼저 기본적인 그리드 컨테이너를 설정해보겠습니다:

\`\`\`css
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1rem;
}
\`\`\`

## fr 단위의 활용

\`fr\` 단위는 Grid에서 사용하는 fractional unit으로, 사용 가능한 공간을 비율로 나누어 할당합니다:

\`\`\`css
.three-column-layout {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  /* 왼쪽 1, 가운데 2, 오른쪽 1의 비율 */
}
\`\`\`

## minmax() 함수로 유연성 확보

\`minmax()\` 함수를 사용하면 최소값과 최대값을 지정하여 더욱 유연한 레이아웃을 만들 수 있습니다:

\`\`\`css
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}
\`\`\`

## 실전 예제: 카드 레이아웃

다음은 실제 프로젝트에서 자주 사용하는 카드 레이아웃 예제입니다:

\`\`\`css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.card {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1.5rem;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
    gap: 1rem;
  }
}
\`\`\`

## 핵심 팁

1. **auto-fit vs auto-fill**: auto-fit은 빈 트랙을 제거하고, auto-fill은 유지합니다.
2. **gap 속성**: margin 대신 gap을 사용하면 더 깔끔한 간격 조정이 가능합니다.
3. **grid-area**: 복잡한 레이아웃에서는 grid-area로 명시적인 배치를 고려해보세요.

## 마무리

CSS Grid를 제대로 활용하면 Flexbox만으로는 구현하기 어려운 복잡한 레이아웃도 간단하게 만들 수 있습니다. 특히 반응형 웹 디자인에서 Grid의 진가가 발휘되니, 다양한 프로젝트에 적용해보시기 바랍니다!`,
  tags: ["CSS", "Grid", "반응형", "레이아웃", "웹디자인"]
};

const mockComments = [
  {
    id: 1,
    author: "CSSMaster",
    authorAvatar: "/placeholder.svg",
    time: "1시간 전",
    content: "정말 유용한 가이드네요! auto-fit과 auto-fill의 차이점 설명이 특히 도움이 되었습니다 👍",
    likes: 8,
    isLiked: false
  },
  {
    id: 2,
    author: "ResponsiveDesigner",
    authorAvatar: "/placeholder.svg",
    time: "45분 전",
    content: "minmax() 함수 활용법이 인상적이에요. 제 프로젝트에 바로 적용해보겠습니다!",
    likes: 5,
    isLiked: true
  }
];

const TipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(mockComments);
  const [isLiked, setIsLiked] = useState(mockTip.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(mockTip.isBookmarked);
  const [likesCount, setLikesCount] = useState(mockTip.vibes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
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

        {/* Tip Content */}
        <Card className="border-border/50 bg-card/50 backdrop-blur mb-8">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className="text-xs">
                #{mockTip.category}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {mockTip.difficulty}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {mockTip.readTime} 읽기
              </div>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">{mockTip.title}</h1>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={mockTip.authorAvatar} alt={mockTip.author} />
                  <AvatarFallback className="bg-gradient-vibe text-white text-sm">
                    {mockTip.author.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{mockTip.author}</span>
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className={`flex items-center gap-1 ${isBookmarked ? 'text-blue-500' : 'hover:text-blue-500'}`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  저장
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Share2 className="w-4 h-4" />
                  공유
                </Button>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {mockTip.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              {mockTip.content.split('\n').map((paragraph, index) => {
                if (paragraph.startsWith('## ')) {
                  return <h2 key={index} className="text-2xl font-bold mt-6 mb-4">{paragraph.slice(3)}</h2>;
                } else if (paragraph.startsWith('```css')) {
                  return <div key={index} className="bg-muted/50 rounded-lg p-4 my-4 font-mono text-sm overflow-x-auto">{/* CSS code block would be here */}</div>;
                } else if (paragraph.startsWith('```')) {
                  return null; // Skip closing code block markers
                } else if (paragraph.includes('`') && paragraph.indexOf('`') !== paragraph.lastIndexOf('`')) {
                  const parts = paragraph.split('`');
                  return (
                    <p key={index} className="mb-4">
                      {parts.map((part, i) => 
                        i % 2 === 0 ? part : <code key={i} className="bg-muted/50 px-1 py-0.5 rounded text-sm">{part}</code>
                      )}
                    </p>
                  );
                } else if (paragraph.match(/^\d+\./)) {
                  return <p key={index} className="mb-2 ml-4">{paragraph}</p>;
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

export default TipDetail;