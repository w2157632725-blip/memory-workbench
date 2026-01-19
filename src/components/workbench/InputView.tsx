"use client";

import { useState, useEffect, useRef } from 'react';
import { useWorkbenchStore } from '@/lib/store';
import { dbService } from '@/lib/supabase/service';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Info, FileText, Upload, Sparkles, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function InputView() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [petals, setPetals] = useState<Array<{left: string, animationDelay: string, animationDuration: string, opacity: number}>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setKnowledgePoints, setViewMode } = useWorkbenchStore();

  useEffect(() => {
    // Generate petals only on client side to avoid hydration mismatch
    setPetals([...Array(6)].map(() => ({
      left: `${10 + Math.random() * 80}%`,
      animationDelay: `${Math.random() * 10}s`,
      animationDuration: `${10 + Math.random() * 10}s`,
      opacity: 0.6 + Math.random() * 0.4
    })));

    // Show guide on first load
    const hasSeenGuide = localStorage.getItem('hasSeenGuide');
    if (!hasSeenGuide) {
      setShowGuide(true);
    }
  }, []);

  const closeGuide = () => {
    setShowGuide(false);
    localStorage.setItem('hasSeenGuide', 'true');
  };

  const handleProcess = async () => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/process/atomizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      });
      
      const data = await response.json();
      if (Array.isArray(data)) {
        // Save to local store
        setKnowledgePoints(data);
        
        // Save to Supabase (async, don't block UI)
        dbService.saveKnowledgePoints(data.map(p => ({
          title: p.title,
          content: p.content,
          tags: p.tags
        }))).catch(err => console.error('Failed to save to Supabase:', err));

        setViewMode('workbench');
      } else {
        console.error('Invalid response format', data);
      }
    } catch (error) {
      console.error('Error processing text:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/parse-file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to parse file');

      const data = await response.json();
      if (data.text) {
        setInput(prev => (prev ? prev + '\n\n' : '') + data.text);
      }
    } catch (error) {
      console.error('File parsing error:', error);
      alert('文件解析失败，请确保文件格式正确 (PDF, Word, 或 图片)。');
    } finally {
      setFileLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background bg-dot-pattern bg-noise relative overflow-hidden">
      {/* Background Decor - Almond Blossom Style */}
      {/* Top Left Branch */}
      <svg className="absolute top-0 left-0 w-96 h-96 text-primary/10 pointer-events-none -translate-x-1/4 -translate-y-1/4" viewBox="0 0 100 100" fill="currentColor">
         <path d="M0,50 Q20,40 40,60 T80,50 T100,70" stroke="currentColor" strokeWidth="2" fill="none" />
         <circle cx="20" cy="40" r="3" fill="currentColor" className="animate-pulse" style={{animationDuration: '4s'}} />
         <circle cx="45" cy="65" r="4" fill="currentColor" className="animate-pulse" style={{animationDuration: '5s'}} />
         <circle cx="80" cy="50" r="3" fill="currentColor" className="animate-pulse" style={{animationDuration: '6s'}} />
      </svg>
      
      {/* Bottom Right Branch - More intricate */}
      <svg className="absolute bottom-0 right-0 w-[600px] h-[600px] text-primary/10 pointer-events-none translate-x-1/4 translate-y-1/4" viewBox="0 0 200 200" fill="currentColor">
         {/* Main thick branch */}
         <path d="M200,200 C150,150 180,100 120,80 C100,70 80,90 60,80" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
         {/* Sub branches */}
         <path d="M160,160 C140,140 120,150 100,130" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
         <path d="M120,80 C100,50 110,30 90,20" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
         {/* Blossoms */}
         <circle cx="120" cy="80" r="5" fill="#E6D690" opacity="0.8" />
         <circle cx="60" cy="80" r="6" fill="white" opacity="0.9" />
         <circle cx="90" cy="20" r="4" fill="white" opacity="0.8" />
         <circle cx="100" cy="130" r="5" fill="white" opacity="0.9" />
         <circle cx="160" cy="160" r="4" fill="#E6D690" opacity="0.6" />
      </svg>
      
      {/* Falling Petals Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {petals.map((style, i) => (
          <div 
            key={i}
            className="petal w-3 h-3 bg-white/80 absolute"
            style={style}
          />
        ))}
      </div>

      {/* Orbs - Adjusted colors for Teal theme */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#40A9B0]/10 rounded-full blur-[128px] pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#E6D690]/20 rounded-full blur-[128px] pointer-events-none mix-blend-multiply" />

      <div className="w-full max-w-3xl space-y-8 text-center relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary text-sm font-medium mb-4 border border-blue-100 dark:border-blue-800">
            <Sparkles className="h-4 w-4" />
            <span>AI 驱动的第二大脑</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight font-display">
            把知识转化为<br/>
            <span className="text-gradient">永久记忆</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            丢掉死记硬背。输入任何文本，AI 将为您拆解知识原子，
            并通过多维感官重塑您的记忆路径。
          </p>
        </div>
        
        <div className="glass-card rounded-3xl p-2 shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
          <Textarea 
            placeholder="在此粘贴文本，或点击下方按钮上传文件..." 
            className="min-h-[240px] text-lg p-6 resize-none bg-transparent border-none focus-visible:ring-0 placeholder:text-muted-foreground/50"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center p-4 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl mt-2 backdrop-blur-sm">
            <div className="flex gap-2">
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
              />
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={fileLoading || loading}
                className="text-muted-foreground hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              >
                {fileLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                上传文件
              </Button>

              <Button variant="ghost" size="sm" onClick={() => setShowGuide(true)} className="text-muted-foreground hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                <Info className="mr-2 h-4 w-4" /> 指南
              </Button>
            </div>

            <Button 
              size="lg" 
              onClick={handleProcess}
              disabled={loading || !input.trim()}
              className="w-full sm:w-auto bg-primary hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105 rounded-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  正在处理...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4 fill-white" />
                  开始拆解
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showGuide} onOpenChange={setShowGuide}>
        <DialogContent className="sm:max-w-[600px] glass-card border-white/20">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <span className="text-3xl">👋</span> 欢迎使用记忆工作台
            </DialogTitle>
            <DialogDescription className="space-y-4 pt-6 text-left text-base">
              <p>这是一个帮助你高效记忆复杂知识的 AI 工具。操作流程如下：</p>
              <div className="grid gap-4 py-4">
                <div className="flex gap-4 p-4 rounded-xl bg-muted/50 border border-border/50">
                  <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 font-bold shrink-0">1</div>
                  <div>
                    <h4 className="font-semibold text-foreground">输入原料</h4>
                    <p className="text-sm mt-1">粘贴任何你想记住的内容（如概念定义、法律条文、学习笔记）。</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-xl bg-muted/50 border border-border/50">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold shrink-0">2</div>
                  <div>
                    <h4 className="font-semibold text-foreground">原子化拆解</h4>
                    <p className="text-sm mt-1">AI 会自动将长文本拆解为一个个独立的“知识原子”。</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-xl bg-muted/50 border border-border/50">
                  <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 font-bold shrink-0">3</div>
                  <div>
                    <h4 className="font-semibold text-foreground">多维加工</h4>
                    <ul className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <li className="flex items-center gap-2"><span className="text-lg">👁️</span> 视觉化图解</li>
                      <li className="flex items-center gap-2"><span className="text-lg">🧠</span> 脑洞故事</li>
                      <li className="flex items-center gap-2"><span className="text-lg">🎧</span> 听觉记忆</li>
                      <li className="flex items-center gap-2"><span className="text-lg">🗣️</span> 费曼私教</li>
                      <li className="flex items-center gap-2 col-span-2"><span className="text-lg">📝</span> 智能填空 (自我测试)</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={closeGuide} size="lg" className="w-full sm:w-auto">开始体验</Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
