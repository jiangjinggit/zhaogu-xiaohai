import React, { useState } from 'react';
import { getIllnessGuidance } from '../services/geminiService';
import { AIResponse } from '../types';
import { Stethoscope, AlertTriangle, ExternalLink, ShieldCheck, Thermometer } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const COMMON_SYMPTOMS = [
  "🤒 发烧超过38.5度",
  "😷 夜间干咳",
  "🤢 呕吐腹泻",
  "🦵 腹部红疹",
  "👂 抓耳朵哭闹"
];

export const IllnessTab: React.FC = () => {
  const [symptoms, setSymptoms] = useState('');
  const [advice, setAdvice] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    const data = await getIllnessGuidance(text);
    setAdvice(data);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      {/* Disclaimer Banner */}
      <div className="bg-amber-50/80 backdrop-blur border-l-4 border-amber-400 rounded-r-xl p-5 flex items-start gap-4 shadow-sm">
        <div className="bg-amber-100 p-2 rounded-full shrink-0">
           <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h4 className="font-bold text-amber-800 text-sm uppercase tracking-wide mb-1">重要免责声明</h4>
          <p className="text-amber-700/80 text-sm leading-relaxed">
            本工具建议仅供参考，**绝不可替代专业医疗诊断**。如遇紧急情况或严重不适，请立即前往医院就医。
          </p>
        </div>
      </div>

      {/* Input Card */}
      <div className="bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg">
                <Thermometer className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">症状自查</h2>
        </div>

        <div className="relative mb-6">
          <input
            type="text"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCheck(symptoms)}
            placeholder="描述宝宝的症状，例如：流鼻涕三天了，有点低烧..."
            className="w-full pl-6 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-slate-700"
          />
          <button 
            onClick={() => handleCheck(symptoms)}
            disabled={loading || !symptoms.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-600 disabled:opacity-50 transition-all shadow-md flex items-center gap-2"
          >
            {loading ? '分析中...' : (
              <>
                <Stethoscope className="w-4 h-4" /> 查询
              </>
            )}
          </button>
        </div>

        {!advice && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">常见症状快捷查询</p>
            <div className="flex flex-wrap gap-3">
              {COMMON_SYMPTOMS.map(sym => (
                <button
                  key={sym}
                  onClick={() => { setSymptoms(sym.substring(2)); handleCheck(sym.substring(2)); }}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:border-blue-400 hover:text-blue-600 hover:shadow-sm transition-all"
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Card */}
      {advice && (
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100 border border-blue-50 overflow-hidden animate-fade-in">
          <div className="bg-blue-500 p-1"></div> {/* Color bar top */}
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-50 p-2 rounded-full">
                    <ShieldCheck className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">家庭护理建议</h3>
            </div>
            
            {/* Markdown Rendering */}
            <div className="prose prose-blue max-w-none text-slate-600 prose-headings:text-blue-900 prose-strong:text-blue-800">
               <ReactMarkdown>{advice.text}</ReactMarkdown>
            </div>

            {advice.sources && advice.sources.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100 bg-slate-50/50 -mx-8 px-8 pb-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">医疗参考来源</h4>
                <ul className="space-y-2">
                  {advice.sources.map((source, idx) => (
                    <li key={idx}>
                      <a 
                        href={source.uri} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 font-medium hover:underline bg-white px-3 py-1 rounded-md border border-slate-100"
                      >
                        <ExternalLink className="w-3 h-3" /> {source.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};