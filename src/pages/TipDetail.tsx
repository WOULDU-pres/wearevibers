import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommentSection } from "@/components/CommentSection";
import { Heart, Bookmark, Share2, Clock, ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useTip, useIsTipVibed, useVibeTip, useIsTipBookmarked, useBookmarkTip } from "@/hooks/useTips";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import MarkdownRenderer from "@/components/MarkdownRenderer";


const TipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: tip, isLoading: tipLoading, error: tipError } = useTip(id!);
  const { data: isTipVibed, isLoading: vibedLoading } = useIsTipVibed(id!);
  const { data: isTipBookmarked } = useIsTipBookmarked(id!);
  const vibeTipMutation = useVibeTip();
  const bookmarkTipMutation = useBookmarkTip();

  const handleLike = () => {
    if (!id) return;
    vibeTipMutation.mutate({ tipId: id, isVibed: isTipVibed || false });
  };

  const handleBookmark = () => {
    if (!id) return;
    bookmarkTipMutation.mutate({ tipId: id, isBookmarked: isTipBookmarked || false });
  };

  if (tipLoading) {
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
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-8 w-3/4 mb-4" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
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

  if (tipError || !tip) {
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
              <h2 className="text-2xl font-bold mb-4">팁을 찾을 수 없습니다</h2>
              <p className="text-muted-foreground">요청하신 팁이 존재하지 않거나 삭제되었습니다.</p>
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

        {/* Tip Content */}
        <Card className="border-border/50 bg-card/50 backdrop-blur mb-8">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className="text-xs">
                #{tip.category}
              </Badge>
              {tip.difficulty_level && (
                <Badge variant="secondary" className="text-xs">
                  레벨 {tip.difficulty_level}
                </Badge>
              )}
              {tip.read_time && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {tip.read_time}분 읽기
                </div>
              )}
            </div>
            
            <h1 className="text-3xl font-bold mb-4">{tip.title}</h1>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={tip.profiles.avatar_url || ''} alt={tip.profiles.full_name || tip.profiles.username} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {(tip.profiles.full_name || tip.profiles.username).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{tip.profiles.full_name || tip.profiles.username}</span>
                <span className="text-sm text-muted-foreground">
                  · {formatDistanceToNow(new Date(tip.created_at!), { addSuffix: true, locale: ko })}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={vibedLoading || vibeTipMutation.isPending}
                  className={`flex items-center gap-1 ${isTipVibed ? 'text-red-500' : 'hover:text-red-500'}`}
                >
                  <Heart className={`w-4 h-4 ${isTipVibed ? 'fill-current' : ''}`} />
                  {tip.vibe_count || 0}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  disabled={bookmarkTipMutation.isPending}
                  className={`flex items-center gap-1 ${isTipBookmarked ? 'text-blue-500' : 'hover:text-blue-500'}`}
                >
                  <Bookmark className={`w-4 h-4 ${isTipBookmarked ? 'fill-current' : ''}`} />
                  저장
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Share2 className="w-4 h-4" />
                  공유
                </Button>
              </div>
            </div>

          </CardHeader>
          
          <CardContent>
            <MarkdownRenderer content={tip.content} />
          </CardContent>
        </Card>

        {/* Comments Section */}
        <CommentSection
          contentId={id!}
          contentType="tip"
          title="댓글"
          className="border-border/50 bg-card/50 backdrop-blur"
          enableRealtime={true}
          showStats={true}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default TipDetail;