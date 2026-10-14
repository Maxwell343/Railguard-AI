import { InspectionRecord } from '../types/inspection';

export const SAMPLE_INSPECTIONS: InspectionRecord[] = [
  {
    id: 'INS-2026-0881',
    title: 'High-Speed Northern Line — KM 142+250 Track Surface Scan',
    timestamp: '2026-10-14 08:42 UTC',
    trackMeta: {
      lineId: 'LINE-NORTH-01',
      lineName: 'Northern Freight & Passenger Trunk Corridor',
      chainageKm: 'KM 142+250',
      trackType: 'Main Line',
      railProfile: '60E1 (UIC 60)',
      sleeperType: 'Pre-stressed Concrete (PSC)',
      inspectorName: 'Eng. R. Vance (Permanent Way Dept.)',
      divisionCode: 'DIV-NORTH-04',
      inspectionDate: '2026-10-14',
    },
    imageUrl:
      'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=1400&q=80',
    imageDimensions: {
      width: 1400,
      height: 933,
    },
    inferenceTimeMs: 42.8,
    modelConfidenceCutoff: 0.45,
    summarySeverity: 'critical',
    status: 'action_required',
    notes:
      'High-dynamic load zone near curve transition. Confirmed visual indentations matching classic Squat profile on inner rail head.',
    predictions: [
      {
        id: 'pred-001',
        defectClass: 'squat',
        confidence: 0.93,
        bbox: {
          x: 0.36,
          y: 0.48,
          width: 0.22,
          height: 0.16,
        },
        severity: 'critical',
        estimatedAreaMm2: 840,
        depthEstimateMm: 3.8,
        recommendedAction:
          'Impose immediate 50 km/h Temporary Speed Restriction (TSR). Schedule emergency ultrasonic probe depth validation within 24h.',
        technicalDescription:
          'Characteristic localized depression with dark crescent-shaped surface fissure along running band. High risk of vertical transverse fracture under axle shock.',
        uicCode: 'UIC 712 R / 227',
        speedRestrictionKmh: 50,
      },
      {
        id: 'pred-002',
        defectClass: 'spalling',
        confidence: 0.81,
        bbox: {
          x: 0.62,
          y: 0.58,
          width: 0.18,
          height: 0.14,
        },
        severity: 'medium',
        estimatedAreaMm2: 410,
        depthEstimateMm: 1.2,
        recommendedAction:
          'Schedule rail grinder machine pass (target removal 1.0 mm) within regular 14-day maintenance window.',
        technicalDescription:
          'Gauge corner flaking slivers detected along high rail. Surface micro-cracks coalesce without sub-surface branching yet.',
        uicCode: 'UIC 712 R / 221',
      },
    ],
  },
  {
    id: 'INS-2026-0879',
    title: 'Western Freight Yard Junction — KM 019+400 Turnout Lead',
    timestamp: '2026-10-13 14:15 UTC',
    trackMeta: {
      lineId: 'LINE-WEST-FREIGHT',
      lineName: 'Heavy Haul Coal & Ore Dedicated Line',
      chainageKm: 'KM 019+400',
      trackType: 'Heavy Haul',
      railProfile: '60 kg/m',
      sleeperType: 'Pre-stressed Concrete (PSC)',
      inspectorName: 'Chief Inspector M. Chen',
      divisionCode: 'DIV-WEST-02',
      inspectionDate: '2026-10-13',
    },
    imageUrl:
      'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1400&q=80',
    imageDimensions: {
      width: 1400,
      height: 933,
    },
    inferenceTimeMs: 38.4,
    modelConfidenceCutoff: 0.45,
    summarySeverity: 'high',
    status: 'action_required',
    notes:
      'Starting section on 1:80 upgrade gradient where heavy locomotives experience tractive friction slippage.',
    predictions: [
      {
        id: 'pred-003',
        defectClass: 'wheel_burn',
        confidence: 0.89,
        bbox: {
          x: 0.44,
          y: 0.42,
          width: 0.24,
          height: 0.18,
        },
        severity: 'high',
        estimatedAreaMm2: 620,
        depthEstimateMm: 1.8,
        recommendedAction:
          'Perform ultrasonic non-destructive examination. Polish/rebuild thermally martensitic zone before next freight passage.',
        technicalDescription:
          'Hardened martensitic crust with thermal micro-checking visible on rail crown. Surface exhibits glazed slippage footprint.',
        uicCode: 'UIC 712 R / 225',
      },
    ],
  },
  {
    id: 'INS-2026-0875',
    title: 'Eastern Suburban Corridor — KM 064+800 Curve Outer Rail',
    timestamp: '2026-10-12 11:30 UTC',
    trackMeta: {
      lineId: 'LINE-EAST-SUBURBAN',
      lineName: 'Commuter Express Mainline',
      chainageKm: 'KM 064+800',
      trackType: 'Main Line',
      railProfile: '54E1 (UIC 54)',
      sleeperType: 'Pre-stressed Concrete (PSC)',
      inspectorName: 'Track Master H. Lindqvist',
      divisionCode: 'DIV-EAST-01',
      inspectionDate: '2026-10-12',
    },
    imageUrl:
      'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1400&q=80',
    imageDimensions: {
      width: 1400,
      height: 933,
    },
    inferenceTimeMs: 41.1,
    modelConfidenceCutoff: 0.45,
    summarySeverity: 'medium',
    status: 'verified',
    notes:
      'Regular cyclic inspection. Moderate gauge corner fatigue slivers on 800m radius curve.',
    predictions: [
      {
        id: 'pred-004',
        defectClass: 'spalling',
        confidence: 0.78,
        bbox: {
          x: 0.32,
          y: 0.52,
          width: 0.28,
          height: 0.14,
        },
        severity: 'medium',
        estimatedAreaMm2: 380,
        depthEstimateMm: 0.9,
        recommendedAction:
          'Monitor during weekly patrol. Include in upcoming bi-monthly rail grinding campaign.',
        technicalDescription:
          'Early-stage spalling at gauge corner. Individual metal loss pits under 1.0mm depth.',
        uicCode: 'UIC 712 R / 221',
      },
    ],
  },
  {
    id: 'INS-2026-0870',
    title: 'Southern Coastal Spur — KM 012+100 Tangent Track',
    timestamp: '2026-10-11 16:05 UTC',
    trackMeta: {
      lineId: 'LINE-SOUTH-COASTAL',
      lineName: 'Coastal Freight Siding & Port Connection',
      chainageKm: 'KM 012+100',
      trackType: 'Branch',
      railProfile: '52 kg/m',
      sleeperType: 'Steel Trough',
      inspectorName: 'Track Inspector S. O’Connor',
      divisionCode: 'DIV-SOUTH-03',
      inspectionDate: '2026-10-11',
    },
    imageUrl:
      'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1400&q=80',
    imageDimensions: {
      width: 1400,
      height: 933,
    },
    inferenceTimeMs: 36.9,
    modelConfidenceCutoff: 0.45,
    summarySeverity: 'none',
    status: 'verified',
    notes:
      'Newly ground rail section. Running crown shows smooth contact band with zero detected fatigue or thermal defects.',
    predictions: [],
  },
];
