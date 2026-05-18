export const FOREST_KEYWORDS = {
  Tree: ['tree', 'पेड़', 'ped', 'vriksh', 'wood', 'tree fall'],
  Fire: ['fire', 'आग', 'aag', 'blaze', 'flames', 'burning', 'forest fire', 'wildfire', 'दावानल'],
  Hunting: ['hunting', 'शिकार', 'shikaar', 'animal hunting', 'illegal hunting', 'wildlife killing', 'trophy hunting'],
  Poaching: ['poaching', 'शिकार', 'shikaar', 'illegal hunting', 'wildlife trade', 'smuggling', 'ivory trade', 'rhino horn', 'animal skin', 'endangered hunting'],
  Logging: ['illegal logging', 'अवैध कटाई', 'jungle katayi', 'jungle cutting', 'deforestation', 'timber smuggling', 'wood smuggling', 'forest destruction', 'tree cutting'],
  Wind: ['wind', 'हवा', 'pawan', 'storm', 'gale', 'breeze', 'झोंका', 'झंझा', 'airflow', 'gust']
};

export const OCEAN_KEYWORDS = {
  flood: ['flood', 'बाढ़', 'pani bhar', 'waterlogging', 'inundation'],
  waves: ['high waves', 'wave', 'लहर', 'lahar'],
  tide: ['tide', 'ज्वार', 'jwar', 'spring tide', 'neap'],
  swell: ['swell', 'surge', 'सर्ज', 'उभार'],
  damage: ['damage', 'टूटा', 'break', 'erosion', 'breach', 'collapse'],
  tsunami: ['tsunami', 'sunami', 'suname', 'सुनामी']
};

export const SENTIMENT_NEG = ['danger', 'help', '救命', 'risk', 'alert', 'warning', 'red', 'evacuate', 'गंभीर', 'खतरा', 'panic', 'sos', 'SOS'];
export const SENTIMENT_POS = ['safe', 'contained', 'clear', 'stabilized', 'normal', 'clear sky'];

/**
 * Classifies a text post into a specific hazard category based on keyword matches
 */
export function classifyText(text: string, mode: 'forest' | 'ocean'): string {
  if (!text) return mode === 'forest' ? 'Other' : 'waves';
  const t = text.toLowerCase();
  const keywords = mode === 'forest' ? FOREST_KEYWORDS : OCEAN_KEYWORDS;
  
  for (const [category, arr] of Object.entries(keywords)) {
    if (arr.some(word => {
      try {
        if (/\s/.test(word)) return t.includes(word);
        return new RegExp('\\b' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(t);
      } catch (e) {
        return t.includes(word);
      }
    })) {
      return category;
    }
  }
  return mode === 'forest' ? 'Other' : 'waves';
}

/**
 * Calculates a rule-based sentiment score from -1.0 to 1.0
 */
export function scoreSentiment(text: string): number {
  if (!text) return 0;
  const s = text.toLowerCase();
  let score = 0;
  SENTIMENT_POS.forEach(w => { if (s.includes(w)) score += 1; });
  SENTIMENT_NEG.forEach(w => { if (s.includes(w)) score -= 1; });
  return Math.max(-1, Math.min(1, score / 3));
}
