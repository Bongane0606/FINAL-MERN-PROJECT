const calculateSafetyScore = (incidents) => {
  let score = 100;
  
  incidents.forEach(incident => {
    switch(incident.type) {
      case 'hard_braking':
        score -= incident.severity === 'high' ? 15 : incident.severity === 'medium' ? 10 : 5;
        break;
      case 'speeding':
        score -= incident.severity === 'high' ? 20 : incident.severity === 'medium' ? 15 : 10;
        break;
      case 'phone_usage':
        score -= 25; // Always severe
        break;
      case 'sharp_turn':
        score -= incident.severity === 'high' ? 10 : incident.severity === 'medium' ? 7 : 3;
        break;
    }
  });

  return Math.max(0, Math.round(score));
};

const calculatePoints = (distance, score, tier) => {
  let basePoints = distance * 10;
  let multiplier = 1;
  
  // Tier bonuses
  if (tier === 'Silver') multiplier = 1.1;
  if (tier === 'Gold') multiplier = 1.25;
  if (tier === 'Platinum') multiplier = 1.5;
  
  return Math.round(basePoints * (score / 100) * multiplier);
};

module.exports = { calculateSafetyScore, calculatePoints };