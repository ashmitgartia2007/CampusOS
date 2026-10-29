import {
  CampusKPIs,
  Building,
  Room,
  EnergyData,
  WaterData,
  WasteData,
  EnvironmentData,
  MaintenanceOrder,
  MLModelRecord,
  NotificationItem,
  SystemSettings
} from '@/types/campus';

export const mockCampusKPIs: CampusKPIs = {
  totalEnergyKw: 1428.5,
  energyChangePct: -4.2,
  waterFlowRateLpm: 184.2,
  waterChangePct: 1.8,
  wasteFillAvgPct: 58.4,
  wasteChangePct: -6.5,
  campusPopulation: 8420,
  populationCapacityPct: 76.5,
  averageAqi: 38,
  aqiStatus: 'Good',
  activeAlertsCount: 3,
  solarGenerationKw: 485.0,
  gridImportKw: 943.5,
  carbonOffsetTodayKg: 1820.4
};

export const mockBuildings: Building[] = [
  {
    id: 'b-eng',
    name: 'Ada Lovelace Engineering Complex',
    code: 'ENG-A',
    category: 'Academic',
    floors: 5,
    grossAreaSqFt: 185000,
    currentOccupancy: 1840,
    maxCapacity: 2400,
    energyUsageKw: 412.8,
    waterDrawLpm: 46.2,
    indoorTempC: 22.4,
    co2Ppm: 680,
    aqi: 32,
    energyStarScore: 91,
    status: 'optimal',
    zone: 'North Tech Quad',
    criticalAlerts: 0,
    hvacStatus: 'Optimized'
  },
  {
    id: 'b-sci',
    name: 'Curie Science & Biotechnology Wing',
    code: 'SCI-B',
    category: 'Research',
    floors: 4,
    grossAreaSqFt: 142000,
    currentOccupancy: 890,
    maxCapacity: 1200,
    energyUsageKw: 375.4,
    waterDrawLpm: 58.7,
    indoorTempC: 21.8,
    co2Ppm: 820,
    aqi: 41,
    energyStarScore: 84,
    status: 'warning',
    zone: 'North Tech Quad',
    criticalAlerts: 1,
    hvacStatus: 'Cooling'
  },
  {
    id: 'b-lib',
    name: 'Alexandria Central Library & Learning Hub',
    code: 'LIB-C',
    category: 'Academic',
    floors: 6,
    grossAreaSqFt: 210000,
    currentOccupancy: 2150,
    maxCapacity: 2800,
    energyUsageKw: 248.6,
    waterDrawLpm: 24.1,
    indoorTempC: 22.1,
    co2Ppm: 710,
    aqi: 29,
    energyStarScore: 94,
    status: 'optimal',
    zone: 'Central Arts & Science',
    criticalAlerts: 0,
    hvacStatus: 'Optimized'
  },
  {
    id: 'b-stu',
    name: 'Turing Student Union & Innovation Commons',
    code: 'STU-D',
    category: 'Student Life',
    floors: 3,
    grossAreaSqFt: 98000,
    currentOccupancy: 1420,
    maxCapacity: 1900,
    energyUsageKw: 168.3,
    waterDrawLpm: 38.5,
    indoorTempC: 23.0,
    co2Ppm: 895,
    aqi: 44,
    energyStarScore: 88,
    status: 'optimal',
    zone: 'Central Arts & Science',
    criticalAlerts: 0,
    hvacStatus: 'Cooling'
  },
  {
    id: 'b-res-e',
    name: 'Hawking East Residential Quad',
    code: 'RES-E',
    category: 'Residential',
    floors: 8,
    grossAreaSqFt: 230000,
    currentOccupancy: 1120,
    maxCapacity: 1400,
    energyUsageKw: 135.2,
    waterDrawLpm: 68.4,
    indoorTempC: 22.8,
    co2Ppm: 640,
    aqi: 35,
    energyStarScore: 82,
    status: 'alert',
    zone: 'South Residential',
    criticalAlerts: 2,
    hvacStatus: 'Heating'
  },
  {
    id: 'b-adm',
    name: 'Founders Administrative Tower',
    code: 'ADM-F',
    category: 'Administration',
    floors: 7,
    grossAreaSqFt: 88000,
    currentOccupancy: 480,
    maxCapacity: 750,
    energyUsageKw: 88.2,
    waterDrawLpm: 12.3,
    indoorTempC: 22.0,
    co2Ppm: 590,
    aqi: 28,
    energyStarScore: 96,
    status: 'optimal',
    zone: 'Central Arts & Science',
    criticalAlerts: 0,
    hvacStatus: 'Optimized'
  }
];

