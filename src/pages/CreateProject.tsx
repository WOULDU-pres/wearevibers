import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/stores';
import { useCreateProject } from '@/hooks/useProjects';
import { FileUpload } from '@/components/FileUpload';
import { useFileUpload } from '@/hooks/useFileUpload';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Upload as LinkIcon, Github, Globe, Palette, Code, Layers, Plus, Loader2 } from 'lucide-react';

// Form validation schema
const createProjectSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(100, '제목은 100자 이하로 입력해주세요'),
  description: z.string().min(10, '설명을 10자 이상 입력해주세요').max(500, '설명은 500자 이하로 입력해주세요'),
  tech_stack: z.array(z.string()).min(1, '최소 1개의 기술 스택을 선택해주세요'),
  github_url: z.string().url('올바른 URL을 입력해주세요').optional().or(z.literal('')),
  demo_url: z.string().url('올바른 URL을 입력해주세요').optional().or(z.literal('')),
  figma_url: z.string().url('올바른 URL을 입력해주세요').optional().or(z.literal('')),
  difficulty_level: z.number().min(1).max(5),
});

type CreateProjectForm = z.infer<typeof createProjectSchema>;

// Common tech stacks
const TECH_STACKS = [
  'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Svelte',
  'Node.js', 'Express', 'Next.js', 'Nuxt.js', 'Python', 'Django',
  'Flask', 'Java', 'Spring', 'C++', 'C#', '.NET', 'PHP', 'Laravel',
  'Ruby', 'Rails', 'Go', 'Rust', 'MongoDB', 'PostgreSQL', 'MySQL',
  'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Vercel',
  'Netlify', 'Firebase', 'Supabase', 'GraphQL', 'REST API', 'WebSocket',
  'HTML', 'CSS', 'Sass', 'Tailwind CSS', 'Bootstrap', 'Material-UI',
  'Ant Design', 'Chakra UI', 'Figma', 'Adobe XD', 'Sketch'
];

const CreateProject = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const createProject = useCreateProject();
  const { uploadImage } = useFileUpload();
  const [uploadedImages, setUploadedImages] = React.useState<string[]>([]);
  const [techStackInput, setTechStackInput] = React.useState('');
  const [filteredTechStacks, setFilteredTechStacks] = React.useState<string[]>([]);

  const form = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: '',
      description: '',
      tech_stack: [],
      github_url: '',
      demo_url: '',
      figma_url: '',
      difficulty_level: 3,
    },
  });

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!user) {
      toast.error('로그인이 필요합니다.');
      navigate('/login?redirect=/projects/create');
    }
  }, [user, navigate]);

  // Filter tech stacks based on input
  const currentTechStack = form.watch('tech_stack');
  React.useEffect(() => {
    if (techStackInput) {
      const filtered = TECH_STACKS.filter(tech => 
        tech.toLowerCase().includes(techStackInput.toLowerCase()) &&
        !currentTechStack.includes(tech)
      );
      setFilteredTechStacks(filtered.slice(0, 5));
    } else {
      setFilteredTechStacks([]);
    }
  }, [techStackInput, currentTechStack]);

  const handleCancel = () => {
    navigate('/');
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const imageUrl = await uploadImage(file, 'projects');
      setUploadedImages(prev => [...prev, imageUrl]);
      return imageUrl;
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('이미지 업로드에 실패했습니다.');
      throw error;
    }
  };

  const removeImage = (imageUrl: string) => {
    setUploadedImages(prev => prev.filter(url => url !== imageUrl));
  };

  const addTechStack = (tech: string) => {
    const currentTechStack = form.getValues('tech_stack');
    if (!currentTechStack.includes(tech)) {
      form.setValue('tech_stack', [...currentTechStack, tech]);
    }
    setTechStackInput('');
  };

  const removeTechStack = (tech: string) => {
    const currentTechStack = form.getValues('tech_stack');
    form.setValue('tech_stack', currentTechStack.filter(t => t !== tech));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && techStackInput.trim()) {
      e.preventDefault();
      addTechStack(techStackInput.trim());
    }
  };

  const onSubmit = async (data: CreateProjectForm) => {
    try {
      await createProject.mutateAsync({
        ...data,
        image_urls: uploadedImages,
        status: 'published',
      });
      
      toast.success('프로젝트가 성공적으로 생성되었습니다!');
      navigate('/profile');
    } catch (error) {
      console.error('Project creation error:', error);
      toast.error('프로젝트 생성에 실패했습니다.');
    }
  };

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              뒤로 가기
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Title Section */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                <Code className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
              새 프로젝트 공유하기
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              당신의 창작물을 WeAreVibers 커뮤니티와 공유하고, 다른 개발자들과 소통해보세요.
            </p>
          </div>

          {/* Project Creation Form */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Layers className="w-6 h-6 text-primary" />
                <span>프로젝트 정보</span>
              </CardTitle>
              <CardDescription>
                프로젝트의 기본 정보를 입력해주세요. 모든 필수 항목을 채워야 합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>프로젝트 제목 *</FormLabel>
                          <FormControl>
                            <Input placeholder="프로젝트 제목을 입력하세요" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>프로젝트 설명 *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="프로젝트에 대해 자세히 설명해주세요 (최소 10자)"
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Tech Stack */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="tech_stack"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>기술 스택 *</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <div className="relative">
                                <Input
                                  placeholder="기술 스택을 검색하고 Enter를 누르세요"
                                  value={techStackInput}
                                  onChange={(e) => setTechStackInput(e.target.value)}
                                  onKeyPress={handleKeyPress}
                                />
                                {filteredTechStacks.length > 0 && (
                                  <div className="absolute top-full left-0 right-0 z-10 bg-background border border-border rounded-md shadow-lg mt-1">
                                    {filteredTechStacks.map((tech) => (
                                      <button
                                        key={tech}
                                        type="button"
                                        onClick={() => addTechStack(tech)}
                                        className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                                      >
                                        {tech}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {field.value.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {field.value.map((tech) => (
                                    <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                                      {tech}
                                      <button
                                        type="button"
                                        onClick={() => removeTechStack(tech)}
                                        className="ml-1 hover:text-destructive"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Difficulty Level */}
                  <FormField
                    control={form.control}
                    name="difficulty_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>난이도 (1-5)</FormLabel>
                        <FormControl>
                          <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <Button
                                key={level}
                                type="button"
                                variant={field.value === level ? "default" : "outline"}
                                size="sm"
                                onClick={() => field.onChange(level)}
                              >
                                {level}
                              </Button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Project Images */}
                  <div className="space-y-4">
                    <Label>프로젝트 이미지</Label>
                    <FileUpload
                      accept="image/*"
                      maxSize={5 * 1024 * 1024} // 5MB
                      onUpload={handleImageUpload}
                      className="w-full"
                    />
                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {uploadedImages.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={imageUrl} 
                              alt={`Project image ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-border"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(imageUrl)}
                              className="absolute top-2 right-2 bg-destructive/90 text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* URLs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="github_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Github className="w-4 h-4" />
                            <span>GitHub URL</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://github.com/user/repo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="demo_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Globe className="w-4 h-4" />
                            <span>데모 URL</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://your-demo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="figma_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Palette className="w-4 h-4" />
                            <span>Figma URL</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://figma.com/file/..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={createProject.isPending}
                    >
                      취소
                    </Button>
                    <Button
                      type="submit"
                      disabled={createProject.isPending}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {createProject.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          생성 중...
                        </>
                      ) : (
                        '프로젝트 생성'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateProject;