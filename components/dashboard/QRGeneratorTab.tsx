import React from 'react';
import { Card, Button, Select, Input } from '../UIComponents';
import { Settings, QrCode, Copy, ExternalLink, FileText, Check } from 'lucide-react';

interface QRGeneratorTabProps {
  qrParams: {
    bu: string;
    ch: string;
    tag: string;
  };
  setQrParams: React.Dispatch<React.SetStateAction<{
    bu: string;
    ch: string;
    tag: string;
  }>>;
  businessUnits: any[];
  channels: any[];
  generateLink: () => void;
  generatedLink: string;
  isCopied: boolean;
  handleCopy: () => void;
  qrLogs: any[];
  filteredQrLogs: any[];
  qrLogCreatorFilter: string;
  setQrLogCreatorFilter: React.Dispatch<React.SetStateAction<string>>;
  qrLogCreators: string[];
  fetchQrLogs: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

export const QRGeneratorTab: React.FC<QRGeneratorTabProps> = ({
  qrParams, setQrParams, businessUnits, channels, generateLink,
  generatedLink, isCopied, handleCopy, qrLogs, filteredQrLogs,
  qrLogCreatorFilter, setQrLogCreatorFilter, qrLogCreators, fetchQrLogs,
  showToast
}) => {
  return (
    <>
            <div className="form-step-enter">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">QR Code & Link Generator</h2>
              <p className="text-gray-500 text-sm sm:text-base mb-4 sm:mb-6">สร้าง QR Code และ Link สำหรับติดตามช่องทางการรับสมัคร</p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuration Panel */}
                <Card className="space-y-6">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-indigo-500" /> Configuration
                  </h3>
                  <div className="space-y-5">
                    <Select
                      label="Business Unit"
                      options={businessUnits.map(b => ({ label: b.name, value: b.name }))}
                      value={qrParams.bu}
                      onChange={(e) => setQrParams(p => ({ ...p, bu: e.target.value }))}
                    />
                    <Select
                      label="Channel (ช่องทางรับสมัคร)"
                      options={channels.filter(c => c.is_active !== false).map(c => ({
                        label: c.name_th || c.name || c.name_en,
                        value: c.name_th || c.name || c.name_en
                      }))}
                      value={qrParams.ch}
                      onChange={(e) => setQrParams(p => ({ ...p, ch: e.target.value }))}
                    />
                    <Input
                      label="Campaign Tag (Optional)"
                      value={qrParams.tag}
                      onChange={(e) => setQrParams(p => ({ ...p, tag: e.target.value }))}
                      placeholder="e.g. SummerIntern2024, JobFair2025"
                    />
                  </div>
                  <Button onClick={generateLink} className="w-full" size="lg">
                    <QrCode className="w-5 h-5 mr-2" /> Generate QR Code
                  </Button>
                </Card>

                {/* QR Display Panel */}
                <Card className={`flex flex-col items-center justify-center min-h-[350px] transition-all ${generatedLink
                  ? 'bg-gradient-to-br from-indigo-50 to-white border-indigo-200'
                  : 'bg-gray-50 border-dashed border-2 border-gray-200'
                  }`}>
                  {generatedLink ? (
                    <div className="text-center space-y-4 p-4 w-full">
                      <div className="bg-white p-4 rounded-xl shadow-lg inline-block">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(generatedLink)}`}
                          alt="QR Code"
                          className="mx-auto"
                        />
                      </div>

                      {/* Link Preview */}
                      <div className="bg-white border border-gray-200 rounded-lg p-3 text-left">
                        <p className="text-xs text-gray-400 mb-1 font-medium">Generated Link:</p>
                        <p className="text-sm text-indigo-600 break-all font-mono bg-indigo-50 p-2 rounded">
                          {generatedLink}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 justify-center">
                        <Button
                          variant={isCopied ? 'primary' : 'outline'}
                          size="sm"
                          onClick={handleCopy}
                          className={isCopied ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                        >
                          {isCopied ? <><Check className="w-4 h-4 mr-1" /> Copied!</> : <><Copy className="w-4 h-4 mr-1" /> Copy Link</>}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(generatedLink, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" /> Open Link
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <QrCode className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="font-medium">No QR Code Generated</p>
                      <p className="text-sm">Configure options and click Generate</p>
                    </div>
                  )}
                </Card>
              </div>

              {/* Recent Transactions Log */}
              <Card className="mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <h3 className="font-bold text-base sm:text-lg text-gray-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-500 flex-shrink-0" /> Recent Transactions
                    <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {filteredQrLogs.length}{qrLogCreatorFilter !== 'all' ? ` / ${qrLogs.length}` : ''} records
                    </span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <select
                      className="border rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none flex-1 sm:flex-none sm:max-w-[220px] truncate"
                      value={qrLogCreatorFilter}
                      onChange={(e) => setQrLogCreatorFilter(e.target.value)}
                    >
                      <option value="all">ทั้งหมด (All)</option>
                      {qrLogCreators.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <Button size="sm" variant="outline" onClick={fetchQrLogs}>Refresh</Button>
                  </div>
                </div>
                {filteredQrLogs.length === 0 ? (
                  <p className="text-gray-500 text-sm p-4 bg-gray-50 rounded-lg text-center">
                    {qrLogs.length === 0 ? 'ยังไม่มีประวัติการสร้าง QR Code' : 'ไม่พบรายการที่ตรงกับตัวกรอง'}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredQrLogs.map((log: any) => {
                      const urlObj = (() => { try { return new URL(log.generated_url); } catch { return null; } })();
                      const params = urlObj ? Object.fromEntries(urlObj.searchParams.entries()) : {};
                      return (
                        <div key={log.id} className="border border-gray-200 rounded-xl p-3 sm:p-4 hover:border-indigo-300 hover:shadow-sm transition-all bg-white">
                          <div className="flex items-start gap-3 sm:gap-4">
                            {/* QR Thumbnail */}
                            <div
                              onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(log.generated_url)}`, '_blank')}
                              title="คลิกเพื่อเปิด QR ขนาดเต็ม"
                              className="group flex-shrink-0 w-11 h-11 sm:w-14 sm:h-14 bg-white border-2 border-gray-100 rounded-xl cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all overflow-hidden flex items-center justify-center"
                            >
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(log.generated_url)}`}
                                alt="QR"
                                className="w-8 h-8 sm:w-11 sm:h-11 object-contain transition-transform group-hover:scale-110"
                              />
                            </div>

                            {/* Main Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1.5">
                                <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-[11px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                                  {log.business_unit || '-'}
                                </span>
                                <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                                  {log.channel || '-'}
                                </span>
                                {log.campaign_tag && (
                                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                                    🏷️ {log.campaign_tag}
                                  </span>
                                )}
                              </div>

                              {/* Compact meta row */}
                              <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-gray-500">
                                <span>{new Date(log.created_at).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                                <span className="text-gray-300">|</span>
                                <span title={log.created_by} className="truncate">{log.created_by || '-'}</span>
                              </div>
                            </div>

                            {/* Copy URL Button */}
                            <button
                              onClick={async () => {
                                await navigator.clipboard.writeText(log.generated_url);
                                showToast('คัดลอก URL แล้ว!', 'success');
                              }}
                              title={log.generated_url}
                              className="flex-shrink-0 inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Copy URL</span>
                              <span className="sm:hidden">Copy</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          
    </>
  );
};
