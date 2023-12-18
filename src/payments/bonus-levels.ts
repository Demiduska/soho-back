type BonusLevel = {
  min: number;
  max: number;
  bonus: number;
};

export const BonusLevels: BonusLevel[] = [
  { min: 50, max: 149, bonus: 0.3 },
  { min: 150, max: 349, bonus: 0.35 },
  { min: 350, max: 649, bonus: 0.4 },
  { min: 650, max: 1349, bonus: 0.45 },
  { min: 1350, max: 2749, bonus: 0.5 },
  { min: 2750, max: 3999, bonus: 0.55 },
  { min: 4000, max: 6999, bonus: 0.6 },
  { min: 7000, max: 9999, bonus: 0.65 },
  { min: 10000, max: 15000, bonus: 0.7 },
  { min: 15000, max: Infinity, bonus: 0.75 },
];
