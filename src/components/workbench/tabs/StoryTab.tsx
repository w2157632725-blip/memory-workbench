"use client";

import { useState } from 'react';
import { useWorkbenchStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useUserStore } from '@/lib/subscription/store';

export default function StoryTab() {
  const { knowledgePoints, selectedPointIds } = useWorkbenchStore();
  const { checkLimit, incrementUsage } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ story_text: string; mapping: any[]; image_prompt: string } | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const selectedContent = knowledgePoints
    .filter(p => selectedPointIds.includes(p.id))
    .map(p => `${p.title}`)
    .join(', ');

  const handleGenerate = async () => {
    if (!checkLimit()) {
      alert('已达到今日使用次数上限 (40次)。请明天再来！');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/process/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: selectedContent }),
      });
      const data = await response.json();
      setResult(data);
      setIsFlipped(false);
      incrementUsage();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {!result ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-4">
          <p>为以下内容编织一个难忘的故事：{selectedContent}</p>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            生成故事
          </Button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center perspective-1000">
          <div className="w-full max-w-lg mb-4 flex justify-between items-center">
             <Button variant="outline" size="sm" onClick={() => setResult(null)}>返回</Button>
             <Button variant="ghost" size="sm" onClick={handleGenerate}><RefreshCcw className="h-4 w-4" /></Button>
          </div>
          
          <div 
            className="relative w-full max-w-lg aspect-[3/4] cursor-pointer group"
            onClick={() => setIsFlipped(!isFlipped)}
          >
             <motion.div
               className="w-full h-full relative preserve-3d transition-all duration-500"
               animate={{ rotateY: isFlipped ? 180 : 0 }}
               style={{ transformStyle: 'preserve-3d' }}
             >
                {/* Front: Story */}
                <Card className="absolute inset-0 backface-hidden w-full h-full flex flex-col overflow-hidden border-2 border-primary/20">
                  <div className="bg-primary/10 p-6 text-center border-b">
                    <h3 className="font-bold text-xl text-primary">故事内容</h3>
                    <p className="text-xs text-muted-foreground mt-1">点击翻转</p>
                  </div>
                  <CardContent className="flex-1 flex items-center justify-center p-8 text-lg font-serif leading-relaxed text-center">
                    {result.story_text}
                  </CardContent>
                  <div className="p-4 bg-muted/30 text-xs text-center text-muted-foreground">
                    提示词: {result.image_prompt}
                  </div>
                </Card>

                {/* Back: Mapping */}
                <Card 
                  className="absolute inset-0 backface-hidden w-full h-full flex flex-col overflow-hidden bg-slate-900 text-slate-100"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  <div className="p-6 text-center border-b border-slate-700">
                    <h3 className="font-bold text-xl">记忆映射</h3>
                  </div>
                  <CardContent className="flex-1 p-8 space-y-4">
                    {result.mapping && Array.isArray(result.mapping) ? (
                      result.mapping.map((m: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center border-b border-slate-700 pb-2">
                          <span className="font-semibold text-blue-300">{m.original}</span>
                          <span className="text-slate-400">→</span>
                          <span className="italic text-green-300">{m.mnemonic}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-center">暂无映射数据</p>
                    )}
                  </CardContent>
                </Card>
             </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
