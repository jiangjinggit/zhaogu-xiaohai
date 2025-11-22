import React, { useState } from 'react';
import { getEmergencyStepWithImage } from '../services/geminiService';
import { AlertOctagon, Phone, ChevronLeft, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const SCENARIOS = [
  { id: 'choking', title: '噎食/窒息', sub: 'Choking', icon: '🛑', color: 'bg-red-50 hover:bg-red-100 border-red-200' },
  { id: 'burns', title: '烧伤/烫伤', sub: 'Burns', icon: '🔥', color: 'bg-orange-50 hover:bg-orange-100 border-orange-200' },
  { id: 'cpr', title: '心肺复苏', sub: 'Child CPR', icon: '❤️', color: 'bg-rose-50 hover:bg-rose-100 border-rose-200' },
  { id: 'poison', title: '误食/中毒', sub: 'Poisoning', icon: '☠️', color: 'bg-purple-50 hover:bg-purple-100 border-purple-200' },
  { id: 'head', title: '头部受伤', sub: 'Head Injury', icon: '🤕', color: 'bg-slate-50 hover:bg-slate-100 border-slate-200' },
  { id: 'seizure', title: '惊厥/抽搐', sub: 'Seizure', icon: '⚡', color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200' },
];

export const EmergencyTab: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [guide, setGuide] = useState<{text: string, imageUrl?: string} | null>(null);
  const [loading, setLoading] = useState(false);

  const handleScenarioClick = async (scenarioTitle: string) => {
    setSelectedScenario(scenarioTitle);
    setLoading(true);
    setGuide(null); // Reset previous guide
    const result = await getEmergencyStepWithImage(scenarioTitle);
    setGuide(result);
    setLoading(false);
  };

  const reset = () => {
    setSelectedScenario(null);
    setGuide(null);
  };

  if (selectedScenario) {
    return (
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <button 
          onClick={reset} 
          className="text-slate-500 hover:text-slate-800 font-bold text-sm flex items-center gap-1 px-4 py-2 rounded-full hover:bg-slate-100 transition-colors w-fit"
        >
          <ChevronLeft className="w-4 h-4" /> 返回列表
        </button>
        
        <div className="bg-red-600 text-white p-6 rounded-3xl shadow-lg shadow-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AlertOctagon className="w-6 h-6 text-red-200" />
              <h2 className="text-2xl font-bold">{selectedScenario} 紧急处理</h2>
            </div>
            <p className="text-red-100 font-medium">请保持冷静，按照以下步骤操作。如遇意识丧失，请立即呼叫急救。</p>
          </div>
          <a href="tel:120" className="flex items-center gap-2 bg-white text-red-600 px-6 py-3 rounded-xl font-bold shadow-md hover:scale-105 transition-transform">
            <Phone className="w-5 h-5 fill-current" />
            <span>呼叫 120</span>
          </a>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg border border-slate-100">
            <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">正在生成权威指南...</h3>
            <p className="text-slate-500">AI 正在检索急救步骤并生成 Nano Banana Pro 示意图</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row">
            {/* Visual Guide Section */}
            <div className="w-full md:w-1/2 bg-slate-100 border-b md:border-b-0 md:border-r border-slate-200 relative min-h-[300px] md:min-h-[500px] flex flex-col">
              <div className="flex-1 flex items-center justify-center p-4">
                {guide?.imageUrl ? (
                    <img 
                        src={guide.imageUrl} 
                        alt={`Illustration for ${selectedScenario}`} 
                        className="w-full h-full object-contain max-h-[400px] drop-shadow-xl"
                    />
                ) : (
                    <div className="text-center text-slate-400">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="font-medium">示意图生成中或暂不可用</p>
                    </div>
                )}
              </div>
               <div className="bg-white/80 backdrop-blur px-3 py-2 text-[10px] text-slate-500 text-center border-t border-slate-100">
                  由 Gemini 3 Pro Image Preview 生成的 AI 示意图，仅供参考
               </div>
            </div>

            {/* Text Steps */}
            <div className="w-full md:w-1/2 p-8 bg-white overflow-y-auto">
              <h3 className="text-lg font-bold text-slate-900 mb-6 uppercase tracking-widest border-b border-slate-100 pb-2">
                行动指南
              </h3>
              {guide?.text ? (
                // Use prose to render the markdown content nicely
                <div className="prose prose-slate max-w-none text-slate-700 prose-headings:font-bold prose-headings:text-slate-900 prose-strong:text-slate-900 prose-li:marker:text-red-500 prose-li:pl-2">
                   <ReactMarkdown>{guide.text}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-slate-500">无相关文本。</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-red-200 mb-10 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <AlertOctagon className="w-14 h-14 mx-auto mb-4 relative z-10" />
        <h2 className="text-3xl font-bold relative z-10">紧急情况快速处理</h2>
        <p className="opacity-90 mt-2 text-lg relative z-10">分秒必争，请选择您当前遇到的情况。</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => handleScenarioClick(s.title)}
            className={`p-6 rounded-3xl border-2 transition-all group text-left flex items-center justify-between hover:shadow-lg hover:-translate-y-1 ${s.color} border-transparent bg-opacity-50 hover:bg-opacity-100`}
          >
            <div className="flex items-center gap-5">
              <span className="text-4xl drop-shadow-sm group-hover:scale-110 transition-transform duration-300">{s.icon}</span>
              <div>
                <span className="block font-bold text-slate-800 text-xl">{s.title}</span>
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mt-0.5">{s.sub}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-12 text-center">
         <p className="text-xs text-slate-400 font-medium bg-slate-100 inline-block px-4 py-2 rounded-full">
            ⚠️ 声明：AI 生成内容仅供紧急参考，请始终优先联系 120 急救中心。
         </p>
      </div>
    </div>
  );
};