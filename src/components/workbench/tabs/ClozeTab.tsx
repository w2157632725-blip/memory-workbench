"use client";

import { useState } from 'react';
import { useWorkbenchStore } from '@/lib/store';
import { useUserStore } from '@/lib/subscription/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, HelpCircle, Keyboard } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

export default function ClozeTab() {
  const { knowledgePoints, selectedPointIds } = useWorkbenchStore();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[] | null>(null);
  const [revealedHints, setRevealedHints] = useState<Record<string, number>>({});
  
  // New state for typing mode
  const [mode, setMode] = useState<'hint' | 'type'>('hint');
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({}); // key: "itemIndex-partIndex", value: userInput
  const [checkResults, setCheckResults] = useState<Record<string, boolean>>({});

  const selectedContent = knowledgePoints
    .filter(p => selectedPointIds.includes(p.id))
    .map(p => `${p.content}`)
    .join('\n');

  const handleGenerate = async () => {
    if (!checkLimit()) {
      alert('已达到今日使用次数上限 (40次)。请明天再来！');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/process/cloze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: selectedContent }),
      });
      const data = await response.json();
      setItems(data);
      setRevealedHints({});
      setUserAnswers({});
      setCheckResults({});
      incrementUsage();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleHint = (itemIdx: number, partIdx: number) => {
    const key = `${itemIdx}-${partIdx}`;
    const currentLevel = revealedHints[key] || 0;
    setRevealedHints(prev => ({
      ...prev,
      [key]: Math.min(currentLevel + 1, 3)
    }));
  };

  const handleInputChange = (itemIdx: number, partIdx: number, value: string) => {
    const key = `${itemIdx}-${partIdx}`;
    setUserAnswers(prev => ({ ...prev, [key]: value }));
    // Reset check status when typing
    setCheckResults(prev => {
        const newResults = { ...prev };
        delete newResults[key];
        return newResults;
    });
  };

  const checkAnswer = (itemIdx: number, partIdx: number, correctAnswer: string) => {
    const key = `${itemIdx}-${partIdx}`;
    const userAnswer = userAnswers[key] || '';
    setCheckResults(prev => ({
        ...prev,
        [key]: userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
    }));
  };

  const getHintContent = (part: any, level: number) => {
    if (level === 0) return "____";
    if (level === 1) return part.hint_1;
    if (level === 2) return part.hint_2;
    return part.answer;
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {!items ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-4">
          <p>为 {selectedPointIds.length} 个项目生成填空练习。</p>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <HelpCircle className="mr-2 h-4 w-4" />}
            生成测验
          </Button>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
             <div className="flex gap-2 items-center">
                <h3 className="font-bold text-lg">智能填空</h3>
                <div className="bg-muted p-1 rounded-lg flex text-xs">
                    <button 
                        onClick={() => setMode('hint')}
                        className={`px-3 py-1 rounded-md transition-all ${mode === 'hint' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                    >
                        提示模式
                    </button>
                    <button 
                        onClick={() => setMode('type')}
                        className={`px-3 py-1 rounded-md transition-all ${mode === 'type' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                    >
                        拼写模式
                    </button>
                </div>
             </div>
             <Button variant="outline" size="sm" onClick={() => setItems(null)}>重置</Button>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="space-y-6">
              {items.map((item, idx) => (
                <Card key={idx}>
                  <CardContent className="p-6 text-lg leading-relaxed">
                    <p className="mb-4 font-medium text-muted-foreground text-sm">原始思考:</p>
                    
                    {mode === 'hint' ? (
                        <div className="flex flex-wrap gap-2 items-center">
                            {item.cloze_parts.map((part: any, pIdx: number) => {
                               const key = `${idx}-${pIdx}`;
                               const level = revealedHints[key] || 0;
                               return (
                                 <div key={pIdx} className="flex flex-col items-center p-2 border rounded bg-muted/30">
                                   <span className="text-xs text-muted-foreground mb-1">线索 #{pIdx + 1}</span>
                                   <Button 
                                     variant={level === 3 ? "default" : "secondary"} 
                                     size="sm"
                                     onClick={() => toggleHint(idx, pIdx)}
                                     className="min-w-[100px]"
                                   >
                                     {getHintContent(part, level)}
                                   </Button>
                                 </div>
                               );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-4 items-start">
                            {item.cloze_parts.map((part: any, pIdx: number) => {
                               const key = `${idx}-${pIdx}`;
                               const isCorrect = checkResults[key];
                               const hasChecked = checkResults.hasOwnProperty(key);
                               
                               return (
                                 <div key={pIdx} className="flex flex-col gap-2 min-w-[150px]">
                                   <span className="text-xs text-muted-foreground">填空 #{pIdx + 1} ({part.hint_1})</span>
                                   <div className="flex gap-2">
                                       <Input 
                                            value={userAnswers[key] || ''}
                                            onChange={(e) => handleInputChange(idx, pIdx, e.target.value)}
                                            placeholder="输入答案..."
                                            className={hasChecked ? (isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50") : ""}
                                       />
                                       <Button size="sm" variant="ghost" onClick={() => checkAnswer(idx, pIdx, part.answer)}>
                                           {hasChecked ? (isCorrect ? "✅" : "❌") : "检查"}
                                       </Button>
                                   </div>
                                   {hasChecked && !isCorrect && (
                                       <span className="text-xs text-red-500">正确答案: {part.answer}</span>
                                   )}
                                 </div>
                               );
                            })}
                        </div>
                    )}

                    <p className="mt-4 p-4 bg-muted/10 rounded border-l-4 border-primary italic">
                      "{item.full_sentence.split(item.cloze_parts[0]?.answer || '___').map((part: string, i: number) => (
                          <span key={i}>
                              {part}
                              {i < item.full_sentence.split(item.cloze_parts[0]?.answer).length - 1 && (
                                  <span className="bg-muted px-2 rounded mx-1 font-bold">___</span>
                              )}
                          </span>
                      ))}" 
                      {/* Note: This is a simplified replacement for demo purposes */}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
