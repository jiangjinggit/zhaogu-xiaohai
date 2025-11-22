import React, { useState } from 'react';
import { getParentingAdvice } from '../services/geminiService';
import { AIResponse } from '../types';
import { Search, ExternalLink, Sparkles, ArrowRight, Lightbulb } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const SUGGESTED_TOPICS = [
  "🚽 2岁宝宝如厕训练方法",
  "🛌 18个月宝宝每天需要睡多久",
  "😡 如何应对宝宝发脾气",
  "🍎 适合幼儿的健康零食",
  "🗣️ 1-3岁语言发育里程碑"
];

export const KnowledgeTab: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    const data = await getParentingAdvice(searchTerm);
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
      
      {/* Search Hero Section */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 sm:p-12 shadow-xl shadow-emerald-200 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-3">育儿知识库</h2>
          <p className="text-emerald-100 mb-8 text-lg">权威、科学的育儿建议，随时为您解答。</p>
          
          <div className="relative max-w-xl mx-auto group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder="例如：怎么改掉咬人的习惯？"
              className="w-full pl-14 pr-32 py-5 bg-white rounded-2xl shadow-lg border-0 text-slate-700 placeholder-slate-400 focus:ring-4 focus:ring-emerald-300/50 outline-none transition-all text-lg"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500 w-6 h-6" />
            <button 
              onClick={() => handleSearch(query)}
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-70 transition-all shadow-md"
            >
              {loading ? '搜索中...' : '咨询AI'}
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Topics or Loading */}
      {!result && !loading && (
        <div>
          <h3 className="text-slate-600 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
            <Lightbulb className="w-4 h-4 text-amber-400" /> 热门话题
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {SUGGESTED_TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => { setQuery(topic.substring(2)); handleSearch(topic.substring(2)); }}
                className="p-5 bg-white border border-slate-100 rounded-2xl text-left hover:shadow-lg hover:-translate-y-1 hover:border-emerald-100 transition-all group flex items-center justify-between"
              >
                <span className="text-slate-700 font-bold text-sm group-hover:text-emerald-700">{topic}</span>
                <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
           <div className="inline-block w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
           <p className="text-slate-500 font-medium animate-pulse">正在检索权威来源...</p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden animate-fade-in">
          <div className="bg-emerald-50/50 p-6 border-b border-emerald-100 flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-emerald-900 text-lg">专家建议摘要</h3>
          </div>
          <div className="p-8">
            {/* Markdown Rendering */}
            <div className="prose prose-emerald max-w-none text-slate-600 prose-headings:text-emerald-900 prose-strong:text-emerald-800 prose-a:text-emerald-600">
              <ReactMarkdown>{result.text}</ReactMarkdown>
            </div>
            
            {result.sources && result.sources.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">参考来源</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.sources.map((source, idx) => (
                    <a 
                      key={idx} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-colors group"
                    >
                      <ExternalLink className="w-4 h-4 flex-shrink-0 text-slate-400 group-hover:text-emerald-500" />
                      <span className="text-sm font-medium text-slate-600 group-hover:text-emerald-700 truncate">{source.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};