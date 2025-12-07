import React, { useState, useEffect, useRef } from 'react';
import { DailyLog, LogType } from '../types';
import { analyzeDailyLogs } from '../services/geminiService';
import { Plus, Activity, Droplets, Utensils, Moon, Trash2, Coffee, Clock, ArrowRight, Sparkles, Mic, MicOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Helper to translate LogType to Chinese
const getLogTypeLabel = (type: LogType) => {
  switch (type) {
    case LogType.FOOD: return '吃饭';
    case LogType.MILK: return '喝奶';
    case LogType.WATER: return '喝水';
    case LogType.POOP: return '便便';
    case LogType.SLEEP: return '睡觉';
    case LogType.OTHER: return '其他';
    default: return type;
  }
};

export const TrackerTab: React.FC = () => {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [detail, setDetail] = useState('');
  const [type, setType] = useState<LogType>(LogType.FOOD);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('toddler_logs');
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('toddler_logs', JSON.stringify(logs));
  }, [logs]);

  const addLog = () => {
    if (!detail.trim()) return;
    const newLog: DailyLog = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type,
      detail
    };
    setLogs([newLog, ...logs]);
    setDetail('');
  };

  const deleteLog = (id: string) => {
    setLogs(logs.filter(l => l.id !== id));
  };

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeDailyLogs(logs);
    setAnalysis(result);
    setLoading(false);
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("您的浏览器暂不支持语音输入功能，请使用 Chrome 或 Safari。");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setDetail((prev) => {
        const spacer = prev.length > 0 ? ' ' : '';
        return prev + spacer + transcript;
      });
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const getIconInfo = (t: LogType) => {
    switch (t) {
      case LogType.FOOD: return { icon: Utensils, color: 'bg-orange-100 text-orange-600' };
      case LogType.MILK: return { icon: Coffee, color: 'bg-blue-100 text-blue-600' };
      case LogType.WATER: return { icon: Droplets, color: 'bg-cyan-100 text-cyan-600' };
      case LogType.SLEEP: return { icon: Moon, color: 'bg-indigo-100 text-indigo-600' };
      case LogType.POOP: return { icon: Activity, color: 'bg-yellow-100 text-yellow-700' };
      default: return { icon: Activity, color: 'bg-gray-100 text-gray-600' };
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Input Section */}
      <div className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/50 border border-white">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <div className="bg-rose-100 p-1.5 rounded-lg">
            <Plus className="w-5 h-5 text-rose-600" />
          </div>
          记录新活动
        </h2>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {(Object.keys(LogType) as Array<keyof typeof LogType>).map((key) => {
             const info = getIconInfo(LogType[key]);
             const Icon = info.icon;
             const isSelected = type === LogType[key];
             return (
              <button
                key={key}
                onClick={() => setType(LogType[key])}
                className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
                  isSelected 
                    ? 'bg-slate-800 text-white shadow-md scale-105' 
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {getLogTypeLabel(LogType[key])}
              </button>
             );
          })}
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder={`输入或点击话筒说话...`}
              className="w-full pl-5 pr-12 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-rose-400 outline-none text-slate-700 placeholder-slate-400 transition-all"
              onKeyDown={(e) => e.key === 'Enter' && addLog()}
            />
            <button
              onClick={toggleVoiceInput}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                isListening 
                  ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-200' 
                  : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100'
              }`}
              title="语音输入"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>
          
          <button 
            onClick={addLog}
            className="bg-gradient-to-r from-rose-500 to-rose-600 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg hover:shadow-rose-200 hover:-translate-y-0.5 transition-all shrink-0"
          >
            添加
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            今日时间轴
          </h3>
          
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
              <Activity className="w-10 h-10 mb-3 opacity-20" />
              <p>暂无记录，快去添加第一条吧！</p>
            </div>
          ) : (
            <div className="relative pl-4 space-y-0">
              {/* Vertical Line */}
              <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-slate-100"></div>

              {logs.map((log, idx) => {
                const info = getIconInfo(log.type);
                const Icon = info.icon;
                return (
                  <div key={log.id} className="relative flex items-start gap-4 pb-8 group last:pb-0">
                    <div className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 border-4 border-white ${info.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 pt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                          {new Date(log.timestamp).toLocaleTimeString('zh-CN', {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <button onClick={() => deleteLog(log.id)} className="text-slate-300 hover:text-red-400 transition-colors p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl rounded-tl-none border border-slate-100 group-hover:border-rose-100 group-hover:bg-rose-50/30 transition-colors">
                        <p className="font-bold text-slate-700 text-sm mb-0.5">{getLogTypeLabel(log.type)}</p>
                        <p className="text-slate-600">{log.detail}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Analysis Card */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-gradient-to-b from-rose-500 to-rose-600 p-6 rounded-3xl shadow-xl shadow-rose-200 text-white relative overflow-hidden">
             {/* Decorative circles */}
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
             <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>

             <div className="relative z-10">
              <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-200" />
                AI 健康日报
              </h3>
              <p className="text-rose-100 text-sm mb-6 opacity-90">基于今日记录的智能分析</p>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 min-h-[180px] mb-4 border border-white/10">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full animate-pulse text-rose-100">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mb-3"></div>
                    <p className="text-sm font-medium">正在分析数据...</p>
                  </div>
                ) : analysis ? (
                  // Markdown Rendering for Analysis
                  <div className="prose prose-invert prose-sm max-w-none text-sm leading-relaxed prose-p:text-rose-50 prose-strong:text-white">
                    <ReactMarkdown>{analysis}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-rose-200/70 text-center p-2">
                    <Activity className="w-10 h-10 mb-2 opacity-50" />
                    <p className="text-sm">记录更多数据后，<br/>点击下方按钮生成报告。</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleAnalyze}
                disabled={loading || logs.length === 0}
                className="w-full py-3 bg-white text-rose-600 font-bold rounded-xl hover:bg-rose-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? '分析中...' : '生成今日分析'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
            <h4 className="font-bold text-blue-800 mb-2 text-sm uppercase tracking-wider">小贴士</h4>
            <p className="text-blue-600 text-sm leading-relaxed">
              1-3岁幼儿建议每日饮水 600-1000ml。保持规律的作息有助于生长激素分泌。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};