import React from 'react';
import { MapPin, ArrowRight, Sparkles, Building2, Factory, Zap, Leaf, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Language } from '../../types';

interface WorkplaceSectionProps {
  lang: Language;
  onSelectSite: (siteKeyword: string) => void;
}

export const WorkplaceSection: React.FC<WorkplaceSectionProps> = ({ lang, onSelectSite }) => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background radial soft shapes */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs sm:text-sm font-bold mb-4">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            {lang === 'th' ? 'สถานที่ทำงานและสภาพแวดล้อม' : 'Workplace Environments'}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            {lang === 'th' ? 'พื้นที่ทำงานที่ตอบโจทย์ทุกไลฟ์สไตล์' : 'Designed for Collaboration & Growth'}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            {lang === 'th'
              ? 'ไม่ว่าคุณจะชอบบรรยากาศใจกลางเมืองหลวง หรือพื้นที่นวัตกรรมสีเขียวขนาดใหญ่ เรามีสถานที่ที่พร้อมสนับสนุนความสำเร็จของคุณ'
              : 'Whether you thrive in the dynamic city center or inside a world-class green eco-industrial park, our workspaces inspire excellence.'}
          </p>
        </div>

        {/* 2 Big Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Card 1: Prachinburi IP1 & Eastern Plants */}
          <div className="group bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 rounded-[2.5rem] p-8 sm:p-10 border border-emerald-100/80 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between gap-3 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                  <Factory className="w-3.5 h-3.5" />
                  {lang === 'th' ? 'นิคมอุตสาหกรรม 304' : '304 Industrial Park'}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full">
                  📍 {lang === 'th' ? 'ปราจีนบุรี & ฉะเชิงเทรา' : 'Prachin Buri & Chachoengsao'}
                </span>
              </div>

              <div className="mb-6 rounded-2xl overflow-hidden shadow-lg border border-white/60 transform group-hover:scale-[1.02] transition-transform duration-500 bg-white">
                <img
                  src="/plant_ip1_isometric.png"
                  alt="Double A Smart Eco-Factory 3D"
                  className="w-full h-64 sm:h-72 object-contain p-2"
                />
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
                {lang === 'th' ? 'ศูนย์นวัตกรรมสีเขียว & พลังงานหมุนเวียน (IP1)' : 'Green Eco-Factory & Clean Energy Hub'}
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                {lang === 'th'
                  ? 'โรงงานผลิตกระดาษคุณภาพสูงระดับโลก พร้อมโรงไฟฟ้าชีวมวลพลังงานหมุนเวียน 100% ครบครันด้วยสิ่งอำนวยความสะดวก ที่พักสวัสดิการ ฟิตเนส และรถรับส่งปรับอากาศ'
                  : 'A world-class smart paper manufacturing and renewable biomass energy park with employee residential perks, fitness centers, and air-conditioned shuttle transport.'}
              </p>

              {/* Bullet Features */}
              <div className="grid grid-cols-2 gap-3 mb-8 text-xs sm:text-sm font-semibold text-slate-700">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-emerald-100">
                  <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{lang === 'th' ? 'โรงงานคาร์บอนต่ำ' : 'Eco Sustainable'}</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-emerald-100">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{lang === 'th' ? 'โรงไฟฟ้าชีวมวล' : 'Clean Biomass'}</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-emerald-100">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{lang === 'th' ? 'หอพัก & รถรับส่ง' : 'Housing & Shuttles'}</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-emerald-100">
                  <HeartHandshake className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{lang === 'th' ? 'สโมสร & ฟิตเนส' : 'Fitness & Club'}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectSite('ip1')}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 group-hover:gap-3"
            >
              <span>{lang === 'th' ? 'สำรวจตำแหน่งงานไซต์ปราจีนบุรี (IP1)' : 'Explore Prachin Buri Roles'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Bangkok HQ & DAP */}
          <div className="group bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/30 rounded-[2.5rem] p-8 sm:p-10 border border-indigo-100/80 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between gap-3 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-xs">
                  <Building2 className="w-3.5 h-3.5" />
                  {lang === 'th' ? 'สำนักงานใหญ่ดิจิทัล' : 'Corporate Headquarter'}
                </span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-100/60 px-3 py-1 rounded-full">
                  📍 {lang === 'th' ? 'กรุงเทพฯ (One Bangkok) & บางนา' : 'Bangkok (One Bangkok) & Bangna'}
                </span>
              </div>

              <div className="mb-6 rounded-2xl overflow-hidden shadow-lg border border-white/60 transform group-hover:scale-[1.02] transition-transform duration-500 bg-white">
                <img
                  src="/corporate_hq_isometric.png"
                  alt="Double A Bangkok HQ 3D"
                  className="w-full h-64 sm:h-72 object-contain p-2"
                />
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
                {lang === 'th' ? 'สำนักงานใหญ่ One Bangkok & Agile Workplace' : 'Smart Digital HQ & Modern Worklife'}
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                {lang === 'th'
                  ? 'ศูนย์กลางการบริหารและการตลาดระดับสากล บรรยากาศการทำงานแบบเปิด กว้างขวาง ทันสมัย เชื่อมต่อระบบรถไฟฟ้า MRT พร้อมสิ่งอำนวยความสะดวกใจกลางเมือง'
                  : 'Strategic corporate headquarters driving global marketing and digital transformation with open collaborative spaces connected seamlessly to MRT transit.'}
              </p>

              {/* Bullet Features */}
              <div className="grid grid-cols-2 gap-3 mb-8 text-xs sm:text-sm font-semibold text-slate-700">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-indigo-100">
                  <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{lang === 'th' ? 'แลนด์มาร์ก One Bangkok' : 'One Bangkok Tower'}</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-indigo-100">
                  <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>{lang === 'th' ? 'Agile & Open Space' : 'Agile Collaboration'}</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-indigo-100">
                  <MapPin className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>{lang === 'th' ? 'ติดรถไฟฟ้า MRT' : 'MRT Connected'}</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-indigo-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{lang === 'th' ? 'ความมั่นคงระดับโลก' : 'Global Alliance'}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectSite('onebkk')}
              className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 group-hover:gap-3"
            >
              <span>{lang === 'th' ? 'สำรวจตำแหน่งงานในกรุงเทพฯ (One Bangkok)' : 'Explore Bangkok Roles'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
