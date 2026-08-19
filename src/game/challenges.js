export const CHALLENGES = [
  {
    id: 'el_haj_defeat',
    titleKey: 'challenge1Title',
    descKey: 'challenge1Desc',
    targetBot: 'El Haj',
    points: 50,
    prerequisiteId: null,
    requirement: (matchStats) => {
      // matchStats: { didIWin: boolean, myScore: number, oppScore: number }
      return matchStats && matchStats.didIWin === true;
    }
  },
  {
    id: 'el_haj_lead_10',
    titleKey: 'challenge2Title',
    descKey: 'challenge2Desc',
    targetBot: 'El Haj',
    points: 150,
    prerequisiteId: 'el_haj_defeat',
    requirement: (matchStats) => {
      if (!matchStats || !matchStats.didIWin) return false;
      const lead = matchStats.myScore - matchStats.oppScore;
      return lead >= 10;
    }
  }
];

export const getChallengeById = (id) => {
  return CHALLENGES.find(c => c.id === id) || null;
};