export const mockRooms: Room[] = [
  {
    id: 'r-101',
    buildingId: 'b-eng',
    buildingName: 'Engineering Complex',
    roomNumber: 'ENG-101',
    name: 'Alan Turing Grand Auditorium',
    type: 'Lecture Hall',
    floor: 1,
    capacity: 350,
    currentOccupancy: 295,
    temperatureC: 22.1,
    targetTempC: 22.0,
    humidityPct: 44,
    co2Ppm: 840,
    luxLevel: 480,
    lightingState: true,
    hvacMode: 'Comfort',
    scheduleStatus: 'Occupied (Class in session)',
    activeEvent: 'CS301: Machine Learning Systems',
    airQualityStatus: 'Good'
  },
  {
    id: 'r-204',
    buildingId: 'b-eng',
    buildingName: 'Engineering Complex',
    roomNumber: 'ENG-204',
    name: 'Autonomous Robotics Simulation Lab',
    type: 'Robotics Lab',
    floor: 2,
    capacity: 40,
    currentOccupancy: 32,
    temperatureC: 21.4,
    targetTempC: 21.0,
    humidityPct: 41,
    co2Ppm: 620,
    luxLevel: 650,
    lightingState: true,
    hvacMode: 'Boost',
    scheduleStatus: 'Occupied (Class in session)',
    activeEvent: 'Robotics Capstone Sprint',
    airQualityStatus: 'Excellent'
  },
  {
    id: 'r-310',
    buildingId: 'b-eng',
    buildingName: 'Engineering Complex',
    roomNumber: 'ENG-310',
    name: 'Quantum Architecture Compute Cluster',
    type: 'Server Room',
    floor: 3,
    capacity: 10,
    currentOccupancy: 2,
    temperatureC: 19.2,
    targetTempC: 19.0,
    humidityPct: 38,
    co2Ppm: 460,
    luxLevel: 220,
    lightingState: true,
    hvacMode: 'Boost',
    scheduleStatus: 'Occupied (Class in session)',
    activeEvent: 'HPC Node Maintenance',
    airQualityStatus: 'Excellent'
  },
  {
    id: 'r-sci-102',
    buildingId: 'b-sci',
    buildingName: 'Science & Biotech Wing',
    roomNumber: 'SCI-102',
    name: 'Molecular Genomics Cleanroom',
    type: 'Bio-Chemistry Lab',
    floor: 1,
    capacity: 30,
    currentOccupancy: 18,
    temperatureC: 20.5,
    targetTempC: 20.5,
    humidityPct: 45,
    co2Ppm: 580,
    luxLevel: 550,
    lightingState: true,
    hvacMode: 'Comfort',
    scheduleStatus: 'Occupied (Class in session)',
    activeEvent: 'Bio-Informatics Postdoc Research',
    airQualityStatus: 'Excellent'
  },
  {
    id: 'r-lib-201',
    buildingId: 'b-lib',
    buildingName: 'Central Library',
    roomNumber: 'LIB-201',
    name: 'Silent Collaborative Commons',
    type: 'Seminar Room',
    floor: 2,
    capacity: 120,
    currentOccupancy: 88,
    temperatureC: 22.8,
    targetTempC: 22.5,
    humidityPct: 46,
    co2Ppm: 760,
    luxLevel: 420,
    lightingState: true,
    hvacMode: 'Eco',
    scheduleStatus: 'Available',
    activeEvent: 'Open Quiet Study Session',
    airQualityStatus: 'Good'
  },
  {
    id: 'r-stu-305',
    buildingId: 'b-stu',
    buildingName: 'Student Union',
    roomNumber: 'STU-305',
    name: 'Student Senate Council Chamber',
    type: 'Lecture Hall',
    floor: 3,
    capacity: 80,
    currentOccupancy: 0,
    temperatureC: 23.5,
    targetTempC: 24.0,
    humidityPct: 49,
    co2Ppm: 490,
    luxLevel: 100,
    lightingState: false,
    hvacMode: 'Eco',
    scheduleStatus: 'Available',
    airQualityStatus: 'Good'
  }
];

