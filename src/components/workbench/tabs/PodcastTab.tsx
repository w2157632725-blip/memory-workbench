"use client";

import { useState } from 'react';
import { useWorkbenchStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Mic, Play, Download } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useUserStore } from '@/lib/subscription/store';

export default function PodcastTab() {
  const { knowledgePoints, selectedPointIds } = useWorkbenchStore();
  const { checkLimit, incrementUsage } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<{ speaker: string; text: string }[] | null>(null);

  const selectedContent = knowledgePoints
    .filter(p => selectedPointIds.includes(p.id))
    .map(p => `${p.title}: ${p.content}`)
    .join('\n\n');

  const handleGenerate = async () => {
    if (!checkLimit()) {
      alert('已达到今日使用次数上限 (40次)。请明天再来！');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/process/podcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: selectedContent }),
      });
      const data = await response.json();
      setScript(data);
      incrementUsage();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN'; // Set language to Chinese
      utterance.rate = 1.0; // Normal speed
      
      // Optional: Select a specific voice if available
      // const voices = window.speechSynthesis.getVoices();
      // utterance.voice = voices.find(v => v.lang === 'zh-CN') || null;

      window.speechSynthesis.speak(utterance);
    } else {
      alert('您的浏览器不支持语音合成功能。');
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {!script ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-4">
          <p>为 {selectedPointIds.length} 个项目生成播客脚本。</p>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mic className="mr-2 h-4 w-4" />}
            生成脚本
          </Button>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-lg">播客脚本</h3>
             <div className="flex gap-2">
               <Button variant="outline" size="sm" onClick={() => setScript(null)}>重置</Button>
               <Button 
                 size="sm" 
                 onClick={() => {
                   const fullText = script.map(line => `${line.speaker}说：${line.text}`).join('\n');
                   handleSpeak(fullText);
                 }}
               >
                 <Play className="mr-2 h-4 w-4" /> 收听 (免费)
               </Button>
             </div>
          </div>
          
          <Card className="flex-1 overflow-hidden">
            <ScrollArea className="h-full p-6">
              <div className="space-y-6 max-w-3xl mx-auto">
                {script.map((line, idx) => (
                  <div key={idx} className={`flex gap-4 ${line.speaker === 'Host A' ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold ${line.speaker === 'Host A' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {line.speaker === 'Host A' ? 'A' : 'B'}
                    </div>
                    <div className={`p-4 rounded-2xl max-w-[80%] ${line.speaker === 'Host A' ? 'bg-muted rounded-tl-none' : 'bg-primary/10 rounded-tr-none'}`}>
                      <p className="text-sm">{line.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      )}
    </div>
  );
}
