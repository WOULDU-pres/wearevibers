"use client";

import React, { useState } from "react";
import { EnhancedImageViewer } from "./enhanced-image-viewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { Image, Play, Star } from "lucide-react";

// 샘플 이미지들 (Unsplash에서 제공)
const sampleImages = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?q=80&w=2076&auto=format&fit=crop&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
];

export function EnhancedImageViewerDemo() {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  const openViewer = (index: number = 0) => {
    setInitialIndex(index);
    setIsViewerOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-br from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Enhanced Image Viewer
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          MagicUI 컴포넌트들을 활용한 고급 이미지 뷰어입니다. 
          Lens 줌, Shimmer 버튼, Border Beam 로딩 효과를 체험해보세요.
        </p>
        
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Badge variant="secondary" className="gap-1">
            <Star className="w-3 h-3" />
            MagicUI Lens
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Play className="w-3 h-3" />
            Shimmer Button
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Image className="w-3 h-3" />
            Border Beam
          </Badge>
        </div>
      </div>

      {/* Quick Demo Buttons */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <Button 
          onClick={() => openViewer(0)}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Image className="w-4 h-4 mr-2" />
          Open Gallery
        </Button>
        
        <Button 
          onClick={() => openViewer(2)}
          size="lg"
          variant="outline"
        >
          Start from Image 3
        </Button>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Lens Zoom
            </CardTitle>
            <CardDescription>
              MagicUI의 Lens 컴포넌트로 마우스 호버 시 이미지 확대
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              키보드 'L' 키로 활성화/비활성화 가능합니다.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-blue-500" />
              Shimmer Download
            </CardTitle>
            <CardDescription>
              MagicUI의 Shimmer Button으로 이미지 다운로드
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              반짝이는 애니메이션 효과가 있는 다운로드 버튼입니다.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5 text-green-500" />
              Border Beam Loading
            </CardTitle>
            <CardDescription>
              MagicUI의 Border Beam으로 로딩 상태 표시
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              이미지 로딩 중 테두리를 따라 움직이는 빛 효과를 보여줍니다.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>키보드 네비게이션</CardTitle>
            <CardDescription>
              키보드로 편리하게 조작
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div>← → : 이미지 네비게이션</div>
              <div>+ - : 줌 인/아웃</div>
              <div>R : 회전</div>
              <div>L : 렌즈 토글</div>
              <div>T : 썸네일 토글</div>
              <div>0 : 줌 리셋</div>
              <div>Esc : 닫기</div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>터치 제스처</CardTitle>
            <CardDescription>
              모바일 친화적 스와이프 지원
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              좌우 스와이프로 이미지 네비게이션이 가능합니다.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>반응형 디자인</CardTitle>
            <CardDescription>
              모든 화면 크기에 최적화
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              데스크톱, 태블릿, 모바일 모든 기기에서 완벽하게 작동합니다.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Thumbnail Gallery */}
      <Card>
        <CardHeader>
          <CardTitle>이미지 갤러리</CardTitle>
          <CardDescription>
            썸네일을 클릭하여 해당 이미지부터 뷰어를 시작하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {sampleImages.map((image, index) => (
              <button
                key={index}
                onClick={() => openViewer(index)}
                className="relative group aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
              >
                <img 
                  src={image} 
                  alt={`Sample ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                  <Image className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => openViewer(0)}
            className="w-full"
            variant="outline"
          >
            <Image className="w-4 h-4 mr-2" />
            모든 이미지 보기
          </Button>
        </CardFooter>
      </Card>

      {/* Enhanced Image Viewer */}
      <EnhancedImageViewer
        images={sampleImages}
        initialIndex={initialIndex}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        showThumbnails={true}
        allowDownload={true}
      />
    </div>
  );
}