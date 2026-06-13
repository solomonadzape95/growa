/**
 * Growa AI Types definitions
 */

export type Crop = 'Maize' | 'Cassava' | 'Yam';
export type Location = 'Ogbomoso' | 'Kaduna' | 'Enugu';

export type AppPage = 'landing' | 'pitch' | 'auth' | 'predict' | 'profile';

export interface PredictionInput {
  crop: Crop;
  location: Location;
  soilPh: number;
  rainfall: number; // in mm
}

export interface RawPredictionResult {
  yieldProbability: number;
  riskFactor: 'Low' | 'Moderate' | 'High';
  issue: string;
  estimatedYieldQuantity: string; // e.g. "2.4 Metric Tons/Hectare"
  optimalTempRange: string;
  soilNitrogen: 'Low' | 'Medium' | 'High';
  soilPotassium: 'Low' | 'Medium' | 'High';
  soilMoistureLevel: string;
}

export interface GeminiInsight {
  intro: string;
  explanationPidgin: string;
  explanationEnglish: string;
  actionableAdvice: string[];
  keyTakeaway: string;
}

export interface DemoStep {
  timeOffset: number; // seconds
  title: string;
  description: string;
  action: () => void;
}

export interface PitchSlide {
  id: number;
  title: string;
  category: string;
  description: string;
  bulletPoints: string[];
  stats?: { value: string; label: string }[];
  icon: string;
  colorTheme: 'green' | 'clay' | 'amber' | 'slate';
  imageUrl?: string;
}

export interface AgriculturalCooperative {
  name: string;
  region: string;
  registeredHectares: number;
  memberCount: number;
  lastFarmingCycle: string;
  avatarSeed: string;
  primaryCrop: Crop;
}
