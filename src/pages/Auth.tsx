import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ClipboardList, User, Lock, Loader2 } from 'lucide-react';
import { z } from 'zod';

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4 shadow-elevated">
            <ClipboardList className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">工作報告系統</h1>
          <p className="text-muted-foreground mt-2">使用使用者名稱登入以管理您的報告</p>
        </div>

        <Card className="shadow-elevated border-0">
          <CardHeader className="pb-4">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">登入</TabsTrigger>
                <TabsTrigger value="signup">註冊</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">使用者名稱</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-username"
                        type="text"
                        placeholder="您的使用者名稱"
                        className="pl-10"
                        value={loginForm.username}
                        onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">密碼</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••"
                        className="pl-10"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full gradient-primary" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    登入
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">使用者名稱</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-username"
                        type="text"
                        placeholder="您的名稱"
                        className="pl-10"
                        value={signupForm.username}
                        onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">密碼</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="至少6個字元"
                        className="pl-10"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full gradient-primary" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    註冊
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
