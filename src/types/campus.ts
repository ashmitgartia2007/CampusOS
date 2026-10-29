export type Severity = 'critical' | 'warning' | 'info' | 'success';

export interface CampusKPIs {
  totalEnergyKw: number;
  energyChangePct: number;
  waterFlowRateLpm: number;
  waterChangePct: number;
  wasteFillAvgPct: number;
  wasteChangePct: number;
  campusPopulation: number;
  populationCapacityPct: number;
  averageAqi: number;
  aqiStatus: 'Good' | 'Moderate' | 'Unhealthy' | 'Hazardous';
  activeAlertsCount: number;
  solarGenerationKw: number;
  gridImportKw: number;
  carbonOffsetTodayKg: number;
}

export interface Building {
  id: string;
  name: string;
  code: string;
  category: 'Academic' | 'Research' | 'Residential' | 'Administration' | 'Athletics' | 'Student Life';
  floors: number;
  grossAreaSqFt: number;
  currentOccupancy: number;
  maxCapacity: number;
  energyUsageKw: number;
  waterDrawLpm: number;
  indoorTempC: number;
  co2Ppm: number;
  aqi: number;
  energyStarScore: number;
  status: 'optimal' | 'warning' | 'alert' | 'offline';
  zone: 'North Tech Quad' | 'Central Arts & Science' | 'South Residential' | 'East Athletics';
  criticalAlerts: number;
  hvacStatus: 'Heating' | 'Cooling' | 'Eco Standby' | 'Optimized';
}

export interface Room {
  id: string;
  buildingId: string;
  buildingName: string;
  roomNumber: string;
  name: string;
  type: 'Lecture Hall' | 'Computer Lab' | 'Bio-Chemistry Lab' | 'Robotics Lab' | 'Seminar Room' | 'Faculty Office' | 'Server Room';
  floor: number;
  capacity: number;
  currentOccupancy: number;
  temperatureC: number;
  targetTempC: number;
  humidityPct: number;
  co2Ppm: number;
  luxLevel: number;
  lightingState: boolean;
  hvacMode: 'Eco' | 'Comfort' | 'Boost' | 'Off';
  scheduleStatus: 'Occupied (Class in session)' | 'Reserved' | 'Available' | 'Maintenance Locked';
  activeEvent?: string;
  airQualityStatus: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

export interface EnergyData {
  summary: {
    realtimeDemandKw: number;
    solarPVKw: number;
    bessStorageKw: number; // Battery storage discharge/charge
    bessSocPct: number; // State of Charge
    gridImportKw: number;
    powerFactor: number;
    dailyConsumptionKwh: number;
    estimatedCostTodayUsd: number;
    peakDemandThresholdKw: number;
    carbonAvoidedKg: number;
  };
  breakdown: {
    name: string;
    value: number; // percentage
    kw: number;
    color: string;
  }[];
  hourlyTrend: {
    time: string;
    actualKw: number;
    baselineKw: number;
    solarKw: number;
    predictedKw: number;
  }[];
  zoneComparison: {
    zone: string;
    currentKw: number;
    budgetKw: number;
    efficiencyScore: number;
  }[];
}

export interface WaterData {
  summary: {
    totalFlowLpm: number;
    dailyUsageLiters: number;
    rainwaterHarvestedL: number;
    rainwaterCapacityPct: number;
    greywaterTreatedL: number;
    reservoirLevelPct: number;
    activeLeaksDetected: number;
    nonRevenueWaterPct: number;
  };
  hourlyFlow: {
    time: string;
    academicFlow: number;
    residentialFlow: number;
    irrigationFlow: number;
    recycledFlow: number;
  }[];
  reservoirs: {
    id: string;
    name: string;
    capacityLiters: number;
    currentLiters: number;
    status: 'Normal' | 'Refilling' | 'Low Reserve';
    purityIndex: number;
  }[];
  leakAlerts: {
    id: string;
    location: string;
    flowLossLph: number;
    acousticConfidence: number;
    detectedAt: string;
    status: 'Investigating' | 'Dispatched' | 'Isolated';
  }[];
}

export interface WasteData {
  summary: {
    totalBins: number;
    binsRequiringPickup: number;
    avgFillPct: number;
    monthlyDiversionRatePct: number;
    compostDivertedKg: number;
    recyclingKg: number;
    landfillKg: number;
    eWasteRecycledKg: number;
  };
  binClusters: {
    id: string;
    location: string;
    zone: string;
    compostFillPct: number;
    recyclingFillPct: number;
    landfillFillPct: number;
    lastEmptied: string;
    status: 'Normal' | 'Attention' | 'Overflow Risk';
  }[];
  streamBreakdown: {
    stream: string;
    weightTons: number;
    percentage: number;
    color: string;
  }[];
  routeOptimization: {
    suggestedTruckStops: number;
    estTravelKm: number;
    fuelSavedLiters: number;
    co2SavedKg: number;
    status: 'Ready to Dispatch' | 'Route Active' | 'Completed';
  };
}

export interface EnvironmentData {
  campusAqi: number;
  primaryPollutant: string;
  ambientTempC: number;
  humidityPct: number;
  windSpeedKmh: number;
  uvIndex: number;
  noiseLevelDb: number;
  solarIrradianceWm2: number;
  sensorNodes: {
    id: string;
    name: string;
    zone: string;
    aqi: number;
    pm25: number;
    pm10: number;
    co2: number;
    temp: number;
    humidity: number;
    noiseDb: number;
    status: 'Healthy' | 'Moderate' | 'Alert';
  }[];
  aqiHistory24h: {
    time: string;
    northQuad: number;
    centralPlaza: number;
    botanicalGarden: number;
    parkingEast: number;
  }[];
}

export interface MaintenanceOrder {
  id: string;
  ticketNumber: string;
  title: string;
  assetId: string;
  assetName: string;
  building: string;
  floor: string;
  severity: 'P1-Critical' | 'P2-High' | 'P3-Normal' | 'P4-Low';
  category: 'HVAC' | 'Electrical' | 'Plumbing' | 'Elevator' | 'IoT Sensor' | 'Structural';
  assignedTo: string;
  createdAt: string;
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Scheduled' | 'Resolved';
  isPredictive: boolean;
  rulDays?: number; // Remaining Useful Life
  failureRiskPct?: number;
  notes: string;
}

export interface MLModelRecord {
  id: string;
  name: string;
  version: string;
  framework: string;
  algorithm: string;
  targetTask: string;
  lastTrained: string;
  metrics: {
    primaryMetric: string;
    primaryValue: number;
    secondaryMetric: string;
    secondaryValue: number;
  };
  status: 'Production' | 'Staging' | 'Retraining Required';
  datasetSamples: number;
  featuresCount: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  severity: Severity;
  category: 'Energy' | 'Water' | 'HVAC' | 'Environment' | 'Security';
  isRead: boolean;
  actionUrl?: string;
}

export interface SystemSettings {
  campusName: string;
  iotGatewayStatus: 'Connected' | 'Degraded' | 'Offline';
  fastApiBackendUrl: string;
  postgresDbUrl: string;
  websocketTelemetryUrl: string;
  simulatedDataFallback: boolean;
  maxPeakDemandKw: number;
  co2WarningThresholdPpm: number;
  waterLeakThresholdLph: number;
  autoHvacEcoSetback: boolean;
  emailAlertsEnabled: boolean;
  smsEmergencyEnabled: boolean;
  activeTheme: 'light' | 'dark' | 'system';
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'operator' | 'viewer';
}
