
import React, { useState, useEffect } from 'react';
import { Button } from './UIComponents';
import { Cookie, X } from 'lucide-react';

interface CookieConsentProps {
  lang: 'en' | 'th';
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ lang }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent-accepted');
    if (!consent) {
      // Delay appearance for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent-accepted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6 animate-in slide-in-from-bottom-full duration-700 ease-out">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
          
          <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Cookie className="w-7 h-7 text-white" />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-lg font-bold text-gray-900 mb-1">
              {lang === 'th' ? 'การใช้คุกกี้ (Cookie Policy)' : 'Cookie Usage Policy'}
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {lang === 'th' ? (
                <>
                  เราใช้คุกกี้เพื่อเพิ่มประสิทธิภาพและประสบการณ์ที่ดีในการใช้เว็บไซต์ 
                  ท่านสามารถศึกษารายละเอียดการใช้คุกกี้ และสามารถเลือกตั้งค่ายินยอม 
                  การใช้คุกกี้ได้โดยคลิก <button className="text-indigo-600 font-bold hover:underline">“การตั้งค่าคุกกี้”</button> 
                  <button className="ml-1 text-indigo-600 font-bold hover:underline">นโยบายการใช้คุกกี้</button>
                </>
              ) : (
                <>
                  We use cookies to improve your efficiency and provide a better experience on our website. 
                  You can study the details of cookie usage and choose your consent settings by clicking 
                  <button className="text-indigo-600 font-bold hover:underline mx-1">"Cookie Settings"</button> 
                  or view our <button className="text-indigo-600 font-bold hover:underline">Cookie Policy</button>.
                </>
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Button 
              variant="outline" 
              size="md" 
              onClick={handleAccept} 
              className="w-full sm:w-auto rounded-xl border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
            >
              {lang === 'th' ? 'การตั้งค่าคุกกี้' : 'Cookie Settings'}
            </Button>
            <Button 
              size="md" 
              onClick={handleAccept} 
              className="w-full sm:w-auto rounded-xl bg-slate-900 text-white hover:bg-black shadow-lg"
            >
              {lang === 'th' ? 'ยอมรับทั้งหมด' : 'Accept All'}
            </Button>
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors md:relative md:top-0 md:right-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
