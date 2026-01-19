"use client";

import { useState, useRef } from 'react';
import { useWorkbenchStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Mic, Send, StopCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useUserStore } from '@/lib/subscription/store';

export default function FeynmanTab() {
  const { knowledgePoints, selectedPointIds } = useWorkbenchStore();
  const { checkLimit, incrementUsage } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: any }[]>([]);
  const [input, setInput] = useState('');
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const selectedPoint = knowledgePoints.find(p => p.id === selectedPointIds[0]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await handleTranscribe(audioBlob);
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscribe = async (audioBlob: Blob) => {
    setLoading(true);
    try {
      const formData = new FormData();
      // Ensure the file extension is .webm or .mp4, supported by API
      formData.append('file', audioBlob, 'recording.webm');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Transcription failed');
      }

      const data = await response.json();
      if (data.text) {
        setInput(prev => prev + (prev ? ' ' : '') + data.text);
      }
    } catch (error: any) {
      console.error('Transcription error:', error);
      alert(`语音识别失败: ${error.message || '请检查麦克风权限或网络'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedPoint) return;
    
    if (!checkLimit()) {
      alert('已达到今日使用次数上限 (40次)。请明天再来！');
      return;
    }

    const userMsg = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/process/feynman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          concept: selectedPoint.content,
          userExplanation: input 
        }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', content: data }]);
      incrementUsage();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (selectedPointIds.length !== 1) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        请选择一个知识点来使用费曼私教进行练习。
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
        <h3 className="font-semibold text-primary">主题: {selectedPoint?.title}</h3>
        <p className="text-xs text-muted-foreground mt-1">用你自己的话解释这个概念（仅使用简单术语！）。</p>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {msg.role === 'user' ? (
                    <p className="text-sm">{msg.content}</p>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider opacity-70">
                        分数: {msg.content.score}/100
                      </div>
                      <p>{msg.content.feedback_summary}</p>
                      {msg.content.highlighted_issues?.length > 0 && (
                        <ul className="list-disc pl-4 space-y-1 text-xs opacity-90 bg-black/5 p-2 rounded">
                          {msg.content.highlighted_issues.map((issue: any, i: number) => (
                            <li key={i}>
                              <span className="font-semibold">"{issue.segment}"</span>: {issue.issue}
                            </li>
                          ))}
                        </ul>
                      )}
                      <p className="font-medium text-primary mt-2">{msg.content.next_question}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t flex gap-2">
          <Textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此输入你的解释..."
            className="min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button size="icon" className="h-[60px] w-[60px]" onClick={handleSend} disabled={loading || !input.trim()}>
            <Send className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="outline" className="h-[60px] w-[60px]">
            <Mic className="h-5 w-5" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
