import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateDisplayName } from '../utils/nameSanitizer';

export const UsernameModal = ({ isOpen, onSubmit, t }) => {
  const [inputName, setInputName] = useState('');
  const [err, setErr] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateDisplayName(inputName);
    if (!validation.valid) {
      if (validation.error === 'NAME_LENGTH_INVALID') {
        setErr(t('usernameLengthError') || 'Name must be between 3 and 20 characters');
      } else if (validation.error === 'NAME_INVALID_CHARACTERS') {
        setErr(t('invalidCharactersError') || 'Name contains invalid characters');
      } else if (validation.error === 'NAME_PROFANITY_DETECTED') {
        setErr(t('profanityError') || 'This name is not permitted');
      } else {
        setErr(t('invalidNameError') || 'Invalid name');
      }
      return;
    }
    onSubmit(validation.sanitized);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
      >
        <motion.div
          initial={{ scale: 0.85, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-slate-900 border-2 border-amber-400/40 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl text-center relative overflow-hidden"
        >
          <div className="w-14 h-14 bg-amber-500/20 border border-amber-400/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
            👤
          </div>
          <h2 className="text-2xl font-black text-amber-300 mb-2">
            {t('setPlayerName') || 'Choose Your Player Name'}
          </h2>
          <p className="text-xs text-slate-300 mb-6 font-medium">
            {t('playerNameNotice') || 'This permanent name will be used on the global Single Player leaderboard.'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <input
                type="text"
                value={inputName}
                maxLength={20}
                onChange={(e) => { setInputName(e.target.value); setErr(''); }}
                placeholder={t('enterNickname') || 'Player Nickname'}
                className="w-full bg-black/50 border border-amber-500/30 rounded-xl px-4 py-3 text-center text-white font-bold text-lg focus:outline-none focus:border-amber-400 transition-colors"
                autoFocus
              />
              {err && <p className="text-red-400 text-xs mt-1.5 font-semibold">{err}</p>}
            </div>

            <button
              type="submit"
              disabled={!inputName.trim()}
              className="w-full btn-moroccan-gold py-3.5 rounded-xl font-bold text-base cursor-pointer disabled:opacity-50 transition-transform active:scale-95"
            >
              {t('confirmName') || 'Save & Continue'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
