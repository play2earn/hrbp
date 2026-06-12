
import React, { useState, useEffect } from 'react';
import { Button, Modal } from './UIComponents';
import { Cookie, X, Shield, BarChart3, Target, Info, CheckCircle2 } from 'lucide-react';

interface CookieConsentProps {
  lang: 'en' | 'th';
}

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ lang }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);

  // Preference Toggles state
  const [analyticsAccepted, setAnalyticsAccepted] = useState(true);
  const [marketingAccepted, setMarketingAccepted] = useState(true);

  // Load saved preferences or show banner
  useEffect(() => {
    const savedSettings = localStorage.getItem('cookie-consent-settings');
    const legacyAccepted = localStorage.getItem('cookie-consent-accepted');

    if (savedSettings) {
      try {
        const parsed: CookiePreferences = JSON.parse(savedSettings);
        setAnalyticsAccepted(parsed.analytics ?? true);
        setMarketingAccepted(parsed.marketing ?? true);
      } catch (e) {
        // Fallback to default
        setAnalyticsAccepted(true);
        setMarketingAccepted(true);
      }
    } else if (legacyAccepted === 'true') {
      // Migrate legacy accepting all
      setAnalyticsAccepted(true);
      setMarketingAccepted(true);
    } else {
      // Delay appearance for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen to custom window event to reopen Cookie Settings
  useEffect(() => {
    const handleOpenSettings = () => {
      // Load current settings when reopening
      const savedSettings = localStorage.getItem('cookie-consent-settings');
      if (savedSettings) {
        try {
          const parsed: CookiePreferences = JSON.parse(savedSettings);
          setAnalyticsAccepted(parsed.analytics ?? true);
          setMarketingAccepted(parsed.marketing ?? true);
        } catch (e) {}
      }
      setIsSettingsOpen(true);
      setIsVisible(true);
    };

    window.addEventListener('open-cookie-settings', handleOpenSettings);
    return () => {
      window.removeEventListener('open-cookie-settings', handleOpenSettings);
    };
  }, []);

  const handleAcceptAll = () => {
    const settings: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true
    };
    localStorage.setItem('cookie-consent-settings', JSON.stringify(settings));
    localStorage.setItem('cookie-consent-accepted', 'true');
    setAnalyticsAccepted(true);
    setMarketingAccepted(true);
    setIsVisible(false);
    setIsSettingsOpen(false);
  };

  const handleSavePreferences = () => {
    const settings: CookiePreferences = {
      necessary: true,
      analytics: analyticsAccepted,
      marketing: marketingAccepted
    };
    localStorage.setItem('cookie-consent-settings', JSON.stringify(settings));
    localStorage.setItem('cookie-consent-accepted', 'true');
    setIsVisible(false);
    setIsSettingsOpen(false);
  };

  if (!isVisible && !isSettingsOpen && !isPolicyOpen) return null;

  return (
    <>
      {/* Banner */}
      {isVisible && (
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
                  {lang === 'th' ? 'นโยบายการใช้งานคุกกี้ (Cookie Policy)' : 'Cookie Usage Policy'}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {lang === 'th' ? (
                    <>
                      เราใช้คุกกี้เพื่อเพิ่มประสิทธิภาพและประสบการณ์ที่ดีในการใช้เว็บไซต์ 
                      ท่านสามารถศึกษารายละเอียดการใช้คุกกี้ และสามารถเลือกตั้งค่ายินยอม 
                      การใช้คุกกี้ได้โดยคลิก <button onClick={() => setIsSettingsOpen(true)} className="text-indigo-600 font-bold hover:underline">“การตั้งค่าคุกกี้”</button> 
                      หรือดู <button onClick={() => setIsPolicyOpen(true)} className="text-indigo-600 font-bold hover:underline">นโยบายการใช้คุกกี้</button> ของเรา
                    </>
                  ) : (
                    <>
                      We use cookies to improve your efficiency and provide a better experience on our website. 
                      You can study the details of cookie usage and choose your consent settings by clicking 
                      <button onClick={() => setIsSettingsOpen(true)} className="text-indigo-600 font-bold hover:underline mx-1">"Cookie Settings"</button> 
                      or view our <button onClick={() => setIsPolicyOpen(true)} className="text-indigo-600 font-bold hover:underline">Cookie Policy</button>.
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <Button 
                  variant="outline" 
                  size="md" 
                  onClick={() => setIsSettingsOpen(true)} 
                  className="w-full sm:w-auto rounded-xl border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                >
                  {lang === 'th' ? 'การตั้งค่าคุกกี้' : 'Cookie Settings'}
                </Button>
                <Button 
                  size="md" 
                  onClick={handleAcceptAll} 
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
      )}

      {/* Cookie Preferences Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title={lang === 'th' ? 'จัดการความเป็นส่วนตัวเรื่องคุกกี้' : 'Cookie Privacy Manager'}
        size="lg"
        footer={
          <div className="w-full flex flex-col sm:flex-row justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleSavePreferences}
              className="w-full sm:w-auto rounded-xl"
            >
              {lang === 'th' ? 'บันทึกการตั้งค่า' : 'Save Preferences'}
            </Button>
            <Button
              onClick={handleAcceptAll}
              className="w-full sm:w-auto rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {lang === 'th' ? 'ยอมรับทั้งหมด' : 'Accept All'}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            {lang === 'th' 
              ? 'เราเคารพในสิทธิความเป็นส่วนตัวของท่าน ท่านสามารถเลือกอนุญาตการใช้งานคุกกี้แต่ละประเภทได้ตามที่ระบุด้านล่างนี้'
              : 'We respect your privacy. You can choose which cookies to allow on our website. Please review the categories below.'}
          </p>

          {/* Category 1: Strictly Necessary */}
          <div className="p-5 bg-white border border-gray-150 rounded-2xl flex items-start gap-4 shadow-sm relative overflow-hidden">
            <div className="p-3 bg-gray-100 rounded-xl text-gray-500 flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-center mb-1">
                <h5 className="font-bold text-gray-900 text-base">
                  {lang === 'th' ? 'คุกกี้ที่จำเป็น (Strictly Necessary Cookies)' : 'Strictly Necessary Cookies'}
                </h5>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  {lang === 'th' ? 'เปิดใช้งานเสมอ' : 'Always Active'}
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {lang === 'th'
                  ? 'คุกกี้ที่จำเป็นสำหรับการทำงานของเว็บไซต์ เพื่อให้สามารถใช้งานได้อย่างปลอดภัย เช่น การยืนยันตัวตนเข้าระบบ การรักษาความปลอดภัย และการกรอกข้อมูลแบบฟอร์ม'
                  : 'These cookies are required to enable core site functionality such as secure user login, threat protection, and form completion. They cannot be disabled.'}
              </p>
            </div>
          </div>

          {/* Category 2: Analytics & Performance */}
          <div className="p-5 bg-white border border-gray-150 rounded-2xl flex items-start gap-4 shadow-sm relative overflow-hidden">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 flex-shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-center mb-1">
                <h5 className="font-bold text-gray-900 text-base">
                  {lang === 'th' ? 'คุกกี้เพื่อการวิเคราะห์และวัดผล (Analytics & Performance)' : 'Analytics & Performance Cookies'}
                </h5>
                
                {/* Custom Toggle Switch */}
                <button
                  onClick={() => setAnalyticsAccepted(prev => !prev)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none ${analyticsAccepted ? 'bg-indigo-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${analyticsAccepted ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {lang === 'th'
                  ? 'คุกกี้ประเภทนี้ช่วยให้เราทราบสถิติการใช้งานเว็บไซต์ของฝั่งผู้เข้าชม เช่น จำนวนผู้ใช้ หน้าที่ได้รับความนิยม เพื่อที่เราจะได้พัฒนารูปแบบการให้บริการที่เหมาะสมมากยิ่งขึ้น'
                  : 'These cookies help us collect aggregated and anonymous statistical data regarding traffic, visitor sources, and page popularity to continuously measure and improve our site performance.'}
              </p>
            </div>
          </div>

          {/* Category 3: Marketing & Advertising */}
          <div className="p-5 bg-white border border-gray-150 rounded-2xl flex items-start gap-4 shadow-sm relative overflow-hidden">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600 flex-shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-center mb-1">
                <h5 className="font-bold text-gray-900 text-base">
                  {lang === 'th' ? 'คุกกี้เพื่อการตลาด (Marketing & Advertising)' : 'Marketing & Advertising Cookies'}
                </h5>
                
                {/* Custom Toggle Switch */}
                <button
                  onClick={() => setMarketingAccepted(prev => !prev)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none ${marketingAccepted ? 'bg-indigo-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${marketingAccepted ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {lang === 'th'
                  ? 'คุกกี้เพื่อการบันทึกข้อมูลพฤติกรรมการใช้งาน และการสร้างโปรไฟล์ของผู้ใช้งาน เพื่อแสดงเนื้อหาและโฆษณาที่ตรงตามความต้องการและความสนใจของตัวผู้ใช้งานมากที่สุด'
                  : 'These cookies track browsing habits across websites to enable building a profile of interest and deliver customized, relevant promotional materials or advertisements.'}
              </p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Cookie Policy Modal */}
      <Modal
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
        title={lang === 'th' ? 'นโยบายการใช้งานคุกกี้ (Cookie Policy)' : 'Cookie Policy Details'}
        size="lg"
        footer={
          <Button
            variant="outline"
            onClick={() => setIsPolicyOpen(false)}
            className="rounded-xl"
          >
            {lang === 'th' ? 'ปิดหน้านี้' : 'Close'}
          </Button>
        }
      >
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          {lang === 'th' ? (
            <>
              <h4 className="font-bold text-gray-900 text-base">การใช้งานคุกกี้ของเรา</h4>
              <p>เว็บไซต์นี้ทำงานร่วมกับคุกกี้เพื่ออำนวยความสะดวกในการเข้าใช้ระบบของคุณ และมอบบริการที่ดีเยี่ยม รวมถึงสถิติการนำทางที่มีคุณภาพ คุกกี้ประกอบด้วยไฟล์ข้อความขนาดเล็กที่ถูกจัดเก็บในเครื่องคอมพิวเตอร์หรือโทรศัพท์เคลื่อนที่ของท่าน</p>
              
              <h5 className="font-bold text-gray-900 mt-3">คุกกี้แต่ละประเภททำงานอย่างไร?</h5>
              <ul className="list-disc pl-5 space-y-2 text-xs">
                <li><strong>คุกกี้ที่จำเป็น:</strong> ช่วยรองรับฟังก์ชันการทำงานพื้นฐาน เช่น คีย์เวิร์ด การเข้าระบบผู้สมัคร และข้อมูลความปลอดภัย</li>
                <li><strong>คุกกี้เพื่อการวิเคราะห์:</strong> ช่วยในการบันทึกจำนวนและการโต้ตอบของผู้สมัครในแต่ละหน้าเว็บ เพื่อนำข้อมูลมาวิเคราะห์ปรับปรุงประสิทธิภาพและอินเตอร์เฟซให้ลื่นไหลมากขึ้น</li>
                <li><strong>คุกกี้การตลาด:</strong> ช่วยให้สามารถติดตามการกระทำและวิเคราะห์ความสอดคล้องของการรับสมัครงาน รวมถึงการแนะนำตำแหน่งงานที่ตรงตามความสามารถของท่านในเครือ ดั๊บเบิ้ล เอ พันธมิตร</li>
              </ul>

              <h5 className="font-bold text-gray-900 mt-3">ระยะเวลาการจัดเก็บ</h5>
              <p className="text-xs">คุกกี้จะถูกเก็บรักษาไว้ตามความเหมาะสมของประเภทการจัดเก็บ (เช่น ล้างข้อมูลเมื่อสิ้นสุดการเข้าใช้งานเบราว์เซอร์สำหรับ Session คุกกี้ หรือเก็บรักษาสูงสุด 1 ปีสำหรับคุกกี้วิเคราะห์สถิติ)</p>

              <p className="text-xs mt-4">ท่านสามารถศึกษานโยบายความเป็นส่วนตัว (Privacy Policy) เพิ่มเติมได้โดยเข้าชมหน้า <a href="https://www.doubleapaper.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">นโยบายความเป็นส่วนตัวของบริษัท</a></p>
            </>
          ) : (
            <>
              <h4 className="font-bold text-gray-900 text-base">About Our Cookie Policy</h4>
              <p>Our website utilizes cookies to deliver custom user experiences, make our interfaces work seamlessly, and monitor performance analytics. Cookies are tiny text files saved directly on your desktop or mobile device when you browse our site.</p>
              
              <h5 className="font-bold text-gray-900 mt-3">Detailed Classifications</h5>
              <ul className="list-disc pl-5 space-y-2 text-xs">
                <li><strong>Strictly Necessary Cookies:</strong> Empower basic navigations, security validation, routing systems, and applicant inputs.</li>
                <li><strong>Analytics Cookies:</strong> Gather details concerning how applicants engage with various components of our website, enabling data-informed design adjustments.</li>
                <li><strong>Marketing Cookies:</strong> Trace application paths and recommend relevant openings across the Double A Alliance.</li>
              </ul>

              <h5 className="font-bold text-gray-900 mt-3">Retention Period</h5>
              <p className="text-xs">Cookies persist depending on classification (either cleared on browser closing for transient session cookies, or kept for up to 1 year for persistent performance analytics cookies).</p>

              <p className="text-xs mt-4">You can study details of our core personal data security systems by inspecting the <a href="https://www.doubleapaper.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">Company's Privacy Policy</a>.</p>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