export const mockEnergyData: EnergyData = {
  summary: {
    realtimeDemandKw: 1428.5,
    solarPVKw: 485.0,
    bessStorageKw: 120.0,
    bessSocPct: 84.5,
    gridImportKw: 823.5,
    powerFactor: 0.98,
    dailyConsumptionKwh: 24680,
    estimatedCostTodayUsd: 3120.50,
    peakDemandThresholdKw: 1750.0,
    carbonAvoidedKg: 1820.4
  },
  breakdown: [
    { name: 'HVAC & Chillers', value: 44, kw: 628.5, color: '#38bdf8' },
    { name: 'Computing & Labs', value: 26, kw: 371.4, color: '#818cf8' },
    { name: 'Interior & Exterior Lighting', value: 14, kw: 200.0, color: '#f59e0b' },
    { name: 'Dining, Kitchens & Pumps', value: 16, kw: 228.6, color: '#10b981' }
  ],
  hourlyTrend: [
    { time: '00:00', actualKw: 680, baselineKw: 720, solarKw: 0, predictedKw: 675 },
    { time: '03:00', actualKw: 620, baselineKw: 650, solarKw: 0, predictedKw: 615 },
    { time: '06:00', actualKw: 790, baselineKw: 830, solarKw: 45, predictedKw: 780 },
    { time: '09:00', actualKw: 1350, baselineKw: 1420, solarKw: 310, predictedKw: 1340 },
    { time: '12:00', actualKw: 1680, baselineKw: 1750, solarKw: 495, predictedKw: 1660 },
    { time: '15:00', actualKw: 1520, baselineKw: 1600, solarKw: 410, predictedKw: 1540 },
    { time: '18:00', actualKw: 1180, baselineKw: 1240, solarKw: 110, predictedKw: 1190 },
    { time: '21:00', actualKw: 890, baselineKw: 940, solarKw: 0, predictedKw: 885 }
  ],
  zoneComparison: [
    { zone: 'North Tech Quad', currentKw: 788.2, budgetKw: 850.0, efficiencyScore: 92 },
    { zone: 'Central Arts & Science', currentKw: 416.9, budgetKw: 460.0, efficiencyScore: 89 },
    { zone: 'South Residential', currentKw: 135.2, budgetKw: 150.0, efficiencyScore: 94 },
    { zone: 'East Athletics & Utilities', currentKw: 88.2, budgetKw: 95.0, efficiencyScore: 87 }
  ]
};

export const mockWaterData: WaterData = {
  summary: {
    totalFlowLpm: 184.2,
    dailyUsageLiters: 164200,
    rainwaterHarvestedL: 48600,
    rainwaterCapacityPct: 78.4,
    greywaterTreatedL: 38200,
    reservoirLevelPct: 82.6,
    activeLeaksDetected: 1,
    nonRevenueWaterPct: 3.2
  },
  hourlyFlow: [
    { time: '00:00', academicFlow: 8, residentialFlow: 24, irrigationFlow: 0, recycledFlow: 12 },
    { time: '04:00', academicFlow: 6, residentialFlow: 18, irrigationFlow: 35, recycledFlow: 30 },
    { time: '08:00', academicFlow: 64, residentialFlow: 82, irrigationFlow: 0, recycledFlow: 22 },
    { time: '12:00', academicFlow: 78, residentialFlow: 54, irrigationFlow: 0, recycledFlow: 36 },
    { time: '16:00', academicFlow: 70, residentialFlow: 60, irrigationFlow: 0, recycledFlow: 28 },
    { time: '20:00', academicFlow: 28, residentialFlow: 88, irrigationFlow: 20, recycledFlow: 25 }
  ],
  reservoirs: [
    {
      id: 'res-main',
      name: 'Central Campus Deep Aquifer Storage',
      capacityLiters: 500000,
      currentLiters: 415000,
      status: 'Normal',
      purityIndex: 98.4
    },
    {
      id: 'res-rain',
      name: 'North Quad Rainwater Harvesting Vault',
      capacityLiters: 150000,
      currentLiters: 118000,
      status: 'Refilling',
      purityIndex: 94.2
    },
    {
      id: 'res-grey',
      name: 'Eco-Park Greywater Bio-Retention Cell',
      capacityLiters: 100000,
      currentLiters: 68000,
      status: 'Normal',
      purityIndex: 89.1
    }
  ],
  leakAlerts: [
    {
      id: 'leak-104',
      location: 'Hawking East Quad — Sub-Basement Lateral B',
      flowLossLph: 145,
      acousticConfidence: 0.94,
      detectedAt: '28 mins ago',
      status: 'Investigating'
    }
  ]
};

