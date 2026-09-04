// components/dashboard/WhatsNewModal.tsx
import React, { useState } from 'react';
import { Modal, Button } from '../UIComponents';
import {
  Sparkles, Rocket, Wrench, ShieldCheck, Bug,
  Calendar, CheckCircle2, ChevronRight, Tag
} from 'lucide-react';
import {
  CHANGELOG_DATA,
  ChangelogItem,
  ChangelogCategoryType,
  markChangelogAsRead
} from '../../constants/changelogData';

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMarkRead?: () => void;
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({
  isOpen,
  onClose,
  onMarkRead,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<string>(CHANGELOG_DATA[0]?.version || '');

  if (!isOpen) return null;

  const currentItem: ChangelogItem = CHANGELOG_DATA.find(c => c.version === selectedVersion) || CHANGELOG_DATA[0];

  const handleDismiss = () => {
    markChangelogAsRead();
    if (onMarkRead) onMarkRead();
    onClose();
  };

  const getCategoryConfig = (type: ChangelogCategoryType) => {
    switch (type) {
      case 'feature':
        return {
          icon: Rocket,
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dotBg: 'bg-emerald-500',
          titleColor: 'text-emerald-900',
        };
      case 'improvement':
        return {
          icon: Wrench,
          badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          dotBg: 'bg-indigo-500',
          titleColor: 'text-indigo-900',
        };
      case 'security':
        return {
          icon: ShieldCheck,
          badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
          dotBg: 'bg-purple-500',
          titleColor: 'text-purple-900',
        };
      case 'fix':
        return {
          icon: Bug,
          badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
          dotBg: 'bg-amber-500',
          titleColor: 'text-amber-900',
        };
      default:
        return {
          icon: Tag,
          badgeBg: 'bg-slate-50 text-slate-700 border-slate-200',
          dotBg: 'bg-slate-500',
          titleColor: 'text-slate-900',
        };
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleDismiss}
      title="มีอะไรใหม่ในระบบ (What's New)"
      size="lg"
      footer={
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>คุณสามารถเปิดดูประวัติอัปเดตย้อนหลังได้ตลอดเวลาจากเมนูด้านซ้าย</span>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleDismiss}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold px-5 py-2 shadow-sm"
          >
            รับทราบแล้ว ปิดหน้าต่าง
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Version Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200">
          {CHANGELOG_DATA.map((item, idx) => {
            const isSelected = item.version === selectedVersion;
            return (
              <button
                key={item.version}
                type="button"
                onClick={() => setSelectedVersion(item.version)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 ring-2 ring-indigo-300'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>{item.version}</span>
                {idx === 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isSelected ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-800'
                  }`}>
                    ล่าสุด
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Version Overview Card */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                Release {currentItem.version}
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {currentItem.date}
              </span>
            </div>
            <h4 className="text-lg font-bold text-white tracking-tight leading-snug">
              {currentItem.title}
            </h4>
            {currentItem.description && (
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {currentItem.description}
              </p>
            )}
          </div>
        </div>

        {/* Change Categories */}
        <div className="space-y-4">
          {currentItem.categories.map((cat, catIdx) => {
            const cfg = getCategoryConfig(cat.type);
            const Icon = cfg.icon;

            return (
              <div
                key={catIdx}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs transition-all hover:border-slate-300"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${cfg.badgeBg}`}>
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {cat.label}
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700 pl-1">
                  {cat.items.map((bullet, bulletIdx) => (
                    <li key={bulletIdx} className="flex items-start gap-2.5 leading-relaxed">
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotBg} mt-1.5 shrink-0`} />
                      <span className="flex-1 font-medium">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
