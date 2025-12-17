import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, Loader2, Sparkles } from 'lucide-react';
import { z } from 'zod';
import logo from '@/assets/logo.jpg';

const loginSchema = z.object({
  username: z.string().trim().min(2, '使用者名稱至少需要2個字元'),
  password: z.string().min(6, '密碼至少需要6個字元'),
});

const signupSchema = z.object({
  username: z.string().trim().min(2, '使用者名稱至少需要2個字元').max(50, '使用者名稱不能超過50個字元'),
  password: z.string().min(6, '密碼至少需要6個字元'),
});

export default function Auth() {
  const navigate = useNavigate();
  const { user, signInWithUsername, signUpWithUsername, loading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [signupForm, setSignupForm] = useState({ username: '', password: '' });

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = loginSchema.safeParse(loginForm);
    if (!result.success) {
      toast({
        title: '錯誤',
        description: result.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await signInWithUsername(loginForm.username, loginForm.password);
    setIsSubmitting(false);

    if (error) {
      toast({
        title: '登入失敗',
        description: error.message || '使用者名稱或密碼錯誤',
        variant: 'destructive',
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = signupSchema.safeParse(signupForm);
    if (!result.success) {
      toast({
        title: '錯誤',
        description: result.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await signUpWithUsername(signupForm.username, signupForm.password);
    setIsSubmitting(false);

    if (error) {
      toast({
        title: '註冊失敗',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: '註冊成功',
        description: '您已成功註冊，正在登入...',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background gradient-mesh">
        <div className="animate-pulse-glow">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 gradient-mesh opacity-60" />
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md animate-fade-in-scale relative z-10">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl overflow-hidden mb-6 shadow-glow animate-float">
            <img src={logo} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">工作報告系統</h1>
          <p className="text-muted-foreground mt-3 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            管理您的安裝報告
            <Sparkles className="h-4 w-4 text-accent" />
          </p>
        </div>

        <Card className="glass shadow-elevated border-border/50 backdrop-blur-xl">
          <CardHeader className="pb-4">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300"
                >
                  登入
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300"
                >
                  註冊
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6 animate-fade-in">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-username" className="text-sm font-medium">使用者名稱</Label>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input
                        id="login-username"
                        type="text"
                        placeholder="您的使用者名稱"
                        className="pl-11 h-12 bg-muted/30 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        value={loginForm.username}
                        onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium">密碼</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-11 h-12 bg-muted/30 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 gradient-primary hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-primary/25 font-medium" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                    登入
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6 animate-fade-in">
                <form onSubmit={handleSignup} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username" className="text-sm font-medium">使用者名稱</Label>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input
                        id="signup-username"
                        type="text"
                        placeholder="您的名稱"
                        className="pl-11 h-12 bg-muted/30 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        value={signupForm.username}
                        onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">密碼</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="至少6個字元"
                        className="pl-11 h-12 bg-muted/30 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 gradient-primary hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-primary/25 font-medium" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                    註冊
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          安全登入 · 資料加密保護
        </p>
      </div>
    </div>
  );
}