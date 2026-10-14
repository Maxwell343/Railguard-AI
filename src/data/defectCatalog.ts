import { DefectClass, DefectClassInfo } from '../types/inspection';

export const DEFECT_CATALOG: Record<DefectClass, DefectClassInfo> = {
  spalling: {
    id: 'spalling',
    displayName: 'Spalling / Flaking',
    uicReference: 'UIC 712 R / Code 221',
    accentColor: '#D9653B', // Restrained Signal Orange
    description:
      'Progressive surface flaking and detachment of metallic slivers from the gauge corner or running band, caused by severe Rolling Contact Fatigue (RCF) and micro-crack coalescence under repeated high contact stress.',
    rootCauses: [
      'Cyclic shear stress exceeding rail steel yield limit',
      'Inadequate rail grinding profile maintenance',
      'High axle loads on tight-radius curved tracks',
      'Decarburized outer rail surface zone',
    ],
    riskFactor:
      'High risk of accelerating into deep head cracks or horizontal sub-surface delamination if not reprofiled.',
    standardRemedy:
      'Perform corrective rail grinding (depth 0.8–1.5 mm). If crack depth exceeds 2.5 mm, plan replacement rail section.',
  },
  wheel_burn: {
    id: 'wheel_burn',
    displayName: 'Wheel Burn / Slip Damage',
    uicReference: 'UIC 712 R / Code 225',
    accentColor: '#C88528', // Industrial Amber
    description:
      'Localized thermal alteration on the rail running surface caused by locomotive driving wheel slipping under high tractive effort, creating a brittle martensitic surface layer prone to cracking.',
    rootCauses: [
      'Locomotive tractive slip on steep gradients or wet rails',
      'Improper adhesion control or sudden power notches',
      'Station departure starting resistance under heavy freight trains',
    ],
    riskFactor:
      'Thermal shock fractures readily initiate transverse cracks under impact of trailing wheelsets.',
    standardRemedy:
      'Ultrasonic flaw detection scan within 48h. Minor burns ground smooth; deep thermal depressions (>1.2 mm) require weld deposit buildup or rail insert plug.',
  },
  squat: {
    id: 'squat',
    displayName: 'Squat Defect',
    uicReference: 'UIC 712 R / Code 227',
    accentColor: '#B83227', // Railway Deep Red
    description:
      'Subsurface crack propagation along the running band accompanied by local plastic depression, widening of the wheel-rail contact path, and distinct crescent-shaped surface indentation.',
    rootCauses: [
      'Rolling contact fatigue crack initiation at white etching layers (WEL)',
      'Subsurface shear yielding at 3–5 mm depth under dynamic impact',
      'Corrugation crest stress concentrations',
    ],
    riskFactor:
      'CRITICAL: High probability of abrupt transverse rail fracture under cold weather or heavy axle dynamic loading.',
    standardRemedy:
      'Immediate 50 km/h temporary speed restriction (TSR). Schedule emergency ultrasonic depth scan. Replace affected rail segment with thermite weld closure within 7 days.',
  },
};
