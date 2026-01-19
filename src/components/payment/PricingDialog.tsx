import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2, QrCode, X, Zap } from 'lucide-react';
import { useUserStore } from '@/lib/subscription/store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { supabase } from '@/lib/supabase/client';
import AuthDialog from '@/components/auth/AuthDialog';

export default function PricingDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { setPro, isPricingOpen, setPricingOpen, setAuthOpen } = useUserStore();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [isPricingOpen]);

  const handleSubscribe = async () => {
    if (!user) {
      alert('请先登录账号，再进行升级操作。');
      setAuthOpen(true); // Open global auth dialog
      // setPricingOpen(false); // Optional: close pricing dialog or keep it open behind? 
      // Let's keep pricing open, auth dialog will overlay on top (z-index needs to be handled) 
      // OR close pricing, let user login, then user has to reopen pricing.
      // Better UX: Close pricing, open auth.
      setPricingOpen(false);
      return;
    }

    setLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setShowQR(true);
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    
    // 1. Update backend
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_pro: true })
        .eq('id', user.id);
        
      if (error) throw error;

      // 2. Update local state
      setPro(true);
      setLoading(false);
      setShowQR(false);
      setPricingOpen(false);
      alert("支付成功！您已升级为 Pro 会员。");
    } catch (error) {
      console.error(error);
      alert('升级失败，请稍后重试');
      setLoading(false);
    }
  };

  return (
    <Dialog open={isPricingOpen} onOpenChange={setPricingOpen}>
      {trigger && <DialogTrigger asChild onClick={() => setPricingOpen(true)}>{trigger}</DialogTrigger>}
      
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
        {!showQR ? (
          <div className="flex flex-col md:flex-row h-full">
            {/* Free Plan */}
            <div className="flex-1 p-6 bg-muted/30 border-r border-border">
              <div className="mb-4">
                <h3 className="font-bold text-xl text-muted-foreground">免费版</h3>
                <div className="text-2xl font-bold mt-2">¥ 0</div>
                <p className="text-sm text-muted-foreground">体验基础功能</p>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2"><Check className="h-4 w-4 text-green-500" /> 每日生成 5 张图片</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-green-500" /> 每日 5 次智能填空</li>
                <li className="flex gap-2 text-muted-foreground"><X className="h-4 w-4" /> 听觉记忆 (Podcast)</li>
                <li className="flex gap-2 text-muted-foreground"><X className="h-4 w-4" /> 优先生成队列</li>
              </ul>
            </div>

            {/* Pro Plan */}
            <div className="flex-1 p-6 bg-gradient-to-br from-yellow-50 to-amber-50 relative">
              <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs px-2 py-1 rounded-bl-lg font-bold">
                RECOMMENDED
              </div>
              <div className="mb-4">
                <h3 className="font-bold text-xl text-amber-900 flex items-center gap-2">
                  <Zap className="h-5 w-5 fill-yellow-500 text-yellow-500" /> 
                  Pro 会员
                </h3>
                <div className="text-3xl font-bold mt-2 text-amber-700">¥ 2.00 <span className="text-sm font-normal text-muted-foreground">/ 永久</span></div>
                <p className="text-sm text-amber-800/80">解锁全部生产力</p>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2"><Check className="h-4 w-4 text-green-600 font-bold" /> <strong>无限次</strong> 图片生成</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-green-600 font-bold" /> <strong>无限次</strong> 智能填空</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-green-600 font-bold" /> 解锁「听觉记忆」Pro</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-green-600 font-bold" /> GPT-4o 优先使用权</li>
              </ul>
              <div className="mt-8">
                <Button onClick={handleSubscribe} disabled={loading} className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white border-0 shadow-lg transition-all hover:scale-[1.02]">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  立即升级
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                    {user ? `将绑定至账号: ${user.email}` : "请先登录账号"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4 py-8 px-4">
            <h3 className="font-semibold text-xl">扫码支付</h3>
            <div className="bg-white p-4 rounded-lg shadow-inner border relative">
              <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded">
                <QrCode className="h-12 w-12 text-muted-foreground" />
                <span className="sr-only">支付宝二维码</span>
              </div>
               {/* Simulate scanning effect */}
               <div className="absolute inset-0 border-2 border-green-500/30 animate-pulse rounded-lg pointer-events-none"></div>
            </div>
            <div className="text-center space-y-1">
                <p className="font-bold text-lg">¥ 2.00</p>
                <p className="text-sm text-muted-foreground">
                请使用支付宝扫码<br/>
                (模拟环境：直接点击下方按钮完成)
                </p>
            </div>
            
            <Button onClick={handleConfirmPayment} disabled={loading} className="w-64 bg-green-600 hover:bg-green-700 h-12 text-lg shadow-xl">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "我已完成支付"}
            </Button>
            <Button variant="ghost" onClick={() => setShowQR(false)} className="text-xs text-muted-foreground">
                返回上一步
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
