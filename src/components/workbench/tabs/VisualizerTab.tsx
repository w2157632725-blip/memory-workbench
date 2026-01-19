"use client";

import { useState, useRef, useEffect } from 'react';
import { useWorkbenchStore } from '@/lib/store';
import { useUserStore } from '@/lib/subscription/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, PlayCircle, Image as ImageIcon } from 'lucide-react';
import mermaid from 'mermaid';

export default function VisualizerTab() {
  const { knowledgePoints, selectedPointIds } = useWorkbenchStore();
  const { checkLimit, incrementUsage } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: string; code: string; explanation: string; imageUrl?: string } | null>(null);
  const mermaidRef = useRef<HTMLDivElement>(null);

  // Filter selected points content
  const selectedContent = knowledgePoints
    .filter(p => selectedPointIds.includes(p.id))
    .map(p => `${p.title}: ${p.content}`)
    .join('\n\n');

  useEffect(() => {
    if (result?.type === 'mermaid' && mermaidRef.current) {
      mermaid.initialize({ startOnLoad: true, theme: 'default' });
      mermaid.render('mermaid-chart', result.code).then(({ svg }) => {
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = svg;
        }
      });
    }
  }, [result]);

  const handleGenerate = async () => {
    if (!checkLimit()) {
      alert('已达到今日使用次数上限 (40次)。请明天再来！');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/process/visualizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: selectedContent }),
      });
      const data = await response.json();
      setResult(data);
      incrementUsage();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!checkLimit()) {
      alert('已达到今日使用次数上限 (40次)。请明天再来！');
      return;
    }

    setLoading(true);
    try {
      // Create a prompt for the image based on selected content
      // 优化 Prompt：强调逻辑关系和结构，避免杂糅
      const prompt = `创建一个清晰的、逻辑性强的教育图解，用于解释：${selectedContent.slice(0, 500)}。要求：1. 画面必须体现出核心概念之间的逻辑关系（如因果、包含、对比）。2. 避免元素堆砌，保持构图简洁。3. 风格为现代扁平化插画。`;
      
      const response = await fetch('/api/process/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (data.url) {
        setResult({
          type: 'image',
          code: '',
          explanation: 'AI 生成的概念图解 (CogView-3-Flash)',
          imageUrl: data.url
        });
        incrementUsage();
      }
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
          <p>为 {selectedPointIds.length} 个选中的项目生成可视化演示。</p>
          <div className="flex gap-4">
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
              生成流程图 (Mermaid)
            </Button>
            <Button onClick={handleGenerateImage} disabled={loading} variant="outline">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
              生成概念图 (CogView)
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 h-full flex flex-col">
          <Card className="flex-1 overflow-hidden flex flex-col">
             <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
               <span className="font-semibold text-sm">可视化输出</span>
               <Button variant="ghost" size="sm" onClick={() => setResult(null)}>重置</Button>
             </div>
             <CardContent className="flex-1 overflow-auto p-4 flex items-center justify-center bg-white">
               {result.type === 'mermaid' ? (
                 <div ref={mermaidRef} className="w-full text-center" />
               ) : result.type === 'image' && result.imageUrl ? (
                 <img src={result.imageUrl} alt="Generated Visualization" className="max-w-full max-h-full object-contain" />
               ) : (
                 <div dangerouslySetInnerHTML={{ __html: result.code }} className="w-full h-full" />
               )}
             </CardContent>
          </Card>
          <div className="p-4 bg-muted rounded-lg text-sm">
            <span className="font-semibold">解释: </span>
            {result.explanation}
          </div>
        </div>
      )}
    </div>
  );
}
