/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sprout, 
  Play, 
  RotateCcw, 
  MapPin, 
  Droplet, 
  Activity, 
  Brain, 
  Sparkles, 
  Compass, 
  ArrowRight, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Thermometer, 
  Info, 
  Flame, 
  Briefcase,
  Users,
  Lock,
  Unlock,
  BookOpen,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Coins,
  Cpu,
  UserCheck,
  Check,
  Building,
  Home,
  Award
} from 'lucide-react';
import { calculatePrediction } from './utils/predictEngine';
import { Crop, Location, PredictionInput, RawPredictionResult, GeminiInsight, AppPage } from './types';
import { PITCH_SLIDES } from './data/pitchSlides';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

interface CooperativeData {
  id: string;
  name: string;
  region: string;
  state: string;
  memberCount: number;
  totalHectares: number;
  primaryCrop: Crop;
  description: string;
  hectaresByType: { name: string; value: number; color: string; percent: string }[];
  history: { season: string; yieldVal: number }[];
  cycle: string;
  soilCluster: string;
}

const COOPERATIVES: CooperativeData[] = [
  {
    id: 'NGA-OGB-7362',
    name: 'Ogbomoso Corn Guild Union',
    region: 'South West Savannah',
    state: 'Oyo State',
    memberCount: 240,
    totalHectares: 480,
    primaryCrop: 'Maize',
    description: 'Aggressive focus on premium Maize and drought-resistant tubers. Linked with Growa IoT Soil Cluster #3 located in the Ogbomoso Savannah vegetation zone.',
    cycle: 'Early Maize / Cassava rotation',
    soilCluster: 'Soil Cluster #3',
    hectaresByType: [
      { name: 'Maize Fields (Oba Strains)', value: 210, color: 'bg-brand-600', percent: '45%' },
      { name: 'Cassava Fields (TME Resistant)', value: 190, color: 'bg-clay-500', percent: '40%' },
      { name: 'Yam Mound Fallows', value: 80, color: 'bg-amber-500', percent: '15%' }
    ],
    history: [
      { season: '2021 Season', yieldVal: 2.1 },
      { season: '2022 Season', yieldVal: 2.8 },
      { season: '2023 Season', yieldVal: 1.9 },
      { season: '2024 Season', yieldVal: 3.4 },
      { season: '2025 Season', yieldVal: 4.1 },
      { season: '2026 Estimate', yieldVal: 4.5 }
    ]
  },
  {
    id: 'NGA-KAD-5819',
    name: 'Kaduna Arid Grain Collective',
    region: 'North Arid Belt',
    state: 'Kaduna State',
    memberCount: 310,
    totalHectares: 620,
    primaryCrop: 'Maize',
    description: 'Focused on high-heat and drought-hardy cereal varieties. Integrates with solar-powered deep probes near active meteorology hub #9 for real-time arid heat modeling.',
    cycle: 'Sorghum / Maize seasonal dry rotation',
    soilCluster: 'Arid Hub #9',
    hectaresByType: [
      { name: 'Dry-Hardy Maize', value: 380, color: 'bg-amber-600', percent: '61%' },
      { name: 'Sorghum & Millet', value: 160, color: 'bg-brand-600', percent: '26%' },
      { name: 'Fallow / Grazing Cover', value: 80, color: 'bg-warmgray-450', percent: '13%' }
    ],
    history: [
      { season: '2021 Season', yieldVal: 1.8 },
      { season: '2022 Season', yieldVal: 2.2 },
      { season: '2023 Season', yieldVal: 2.5 },
      { season: '2024 Season', yieldVal: 2.1 },
      { season: '2025 Season', yieldVal: 3.2 },
      { season: '2026 Estimate', yieldVal: 3.8 }
    ]
  },
  {
    id: 'NGA-ENU-1044',
    name: 'Enugu Rainforest Tuber Alliance',
    region: 'South East Rainforest',
    state: 'Enugu State',
    memberCount: 180,
    totalHectares: 350,
    primaryCrop: 'Yam',
    description: 'Specializes in high-hydration nutrient dense root crops. Directly hooked into soil saturation networks tracking tropical aluminum lock risks and acid indices.',
    cycle: 'Yam Mound / Cassava rotation',
    soilCluster: 'Rainforest Sub-node #12',
    hectaresByType: [
      { name: 'Yam Mounds (Noble Strains)', value: 180, color: 'bg-brand-650', percent: '51%' },
      { name: 'High-Yield Cassava', value: 120, color: 'bg-clay-500', percent: '34%' },
      { name: 'Fallow Forest Glades', value: 50, color: 'bg-emerald-500', percent: '15%' }
    ],
    history: [
      { season: '2021 Season', yieldVal: 8.5 },
      { season: '2022 Season', yieldVal: 9.2 },
      { season: '2023 Season', yieldVal: 7.9 },
      { season: '2024 Season', yieldVal: 10.4 },
      { season: '2025 Season', yieldVal: 12.1 },
      { season: '2026 Estimate', yieldVal: 13.5 }
    ]
  }
];

