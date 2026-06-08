export const getNextValue = (val) => {
  if (val < 10) return val + 1;
  return null;
};

export const generateDeck = () => {
  const suits = ['dheb', 'jben', 'syouf', 'zrawet'];
  const displayMap = { 8: 10, 9: 11, 10: 12 };
  return suits.flatMap(suit => 
    Array.from({ length: 10 }, (_, i) => {
      const value = i + 1;
      return {
        suit,
        value,
        displayValue: displayMap[value] || value,
        id: `${suit}-${value}`
      };
    })
  );
};

export const shuffle = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};
