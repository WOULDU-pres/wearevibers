import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Settings, 
  Upload, 
  Camera, 
  Heart, 
  MessageSquare, 
  Calendar,
  MapPin,
  Link as LinkIcon,
  Github,
  Twitter,
  Globe,
  Edit,
  Save,
  X
} from "lucide-react";

// Mock user data
const mockUser = {
  id: "1",
  username: "DevViber",
  fullName: "김개발",
  email: "dev@wearevibers.com",
  bio: "풀스택 개발자 | 아름다운 코드를 추구합니다 ✨",
  location: "서울, 한국",
  website: "https://devviber.dev",
  joinDate: "2024년 1월",
  avatar: "/placeholder.svg",
  coverImage: "/placeholder.svg",
  stats: {
    projects: 12,
    vibes: 450,
    followers: 89,
    following: 156
  },
  socialLinks: {
    github: "https://github.com/devviber",
    twitter: "https://twitter.com/devviber",
    linkedin: "https://linkedin.com/in/devviber"
  }
};

const mockProjects = [
  {
    id: 1,
    title: "Minimalist Task Manager",
    description: "Clean and simple task management app",
    image: "/placeholder.svg",
    vibes: 89,
    comments: 12,
    tags: ["React", "TypeScript", "Tailwind"]
  },
  {
    id: 2,
    title: "Weather Dashboard",
    description: "Beautiful weather forecast application",
    image: "/placeholder.svg",
    vibes: 156,
    comments: 23,
    tags: ["Vue.js", "API", "Charts"]
  }
];

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: mockUser.username,
    fullName: mockUser.fullName,
    bio: mockUser.bio,
    location: mockUser.location,
    website: mockUser.website
  });

  const handleSave = () => {
    // TODO: Save profile data to Supabase
    console.log("Saving profile:", formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      username: mockUser.username,
      fullName: mockUser.fullName,
      bio: mockUser.bio,
      location: mockUser.location,
      website: mockUser.website
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = () => {
    // TODO: Implement avatar upload with Supabase Storage
    console.log("Avatar upload");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="relative mb-8">
          {/* Cover Image */}
          <div className="h-48 md:h-64 bg-gradient-vibe rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => {/* TODO: Cover image upload */}}
            >
              <Camera className="w-4 h-4 mr-2" />
              Change Cover
            </Button>
          </div>

          {/* Profile Info */}
          <div className="relative -mt-16 px-6">
            <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                  <AvatarImage src={mockUser.avatar} alt={mockUser.username} />
                  <AvatarFallback className="bg-gradient-vibe text-white text-3xl font-bold">
                    {mockUser.username.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-2 right-2 rounded-full w-8 h-8 p-0"
                  onClick={handleAvatarUpload}
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>

              {/* User Info */}
              <div className="flex-1 mt-4 md:mt-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">{mockUser.fullName}</h1>
                    <p className="text-xl text-muted-foreground">@{mockUser.username}</p>
                    <p className="text-muted-foreground mt-2">{mockUser.bio}</p>
                    
                    <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{mockUser.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{mockUser.joinDate} 가입</span>
                      </div>
                      {mockUser.website && (
                        <div className="flex items-center space-x-1">
                          <Globe className="w-4 h-4" />
                          <a href={mockUser.website} className="hover:text-primary" target="_blank" rel="noopener noreferrer">
                            {mockUser.website.replace('https://', '')}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-3 mt-4 md:mt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" size="icon">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex space-x-6 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{mockUser.stats.projects}</div>
                    <div className="text-sm text-muted-foreground">Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{mockUser.stats.vibes}</div>
                    <div className="text-sm text-muted-foreground">Vibes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{mockUser.stats.followers}</div>
                    <div className="text-sm text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{mockUser.stats.following}</div>
                    <div className="text-sm text-muted-foreground">Following</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="lounge">Lounge</TabsTrigger>
            <TabsTrigger value="tips">Tips</TabsTrigger>
            <TabsTrigger value="vibed">Vibed</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockProjects.map((project) => (
                <Card key={project.id} className="border-border/50 bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300">
                  <div className="aspect-video bg-muted rounded-t-lg relative overflow-hidden">
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2">{project.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{project.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>{project.vibes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{project.comments}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="lounge">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">라운지 게시글이 없습니다.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tips">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">공유한 팁이 없습니다.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vibed">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">좋아요를 누른 콘텐츠가 없습니다.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-gradient-vibe hover:opacity-90">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default Profile;