export const mockWasteData: WasteData = {
  summary: {
    totalBins: 142,
    binsRequiringPickup: 8,
    avgFillPct: 58.4,
    monthlyDiversionRatePct: 72.8,
    compostDivertedKg: 12840,
    recyclingKg: 18450,
    landfillKg: 11900,
    eWasteRecycledKg: 2450
  },
  binClusters: [
    {
      id: 'bin-c1',
      location: 'Student Union Plaza Entrance',
      zone: 'Central Plaza',
      compostFillPct: 78,
      recyclingFillPct: 88,
      landfillFillPct: 62,
      lastEmptied: '4 hours ago',
      status: 'Attention'
    },
    {
      id: 'bin-c2',
      location: 'Engineering Atrium East',
      zone: 'North Quad',
      compostFillPct: 45,
      recyclingFillPct: 60,
      landfillFillPct: 40,
      lastEmptied: '2 hours ago',
      status: 'Normal'
    },
    {
      id: 'bin-c3',
      location: 'Library Food & Beverage Courtyard',
      zone: 'Central Quad',
      compostFillPct: 86,
      recyclingFillPct: 92,
      landfillFillPct: 75,
      lastEmptied: '6 hours ago',
      status: 'Overflow Risk'
    },
    {
      id: 'bin-c4',
      location: 'Dining Hall Delivery Bay',
      zone: 'South Residential',
      compostFillPct: 82,
      recyclingFillPct: 70,
      landfillFillPct: 65,
      lastEmptied: '3 hours ago',
      status: 'Attention'
    }
  ],
  streamBreakdown: [
    { stream: 'Compost & Organic', weightTons: 12.8, percentage: 31, color: '#10b981' },
    { stream: 'Paper & Cardboard', weightTons: 10.4, percentage: 25, color: '#38bdf8' },
    { stream: 'Plastics & Metals', weightTons: 8.2, percentage: 20, color: '#818cf8' },
    { stream: 'General Landfill', weightTons: 9.8, percentage: 24, color: '#94a3b8' }
  ],
  routeOptimization: {
    suggestedTruckStops: 8,
    estTravelKm: 4.2,
    fuelSavedLiters: 18.5,
    co2SavedKg: 49.2,
    status: 'Ready to Dispatch'
  }
};

export const mockEnvironmentData: EnvironmentData = {
  campusAqi: 38,
  primaryPollutant: 'PM2.5 (9.2 µg/m³)',
  ambientTempC: 23.4,
  humidityPct: 48,
  windSpeedKmh: 14.5,
  uvIndex: 5.2,
  noiseLevelDb: 46.8,
  solarIrradianceWm2: 685,
  sensorNodes: [
    {
      id: 'env-1',
      name: 'North Quad Research Pavilion',
      zone: 'North Tech Quad',
      aqi: 32,
      pm25: 7.8,
      pm10: 16.2,
      co2: 440,
      temp: 22.8,
      humidity: 46,
      noiseDb: 42.1,
      status: 'Healthy'
    },
    {
      id: 'env-2',
      name: 'University Botanical Conservation Park',
      zone: 'Eco Zone',
      aqi: 22,
      pm25: 4.5,
      pm10: 11.0,
      co2: 395,
      temp: 21.6,
      humidity: 56,
      noiseDb: 36.4,
      status: 'Healthy'
    },
    {
      id: 'env-3',
      name: 'Central Amphitheater & Plaza',
      zone: 'Central Quad',
      aqi: 44,
      pm25: 11.2,
      pm10: 24.5,
      co2: 510,
      temp: 24.5,
      humidity: 44,
      noiseDb: 58.2,
      status: 'Healthy'
    },
    {
      id: 'env-4',
      name: 'Transit Hub & East Parking Deck',
      zone: 'Perimeter East',
      aqi: 58,
      pm25: 16.4,
      pm10: 38.0,
      co2: 580,
      temp: 25.1,
      humidity: 42,
      noiseDb: 64.5,
      status: 'Moderate'
    }
  ],
  aqiHistory24h: [
    { time: '00:00', northQuad: 28, centralPlaza: 32, botanicalGarden: 20, parkingEast: 38 },
    { time: '04:00', northQuad: 25, centralPlaza: 28, botanicalGarden: 18, parkingEast: 34 },
    { time: '08:00', northQuad: 36, centralPlaza: 46, botanicalGarden: 24, parkingEast: 68 },
    { time: '12:00', northQuad: 34, centralPlaza: 44, botanicalGarden: 22, parkingEast: 58 },
    { time: '16:00', northQuad: 38, centralPlaza: 48, botanicalGarden: 26, parkingEast: 64 },
    { time: '20:00', northQuad: 30, centralPlaza: 36, botanicalGarden: 21, parkingEast: 46 }
  ]
};

