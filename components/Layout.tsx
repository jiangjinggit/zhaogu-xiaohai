import React from 'react';
import { AppTab } from '../types';
import { BookOpen, Activity, Stethoscope, AlertOctagon, Baby } from 'lucide-react';

interface LayoutProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentTab, onTabChange, children }) => {
  const navItems = [
    { id: AppTab.KNOWLEDGE, label: '育儿知识', icon: BookOpen, color: 'text-emerald-500' },
    { id: AppTab.TRACKER, label: '日常记录', icon: Activity, color: 'text-rose-500' },
    { id: AppTab.ILLNESS, label: '疾病护理', icon: Stethoscope, color: 'text-blue-500' },
    { id: AppTab.EMERGENCY, label: '紧急处理', icon: AlertOctagon, danger: true, color: 'text-red-500' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-rose-50 via-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-white/50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-rose-400 to-rose-600 p-2.5 rounded-2xl shadow-rose-200 shadow-lg transform transition-transform hover:scale-105">
              <Baby className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">幼儿成长助手</h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Smart Parenting Companion</p>
            </div>
          </div>
          <div className="text-xs font-semibold text-rose-600 bg-rose-100/50 px-3 py-1.5 rounded-full border border-rose-100">
            1-3岁专属
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 pb-28 sm:pb-10">
        {children}
      </main>

      {/* Mobile Bottom Nav (Glassmorphism) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 px-2 py-2 sm:hidden z-30 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 w-16 ${
                  isActive 
                    ? 'bg-slate-100 scale-110'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon 
                  className={`w-6 h-6 transition-colors ${isActive ? item.color : 'text-slate-400'}`} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={`text-[10px] font-bold transition-colors ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Floating Nav */}
      <div className="hidden sm:block fixed left-1/2 -translate-x-1/2 bottom-8 z-30 animate-fade-in">
        <div className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl shadow-slate-200/50 rounded-full p-1.5 flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 font-bold text-sm ${
                  isActive 
                    ? item.danger 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-200' 
                      : 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg shadow-slate-300'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};