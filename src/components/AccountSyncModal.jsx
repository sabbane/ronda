import { useState } from 'react';
import { challengeService } from '../services/challengeService';

export const AccountSyncModal = ({ isOpen, onClose, t, playClick, onSyncSuccess }) => {
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' | 'claim'
  const [code, setCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    playClick?.();
    setIsLoading(true);
    setMessage(null);
    const res = await challengeService.generateTransferCode();
    setIsLoading(false);
    if (res?.ok && res.code) {
      setCode(res.code);
    } else {
      setMessage({ type: 'error', text: t('codeGenerateError') || 'Failed to generate code' });
    }
  };

  const handleClaim = async (e) => {
    e.preventDefault();
    playClick?.();
    const cleanCode = inputCode.trim().toUpperCase();
    if (!cleanCode) return;
    setIsLoading(true);
    setMessage(null);
    const res = await challengeService.claimTransferCode(cleanCode);
    setIsLoading(false);
    if (res?.ok) {
      setMessage({ type: 'success', text: t('transferSuccess') || 'Account successfully linked!' });
      setTimeout(() => {
        onSyncSuccess?.();
        onClose();
      }, 1500);
    } else {
      setMessage({ type: 'error', text: t('invalidCode') || 'Invalid or expired code.' });
    }
  };

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-md p-6 rounded-3xl border-2 border-amber-400/40 shadow-2xl text-center flex flex-col gap-5 text-white"
        style={{ backgroundColor: 'rgba(30, 58, 138, 0.95)' }}
      >
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h2 className="text-xl font-black text-amber-300 tracking-wide flex items-center gap-2">
            <span>🔄</span> {t('syncAccount') || 'Sync Account'}
          </h2>
          <button
            onClick={() => { playClick?.(); onClose(); }}
            className="text-slate-400 hover:text-white text-lg font-bold px-2 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => { playClick?.(); setActiveTab('generate'); setMessage(null); }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'generate'
                ? 'bg-amber-600 border border-amber-400 text-white shadow-inner'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('generateCodeTab') || 'Share Code'}
          </button>
          <button
            onClick={() => { playClick?.(); setActiveTab('claim'); setMessage(null); }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'claim'
                ? 'bg-amber-600 border border-amber-400 text-white shadow-inner'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('enterCodeTab') || 'Enter Code'}
          </button>
        </div>

        {message && (
          <div className={`p-3 rounded-xl text-xs font-bold ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'}`}>
            {message.text}
          </div>
        )}

        {/* Tab 1: Generate */}
        {activeTab === 'generate' && (
          <div className="flex flex-col gap-4 text-left text-xs text-slate-300">
            <p>{t('generateCodeDesc') || 'Generate a 6-digit sync code to transfer your score and progress to another device or browser.'}</p>
            {code ? (
              <div className="flex flex-col items-center gap-3 bg-black/50 p-4 rounded-2xl border border-amber-400/30">
                <span className="text-2xl font-mono font-black text-amber-300 tracking-widest">{code}</span>
                <button
                  onClick={handleCopy}
                  className="px-4 py-1.5 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-bold hover:bg-amber-500/30 cursor-pointer"
                >
                  {copied ? (t('copied') || 'Copied!') : (t('copyCode') || 'Copy Code')}
                </button>
                <span className="text-[10px] text-slate-400">{t('codeValidNotice') || 'Valid for 15 minutes.'}</span>
              </div>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full btn-moroccan-gold py-3 rounded-xl font-bold text-slate-900 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (t('loading') || 'Loading...') : (t('generateTransferCode') || 'Generate Code')}
              </button>
            )}
          </div>
        )}

        {/* Tab 2: Claim */}
        {activeTab === 'claim' && (
          <form onSubmit={handleClaim} className="flex flex-col gap-4 text-left text-xs text-slate-300">
            <p>{t('enterCodeDesc') || 'Enter the sync code generated on your other device to restore your account.'}</p>
            <input
              type="text"
              placeholder="RND-XXXXXX"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              className="w-full p-3 rounded-xl bg-black/50 border border-amber-400/30 text-center font-mono font-bold text-base text-amber-300 focus:outline-none focus:border-amber-400 uppercase"
              maxLength={10}
            />
            <button
              type="submit"
              disabled={isLoading || !inputCode.trim()}
              className="w-full btn-moroccan-gold py-3 rounded-xl font-bold text-slate-900 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (t('loading') || 'Loading...') : (t('restoreAccount') || 'Restore Account')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
