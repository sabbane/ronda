
import { useLanguage } from '../contexts/LanguageContext';

export const Rules = ({ onBack }) => {
  const { language, changeLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center text-white relative overflow-hidden overflow-y-auto">
      {/* Background Image with Moroccan Vibe */}
      <div
        className="fixed inset-0 z-0 scale-105 pointer-events-none"
        style={{
          backgroundImage: "url('/assets/moroccan_background.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.4) saturate(1.1)'
        }}
      />

      <div className="w-full max-w-2xl p-4 z-30 pt-12 pb-8 relative flex flex-col min-h-screen">
        
        {/* Header section: Back button and Language Switcher */}
        <div className="flex justify-between items-center mb-8 relative">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md text-slate-200 rounded-full border border-white/10 transition-all active:scale-95 shadow-lg group"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="18" height="18" 
              viewBox="0 0 24 24" 
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className="group-hover:-translate-x-1 transition-transform rtl:group-hover:translate-x-1"
            >
              <path d="m15 18-6-6 6-6"/>
            </svg>
            <span className="text-sm font-bold uppercase tracking-wider hidden sm:inline">{t('backToMenu')}</span>
          </button>

          {/* Language Selector */}
          <div className="flex gap-2" dir="ltr">
            <button
              onClick={() => changeLanguage('en')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${language === 'en' ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)]' : 'bg-white/10 text-slate-300 hover:bg-white/20'} backdrop-blur-md transition-all border border-white/10`}
            >
              <img src="https://flagcdn.com/w40/gb.png" alt="EN" className="w-4 h-3 object-cover rounded-sm" /> EN
            </button>
            <button
              onClick={() => changeLanguage('de')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${language === 'de' ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)]' : 'bg-white/10 text-slate-300 hover:bg-white/20'} backdrop-blur-md transition-all border border-white/10`}
            >
              <img src="https://flagcdn.com/w40/de.png" alt="DE" className="w-4 h-3 object-cover rounded-sm" /> DE
            </button>
            <button
              onClick={() => changeLanguage('fr')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${language === 'fr' ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)]' : 'bg-white/10 text-slate-300 hover:bg-white/20'} backdrop-blur-md transition-all border border-white/10`}
            >
              <img src="https://flagcdn.com/w40/fr.png" alt="FR" className="w-4 h-3 object-cover rounded-sm" /> FR
            </button>
            <button
              onClick={() => changeLanguage('ar')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${language === 'ar' ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)]' : 'bg-white/10 text-slate-300 hover:bg-white/20'} backdrop-blur-md transition-all border border-white/10`}
            >
              <img src="https://flagcdn.com/w40/ma.png" alt="AR" className="w-4 h-3 object-cover rounded-sm" /> AR
            </button>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl p-6 sm:p-10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 text-left w-full flex-1 mb-8">
          <h1 className="text-4xl sm:text-5xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-500 tracking-tighter drop-shadow-lg text-center">
            {t('rulesTitle')}
          </h1>

          <div className="space-y-6 text-slate-200 text-base sm:text-lg leading-relaxed font-medium" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <p className="p-4 bg-white/5 rounded-xl border border-white/10">
              {t('rulesIntro')}
            </p>
            
            <p className="p-4 bg-white/5 rounded-xl border border-white/10">
              {t('rulesGameplay')}
            </p>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="mb-4">{t('rulesPoints')}</p>
              <ul className="space-y-3 pl-4 sm:pl-6 rtl:pr-4 rtl:pl-0 rtl:sm:pr-6 text-amber-100/90">
                <li>{t('rulesMissa')}</li>
                <li>{t('rulesDerba')}</li>
                <li>{t('rulesRonda')}</li>
                <li>{t('rulesTringa')}</li>
              </ul>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="mb-4 text-xl font-bold text-orange-300">{t('rulesSpecialMovesTitle')}</p>
              <ul className="space-y-3 pl-4 sm:pl-6 rtl:pr-4 rtl:pl-0 rtl:sm:pr-6 text-amber-100/90">
                <li>{t('rulesClash')}</li>
                <li>{t('rulesTringaVsRonda')}</li>
                <li>{t('rulesTringaVsTringa')}</li>
                <li>{t('rulesCounterAttack')}</li>
                <li>{t('rulesUltimateAttack')}</li>
                <li>{t('rulesFinalFail')}</li>
                <li>{t('rulesKingFinish')}</li>
                <li>{t('rulesAsFinish')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
