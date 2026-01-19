import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { User } from '@supabase/supabase-js';
import { Loader2, LogIn } from 'lucide-react';
import { useUserStore } from '@/lib/subscription/store';
import UserMenu from '@/components/layout/UserMenu';

export default function AuthDialog() {
  // const [isOpen, setIsOpen] = useState(false); // Deprecated in favor of global store state
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { isAuthOpen, setAuthOpen } = useUserStore();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Removed checkSubscription as we don't have Pro plans anymore
  
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate password confirmation for signup
    if (mode === 'signup' && password !== confirmPassword) {
      alert('两次输入的密码不一致，请重新检查。');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signup') {
        // Sign up logic
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        // If auto-confirm is enabled in Supabase, user session will be active immediately
        if (data.session) {
          alert('注册成功并已自动登录！');
          setAuthOpen(false);
        } else {
          // Fallback if auto-confirm is NOT enabled
          alert('注册成功！');
          setMode('signin');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setAuthOpen(false);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      if (error.message === 'Failed to fetch' || error.name === 'AuthRetryableFetchError') {
        alert('连接失败：请检查您的网络，或确认 Supabase API Key 是否正确配置 (应为 JWT 格式)。');
      } else if (error.message.includes('Password should be at least 6 characters')) {
        alert('密码太短啦，至少需要 6 个字符哦。');
      } else if (error.message.includes('Email not confirmed')) {
        alert('您的邮箱尚未验证。请查收邮件并点击验证链接，或者检查垃圾箱。');
      } else {
        alert(error.message || '认证失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (user) {
    return <UserMenu user={user} onSignOut={handleSignOut} />;
  }

  return (
    <Dialog open={isAuthOpen} onOpenChange={setAuthOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors">
          <LogIn className="h-4 w-4" /> 登录 / 注册
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-white/20 sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center pb-2">
            {mode === 'signin' ? '欢迎回来' : '创建账号'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === 'signin' ? '登录以同步您的记忆库。' : '注册即刻开启记忆强化之旅。'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleAuth} className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="邮箱地址"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/50 border-white/20 focus:bg-white/80 transition-all"
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/50 border-white/20 focus:bg-white/80 transition-all"
            />
          </div>

          {mode === 'signup' && (
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="确认密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-white/50 border-white/20 focus:bg-white/80 transition-all"
              />
            </div>
          )}
          
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'signin' ? '登录' : '注册'}
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            {mode === 'signin' ? (
              <>
                还没有账号？
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="ml-1 text-primary hover:underline"
                >
                  去注册
                </button>
              </>
            ) : (
              <>
                已有账号？
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="ml-1 text-primary hover:underline"
                >
                  去登录
                </button>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
