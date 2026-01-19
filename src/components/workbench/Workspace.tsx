"use client";

import { useWorkbenchStore } from '@/lib/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Brain, Headphones, MessageCircle, FileQuestion, Sparkles } from 'lucide-react';

import VisualizerTab from './tabs/VisualizerTab';
import StoryTab from './tabs/StoryTab';
import PodcastTab from './tabs/PodcastTab';
import FeynmanTab from './tabs/FeynmanTab';
import ClozeTab from './tabs/ClozeTab';

import { Crown } from 'lucide-react';

export default function Workspace() {
  const { currentTab, setCurrentTab, selectedPointIds } = useWorkbenchStore();

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
  };

  if (selectedPointIds.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background bg-dot-pattern p-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 via-transparent to-blue-500/5 pointer-events-none" />
        
        <div className="text-center space-y-6 max-w-lg relative z-10 animate-in zoom-in-95 duration-500">
          <div className="bg-white/80 dark:bg-black/50 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/20 dark:border-white/10">
            <div className="bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-2xl p-6 inline-block mb-4 shadow-inner">
              <Brain className="h-16 w-16 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              记忆<span className="text-primary">实验室</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
              从左侧边栏选择一个或多个知识点，<br/>让 AI 为您开启多维记忆透镜。
            </p>
            
            <div className="mt-8 p-5 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border border-amber-100 dark:border-amber-900/50 rounded-xl text-sm text-amber-900 dark:text-amber-200 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-1">
                 <Sparkles className="h-4 w-4 text-amber-400 opacity-50 group-hover:opacity-100 transition-opacity" />
               </div>
               <div className="font-bold flex items-center justify-center gap-2 mb-2 text-base">
                  <Crown className="h-5 w-5 text-amber-600 fill-amber-100" /> 
                  <span>赞助商广告</span>
               </div>
               <p className="mb-2 font-medium">此广告位火热招租中，展示您的品牌。</p>
               <div className="inline-block bg-white/50 dark:bg-black/20 px-3 py-1 rounded-full text-xs font-mono border border-amber-200/50">
                 联系 wzh200563 投放
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background bg-dot-pattern bg-noise overflow-hidden relative">
      {/* Background Decor - Almond Blossom */}
      <svg className="absolute bottom-0 left-0 w-[400px] h-[400px] text-primary/5 pointer-events-none translate-y-1/3 -translate-x-1/4" viewBox="0 0 100 100" fill="currentColor">
         <path d="M0,100 Q30,50 60,80 T100,60" stroke="currentColor" strokeWidth="2" fill="none" />
         <circle cx="30" cy="50" r="3" fill="currentColor" />
         <circle cx="60" cy="80" r="4" fill="currentColor" />
         <circle cx="90" cy="65" r="2" fill="currentColor" />
      </svg>

      {/* Top Bar with Glass effect - Added pr-24 to avoid overlap with auth button */}
      <div className="p-4 border-b border-white/20 dark:border-white/10 bg-white/40 dark:bg-[#12162B]/40 backdrop-blur-xl sticky top-0 z-30 pr-32">
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-5 h-12 p-1 bg-[#F0F8FA]/50 dark:bg-[#12162B]/50 backdrop-blur-md border border-white/30 dark:border-white/5 shadow-inner rounded-xl">
            <TabsTrigger value="visual" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-300">
              <Eye className="h-4 w-4 mr-2" /> 视觉化
            </TabsTrigger>
            <TabsTrigger value="story" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-300">
              <Brain className="h-4 w-4 mr-2" /> 脑洞编剧
            </TabsTrigger>
            <TabsTrigger value="podcast" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-300 relative group">
              <Headphones className="h-4 w-4 mr-2" /> 听觉记忆
            </TabsTrigger>
            <TabsTrigger value="feynman" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-300">
              <MessageCircle className="h-4 w-4 mr-2" /> 费曼私教
            </TabsTrigger>
            <TabsTrigger value="cloze" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-300">
              <FileQuestion className="h-4 w-4 mr-2" /> 智能填空
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-auto p-6 md:p-8">
        <div className="max-w-5xl mx-auto h-full">
           <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl h-full overflow-hidden p-1">
              <div className="h-full overflow-auto p-6 bg-white/50 dark:bg-black/50 rounded-xl">
                {currentTab === 'visual' && <VisualizerTab />}
                {currentTab === 'story' && <StoryTab />}
                {currentTab === 'podcast' && <PodcastTab />}
                {currentTab === 'feynman' && <FeynmanTab />}
                {currentTab === 'cloze' && <ClozeTab />}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