export default function App() {
  // Navigation & Page State
  const [currentPage, setCurrentPage] = useState<AppPage>('landing');
  
  // Slide Deck Selection
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  // Input states (Prediction Engine)
  const [crop, setCrop] = useState<Crop>('Maize');
  const [location, setLocation] = useState<Location>('Ogbomoso');
  const [soilPh, setSoilPh] = useState<number>(6.2);
  const [rainfall, setRainfall] = useState<number>(850);

  // Authentication State
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);

  // Active Cooperative State on Profile View
  const [activeCoopId, setActiveCoopId] = useState<string>('NGA-OGB-7362');
  const activeCoop = COOPERATIVES.find(c => c.id === activeCoopId) || COOPERATIVES[0];

  // Interface prediction progress states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisPhase, setAnalysisPhase] = useState<'idle' | 'processing' | 'done'>('idle');
  const [analysisStepLabel, setAnalysisStepLabel] = useState<string>('');
  
  // Advisor & Model results
  const [rawResult, setRawResult] = useState<RawPredictionResult | null>(null);
  const [geminiAdvice, setGeminiAdvice] = useState<GeminiInsight | null>(null);
  const [displayedAdvice, setDisplayedAdvice] = useState<string>('');
  const [adviceLang, setAdviceLang] = useState<'pidgin' | 'english'>('pidgin');

  // Extended Interactive Demo control state
  const [demoActive, setDemoActive] = useState<boolean>(false);
  const [demoProgressPercent, setDemoProgressPercent] = useState<number>(0);
  const [demoStep, setDemoStep] = useState<number>(0);
  const [demoBannerText, setDemoBannerText] = useState<string>('');

  // Refs for scrubbing active presentation
  const demoTimeouts = useRef<number[]>([]);
  const streamIntervalRef = useRef<number | null>(null);

  // Auto-slide dynamic interval when slideshow is visible but demo is inactive
  useEffect(() => {
    if (currentPage === 'pitch' && !demoActive) {
      const slideInterval = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % PITCH_SLIDES.length);
      }, 9000);
      return () => clearInterval(slideInterval);
    }
  }, [currentPage, demoActive]);

  // Handle single dynamic analysis computation
  const runPrediction = (
    overrideConfig?: { crop: Crop; location: Location; soilPh: number; rainfall: number },
    onCalculationComplete?: (res: { raw: RawPredictionResult; advisor: GeminiInsight }) => void
  ) => {
    setIsAnalyzing(true);
    setAnalysisPhase('processing');
    setRawResult(null);
    setGeminiAdvice(null);
    setDisplayedAdvice('');

    const steps = [
      'Establishing connection to Ogbomoso IoT soil matrix node...',
      'Retrieving seasonal precipitation grids of the Nigerian Meteorological Agency (NIMET)...',
      'Deploying support vector machines for crop yield calculations...',
      'Injecting metrics to Gemini to generate conversational Pidgin voice bulletins...'
    ];

    steps.forEach((lbl, idx) => {
      const timeoutId = window.setTimeout(() => {
        setAnalysisStepLabel(lbl);
      }, idx * 600);
      if (demoActive) {
        demoTimeouts.current.push(timeoutId);
      }
    });

    const finalTimeoutId = window.setTimeout(() => {
      const paramsToUse = overrideConfig || { crop, location, soilPh, rainfall };
      const out = calculatePrediction(paramsToUse);
      
      setRawResult(out.raw);
      setGeminiAdvice(out.advisor);
      setAnalysisPhase('done');
      setIsAnalyzing(false);

      if (onCalculationComplete) {
        onCalculationComplete(out);
      }
    }, steps.length * 600 + 100);

    if (demoActive) {
      demoTimeouts.current.push(finalTimeoutId);
    }
  };

  // Translate advisor string typing streaming response
  useEffect(() => {
    if (analysisPhase === 'done' && geminiAdvice) {
      if (streamIntervalRef.current) {
        window.clearInterval(streamIntervalRef.current);
      }

      const fullText = adviceLang === 'pidgin' 
        ? geminiAdvice.explanationPidgin 
        : geminiAdvice.explanationEnglish;
      
      let currentIndex = 0;
      setDisplayedAdvice('');

      streamIntervalRef.current = window.setInterval(() => {
        if (currentIndex < fullText.length) {
          const nextChunk = fullText.slice(0, currentIndex + 2);
          setDisplayedAdvice(nextChunk);
          currentIndex += 2;
        } else {
          setDisplayedAdvice(fullText);
          if (streamIntervalRef.current) {
            window.clearInterval(streamIntervalRef.current);
          }
        }
      }, 10);
    }

    return () => {
      if (streamIntervalRef.current) {
        window.clearInterval(streamIntervalRef.current);
      }
    };
  }, [analysisPhase, geminiAdvice, adviceLang]);

  // Clean timeouts on reset
  const clearAllDemoTimers = () => {
    demoTimeouts.current.forEach((tId) => window.clearTimeout(tId));
    demoTimeouts.current = [];
    if (streamIntervalRef.current) {
      window.clearInterval(streamIntervalRef.current);
    }
  };

  // Reset demo
  const resetDashboard = () => {
    clearAllDemoTimers();
    setDemoActive(false);
    setDemoStep(0);
    setDemoProgressPercent(0);
    setIsAnalyzing(false);
    setAnalysisPhase('idle');
    setRawResult(null);
    setGeminiAdvice(null);
    setDisplayedAdvice('');
    setCrop('Maize');
    setLocation('Ogbomoso');
    setSoilPh(6.2);
    setRainfall(850);
    setIsAuthenticated(false);
    setAuthEmail('');
    setAuthPassword('');
    setAuthError(null);
    setCurrentPage('landing');
    setCurrentSlideIndex(0);
  };

  // Mock Manual Login handler
  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.includes('@') || authPassword.length < 5) {
      setAuthError('Please enter a valid cooperative extension email & password (min 5 characters).');
      return;
    }
    setIsAuthLoading(true);
    setAuthError(null);
    setTimeout(() => {
      setIsAuthLoading(false);
      setIsAuthenticated(true);
      setCurrentPage('profile');
    }, 1000);
  };

  // Launch the Extensive automated 2-to-3 minute Live Demo Tour
  const startDemo = () => {
    resetDashboard();
    setDemoActive(true);
    setDemoStep(1);
    setDemoProgressPercent(2);
    setCurrentPage('landing');
    setDemoBannerText('[Tour Step 1/16] Welcome to Growa AI. Ground-breaking precision agronomy for West Africa.');

    // Transition to Pitch Deck (Second 6)
    const tPitchTrans = window.setTimeout(() => {
      setDemoStep(2);
      setDemoProgressPercent(8);
      setCurrentPage('pitch');
      setCurrentSlideIndex(0);
      setDemoBannerText('[Tour Step 2/16] Slide 1: Bypassing literacy barriers with interactive speech translations.');
    }, 6000);
    demoTimeouts.current.push(tPitchTrans);

    // Slide 2 - Use cases & Deployments (Second 12)
    const tSlide2 = window.setTimeout(() => {
      setDemoStep(3);
      setDemoProgressPercent(15);
      setDemoBannerText('[Tour Step 3/16] Slide 2: Real-world cooperative extension workflows & ag-insurers.');
      setCurrentSlideIndex(1);
    }, 12000);
    demoTimeouts.current.push(tSlide2);

    // Slide 3 - Market capacity (Second 18)
    const tSlide3 = window.setTimeout(() => {
      setDemoStep(4);
      setDemoProgressPercent(24);
      setDemoBannerText('[Tour Step 4/16] Slide 3: Capturing the $22B West African agrarian yield opportunity.');
      setCurrentSlideIndex(2);
    }, 18000);
    demoTimeouts.current.push(tSlide3);

    // Slide 4 - Revenue engine (Second 24)
    const tSlide4 = window.setTimeout(() => {
      setDemoStep(5);
      setDemoProgressPercent(32);
      setDemoBannerText('[Tour Step 5/16] Slide 4: Dual-engine model (bulk SaaS + micro-tokens loaded via airtime).');
      setCurrentSlideIndex(3);
    }, 24000);
    demoTimeouts.current.push(tSlide4);

    // Slide 5 - Roadmap (Second 30)
    const tSlide5 = window.setTimeout(() => {
      setDemoStep(6);
      setDemoProgressPercent(40);
      setDemoBannerText('[Tour Step 6/16] Slide 5: Roadmaps to train 500 extension leaders across agricultural centers.');
      setCurrentSlideIndex(4);
    }, 30000);
    demoTimeouts.current.push(tSlide5);

    // Transition to Auth (Second 36)
    const tAuthTrans = window.setTimeout(() => {
      setDemoStep(7);
      setDemoProgressPercent(48);
      setCurrentPage('auth');
      setDemoBannerText('[Tour Step 7/16] Loading Agent Auth. Securing access to cooperative records.');
    }, 36000);
    demoTimeouts.current.push(tAuthTrans);

    // Auto-type coordinates (Second 39)
    const tAuthType = window.setTimeout(() => {
      setDemoStep(8);
      setDemoProgressPercent(54);
      setAuthEmail('ogbomoso.coop@growa.ng');
      setAuthPassword('super6maize');
      setDemoBannerText('[Tour Step 8/16] Auto-typing localized credentials: ogbomoso.coop@growa.ng...');
    }, 39000);
    demoTimeouts.current.push(tAuthType);

    // Submit Auth (Second 42)
    const tAuthSubmit = window.setTimeout(() => {
      setDemoStep(9);
      setDemoProgressPercent(60);
      setIsAuthLoading(true);
      setDemoBannerText('[Tour Step 9/16] Querying central cooperative directory database indices...');
    }, 42000);
    demoTimeouts.current.push(tAuthSubmit);

    // Load Profile (Second 45)
    const tProfileTrans = window.setTimeout(() => {
      setDemoStep(10);
      setDemoProgressPercent(67);
      setIsAuthLoading(false);
      setIsAuthenticated(true);
      setCurrentPage('profile');
      setDemoBannerText('[Tour Step 10/16] Authenticated! Accessing Ogbomoso Savannah Corn Guild registries.');
    }, 45000);
    demoTimeouts.current.push(tProfileTrans);

    // Audit Profile (Second 49)
    const tProfileAudit = window.setTimeout(() => {
      setDemoStep(11);
      setDemoProgressPercent(73);
      setDemoBannerText('[Tour Step 11/16] Mapping active cohort details (480 total crop hectares, 240 active members).');
    }, 49000);
    demoTimeouts.current.push(tProfileAudit);

    // Transition to active simulator (Second 53)
    const tPredictTrans = window.setTimeout(() => {
      setDemoStep(12);
      setDemoProgressPercent(80);
      setCurrentPage('predict');
      setDemoBannerText('[Tour Step 12/16] Loading active sensor simulation engine dashboards.');
    }, 53000);
    demoTimeouts.current.push(tPredictTrans);

    // Alter sowing metrics (Second 56)
    const tPredictFill = window.setTimeout(() => {
      setDemoStep(13);
      setDemoProgressPercent(85);
      setCrop('Maize');
      setLocation('Ogbomoso');
      setSoilPh(5.8);
      setRainfall(250); // Drought Threat
      setDemoBannerText('[Tour Step 13/16] Simulating crop parameters: Maize in Ogbomoso savannah under drought conditions.');
    }, 56000);
    demoTimeouts.current.push(tPredictFill);

    // Trigger prediction computation (Second 60)
    const tPredictTrigger = window.setTimeout(() => {
      setDemoStep(14);
      setDemoProgressPercent(90);
      setDemoBannerText('[Tour Step 14/16] Calculating predictive models. Matching historical soil arrays...');
      runPrediction({
        crop: 'Maize',
        location: 'Ogbomoso',
        soilPh: 5.8,
        rainfall: 250
      }, (res) => {
        // Yield calibrated (Second 62)
        const tResultPopulated = window.setTimeout(() => {
          setDemoStep(15);
          setDemoProgressPercent(95);
          setDemoBannerText('[Tour Step 15/16] Calculation complete. Dialect advisory translator pipeline is active.');
        }, 1200);
        demoTimeouts.current.push(tResultPopulated);

        // Gemini typing broadcast complete (Second 66)
        const tAdviceType = window.setTimeout(() => {
          setDemoStep(16);
          setDemoProgressPercent(100);
          setDemoBannerText('[Tour Step 16/16] Crop advisory translation streaming finalized. Sowing instructions sent!');
        }, 4000);
        demoTimeouts.current.push(tAdviceType);
      });
    }, 60000);
    demoTimeouts.current.push(tPredictTrigger);
  };

  // Class helper for color-coded risk highlights
  const getRiskColor = (risk: 'Low' | 'Moderate' | 'High') => {
    switch (risk) {
      case 'High':
        return {
          bg: 'bg-clay-50 border-clay-300',
          text: 'text-clay-700',
          badge: 'bg-clay-650 text-white',
          accent: 'border-clay-400',
          iconColor: 'text-clay-600'
        };
      case 'Moderate':
        return {
          bg: 'bg-amber-50/50 border-amber-300',
          text: 'text-amber-850',
          badge: 'bg-amber-600 text-white',
          accent: 'border-amber-450',
          iconColor: 'text-amber-600'
        };
      case 'Low':
      default:
        return {
          bg: 'bg-brand-50 border-brand-300',
          text: 'text-brand-900',
          badge: 'bg-brand-650 text-white',
          accent: 'border-brand-500',
          iconColor: 'text-brand-700'
        };
    }
  };

  // Soil and moisture label utilities
  const getPhLevelType = (ph: number) => {
    if (ph < 5.0) return 'Highly Acidic (Al aluminum toxicity risk)';
    if (ph < 6.0) return 'Moderately Acidic (Favorable for Yam/Cassava)';
    if (ph <= 7.2) return 'Ideal Neutral (Excellent Nutrient Uptake)';
    if (ph < 8.5) return 'Mildly Alkaline';
    return 'Highly Alkaline';
  };

  const getRainfallLabel = (mm: number) => {
    if (mm < 400) return 'Very Low Rain (Severe Drought Threat)';
    if (mm < 800) return 'Moderate Rain (Requires Stable Mulching)';
    if (mm <= 1500) return 'Optimal Rain Moisture (Healthy Vine/Root spread)';
    return 'Heavy Precipitation (Waterlogging & Root-Rot danger)';
  };

  const activeSlide = PITCH_SLIDES[currentSlideIndex];

  return (
    <div className="min-h-screen bg-warmgray-50 bg-grid-pattern text-warmgray-900 selection:bg-brand-200 selection:text-brand-900 pb-12 transition-all">
      
      {/* Growa Dynamic Master Header Bar */}
      <AnimatePresence>
        {demoActive && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-brand-950 text-white text-xs md:text-sm py-3 px-4 shadow-inner relative z-50 border-b border-brand-900"
          >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="flex h-3 w-3 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
                <p className="font-mono tracking-tight text-brand-100 text-left">
                  <span className="text-amber-400 font-bold uppercase mr-1.5">[Interactive Audio-Visual Tour]</span>
                  {demoBannerText}
                </p>
              </div>

              {/* Progress Bar and Stop Controls */}
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-brand-300">Progress:</span>
                  <div className="w-24 md:w-36 bg-brand-800 rounded-full h-2 overflow-hidden border border-brand-700">
                    <div 
                      className="bg-amber-400 h-full rounded-full transition-all duration-700" 
                      style={{ width: `${demoProgressPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-300">{demoProgressPercent}%</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-terminate-demo"
                    onClick={resetDashboard}
                    className="bg-clay-600 hover:bg-clay-700 transition px-3 py-1 rounded text-xs font-medium flex items-center gap-1 cursor-pointer text-white"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Stop Tour
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header navigation */}
      <header id="header-growa-nav" className="bg-white border-b border-warmgray-200 sticky top-0 z-45 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex flex-col sm:flex-row items-center justify-between gap-4 py-2 sm:py-0">
          
          <div className="flex items-center gap-2.5">
            <div className="bg-brand-600 text-white rounded-xl p-2.5 shadow-sm flex items-center justify-center">
              <Sprout className="w-6 h-6 text-brand-100" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-brand-950 font-sans">Growa</span>
              <sup className="text-[10px] font-mono tracking-widest text-clay-600 uppercase ml-1">AI</sup>
              <p className="text-[10px] text-warmgray-400 font-medium tracking-tight -mt-1 hidden sm:block">Nigerian Agronomic Translation Suite</p>
            </div>
          </div>

          {/* Core app routes tabs */}
          <nav className="flex items-center bg-warmgray-100 p-1 rounded-xl border border-warmgray-200">
            <button
              id="tab-landing"
              disabled={demoActive}
              onClick={() => setCurrentPage('landing')}
              className={`px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                currentPage === 'landing' 
                  ? 'bg-white text-brand-800 shadow-xs ring-1 ring-black/5' 
                  : 'text-warmgray-500 hover:text-warmgray-800 disabled:opacity-50'
              }`}
            >
              <Home className="w-4 h-4 text-emerald-500" />
              <span>Home</span>
            </button>
            <button
              id="tab-pitch"
              disabled={demoActive}
              onClick={() => setCurrentPage('pitch')}
              className={`px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                currentPage === 'pitch' 
                  ? 'bg-white text-brand-800 shadow-xs ring-1 ring-black/5' 
                  : 'text-warmgray-500 hover:text-warmgray-800 disabled:opacity-50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-brand-500" />
              <span>Pitch Slides</span>
            </button>
            <button
              id="tab-auth"
              disabled={demoActive}
              onClick={() => setCurrentPage('auth')}
              className={`px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                currentPage === 'auth' 
                  ? 'bg-white text-brand-800 shadow-xs ring-1 ring-black/5' 
                  : 'text-warmgray-500 hover:text-warmgray-800 disabled:opacity-50'
              }`}
            >
              <Lock className="w-4 h-4 text-clay-500" />
              <span>Agent Auth</span>
            </button>
            <button
              id="tab-profile"
              disabled={demoActive}
              onClick={() => setCurrentPage('profile')}
              className={`px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                currentPage === 'profile' 
                  ? 'bg-white text-brand-800 shadow-xs ring-1 ring-black/5' 
                  : 'text-warmgray-500 hover:text-warmgray-800 disabled:opacity-50'
              }`}
            >
              <Users className="w-4 h-4 text-amber-500" />
              <span>Coop Profile</span>
              {isAuthenticated && (
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
              )}
            </button>
            <button
              id="tab-predict"
              disabled={demoActive}
              onClick={() => setCurrentPage('predict')}
              className={`px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                currentPage === 'predict' 
                  ? 'bg-white text-brand-800 shadow-xs ring-1 ring-black/5' 
                  : 'text-warmgray-500 hover:text-warmgray-800 disabled:opacity-50'
              }`}
            >
              <Cpu className="w-4 h-4 text-brand-650" />
              <span>Yield Predictor</span>
            </button>
          </nav>

          {/* Presentation Trigger Control */}
          <div>
            <button
              id="btn-header-demo-launcher"
              onClick={demoActive ? resetDashboard : startDemo}
              className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold tracking-wide transition flex items-center gap-2 cursor-pointer shadow-sm ${
                demoActive 
                  ? 'bg-clay-600 hover:bg-clay-700 text-white' 
                  : 'bg-brand-600 text-white hover:bg-brand-700 active:scale-97'
              }`}
            >
              <Play className={`w-3.5 h-3.5 fill-current ${demoActive ? 'animate-spin' : ''}`} />
              {demoActive ? 'Reset Platform' : 'Start Auto-Tour (2 Mins)'}
            </button>
          </div>

        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-6">
        
        {/* Active Route Wrapper */}
        <div className="min-h-[70vh]">
          
          {/* TAB 0: LANDING PAGE */}
          {currentPage === 'landing' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-16 py-4 animate-fade-in"
            >
              {/* Hero Section */}
              <div id="growa-hero-container" className="relative bg-brand-950 text-white rounded-3xl p-8 md:p-14 overflow-hidden border border-brand-900 shadow-xl">
                {/* Visual patterns & blobs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-700/20 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

                <div className="relative z-10 max-w-3xl space-y-6">
                  <span className="px-3.5 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs font-mono tracking-widest text-emerald-400 uppercase font-black">
                     Next-Gen Agronomy Suite For West Africa
                  </span>
                  
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight md:leading-none text-white font-sans">
                    Translating High-Resolution soil IoT metrics into native dialects.
                  </h1>
                  
                  <p className="text-brand-100 text-sm md:text-base max-w-xl leading-relaxed font-semibold">
                    Growa AI is a precision-agronomy platform designed specifically for Sub-Saharan ecosystems. We bridge the comprehension divide by translating complex physical chemistry sensor telemetry into actionable instructions spoken in local dialects like West African Pidgin English.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      id="btn-hero-start-demo"
                      onClick={startDemo}
                      className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-brand-950 font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 text-sm"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Launch Interactive Demo Tour</span>
                    </button>
                    <button
                      id="btn-hero-view-pitch"
                      onClick={() => setCurrentPage('pitch')}
                      className="px-6 py-3 bg-brand-900 hover:bg-brand-850 text-brand-100 font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer border border-brand-800 text-sm"
                    >
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      <span>Review Pitch & Business Model</span>
                    </button>
                  </div>
                </div>

                {/* Floating Metric Badge inside Hero */}
                <div className="relative md:absolute bottom-0 md:bottom-12 right-0 md:right-12 mt-8 md:mt-0 bg-brand-900/90 backdrop-blur-md border border-brand-800 p-5 rounded-2xl md:max-w-xs space-y-1.5">
                  <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest font-mono">Live Network Coverage</p>
                  <p className="text-xl font-black text-white font-sans">Ogbomoso, Enugu & Kaduna</p>
                  <p className="text-xs text-brand-200">Active regional meteorological & municipal soil arrays synchronized.</p>
                </div>
              </div>

              {/* Startup Metrics Bar */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { value: '480+', label: 'Registered Acreage Under Active Audit', icon: 'Building' },
                  { value: '94%', label: 'Trial Cooperative Advisory Sowing Compliance', icon: 'Award' },
                  { value: '₦150', label: 'Farmer Airtime Micro-payment per query', icon: 'Coins' },
                  { value: '38M+', label: 'Nigerian Agrarian Addressable Market (TAM)', icon: 'Users' }
                ].map((m, idx) => (
                  <div key={idx} className="bg-white border border-warmgray-250/70 p-6 rounded-2xl shadow-xs relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
                    <p className="text-3xl font-black font-mono tracking-tight text-brand-900 relative z-10">{m.value}</p>
                    <p className="text-xs text-warmgray-500 font-bold relative z-10 mt-1">{m.label}</p>
                  </div>
                ))}
              </div>

              {/* Three Pillared Solution Grid */}
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <span className="text-[10px] uppercase font-bold text-clay-600 tracking-widest font-mono">Platform Integration Channels</span>
                  <h2 className="text-2xl md:text-3xl font-black text-warmgray-900 tracking-tight">Our Core Operational Architecture</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      title: '1. Cellular IoT Soil Probes',
                      desc: 'Low-cost solar telemetry rods measuring moisture, NPK layers, temperature, and local rainfall logs directly embedded in cooperative fields. Built for harsh Sahel and Savannah climates.',
                      img: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80',
                      badge: 'RAW SENSOR CAPTURE'
                    },
                    {
                      title: '2. Language Translation Pipe',
                      desc: 'Advanced Gemini flash translation engines mapping complex numerical probability margins into natural oral advice matching local agrarian accents and audio broadcasts.',
                      img: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80',
                      badge: 'GEMINI FLASH SPEECH'
                    },
                    {
                      title: '3. Cooperative Portfolio Node',
                      desc: 'Centralized diagnostic records where union administrators assess regional alerts, dispatch physical fertilizer bins, and scale operations easily.',
                      img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad49f?auto=format&fit=crop&w=600&q=80',
                      badge: 'COOPERATIVE PORTAL'
                    }
                  ].map((card, cIndex) => (
                    <div key={cIndex} className="bg-white border border-warmgray-200 rounded-2xl overflow-hidden shadow-xs flex flex-col h-full group">
                      <div className="h-44 relative overflow-hidden bg-brand-50 shrink-0">
                        <img 
                          src={card.img} 
                          alt={card.title} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale-[20%] hover:grayscale-0"
                        />
                        <div className="absolute top-3 left-3 bg-brand-950/80 backdrop-blur-xs text-white text-[9px] font-bold tracking-widest px-2.5 py-1 rounded font-mono">
                          {card.badge}
                        </div>
                      </div>
                      <div className="p-6 flex flex-col justify-between flex-grow space-y-3">
                        <h3 className="text-lg font-black text-brand-950">{card.title}</h3>
                        <p className="text-xs text-warmgray-500 leading-relaxed font-semibold">{card.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call-to-action Section */}
              <div className="bg-warmgray-100 border border-warmgray-200 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <h3 className="text-xl md:text-2xl font-black text-brand-950 tracking-tight">Ready to see the Growa Agricultural Engine in action?</h3>
                  <p className="text-xs md:text-sm text-warmgray-500 font-semibold leading-relaxed">
                    Watch our automated tour showcase the end-to-end framework, from the pitch deck and metrics to cooperative logins and physical sensor analytics streams.
                  </p>
                </div>
                <button
                  id="btn-cta-execute-tour"
                  onClick={startDemo}
                  className="px-6 py-3.5 bg-brand-650 hover:bg-brand-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shrink-0 text-xs md:text-sm"
                >
                  <Play className="w-4 h-4 fill-current animate-pulse" />
                  <span>Execute Full 3-Min Tour</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 1: PITCH DECK SLIDESHOW */}
          {currentPage === 'pitch' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-5xl mx-auto py-4 space-y-6"
            >
              {/* Pitch Deck Header context */}
              <div className="text-center space-y-2">
                <span className="px-3 py-1 bg-brand-50 border border-brand-200 rounded-full text-[11px] font-mono tracking-widest text-brand-850 uppercase font-black">
                  Interactive Startup Pitch Deck (Investor Brief)
                </span>
                <h1 className="text-2xl md:text-4xl font-extrabold text-warmgray-900 tracking-tight">
                  Solving the West African Yield Gap
                </h1>
                <p className="text-warmgray-500 text-xs md:text-sm max-w-lg mx-auto font-semibold">
                  Slide-by-slide brief outlining our business fundamentals, addressable niches, revenue models, and scale milestones.
                </p>
              </div>

              {/* Dynamic Slideshow Core viewport Container */}
              <div 
                id="growa-slideshow-viewport"
                className={`bg-white rounded-3xl border transition-all p-6 md:p-10 relative overflow-hidden ${
                  demoActive 
                    ? 'ring-4 ring-brand-500 border-brand-500 shadow-xl' 
                    : 'border-warmgray-200 shadow-md'
                }`}
              >
                {/* Giant Slide Watermark Indicator */}
                <div className="absolute -bottom-8 -right-4 text-brand-850/[0.03] text-[15rem] leading-none select-none pointer-events-none font-black font-mono">
                  0{activeSlide.id}
                </div>

                {/* Subtly stylized background patterns */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-brand-50/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
                <div className="absolute -left-10 top-1/4 w-40 h-40 bg-clay-50/20 rounded-full blur-2xl pointer-events-none"></div>

                {/* Categories Badge and Slide tracking details */}
                <div className="flex items-center justify-between border-b border-warmgray-150 pb-5 mb-6 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-850 text-xs px-2.5 py-1 rounded-lg font-black font-mono tracking-wide uppercase">
                      {activeSlide.category}
                    </span>
                    <span className="text-[11px] font-bold text-warmgray-400 uppercase tracking-widest font-mono">
                      • Slide {cumulativeIndexLabel(activeSlide.id)}
                    </span>
                  </div>
                  
                  {/* Indicators dots */}
                  <div className="flex gap-2">
                    {PITCH_SLIDES.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => !demoActive && setCurrentSlideIndex(idx)}
                        disabled={demoActive}
                        className={`h-2.5 rounded-full transition-all cursor-pointer ${
                          idx === currentSlideIndex 
                            ? 'w-8 bg-brand-650' 
                            : 'w-2.5 bg-warmgray-250 hover:bg-warmgray-450'
                        }`}
                        title={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Slide content viewport */}
                <div className="min-h-[400px] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                  
                  {/* Left Column: Title, description, bullets */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="space-y-3">
                      <div className="text-[10px] font-bold text-brand-650 uppercase tracking-widest font-mono">
                        Key Strategic Directives
                      </div>
                      <h2 className="text-xl md:text-3.5xl font-black text-warmgray-950 tracking-tight leading-tight">
                        {activeSlide.title}
                      </h2>
                    </div>
                    
                    <p className="text-sm md:text-base text-warmgray-600 leading-relaxed font-semibold">
                      {activeSlide.description}
                    </p>

                    <div className="space-y-3.5 pt-2">
                      {activeSlide.bulletPoints.map((bp, keyIdx) => (
                        <div key={keyIdx} className="flex items-start gap-3 bg-warmgray-50/50 p-2.5 rounded-xl border border-warmgray-150/40">
                          <span className="h-5.5 w-5.5 bg-brand-50 border border-brand-200 text-brand-700 text-xs rounded-full flex items-center justify-center shrink-0 font-bold mt-0.5 shadow-2xs">
                            ✓
                          </span>
                          <span className="text-xs md:text-sm text-warmgray-700 font-bold leading-relaxed">{bp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: High Quality Topic Image + Key Stats panel */}
                  <div className="lg:col-span-5 space-y-6 w-full">
                    {/* Unsplash Image Card representation */}
                    {activeSlide.imageUrl && (
                      <div className="relative h-44 rounded-2xl overflow-hidden border border-warmgray-200 shadow-sm shrink-0">
                        <img 
                          src={activeSlide.imageUrl} 
                          alt={activeSlide.title} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover grayscale-15 hover:grayscale-0 transition-all duration-300"
                        />
                        <div className="absolute bottom-2 left-2 bg-brand-950/85 backdrop-blur-md px-3 py-1 rounded text-[10px] text-white font-bold tracking-widest font-mono">
                          ACTIVE CROP SURVEY DATA v2.1
                        </div>
                      </div>
                    )}

                    {/* Stats Module */}
                    <div className="p-5 md:p-6 bg-warmgray-50 rounded-2xl border border-warmgray-150 space-y-5">
                      <h3 className="text-xs font-bold text-warmgray-400 uppercase tracking-widest font-mono block">
                        Verified Agrarian KPI Targets
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        {activeSlide.stats && activeSlide.stats.map((st, sIdx) => (
                          <div key={sIdx} className="space-y-1 bg-white p-3 rounded-xl border border-warmgray-200/80">
                            <span className="text-2xl md:text-3xl font-black font-mono tracking-tight text-brand-850 block">
                              {st.value}
                            </span>
                            <span className="text-[10px] text-warmgray-500 leading-snug font-semibold block min-h-8">
                              {st.label}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-1">
                        <div className="flex items-center gap-2 text-[9px] uppercase font-bold tracking-wider text-clay-700 bg-clay-50 border border-clay-100 p-2.5 rounded-lg justify-center">
                          <Coins className="w-3.5 h-3.5 text-clay-500 shrink-0" />
                          <span>Locked National Strategic Agri-Expansion Portfolio</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Manual Navigation Controls inside the Slide view frame */}
                <div className="flex items-center justify-between border-t border-warmgray-150 mt-8 pt-5 relative z-10">
                  <button
                    disabled={demoActive || currentSlideIndex === 0}
                    onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                    className="px-4 py-2 bg-warmgray-100 border border-warmgray-200 text-xs font-bold text-warmgray-600 rounded-xl flex items-center gap-1 hover:bg-warmgray-200 transition disabled:opacity-50 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous Slide
                  </button>
                  
                  {currentSlideIndex < PITCH_SLIDES.length - 1 ? (
                    <button
                      disabled={demoActive}
                      onClick={() => setCurrentSlideIndex(prev => Math.min(PITCH_SLIDES.length - 1, prev + 1))}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-xs font-bold text-white rounded-xl flex items-center gap-1 transition cursor-pointer"
                    >
                      Next Slide <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      disabled={demoActive}
                      onClick={() => setCurrentPage('auth')}
                      className="px-4 py-2 bg-clay-650 hover:bg-clay-700 text-xs font-bold text-white rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                    >
                      Enter Platform Agent Auth <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>

              {/* Demo active instructional tooltip card */}
              {demoActive && (
                <div className="bg-brand-950 text-brand-100 p-4 rounded-xl text-center text-xs font-mono border border-brand-900 leading-relaxed max-w-xl mx-auto shadow-inner">
                  💡 <span className="font-bold text-amber-300 font-mono">Demo Auto Tour Active:</span> We are showing slide-by-slide strategic metrics. Next, the agent verification gateway will authenticates automatic profiles.
                </div>
              )}

            </motion.div>
          )}

          {/* TAB 2: MOCK AUTHENTICATION */}
          {currentPage === 'auth' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto py-12"
            >
              <div 
                id="growa-auth-card"
                className={`bg-white rounded-3xl border transition-all p-8 space-y-6 ${
                  demoActive && demoStep >= 6 
                    ? 'ring-4 ring-brand-500 border-brand-500 scale-102 shadow-lg' 
                    : 'border-warmgray-200 shadow-md'
                }`}
              >
                {/* Auth Logo / Design */}
                <div className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 bg-clay-50 border border-clay-155 rounded-xl flex items-center justify-center text-clay-600">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-extrabold text-warmgray-900 tracking-tight">Cooperative Extension Portal</h2>
                  <p className="text-xs text-warmgray-400">
                    Enter localized credentials to synchronize IoT data profiles.
                  </p>
                </div>

                {/* Form fields */}
                <form onSubmit={handleManualLogin} className="space-y-4">
                  {authError && (
                    <div className="bg-clay-50 border border-clay-200 rounded-xl p-3 text-xs text-clay-700 font-semibold flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-clay-600 shrink-0 mt-0.5" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {/* Email Field with explicit label */}
                  <div>
                    <label htmlFor="auth-email-input" className="text-[11px] font-bold text-warmgray-400 uppercase tracking-widest block mb-1">
                      Cooperative Email Address
                    </label>
                    <input
                      id="auth-email-input"
                      type="email"
                      required
                      placeholder="e.g. extension.officer@growa.ng"
                      disabled={demoActive}
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full bg-warmgray-50 border border-warmgray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition font-medium"
                    />
                  </div>

                  {/* Password Field with explicit label */}
                  <div>
                    <label htmlFor="auth-password-input" className="text-[11px] font-bold text-warmgray-400 uppercase tracking-widest block mb-1">
                      Platform Secure Password
                    </label>
                    <input
                      id="auth-password-input"
                      type="password"
                      required
                      placeholder="••••••••"
                      disabled={demoActive}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full bg-warmgray-50 border border-warmgray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition font-medium"
                    />
                  </div>

                  {/* Sign In Submit Option */}
                  <button
                    id="btn-submit-auth"
                    type="submit"
                    disabled={isAuthLoading || demoActive}
                    className={`w-full py-3.5 rounded-xl text-sm font-bold tracking-wide cursor-pointer transition flex items-center justify-center gap-2 text-white ${
                      isAuthLoading 
                        ? 'bg-warmgray-300 text-warmgray-500' 
                        : demoActive && demoStep === 7
                          ? 'bg-amber-400 text-brand-950 scale-102 ring-2 ring-offset-2 ring-amber-300 font-black'
                          : 'bg-brand-600 hover:bg-brand-700 active:scale-98 shadow-xs'
                    }`}
                  >
                    {isAuthLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-brand-700" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Verifying with Growa Registry...</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4 text-brand-200" />
                        <span>Authenticate Cooperative</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Cooperative reference context */}
                <div className="bg-warmgray-50 border border-warmgray-150 rounded-xl p-4 text-xs space-y-1 text-center">
                  <p className="font-bold text-warmgray-700">Need Demo Logins?</p>
                  <p className="text-warmgray-500 text-[11px] leading-relaxed">
                    Type any cooperative email (e.g., <code className="bg-warmgray-100 font-mono text-clay-700 px-1 rounded">coop@growa.ng</code>) and password to immediately unlock.
                  </p>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 3: COOPERATIVE FIELD PROFILE */}
          {currentPage === 'profile' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto py-4 space-y-6"
            >
              
              {/* Authenticated Check safeguard */}
              {!isAuthenticated ? (
                <div className="bg-white rounded-3xl p-10 border border-warmgray-200 text-center max-w-md mx-auto space-y-5">
                  <div className="w-14 h-14 bg-clay-50 text-clay-600 rounded-full flex items-center justify-center mx-auto border border-clay-155">
                    <Lock className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-extrabold text-warmgray-900">Cooperative File Locked</h3>
                    <p className="text-xs text-warmgray-400">
                      You must authenticate using the **Agent Auth** tab before reading member field charts.
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentPage('auth')}
                    className="bg-brand-600 hover:bg-brand-700 text-xs text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer transition"
                  >
                    Go to Agent Auth Portal
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Cooperative Selector tabs/pills */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-warmgray-50 border border-warmgray-200 p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-black text-warmgray-600 uppercase tracking-widest font-mono">
                        Active Database Registry:
                      </span>
                    </div>
                    <div className="flex bg-warmgray-150 p-1 rounded-xl gap-1">
                      {COOPERATIVES.map((coop) => (
                        <button
                          key={coop.id}
                          disabled={demoActive}
                          onClick={() => {
                            setActiveCoopId(coop.id);
                            // Set respective regional controls on click if available
                            if (coop.id === 'NGA-OGB-7362') { setLocation('Ogbomoso'); setCrop('Maize'); }
                            else if (coop.id === 'NGA-KAD-5819') { setLocation('Kaduna'); setCrop('Maize'); }
                            else if (coop.id === 'NGA-ENU-1044') { setLocation('Enugu'); setCrop('Yam'); }
                          }}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            activeCoopId === coop.id
                              ? 'bg-white text-brand-900 shadow-xs border border-warmgray-200'
                              : 'text-warmgray-500 hover:text-warmgray-700 disabled:opacity-50'
                          }`}
                        >
                          {coop.primaryCrop === 'Maize' ? '🌽 ' : '🥔 '} 
                          {coop.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cooperative metadata card */}
                  <div 
                    id="coop-status-card"
                    className={`bg-white rounded-3xl border transition-all p-6 md:p-8 relative ${
                      demoActive && demoStep >= 9 
                        ? 'ring-4 ring-brand-500 border-brand-500 scale-102 shadow-lg' 
                        : 'border-warmgray-200 shadow-sm'
                    }`}
                  >
                    <div className="absolute top-0 right-0 p-4">
                      <span className="bg-green-150 border border-green-300 text-green-850 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono flex items-center gap-1 shadow-xs">
                        <UserCheck className="w-3.5 h-3.5 text-green-700" /> Authorized Cooperative
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      
                      {/* Left: Cooperative details */}
                      <div className="lg:col-span-8 space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          {/* Rich avatar image representing crop */}
                          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-brand-200 shadow-xs shrink-0 bg-brand-50">
                            {activeCoop.primaryCrop === 'Maize' ? (
                              <img 
                                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=150&h=150&q=80" 
                                alt="Maize" 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer" 
                              />
                            ) : (
                              <img 
                                src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=150&h=150&q=80" 
                                alt="Yam" 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer" 
                              />
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-lg md:text-xl font-black text-warmgray-950 tracking-tight leading-none">
                                {activeCoop.name}
                              </h3>
                              <span className="bg-clay-155 text-clay-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                ID: {activeCoop.id}
                              </span>
                            </div>
                            <p className="text-xs text-warmgray-500 leading-relaxed">
                              {activeCoop.description}
                            </p>
                          </div>
                        </div>

                        {/* Badges metadata */}
                        <div className="flex flex-wrap gap-2.5 text-xs font-semibold pt-1">
                          <span className="text-warmgray-500 text-[11px] flex items-center gap-1.5 bg-warmgray-50 border border-warmgray-150 px-2.5 py-1 rounded-lg">
                            <MapPin className="w-3.5 h-3.5 text-brand-600" /> {activeCoop.state}, {activeCoop.region}
                          </span>
                          <span className="text-warmgray-500 text-[11px] flex items-center gap-1.5 bg-warmgray-50 border border-warmgray-150 px-2.5 py-1 rounded-lg">
                            <Users className="w-3.5 h-3.5 text-amber-500" /> {activeCoop.memberCount} Smallholders
                          </span>
                          <span className="text-warmgray-500 text-[11px] flex items-center gap-1.5 bg-warmgray-50 border border-warmgray-150 px-2.5 py-1 rounded-lg">
                            <Calendar className="w-3.5 h-3.5 text-clay-500" /> Cycle: {activeCoop.cycle}
                          </span>
                        </div>
                      </div>

                      {/* Right: Authenticated Agent Solomon Adzape profile photo details */}
                      <div className="lg:col-span-4 bg-emerald-50/50 border border-emerald-150 rounded-2xl p-4 flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-emerald-200 shadow-sm shrink-0 ring-2 ring-emerald-500/20">
                          {/* Premium West African leader headshot */}
                          <img 
                            src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=150&h=150&q=80" 
                            alt="Solomon Adzape Profile" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-0.5 text-left min-w-0">
                          <p className="text-[9px] uppercase font-bold text-emerald-700 tracking-widest font-mono">EXTENSION AGENT</p>
                          <p className="font-extrabold text-brand-950 text-sm truncate" title="Solomon Adzape">Solomon Adzape</p>
                          <p className="text-[10px] text-emerald-800 font-medium truncate">adzapesolomon@gmail.com</p>
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Recharts Season Historical Yield Trend Line Chart */}
                  <div className="bg-white border border-warmgray-200 rounded-3xl p-6 md:p-8 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-warmgray-100 pb-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        <div>
                          <h4 className="text-sm font-bold text-warmgray-855">Historical Seasonal Yield Trend</h4>
                          <p className="text-[11px] text-warmgray-400">Verifiable production average over multi-year harvests</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-brand-50 border border-brand-200 px-2.5 py-1 rounded text-brand-700 uppercase">
                        Unit: {activeCoop.primaryCrop === 'Maize' ? 'Metric Tons / Ha' : 'Tons / Ha'}
                      </span>
                    </div>

                    <div className="h-64 mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={activeCoop.history}
                          margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                          <XAxis 
                            dataKey="season" 
                            stroke="#888888" 
                            fontSize={11} 
                            tickLine={false} 
                            axisLine={false} 
                          />
                          <YAxis 
                            stroke="#888888" 
                            fontSize={11} 
                            tickLine={false} 
                            axisLine={false} 
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-brand-950 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-md border border-brand-800">
                                    <p className="font-mono text-emerald-400">{payload[0].payload.season}</p>
                                    <p className="text-sm font-black mt-0.5">
                                      {payload[0].value} {activeCoop.primaryCrop === 'Maize' ? 'MT/Ha' : 'Tons/Ha'}
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="yieldVal"
                            stroke="#10b981" 
                            strokeWidth={3}
                            dot={{ r: 5, strokeWidth: 2, fill: "#ffffff" }}
                            activeDot={{ r: 7, strokeWidth: 0 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Arable land details and charts logs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Land acreage distribution panel */}
                    <div className="bg-white border border-warmgray-200 rounded-3xl p-6 md:p-8 space-y-4">
                      <div className="flex items-center gap-2 border-b border-warmgray-100 pb-3">
                        <Building className="w-5 h-5 text-brand-650" />
                        <h4 className="text-sm font-bold text-warmgray-800">Cluster Hectares Management</h4>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-warmgray-500">Total Registered Arable Lands</span>
                          <span className="font-mono text-sm font-black text-brand-850">{activeCoop.totalHectares} Ha</span>
                        </div>
                        
                        {/* Dynamic progressive tracks representation */}
                        <div className="space-y-3">
                          {activeCoop.hectaresByType.map((h, hIdx) => (
                            <div key={hIdx} className="space-y-1">
                              <div className="flex items-center justify-between text-xs font-medium text-warmgray-405">
                                <span>{h.name}</span>
                                <span>{h.value} Ha</span>
                              </div>
                              <div className="w-full bg-warmgray-100 rounded-full h-2 overflow-hidden">
                                <div 
                                  className={`${h.color} h-full rounded-full transition-all duration-500`} 
                                  style={{ width: h.percent }} 
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Historical Extension logs */}
                    <div className="bg-white border border-warmgray-200 rounded-3xl p-6 md:p-8 space-y-4 font-sans">
                      <div className="flex items-center gap-2 border-b border-warmgray-100 pb-3">
                        <Activity className="w-5 h-5 text-clay-605" />
                        <h4 className="text-sm font-bold text-warmgray-800">Agronomic History & Advisories Sent</h4>
                      </div>

                      <div className="space-y-3">
                        
                        <div className="flex items-start gap-2.5 p-2 bg-warmgray-50/75 border border-warmgray-100 rounded-xl">
                          <span className="p-1 px-1.5 text-[9px] font-mono font-bold uppercase rounded bg-brand-100 text-brand-850 shrink-0 mt-0.5">
                            ADVISORY
                          </span>
                          <div className="text-xs space-y-0.5 text-left">
                            <p className="font-bold text-warmgray-800">Drought-resistant seed bulletin broadcasted</p>
                            <span className="text-[10px] text-warmgray-400">Broadcast: 12 days ago via text and offline IVR network</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 p-2 bg-warmgray-50/75 border border-warmgray-100 rounded-xl">
                          <span className="p-1 px-1.5 text-[9px] font-mono font-bold uppercase rounded bg-clay-100 text-clay-700 shrink-0 mt-0.5">
                            WARNING
                          </span>
                          <div className="text-xs space-y-0.5 text-left">
                            <p className="font-bold text-warmgray-800">Aluminum toxicity localized soil lock alert</p>
                            <span className="text-[10px] text-warmgray-400">Logged: 22 days ago inside {activeCoop.soilCluster} indices</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 p-2 bg-warmgray-50/75 border border-warmgray-100 rounded-xl">
                          <span className="p-1 px-1.5 text-[9px] font-mono font-bold uppercase rounded bg-amber-100 text-amber-900 shrink-0 mt-0.5">
                            COMPLETED
                          </span>
                          <div className="text-xs space-y-0.5 text-left">
                            <p className="font-bold text-warmgray-800">NPK 15:15:15 bulk application verification</p>
                            <span className="text-[10px] text-warmgray-400">Cycle: early wet seasonal diagnostic run completed</span>
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>

                  {/* Move to Predict Panel Trigger */}
                  <div className="text-center pt-2">
                    <button
                      onClick={() => setCurrentPage('predict')}
                      className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-xs font-extrabold text-white rounded-xl transition flex items-center gap-1.5 mx-auto cursor-pointer shadow-md"
                    >
                      Proceed to Yield Prediction Engine <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              )}

            </motion.div>
          )}

          {/* TAB 4: CALCULATOR / YIELD PREDICTION SUITE */}
          {currentPage === 'predict' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 pt-2"
            >
              
              {/* Layout for calculator panel split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Inputs area */}
                <section className="lg:col-span-5 space-y-6">
                  
                  <div 
                    id="farm-input-card-v2"
                    className={`bg-white rounded-2xl border transition-all p-6 md:p-8 space-y-6 ${
                      demoActive && demoStep === 12 
                        ? 'ring-4 ring-brand-500 border-brand-500 scale-[1.02] shadow-lg' 
                        : 'border-warmgray-200 shadow-xs'
                    }`}
                  >
                    
                    <div className="flex items-center justify-between border-b border-warmgray-100 pb-4">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-brand-600" />
                        <h2 className="text-lg font-bold text-warmgray-800">Soil & Weather Inputs</h2>
                      </div>
                      
                      {demoActive ? (
                        <span className="bg-brand-950 text-white text-[10px] px-2.5 py-1 rounded-full font-mono font-medium animate-pulse">
                          Autofilling parameters
                        </span>
                      ) : (
                        <span className="text-xs text-brand-600 font-mono flex items-center gap-1 bg-brand-50 px-2 py-0.5 rounded-sm">
                          <Activity className="w-3 h-3 text-brand-500" /> Active Mode
                        </span>
                      )}
                    </div>

                    {/* Crop types select buttons */}
                    <div>
                      <label className="text-xs font-bold text-warmgray-500 uppercase tracking-wider block mb-2">
                        Select Target Crop
                      </label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {(['Maize', 'Cassava', 'Yam'] as Crop[]).map((c) => {
                          const isSelected = crop === c;
                          return (
                            <button
                              key={c}
                              type="button"
                              id={`predict-crop-select-${c.toLowerCase()}`}
                              disabled={demoActive}
                              onClick={() => setCrop(c)}
                              className={`py-3.5 px-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                                isSelected 
                                  ? 'bg-brand-50 border-brand-500 text-brand-800 ring-1 ring-brand-500 font-bold' 
                                  : 'bg-warmgray-50/50 border-warmgray-200 text-warmgray-600 hover:bg-warmgray-50 hover:text-warmgray-800 disabled:opacity-75'
                              }`}
                            >
                              <span className="text-xl">
                                {c === 'Maize' ? '🌽' : c === 'Cassava' ? '🍠' : '🥔'}
                              </span>
                              <span className="text-sm font-semibold">{c}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Regional Select list */}
                    <div>
                      <label htmlFor="predict-region-select" className="text-xs font-bold text-warmgray-500 uppercase tracking-wider block mb-1.5">
                        Farm Region (Nigeria)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-warmgray-400">
                          <MapPin className="w-4 h-4 text-brand-600" />
                        </div>
                        <select
                          id="predict-region-select"
                          disabled={demoActive}
                          value={location}
                          onChange={(e) => setLocation(e.target.value as Location)}
                          className="w-full bg-warmgray-50 border border-warmgray-200 rounded-xl py-3 pl-10 pr-4 text-sm font-semibold text-warmgray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition disabled:opacity-80"
                        >
                          <option value="Ogbomoso">Ogbomoso (South West - Savannah)</option>
                          <option value="Kaduna">Kaduna (North - Arid Belt)</option>
                          <option value="Enugu">Enugu (South East - Rainforest)</option>
                        </select>
                      </div>
                    </div>

                    {/* Soil pH Level */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label htmlFor="predict-ph-slider" className="text-xs font-bold text-warmgray-500 uppercase tracking-wider">
                          Soil pH Level
                        </label>
                        <motion.span 
                          key={soilPh}
                          initial={{ scale: 0.9, opacity: 0.8 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 450, damping: 20 }}
                          className="font-mono text-sm font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-md inline-block"
                        >
                          {soilPh.toFixed(1)}
                        </motion.span>
                      </div>
                      
                      {/* Premium Spring-Animated Track Wrapper */}
                      <div className="relative w-full h-2 bg-warmgray-200 rounded-lg mb-1 flex items-center">
                        <motion.div 
                          className="absolute left-0 top-0 h-full bg-brand-600 rounded-lg"
                          initial={false}
                          animate={{ width: `${(soilPh / 14) * 100}%` }}
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        />
                        <motion.div 
                          className="absolute w-4 h-4 bg-white border-2 border-brand-600 rounded-full shadow-md pointer-events-none"
                          initial={false}
                          animate={{ left: `calc(${(soilPh / 14) * 100}% - 8px)` }}
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        />
                        <input
                          id="predict-ph-slider"
                          type="range"
                          min="0.0"
                          max="14.0"
                          step="0.1"
                          disabled={demoActive}
                          value={soilPh}
                          onChange={(e) => setSoilPh(parseFloat(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-between text-[11px] font-medium text-warmgray-400 mt-1">
                        <span className="text-amber-700 font-bold">Acidic (0.0)</span>
                        <span className="text-brand-650 font-black">Neutral (7.0)</span>
                        <span className="text-blue-700 font-bold">Alkaline (14.0)</span>
                      </div>
                      <div className="bg-warmgray-50/75 border border-warmgray-100 rounded-lg p-2 mt-2 text-center text-[11px] font-mono font-semibold text-warmgray-500">
                        Soil Chemistry: <span className="text-brand-700">{getPhLevelType(soilPh)}</span>
                      </div>
                    </div>

                    {/* Rainfall slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label htmlFor="predict-rain-slider" className="text-xs font-bold text-warmgray-500 uppercase tracking-wider">
                          Expected Seasonal Rainfall
                        </label>
                        <motion.span 
                          key={rainfall}
                          initial={{ scale: 0.9, opacity: 0.8 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 450, damping: 20 }}
                          className="font-mono text-sm font-bold text-clay-700 bg-clay-50 border border-clay-150 px-2 py-0.5 rounded-md inline-block"
                        >
                          {rainfall} mm
                        </motion.span>
                      </div>

                      {/* Premium Spring-Animated Track Wrapper */}
                      <div className="relative w-full h-2 bg-warmgray-200 rounded-lg mb-1 flex items-center">
                        <motion.div 
                          className="absolute left-0 top-0 h-full bg-clay-600 rounded-lg"
                          initial={false}
                          animate={{ width: `${(rainfall / 2000) * 100}%` }}
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        />
                        <motion.div 
                          className="absolute w-4 h-4 bg-white border-2 border-clay-600 rounded-full shadow-md pointer-events-none"
                          initial={false}
                          animate={{ left: `calc(${(rainfall / 2000) * 100}% - 8px)` }}
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        />
                        <input
                          id="predict-rain-slider"
                          type="range"
                          min="0"
                          max="2000"
                          step="25"
                          disabled={demoActive}
                          value={rainfall}
                          onChange={(e) => setRainfall(parseInt(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-between text-[11px] font-medium text-warmgray-400 mt-1">
                        <span className="font-bold">Drought (0 mm)</span>
                        <span className="font-semibold text-warmgray-500">1000 mm</span>
                        <span className="font-bold text-brand-700">Rain Forest (2000 mm)</span>
                      </div>
                      <div className="bg-warmgray-50/75 border border-warmgray-100 rounded-lg p-2 mt-2 text-center text-[11px] font-mono font-semibold text-warmgray-500">
                        Precipitation Plan: <span className="text-clay-650">{getRainfallLabel(rainfall)}</span>
                      </div>
                    </div>

                    {/* Trigger calculate button */}
                    <button
                      type="button"
                      id="btn-trigger-calculator-run"
                      disabled={isAnalyzing || demoActive}
                      onClick={() => runPrediction()}
                      className={`w-full py-4 rounded-xl font-bold tracking-wide transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                        demoActive && demoStep === 13 
                          ? 'bg-amber-400 text-brand-950 scale-102 ring-4 ring-offset-4 ring-amber-300 font-extrabold' 
                          : isAnalyzing 
                            ? 'bg-warmgray-300 text-warmgray-600 cursor-not-allowed'
                            : demoActive
                              ? 'bg-warmgray-100 text-warmgray-400 cursor-not-allowed'
                              : 'bg-brand-600 text-white hover:bg-brand-700 active:scale-98 shadow-brand-200'
                      }`}
                    >
                      {isAnalyzing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Processing agronome indices...</span>
                        </>
                      ) : (
                        <>
                          <Brain className="w-5 h-5 opacity-90 text-brand-100" />
                          <span>Run Agri-AI Prediction</span>
                        </>
                      )}
                    </button>

                  </div>

                  {/* Informational guide */}
                  <div className="bg-clay-50/40 border border-clay-150 p-4 rounded-2xl text-xs space-y-1">
                    <p className="font-bold text-clay-950">How Manual Mode works:</p>
                    <p className="text-warmgray-500 leading-relaxed">
                      Toggle crops (e.g. Yam) and regional centers (e.g. Enugu rainforest). See dynamic localized predictions immediately change to guide cooperative sowing operations.
                    </p>
                  </div>

                </section>

                {/* Outputs areas */}
                <section className="lg:col-span-7 space-y-8">
                  
                  {/* Panel A: Raw Model Output */}
                  <div 
                    id="raw-result-panel"
                    className={`bg-white rounded-2xl border transition-all p-6 md:p-8 space-y-6 ${
                      demoActive && demoStep === 14 
                        ? 'ring-4 ring-brand-500 ring-offset-4 border-brand-500 scale-[1.01] shadow-lg' 
                        : 'border-warmgray-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-warmgray-100 pb-4">
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-brand-600" />
                        <div>
                          <h3 className="text-lg font-bold text-warmgray-800">Panel A: Raw Model Output</h3>
                          <p className="text-[10px] text-warmgray-400 uppercase tracking-wider font-mono">Cold Decisive Sensor Telemetry</p>
                        </div>
                      </div>
                      <span className="bg-warmgray-100 px-2.5 py-1 text-xs rounded-lg font-mono font-bold text-warmgray-500">
                        ML-Engine v1.0.3
                      </span>
                    </div>

                    {/* Progress States */}
                    {analysisPhase === 'processing' && (
                      <div className="min-h-48 flex flex-col items-center justify-center text-center p-8">
                        <svg className="animate-spin h-10 w-10 text-brand-500 mb-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="font-mono text-xs text-brand-600 leading-relaxed animate-pulse uppercase tracking-wider">
                          {analysisStepLabel}
                        </p>
                        <p className="text-xs text-warmgray-400 mt-1">Calibrating regional soil moisture logs...</p>
                      </div>
                    )}

                    {analysisPhase === 'idle' && (
                      <div className="min-h-48 flex flex-col items-center justify-center text-center border-2 border-dashed border-warmgray-200 rounded-xl p-8 bg-warmgray-50/50">
                        <Activity className="w-8 h-8 text-warmgray-300 mb-2" />
                        <p className="text-warmgray-500 text-sm font-semibold">Ready to Analyze</p>
                        <p className="text-xs text-warmgray-400 max-w-xs mt-1">
                          Select parameters on the left, then click <strong>Run Agri-AI Prediction</strong> to compile results.
                        </p>
                      </div>
                    )}

                    {analysisPhase === 'done' && rawResult && (
                      <div className="space-y-6">
                        
                        {/* Gauge metrics and Risk summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Yield Probability Radial / Gauge block */}
                          <div className="bg-warmgray-50/70 border border-warmgray-150 p-5 rounded-2xl flex items-center justify-between gap-4">
                            <div>
                              <span className="text-xs font-bold text-warmgray-400 uppercase tracking-wider block">Yield Probability</span>
                              <span className="text-3xl font-black font-mono tracking-tight text-brand-900 block mt-1">
                                {rawResult.yieldProbability}%
                              </span>
                              <span className="text-xs text-brand-650 flex items-center gap-1 mt-1 font-medium">
                                <TrendingUp className="w-3.5 h-3.5" /> Est. Harvest Output
                              </span>
                            </div>
                            
                            {/* Styled Progress Ring */}
                            <div className="relative h-18 w-18 flex items-center justify-center">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle cx="36" cy="36" r="30" stroke="#E6E5E4" strokeWidth="6" fill="transparent" />
                                <circle cx="36" cy="36" r="30" stroke="#437d64" strokeWidth="6" fill="transparent"
                                  strokeDasharray={`${2 * Math.PI * 30}`}
                                  strokeDashoffset={`${2 * Math.PI * 30 * (1 - rawResult.yieldProbability / 100)}`}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className="absolute text-xs font-bold font-mono text-brand-800">
                                {rawResult.yieldProbability}%
                              </span>
                            </div>
                          </div>

                          {/* Threat / Risk Assessment Card */}
                          <div className={`border p-5 rounded-2xl ${getRiskColor(rawResult.riskFactor).bg} ${getRiskColor(rawResult.riskFactor).accent}`}>
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-xs font-bold text-warmgray-400 uppercase tracking-wider block">Risk Assessment</span>
                                <span className={`text-xl font-bold block mt-1 ${getRiskColor(rawResult.riskFactor).text}`}>
                                  {rawResult.riskFactor} Risk
                                </span>
                              </div>
                              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${getRiskColor(rawResult.riskFactor).badge}`}>
                                {rawResult.yieldProbability < 50 ? 'WARNING' : 'SECURE'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-warmgray-500 font-semibold mt-2.5">
                              {rawResult.riskFactor === 'High' ? (
                                <AlertTriangle className="w-4 h-4 text-clay-605 shrink-0" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                              )}
                              <span className="truncate">{rawResult.issue}</span>
                            </div>
                          </div>

                        </div>

                        {/* Telemetry metadata Grid */}
                        <div className="bg-warmgray-50/50 border border-warmgray-150 rounded-xl p-5 grid grid-cols-2 lg:grid-cols-4 gap-4 divide-y-0 divide-x-2 divide-warmgray-250">
                          
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-warmgray-400 tracking-wider">Est. Yield Mass</span>
                            <p className="text-xs font-bold font-mono text-warmgray-800 flex items-center gap-1">
                              🌽 {rawResult.estimatedYieldQuantity}
                            </p>
                          </div>

                          <div className="pl-2 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-warmgray-400 tracking-wider">Optimum Temp</span>
                            <p className="text-xs font-bold font-mono text-warmgray-800 flex items-center gap-1">
                              <Thermometer className="w-3.5 h-3.5 text-amber-600" /> {rawResult.optimalTempRange}
                            </p>
                          </div>

                          <div className="pl-2 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-warmgray-400 tracking-wider">Soil Moisture</span>
                            <p className="text-xs font-bold font-mono text-warmgray-800 flex items-center gap-1">
                              <Droplet className="w-3.5 h-3.5 text-brand-600" /> {rawResult.soilMoistureLevel}
                            </p>
                          </div>

                          <div className="pl-2 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-warmgray-400 tracking-wider">Nutrients (N-K)</span>
                            <div className="flex gap-2">
                              <span className="bg-brand-50 border border-brand-200 text-[9px] font-bold px-1.5 py-0.5 rounded text-brand-700">
                                N: {rawResult.soilNitrogen}
                              </span>
                              <span className="bg-clay-50 border border-clay-155 text-[9px] font-bold px-1.5 py-0.5 rounded text-clay-700">
                                K: {rawResult.soilPotassium}
                              </span>
                            </div>
                          </div>

                        </div>

                      </div>
                    )}

                  </div>

                  {/* Panel B: Gemini Pilot Insight */}
                  <div 
                    id="gemini-insight-panel"
                    className={`bg-white rounded-2xl border transition-all p-6 md:p-8 space-y-6 ${
                      demoActive && demoStep === 15 
                        ? 'ring-4 ring-brand-500 ring-offset-4 border-brand-500 scale-[1.01] shadow-lg' 
                        : 'border-warmgray-200 shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-warmgray-100 pb-4">
                      
                      <div className="flex items-center gap-2.5">
                        <div className="bg-brand-100 text-brand-800 rounded-xl p-2 shadow-inner flex items-center justify-center animate-pulse">
                          <Sparkles className="w-5 h-5 text-brand-650" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-warmgray-800 flex items-center gap-1.5 animate-pulse">
                            Panel B: Gemini Pilot Insight 
                          </h3>
                          <p className="text-[10px] text-warmgray-400 uppercase tracking-wider font-mono">Agri-Insight Language Translation Engine</p>
                        </div>
                      </div>

                      {/* English / Pidgin Toggle buttons */}
                      {analysisPhase === 'done' && geminiAdvice && (
                        <div className="flex items-center bg-warmgray-100 p-1 rounded-xl self-start md:self-auto border border-warmgray-200">
                          <button
                            id="predict-lang-pidgin"
                            type="button"
                            onClick={() => setAdviceLang('pidgin')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              adviceLang === 'pidgin' 
                                ? 'bg-brand-600 text-white shadow-sm' 
                                : 'text-warmgray-500 hover:text-warmgray-850'
                            }`}
                          >
                            🗣️ Pidgin (Farmer)
                          </button>
                          <button
                            id="predict-lang-english"
                            type="button"
                            onClick={() => setAdviceLang('english')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              adviceLang === 'english' 
                                ? 'bg-brand-600 text-white shadow-sm' 
                                : 'text-warmgray-500 hover:text-warmgray-850'
                            }`}
                          >
                            🇬🇧 Standard English
                          </button>
                        </div>
                      )}
                    </div>

                    {/* States rendering */}
                    {analysisPhase === 'processing' && (
                      <div className="min-h-60 flex flex-col items-center justify-center text-center p-8 space-y-4">
                        <div className="relative">
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 border border-brand-200">
                            <Sparkles className="w-6 h-6 text-brand-600 animate-spin" />
                          </span>
                          <span className="absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-brand-500 animate-ping"></span>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-warmgray-800">Gemini is translating raw telemetry...</p>
                          <p className="text-xs text-warmgray-400 max-w-sm">Generating clear agronomic actions in conversational dialect</p>
                        </div>
                        
                        <div className="w-full max-w-xs bg-warmgray-150 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-brand-600 h-full rounded-full animate-pulse-ring" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                    )}

                    {analysisPhase === 'idle' && (
                      <div className="min-h-60 flex flex-col items-center justify-center text-center border-2 border-dashed border-warmgray-200 rounded-xl p-8 bg-warmgray-50/50">
                        <Sparkles className="w-8 h-8 text-warmgray-300 mb-2" />
                        <p className="text-warmgray-500 text-sm font-semibold">Localized AI Advice Idle</p>
                        <p className="text-xs text-warmgray-400 max-w-xs mt-1">
                          Run predication to trigger organic Gemini broadcast translation.
                        </p>
                      </div>
                    )}

                    {analysisPhase === 'done' && geminiAdvice && (
                      <div className="space-y-6">
                        
                        {/* Chat speech bubble container */}
                        <div className="bg-brand-50/70 border border-brand-150 rounded-2xl p-5 md:p-6 relative">
                          <div className="flex items-center gap-2.5 mb-3 select-none">
                            <div className="h-6.5 w-6.5 rounded-full bg-brand-600 text-[10px] font-bold text-white flex items-center justify-center">
                              G
                            </div>
                            <span className="text-xs font-bold text-brand-850">Growa-Gemini Translator</span>
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          </div>

                          <div className="space-y-3">
                            <p className="font-mono text-[11px] font-bold text-brand-700 tracking-wider">
                              {geminiAdvice.intro}
                            </p>
                            
                            <p className="text-sm md:text-[15px] text-warmgray-800 leading-relaxed font-semibold font-sans border-l-4 border-clay-500 pl-3.5 italic bg-white/65 py-3 rounded-r-lg">
                              "{displayedAdvice || '...'}"
                              {displayedAdvice.length < (adviceLang === 'pidgin' ? geminiAdvice.explanationPidgin : geminiAdvice.explanationEnglish).length && (
                                <span className="inline-block w-2.5 h-4 bg-brand-600 animate-pulse ml-0.5" />
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Action items */}
                        <div className="space-y-3 pt-1">
                          <h4 className="text-xs font-bold text-warmgray-500 uppercase tracking-widest flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-brand-700" /> Dynamic Preventive Action Items
                          </h4>
                          
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {geminiAdvice.actionableAdvice.map((item, idx) => (
                              <li 
                                key={idx}
                                className="bg-warmgray-50 border border-warmgray-150 p-3.5 rounded-xl text-xs text-warmgray-700 flex items-start gap-2.5 hover:border-brand-300 transition animate-fade-in"
                              >
                                <span className="h-5 w-5 rounded-full bg-brand-100 text-[10px] font-bold text-brand-805 flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <span className="leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Key takeaways */}
                        <div className="bg-clay-50 border border-clay-150 p-4 rounded-xl flex items-center gap-3">
                          <Flame className="w-5 h-5 text-clay-600 shrink-0" />
                          <div className="text-xs">
                            <span className="font-extrabold text-clay-900 block uppercase tracking-wider text-[10px]">Agri-AI Key Takeaway</span>
                            <p className="text-warmgray-600 font-semibold">{geminiAdvice.keyTakeaway}</p>
                          </div>
                        </div>

                      </div>
                    )}

                  </div>

                </section>

              </div>

            </motion.div>
          )}

        </div>

        {/* Confetti celebration popup when Active Demo concludes */}
        <AnimatePresence>
          {demoActive && demoStep === 15 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-brand-500 shadow-2xl text-center space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2.5 bg-brand-600 animate-pulse"></div>
                <div className="text-5xl">🎉</div>
                
                <div className="space-y-2">
                  <h3 className="text-xl md:text-2xl font-extrabold text-brand-950 tracking-tight">
                    Growa Demo Concluded!
                  </h3>
                  <p className="text-xs text-warmgray-500 leading-relaxed">
                    You have successfully completed our comprehensive agronomic advisory tour: from Slide Deck to Cooperative profile audits, sensor simulation, and translation bulletins.
                  </p>
                </div>

                <div className="bg-brand-50/70 border border-brand-150 p-4 rounded-xl text-left text-xs space-y-1">
                  <p className="font-bold text-brand-850">Explore Manual Mode:</p>
                  <p className="text-warmgray-600 leading-relaxed">
                    Everything is now unlocked! Feel free to switch tabs, change the pH level sliders, select Cassava or Yam, and test other custom regional advice packets.
                  </p>
                </div>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={resetDashboard}
                    className="px-5 py-2.5 bg-warmgray-100 hover:bg-warmgray-200 text-warmgray-600 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Dismiss & Explore
                  </button>
                  <button
                    onClick={startDemo}
                    className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Replay Tour
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer info/details */}
        <footer className="border-t border-warmgray-200 mt-16 pt-6 text-center text-xs text-warmgray-400 space-y-1.5 max-w-5xl mx-auto">
          <p>© 2026 Growa AI Inc. Designed especially for high-yield Nigerian agricultural output.</p>
          <p className="font-mono text-[10px] text-warmgray-300">
            Powered by Gemini flash models • Complies with local soil chemistry mapping standards (Ogbomoso Savannah, Enugu Rainforest, Kaduna Plains)
          </p>
        </footer>

      </main>
    </div>
  );
}

// Simple label helper
function cumulativeIndexLabel(idx: number): string {
  return `${idx} / ${PITCH_SLIDES.length}`;
}
