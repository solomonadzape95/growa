import { Crop, Location, PredictionInput, RawPredictionResult, GeminiInsight } from '../types';

/**
 * Custom dynamic prediction and advisor engine for Growa AI
 * Translates soil indicators and weather parameters into customized agricultural metrics and Pidgin AI advisory.
 */

export function calculatePrediction(input: PredictionInput): {
  raw: RawPredictionResult;
  advisor: GeminiInsight;
} {
  const { crop, location, soilPh, rainfall } = input;

  // Let's create deterministic dynamic calculations based on inputs to simulate a rigorous ML model
  let yieldProb = 0;
  let riskField: 'Low' | 'Moderate' | 'High' = 'Low';
  let issueText = 'Optimal Climate & Soil Chemistry';
  let yieldQty = '';
  let soilMoisture = '';
  let nitrogen: 'Low' | 'Medium' | 'High' = 'Medium';
  let potassium: 'Low' | 'Medium' | 'High' = 'Medium';
  const optimalTemp = location === 'Kaduna' ? '29°C' : location === 'Ogbomoso' ? '28°C' : '26°C';

  // Specific check for DEMO CASE to match precisely the instructions:
  // "Maize, Ogbomoso, pH = 5.8, Rainfall = Low (e.g. 250mm)"
  // instrucs: Populate Panel A with: "Yield Prob: 42%", "Drought Risk: 88%" (we can handle risk factor and display drought risk explicitly).
  const isDemoCase = crop === 'Maize' && location === 'Ogbomoso' && soilPh === 5.8 && rainfall <= 300;

  if (isDemoCase) {
    return {
      raw: {
        yieldProbability: 42,
        riskFactor: 'High',
        issue: 'Early Dry Spell / Severe Drought Risk',
        estimatedYieldQuantity: '1.2 Metric Tons/Hectare (Estimated)',
        optimalTempRange: '28°C - 31°C',
        soilNitrogen: 'Low',
        soilPotassium: 'Medium',
        soilMoistureLevel: 'Critically Dry (12% Volumetric)',
      },
      advisor: {
        intro: 'Model analysis complete. Explanation for Farmer:',
        explanationPidgin: "Bros, the rain wey dey come Ogbomoso next week no go reach for this maize. Make you no plant the normal seed. Try buy that drought-resistant 'Oba Super 6' seed make your hand no touch ground.",
        explanationEnglish: "The upcoming forecast for Ogbomoso indicates insufficient rainfall to sustain early maize seedlings. Avoid sowing local, unimproved varieties. Acquire drought-tolerant 'Oba Super 6' hybrids to guarantee seed survival and crop safety.",
        actionableAdvice: [
          'Postpone sowing until stable rainfall is confirmed, or employ supplementary drip irrigation.',
          'Sow drought-resistant hybrid corn (e.g., Oba Super 6, Oba 98).',
          'Apply organic mulching (covering soil with dried weeds or stalks) to conserve the little topsoil moisture available.',
          'Consider soil amendments like biochar to boost water retention capacities.'
        ],
        keyTakeaway: 'Drought protection active: switch Maize variety immediately to preserve capital.'
      }
    };
  }

  // --- MANUAL DYNAMIC ENGINE ---
  if (crop === 'Maize') {
    // Maize needs 5.8 - 6.8 pH, 600 - 1200mm rainfall
    let base = 75;
    
    // pH penalties
    if (soilPh < 5.5) {
      base -= (5.5 - soilPh) * 15;
    } else if (soilPh > 7.0) {
      base -= (soilPh - 7.0) * 15;
    }

    // Rainfall penalties
    if (rainfall < 500) {
      base -= (500 - rainfall) * 0.12;
    } else if (rainfall > 1300) {
      base -= (rainfall - 1300) * 0.08;
    }

    yieldProb = Math.max(15, Math.min(95, Math.round(base)));

    // Risk assessment
    const droughtPrevalence = rainfall < 450;
    const acidicSoil = soilPh < 5.0;
    const floodPrevalence = rainfall > 1500;

    if (droughtPrevalence || acidicSoil || floodPrevalence) {
      riskField = 'High';
      issueText = droughtPrevalence 
        ? 'Severe Drought & Crop Water Stress' 
        : acidicSoil 
          ? 'Acidic Soil Block / Aluminum Toxicity' 
          : 'High Soil Saturation & Root Suffocation';
    } else if (rainfall < 600 || rainfall > 1200 || soilPh < 5.6 || soilPh > 7.2) {
      riskField = 'Moderate';
      issueText = rainfall < 600 
        ? 'Sub-optimal Soil Moisture Reserve' 
        : rainfall > 1200 
          ? 'Mild Leaf Spot & Nutrient Leaching' 
          : 'Minor Soil Nutrient Chemical Lock';
    } else {
      riskField = 'Low';
      issueText = 'Highly Favorable Soil & Climate Synergy';
    }

    yieldQty = `${(yieldProb * 0.04).toFixed(1)} MT / Hectare`;
    soilMoisture = rainfall < 400 ? 'Low (15%)' : rainfall > 1200 ? 'Saturated (72%)' : 'Optimal (45%)';
    nitrogen = soilPh < 5.2 ? 'Low' : 'Medium';
    potassium = 'Medium';

  } else if (crop === 'Cassava') {
    // Cassava is highly resilient, works on 4.5 - 7.5 pH, 800 - 2000mm rainfall
    let base = 82;
    
    // pH penalty
    if (soilPh < 4.8) {
      base -= (4.8 - soilPh) * 10;
    } else if (soilPh > 7.5) {
      base -= (soilPh - 7.5) * 10;
    }

    // Rainfall penalty (thrives in water, drought-tolerant, but roots rot if waterlogged)
    if (rainfall < 400) {
      base -= (400 - rainfall) * 0.05;
    } else if (rainfall > 1700) {
      base -= (rainfall - 1700) * 0.07;
    }

    yieldProb = Math.max(20, Math.min(95, Math.round(base)));

    const swampyGround = rainfall > 1600;
    const dryGround = rainfall < 350;

    if (swampyGround) {
      riskField = 'High';
      issueText = 'High Risk of Tuber Root-Rot';
    } else if (dryGround) {
      riskField = 'Moderate';
      issueText = 'Drought-Induced Stunting';
    } else {
      riskField = 'Low';
      issueText = 'Strong Root-Zone Tuber Development';
    }

    yieldQty = `${(yieldProb * 0.15).toFixed(1)} Tons / Hectare`;
    soilMoisture = rainfall < 400 ? 'Dry (19%)' : rainfall > 1500 ? 'Swampy (80%)' : 'Balanced (48%)';
    nitrogen = 'Medium';
    potassium = rainfall > 1400 ? 'Low' : 'High';

  } else {
    // Yam - very sensitive, noble crop. Needs 5.5 - 6.5 pH, 1000 - 1800mm rainfall
    let base = 70;
    
    if (soilPh < 5.3) {
      base -= (5.3 - soilPh) * 18;
    } else if (soilPh > 6.8) {
      base -= (soilPh - 6.8) * 18;
    }

    if (rainfall < 700) {
      base -= (700 - rainfall) * 0.15;
    } else if (rainfall > 1600) {
      base -= (rainfall - 1600) * 0.1;
    }

    yieldProb = Math.max(10, Math.min(95, Math.round(base)));

    const waterlogged = rainfall > 1500;
    const extremeDrought = rainfall < 600;

    if (waterlogged || extremeDrought || soilPh < 5.0) {
      riskField = 'High';
      issueText = waterlogged 
        ? 'Fungal Leaf Spot (Yam Anthracnose) & Water Stress' 
        : extremeDrought 
          ? 'Severe Vine Desiccation & Heat Stunt' 
          : 'High Acidity (Calcium/Magnesium Deficiency)';
    } else if (rainfall < 900 || rainfall > 1400 || soilPh < 5.5 || soilPh > 6.5) {
      riskField = 'Moderate';
      issueText = 'Sub-optimal Tuber Elongation Conditions';
    } else {
      riskField = 'Low';
      issueText = 'Excellent Mound/Ridge Structure & Moisture';
    }

    yieldQty = `${(yieldProb * 0.18).toFixed(1)} Tons / Hectare`;
    soilMoisture = rainfall < 500 ? 'Dry (22%)' : rainfall > 1300 ? 'Saturated (68%)' : 'Rich Humid (52%)';
    nitrogen = 'High';
    potassium = 'High';
  }

  // Generate localized Advisor advice based on selected details
  const advisor = getAdvisorAdvice(crop, location, soilPh, rainfall, yieldProb, riskField);

  return {
    raw: {
      yieldProbability: yieldProb,
      riskFactor: riskField,
      issue: issueText,
      estimatedYieldQuantity: yieldQty,
      optimalTempRange: `${optimalTemp} (Optimal)`,
      soilNitrogen: nitrogen,
      soilPotassium: potassium,
      soilMoistureLevel: soilMoisture
    },
    advisor
  };
}