export const mockMaintenanceOrders: MaintenanceOrder[] = [
  {
    id: 'mo-8901',
    ticketNumber: 'WO-2026-8901',
    title: 'Chiller Compressor #2 Bearing Vibration Drift',
    assetId: 'CHL-SCI-02',
    assetName: 'York YVAA 250-Ton Variable Speed Screw Chiller',
    building: 'Curie Science & Biotechnology Wing',
    floor: 'Roof Mechanical Plant',
    severity: 'P1-Critical',
    category: 'HVAC',
    assignedTo: 'Carlos Vance (Lead HVAC Specialist)',
    createdAt: 'Today, 08:30 AM',
    dueDate: 'Today, 04:00 PM',
    status: 'In Progress',
    isPredictive: true,
    rulDays: 12,
    failureRiskPct: 88,
    notes: 'Scikit-learn IsolationForest model flagged harmonic 3X peak vibration exceeding ISO 10816 standards.'
  },
  {
    id: 'mo-8902',
    ticketNumber: 'WO-2026-8902',
    title: 'Acoustic Leak Isolation — Lateral Domestic Line B',
    assetId: 'PLM-RES-08',
    assetName: 'Main Potable Water Distribution Manifold',
    building: 'Hawking East Residential Quad',
    floor: 'Sub-Basement B2',
    severity: 'P2-High',
    category: 'Plumbing',
    assignedTo: 'Sarah Lin (Hydraulic Systems Tech)',
    createdAt: 'Today, 09:15 AM',
    dueDate: 'Tomorrow, 12:00 PM',
    status: 'Scheduled',
    isPredictive: true,
    rulDays: 6,
    failureRiskPct: 92,
    notes: 'Smart flow meters detected differential loss of 145 L/hr confirmed by acoustic sensor #AC-81.'
  },
  {
    id: 'mo-8903',
    ticketNumber: 'WO-2026-8903',
    title: 'Cleanroom Fresh Air Damper Actuator Calibrate',
    assetId: 'AHU-SCI-04',
    assetName: 'Air Handling Unit #4 HEPA Filtration Stage',
    building: 'Curie Science & Biotechnology Wing',
    floor: 'Level 1 North',
    severity: 'P3-Normal',
    category: 'HVAC',
    assignedTo: 'Dave Kroll (Building Automation)',
    createdAt: 'Yesterday, 02:40 PM',
    dueDate: 'Oct 31, 2026',
    status: 'Open',
    isPredictive: false,
    notes: 'Damper position feedback loop has 8% offset discrepancy compared to pneumatic control signal.'
  },
  {
    id: 'mo-8904',
    ticketNumber: 'WO-2026-8904',
    title: 'Solar Inverter String 4 MPPT Efficiency Drop',
    assetId: 'SOL-ENG-INV4',
    assetName: 'SMA Sunny Tripower CORE2 110kW Inverter',
    building: 'Ada Lovelace Engineering Complex',
    floor: 'Rooftop Solar Array',
    severity: 'P3-Normal',
    category: 'Electrical',
    assignedTo: 'Elena Rostova (Renewable Power Tech)',
    createdAt: '2 days ago',
    dueDate: 'Nov 02, 2026',
    status: 'In Progress',
    isPredictive: true,
    rulDays: 24,
    failureRiskPct: 64,
    notes: 'String 4 producing 18% lower current under uniform irradiance. Thermal imaging suggested loose MC4 connector.'
  },
  {
    id: 'mo-8905',
    ticketNumber: 'WO-2026-8905',
    title: 'Passenger Elevator #3 Hydraulic Pressure Check',
    assetId: 'ELV-LIB-03',
    assetName: 'Otis Gen2 Geared Passenger Elevator',
    building: 'Alexandria Central Library',
    floor: 'Shaft 3',
    severity: 'P4-Low',
    category: 'Elevator',
    assignedTo: 'Mark Hansen (Otis Certified Contractor)',
    createdAt: '3 days ago',
    dueDate: 'Nov 05, 2026',
    status: 'Resolved',
    isPredictive: false,
    notes: 'Routine quarterly safety audit completed. Valve pressure calibrated to manufacturer spec.'
  }
];

