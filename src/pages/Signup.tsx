import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores";
import { toast } from "sonner";
import logoImg from "@/assets/logo.png";
import { useFormStore } from "@/stores";

const Signup = () => {
  const { signupForm, updateSignupForm, resetSignupForm } = useFormStore();
  const [isLoading, setIsLoading] = useState(false);

  const { signUp, signInWithOAuth, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    if (!signupForm.agreeToTerms) {
      toast.error('이용약관과 개인정보 처리방침에 동의해주세요.');
      return;
    }

    if (!isPasswordValid) {
      toast.error('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(
        signupForm.email, 
        signupForm.password, 
        {
          username: signupForm.username,
          fullName: signupForm.fullName,
        }
      );
      
      if (error) {
        if (error.message.includes('email')) {
          toast.error('이미 사용 중인 이메일입니다.');
        } else if (error.message.includes('username')) {
          toast.error('이미 사용 중인 사용자명입니다.');
        } else {
          toast.error(error.message || '회원가입에 실패했습니다.');
        }
      } else {
        toast.success('회원가입이 완료되었습니다! 이메일을 확인해주세요.');
        navigate('/login');
      }
    } catch (error) {
      toast.error('예상치 못한 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google') => {
    try {
      const { error } = await signInWithOAuth(provider);
      
      if (error) {
        toast.error(error.message || '소셜 가입에 실패했습니다.');
      }
      // OAuth는 리다이렉트되므로 성공 메시지는 여기서 표시하지 않음
    } catch (error) {
      toast.error('예상치 못한 오류가 발생했습니다.');
    }
  };

  const passwordsMatch = signupForm.password === signupForm.confirmPassword;
  const isPasswordValid = signupForm.password.length >= 8;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <img src={logoImg} alt="WeAreVibers" className="w-8 h-8" />
            <span className="text-2xl font-bold text-primary font-semibold">
              WeAreVibers,
            </span>
          </div>
          <p className="text-muted-foreground">
            Join the creative developer community
          </p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Create account</CardTitle>
            <CardDescription className="text-center">
              Enter your information to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Social Signup Buttons */}
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSocialLogin("google")}
                disabled={loading || isLoading}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="viber123"
                      value={signupForm.username}
                      onChange={(e) => updateSignupForm({ username: e.target.value })}
                      className="pl-10"
                      disabled={loading || isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={signupForm.fullName}
                    onChange={(e) => updateSignupForm({ fullName: e.target.value })}
                    disabled={loading || isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={signupForm.email}
                    onChange={(e) => updateSignupForm({ email: e.target.value })}
                    className="pl-10"
                    disabled={loading || isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    type={signupForm.showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={signupForm.password}
                    onChange={(e) => updateSignupForm({ password: e.target.value })}
                    className="pl-10 pr-10"
                    disabled={loading || isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => updateSignupForm({ showPassword: !signupForm.showPassword })}
                  >
                    {signupForm.showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {formData.password && !isPasswordValid && (
                  <p className="text-sm text-destructive">
                    Password must be at least 8 characters long
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    type={signupForm.showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={signupForm.confirmPassword}
                    onChange={(e) => updateSignupForm({ confirmPassword: e.target.value })}
                    className="pl-10 pr-10"
                    disabled={loading || isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => updateSignupForm({ showConfirmPassword: !signupForm.showConfirmPassword })}
                  >
                    {signupForm.showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {formData.confirmPassword && !passwordsMatch && (
                  <p className="text-sm text-destructive">
                    Passwords don't match
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={signupForm.agreeToTerms}
                  onCheckedChange={(checked) => updateSignupForm({ agreeToTerms: !!checked })}
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={!formData.agreeToTerms || !passwordsMatch || !isPasswordValid || loading || isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            {/* Sign in link */}
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;