// Generate beautiful custom advising based on state switches
function getAdvisorAdvice(
  crop: Crop,
  location: Location,
  soilPh: number,
  rainfall: number,
  yieldProb: number,
  risk: 'Low' | 'Moderate' | 'High'
): GeminiInsight {
  
  if (crop === 'Maize') {
    switch (location) {
      case 'Kaduna':
        return {
          intro: 'Model analysis complete. Explanation for Farmer:',
          explanationPidgin: "Kaduna weather design well for maize this year, but pH level dey slightly high. No shake! Just apply small Urea fertilizer after two weeks make the crop grow berekete. Watch out for those armyworms too.",
          explanationEnglish: "The agricultural forecast for Kaduna is positive for corn. However, a slightly elevated pH may limit micro-micronutrient absorption. Apply urea top-dressing two weeks post-emergence and regularly monitor fields for early signs of fall armyworm infestation.",
          actionableAdvice: [
            'Apply Urea or Ammonium Sulphate fertilizer at 3-4 weeks to boost early growth.',
            'Maintain strict scouting for Armyworm pests, spraying neem oil or organic repellents early.',
            'Apply secondary nitrogen fertilizer if leaf tips start showing yellowing patterns.'
          ],
          keyTakeaway: 'Kaduna soils are primed for hybrid Maize, target high planting density with active pest tracking.'
        };
      case 'Enugu':
        return {
          intro: 'Model analysis complete. Explanation for Farmer:',
          explanationPidgin: "Enugu land get water well-well, but too much water fit drown your maize roots. Make you clear drainage channels on your farm quick-quick, and put small lime (calcium carbonate) inside the soil to cure the acid before you plant.",
          explanationEnglish: "Enugu's high-precipitation climate ensures optimal moisture, but carries standard waterlogging threats. Ensure deep drainage trenches around Maize borders. Add agricultural lime to counter minor soil acidity during land preparation.",
          actionableAdvice: [
            'Clear natural discharge outlets to prevent continuous ponding or root rot.',
            'Add agricultural lime (calcium carbonate) or dolomite to sweeten the acid soil.',
            'Plant on elevated mounds if your plot stands in low-lying, swampy spots.'
          ],
          keyTakeaway: 'Control excessive water pooling and sweeten the acidic soil to unlock premium corn yields.'
        };
      case 'Ogbomoso':
      default:
        if (rainfall < 500) {
          return {
            intro: 'Model analysis complete. Explanation for Farmer:',
            explanationPidgin: "Bros, the rain wey dey come Ogbomoso next week no go reach for this maize. Make you no plant the normal seed. Try buy that drought-resistant 'Oba Super 6' seed make your hand no touch ground.",
            explanationEnglish: "Current precipitation forecast for Ogbomoso depicts a severe early-stage moisture shortage. Traditional seed corn varieties will crash. We advise planting Oba Super 6 or similar drought-tolerant commercial hybrids.",
            actionableAdvice: [
              'Abandon local unimproved corn kernels for drought-resilient seed strains.',
              'Apply heavy leaf mulching to conserve remaining moisture reserves.',
              'Postpone deep fertilizer top-dressing until steady rains return to prevent burning roots.'
            ],
            keyTakeaway: 'Switch corn strain to Oba Super 6 immediately to survive the early Ogbomoso dry season.'
          };
        } else {
          return {
            intro: 'Model analysis complete. Explanation for Farmer:',
            explanationPidgin: "Ogbomoso land good for Maize this season! The rain ready, soil dey normal. Just keep eye on weed make dem no swallow your crops, apply NPK fertilizer to boost weight of the corn cob.",
            explanationEnglish: "Ogbomoso's meteorological forecast is prime for Maize. Soil pH is within normal bounds. Minimize weed competition during early development, and treat fields with NPK 15-15-15 to maximize cob weight.",
            actionableAdvice: [
              'Treat plots with organic compost or pre-emergence organic herbicide active agents.',
              'Apply strategic doses of NPK 15:15:15 at 3 and 6 weeks.',
              'Ensure optimal spacing (approx. 75cm x 25cm) during manual sowing.'
            ],
            keyTakeaway: 'Excellent agricultural season ahead; sustain high soil aeration and timely field clearing.'
          };
        }
    }
  } else if (crop === 'Cassava') {
    switch (location) {
      case 'Enugu':
        return {
          intro: 'Model analysis complete. Explanation for Farmer:',
          explanationPidgin: "Cassava go clean mouth for Enugu because of rain, but if water log for ground, the roots go rot! Make sure you build high ridges (heaps) make water dey flow pass easily. No go plant for swampy side o!",
          explanationEnglish: "Cassava yields in Enugu will thrive with the abundant rain. However, poor sub-surface drainage triggers root rot. Construct prominent ridges and avoid cultivating Cassava in low-lying clay valleys.",
          actionableAdvice: [
            'Build ridges or high earthen heaps instead of flat bed planting.',
            'Harvest immediately if you detect root softening or unexpected stem dieback.',
            'Select high-yielding, disease-resistant stems like TME 419 or TMS 98/0505.'
          ],
          keyTakeaway: 'Water drainage is vital: keep cassava tubers elevated from standing groundwater.'
        };
      case 'Kaduna':
        return {
          intro: 'Model analysis complete. Explanation for Farmer:',
          explanationPidgin: "Cassava get stamina, but Kaduna dry sun fit dry the stems before they take root. Make you plant deep inside the loam ridge and cover the top with dry leaves (mulching) to hold the small moisture wey dey soil.",
          explanationEnglish: "Cassava is highly resilient, but northern heat risks drying out bare stems before root-striking occurs. Plant deep within loam ridges and apply straw mulch to conserve moisture during root initiation.",
          actionableAdvice: [
            'Mulch ridges with dry guinea grass to shield tender tuber stalks from direct sun.',
            'Plant stem cuttings at an angle to favor robust structural rooting.',
            'Check for Cassava Mosaic Disease and burn any diseased leaf clusters immediately.'
          ],
          keyTakeaway: 'Sun-protection and mulching are paramount to establish Cassava in arid Kaduna soil.'
        };
      case 'Ogbomoso':
      default:
        return {
          intro: 'Model analysis complete. Explanation for Farmer:',
          explanationPidgin: "Cassava dey do well for Ogbomoso soil! The heat and rainfall level match standard. Just make sure you clear the weeds early during the first 4 to 6 weeks, so they no go drag nutrition with your cassava tubers.",
          explanationEnglish: "Ogbomoso soils are exceptionally highly rated for Cassava development. Climate parameters match optimal limits. Maintain strict herbicide or manual clearing regimes during weeks 4 to 6 to prevent nutrient-stealth weeds.",
          actionableAdvice: [
            'Execute early-stage clearing to prevent weeds from stealing key nutrients.',
            'Maintain a crop density of approximately 10,000 stem cuttings per hectare.',
            'Prepare plots with potassium-rich fertilizers to enhance starch deposit sizes.'
          ],
          keyTakeaway: 'Optimal soil characteristics are present; maximize yield potential through meticulous early weeding.'
        };
    }
  } else {
    // Yam
    switch (location) {
      case 'Enugu':
        return {
          intro: 'Model analysis complete. Explanation for Farmer:',
          explanationPidgin: "Enugu get standard fertile soil for Yam! Perfect rain and moisture. Just stake your vines high to catch enough sunlight, and watch the leaves make spear-shaped spots no start to yellow. Chop life, your harvest go soft!",
          explanationEnglish: "Enugu province enjoys extremely rich soil and optimal moisture patterns for premium Yam cultivation. Secure vigorous climbing stakes for the vines to capture optimal sunlight, and monitor foliage for early fungal leaf spot.",
          actionableAdvice: [
            'Build sturdy 3-4 meter stakes to support extensive leaf surface photosynthesis.',
            'Monitor closely for Yam Anthracnose disease during heavy mid-season rains.',
            'Incorporate organic material or wood ash inside the planting pits.'
          ],
          keyTakeaway: 'Highly lucrative harvest season expected; ensure strong structural vine staking is in place.'
        };
      case 'Kaduna':
        return {
          intro: 'Model analysis complete. Explanation for Farmer:',
          explanationPidgin: "Yam for Kaduna need extra care o! The sun dey hot well-well and termites fit chop the tuber under ground. You must mulch the heaps heavily with grass to cool the soil, and treat the seed yams with local organic ash to keep insect away.",
          explanationEnglish: "Northern Yam farming in Kaduna presents heat and insect threats. Excessive heat can roast subterranean seed tubers, while dry soils invite termite destruction. Mulch mounded hills deeply and pre-treat seed yams with ashes.",
          actionableAdvice: [
            'Implement continuous, dense straw mulching over the planting mounds.',
            'Apply wood ash or botanical repellents to seeds to deter termite attack.',
            'Provide supplementary shade cap to protect emerging vine tips from scorching.'
          ],
          keyTakeaway: 'Aggressive mulching and pest deterrence are crucial to harvesting sweet Yams in Kaduna.'
        };
      case 'Ogbomoso':
      default:
        return {
          intro: 'Model analysis complete. Explanation for Farmer:',
          explanationPidgin: "Yam need space and deep rich soils for Ogbomoso. Make your heaps big and high make the yam tubers fit expand well. Apply compost or manure early, and prepare wood sticks for staking before the vines crawl too long.",
          explanationEnglish: "Yam cultivation in Ogbomoso commands large mounds and highly loosened topsoil structure. Design lofty ridges to accommodate unrestricted tuber development. Incorporate cured livestock compost early.",
          actionableAdvice: [
            'Construct prominent, well-intervaled heaps to aid tuber expansion.',
            'Stake early as soon as vines emerge to encourage aerial crown spread.',
            'Mix dry animal-manure compost in holes before planting tubers.'
          ],
          keyTakeaway: 'Loosened deep soil and robust mounding will maximize the volume of harvested tubers.'
        };
    }
  }
}