export const mockMLModels: MLModelRecord[] = [
  {
    id: 'ml-01',
    name: 'Campus Grid Load Forecaster',
    version: 'v2.4.1',
    framework: 'Scikit-learn 1.5.2',
    algorithm: 'HistGradientBoostingRegressor',
    targetTask: 'Predict 48h campus electricity demand (kW)',
    lastTrained: '2026-10-27 03:00 UTC',
    metrics: {
      primaryMetric: 'RMSE',
      primaryValue: 14.2,
      secondaryMetric: 'R² Score',
      secondaryValue: 0.948
    },
    status: 'Production',
    datasetSamples: 175200,
    featuresCount: 18
  },
  {
    id: 'ml-02',
    name: 'Chiller Anomaly & Vibration Watcher',
    version: 'v1.8.0',
    framework: 'Scikit-learn 1.5.2',
    algorithm: 'IsolationForest + RobustScaler',
    targetTask: 'Detect mechanical bearing wear & abnormal thermal drift',
    lastTrained: '2026-10-25 12:30 UTC',
    metrics: {
      primaryMetric: 'Precision',
      primaryValue: 0.932,
      secondaryMetric: 'Recall',
      secondaryValue: 0.895
    },
    status: 'Production',
    datasetSamples: 524000,
    featuresCount: 12
  },
  {
    id: 'ml-03',
    name: 'Smart Building Occupancy Estimator',
    version: 'v3.1.2',
    framework: 'Scikit-learn 1.5.2',
    algorithm: 'RandomForestClassifier',
    targetTask: 'Predict room occupancy levels from CO2 + Wi-Fi probe beacons',
    lastTrained: '2026-10-20 08:00 UTC',
    metrics: {
      primaryMetric: 'F1 Score',
      primaryValue: 0.914,
      secondaryMetric: 'Balanced Accuracy',
      secondaryValue: 0.922
    },
    status: 'Production',
    datasetSamples: 89400,
    featuresCount: 14
  },
  {
    id: 'ml-04',
    name: 'Water Distribution Leak Acoustic Classifier',
    version: 'v1.2.0',
    framework: 'Scikit-learn 1.5.2',
    algorithm: 'ExtraTreesClassifier',
    targetTask: 'Classify pipe acoustic spectrum into laminar vs turbulent leak',
    lastTrained: '2026-10-14 21:00 UTC',
    metrics: {
      primaryMetric: 'AUC-ROC',
      primaryValue: 0.965,
      secondaryMetric: 'False Positive Rate',
      secondaryValue: 0.028
    },
    status: 'Staging',
    datasetSamples: 42100,
    featuresCount: 24
  }
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'High Peak Demand Alert',
    description: 'Campus power draw reached 1,428 kW (81.6% of contract threshold). Solar peak offsetting 485 kW.',
    timestamp: '12 mins ago',
    severity: 'warning',
    category: 'Energy',
    isRead: false,
    actionUrl: '/energy'
  },
  {
    id: 'notif-2',
    title: 'Isolation Forest Anomaly Detected',
    description: 'Chiller Unit #2 in Science Wing experiencing bearing harmonic vibration. Work order #8901 generated.',
    timestamp: '35 mins ago',
    severity: 'critical',
    category: 'HVAC',
    isRead: false,
    actionUrl: '/maintenance'
  },
  {
    id: 'notif-3',
    title: 'Smart Waste Overflow Warning',
    description: 'Library Courtyard Bin Cluster recycling bin reached 92% fill. Truck dispatch queued.',
    timestamp: '1 hour ago',
    severity: 'warning',
    category: 'Environment',
    isRead: false,
    actionUrl: '/waste'
  },
  {
    id: 'notif-4',
    title: 'Rainwater Tank Harvest Optimum',
    description: 'North Quad Rainwater Vault reached 78.4% capacity. Treatment pump switching to greywater loop.',
    timestamp: '3 hours ago',
    severity: 'success',
    category: 'Water',
    isRead: true,
    actionUrl: '/water'
  }
];

export const mockSystemSettings: SystemSettings = {
  campusName: 'Metropolitan University of Technology & Innovation',
  iotGatewayStatus: 'Connected',
  fastApiBackendUrl: 'http://localhost:8000/api/v1',
  postgresDbUrl: 'postgresql://campus_admin:***@localhost:5432/campusos_db',
  websocketTelemetryUrl: 'ws://localhost:8000/ws/telemetry',
  simulatedDataFallback: true,
  maxPeakDemandKw: 1750,
  co2WarningThresholdPpm: 1000,
  waterLeakThresholdLph: 100,
  autoHvacEcoSetback: true,
  emailAlertsEnabled: true,
  smsEmergencyEnabled: true,
  activeTheme: 'dark'
};
