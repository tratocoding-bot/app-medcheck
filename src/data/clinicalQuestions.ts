// Theme metadata for display
export const themeInfo: Record<string, { label: string; icon: string; color: string }> = {
  cardiologia: { label: "Cardiologia", icon: "🫀", color: "text-red-500" },
  pneumologia: { label: "Pneumologia", icon: "🫁", color: "text-blue-500" },
  cirurgia: { label: "Cirurgia Geral", icon: "🔪", color: "text-orange-500" },
  ginecologia: { label: "Ginecologia e Obstetrícia", icon: "🤰", color: "text-pink-500" },
  pediatria: { label: "Pediatria", icon: "👶", color: "text-cyan-500" },
  saude_coletiva: { label: "Saúde Coletiva", icon: "🏥", color: "text-green-500" },
  saude_mental: { label: "Saúde Mental", icon: "🧠", color: "text-purple-500" },
  urgencia: { label: "Urgência e Emergência", icon: "🚨", color: "text-red-600" },
  etica: { label: "Ética Médica", icon: "⚖️", color: "text-amber-600" },
  infectologia: { label: "Infectologia", icon: "🦠", color: "text-lime-600" },
  nefrologia: { label: "Nefrologia", icon: "🫘", color: "text-violet-500" },
  endocrinologia: { label: "Endocrinologia", icon: "💉", color: "text-teal-500" },
  reumatologia: { label: "Reumatologia", icon: "🦴", color: "text-amber-500" },
  gastroenterologia: { label: "Gastroenterologia", icon: "🔬", color: "text-yellow-600" },
  clinica_medica: { label: "Clínica Médica", icon: "🩺", color: "text-blue-600" },
  medicina_familia: { label: "Med. Família e Comunidade", icon: "🏠", color: "text-emerald-500" },
};

export const clinicalLevels = [
  { key: "interno", label: "Interno", minXP: 0, maxXP: 199, emoji: "🩺" },
  { key: "r1", label: "R1", minXP: 200, maxXP: 499, emoji: "📋" },
  { key: "r2", label: "R2", minXP: 500, maxXP: 999, emoji: "🏥" },
  { key: "especialista", label: "Especialista", minXP: 1000, maxXP: Infinity, emoji: "⭐" },
];

export const enamedScoreLevels = [
  { label: "Iniciante", min: 0, max: 200 },
  { label: "Básico", min: 200, max: 400 },
  { label: "Intermediário", min: 400, max: 600 },
  { label: "Avançado", min: 600, max: 800 },
  { label: "Pronto para prova", min: 800, max: 1000 },
];

export function getLevelForXP(xp: number) {
  return clinicalLevels.find(l => xp >= l.minXP && xp <= l.maxXP) ?? clinicalLevels[0];
}

export function getScoreLevel(score: number) {
  return enamedScoreLevels.find(l => score >= l.min && score < l.max) ?? enamedScoreLevels[0];
}

export function calculateEnamedScore(accuracy: number, streak: number, checklistProgress: number): number {
  // accuracy: 0-1, streak: days, checklistProgress: 0-1
  const accuracyScore = accuracy * 500; // 50% weight
  const consistencyScore = Math.min(streak, 30) / 30 * 250; // 25% weight  
  const progressScore = checklistProgress * 250; // 25% weight
  return Math.round(Math.min(1000, accuracyScore + consistencyScore + progressScore));
}
