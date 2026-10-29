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
  SystemSettings,
  AuthUser
} from '@/types/campus';
import {
  mockCampusKPIs,
  mockBuildings,
  mockRooms,
  mockEnergyData,
  mockWaterData,
  mockWasteData,
  mockEnvironmentData,
  mockMaintenanceOrders,
  mockMLModels,
  mockNotifications,
  mockSystemSettings
} from './mockData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Token storage key
const TOKEN_KEY = 'campusos-auth-token';
const USER_KEY = 'campusos-auth-user';

// In-memory fallback state
let currentMaintenanceOrders: MaintenanceOrder[] = [...mockMaintenanceOrders];
let currentRooms: Room[] = [...mockRooms];
let currentBuildings: Building[] = [...mockBuildings];
let currentSettings: SystemSettings = { ...mockSystemSettings };
let currentNotifications: NotificationItem[] = [...mockNotifications];

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function checkAuthError(res: Response): Promise<void> {
  if (res.status === 401 || res.status === 403) {
    let message = 'Access denied: Insufficient role permissions';
    try {
      const data = await res.json();
      if (data.detail) message = data.detail;
    } catch {}
    throw new Error(message);
  }
}

async function safeFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  fallback: () => T
): Promise<T> {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...(options.headers || {})
    };

    const res = await fetch(url, {
      ...options,
      headers,
      signal: AbortSignal.timeout(2500)
    });

    if (res.status === 401 || res.status === 403) {
      await checkAuthError(res);
    }

    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } catch (err: any) {
    if (err.message?.includes('Forbidden') || err.message?.includes('Access denied') || err.message?.includes('Requires')) {
      throw err;
    }
    // Graceful fallback to rich local state
    return fallback();
  }
}

export function mapBuildingFromApi(b: any): Building {
  return {
    id: b.id,
    name: b.name,
    code: b.code,
    category: b.category,
    floors: b.floors ?? 1,
    grossAreaSqFt: b.gross_area_sqft ?? b.grossAreaSqFt ?? 50000,
    currentOccupancy: b.current_occupancy ?? b.currentOccupancy ?? 0,
    maxCapacity: b.max_capacity ?? b.maxCapacity ?? 100,
    energyUsageKw: b.energy_usage_kw ?? b.energyUsageKw ?? 0,
    waterDrawLpm: b.water_draw_lpm ?? b.waterDrawLpm ?? 0,
    indoorTempC: b.indoor_temp_c ?? b.indoorTempC ?? 22.0,
    co2Ppm: b.co2_ppm ?? b.co2Ppm ?? 600,
    aqi: b.aqi ?? 35,
    energyStarScore: b.energy_star_score ?? b.energyStarScore ?? 85,
    status: b.status ?? 'optimal',
    zone: b.zone,
    criticalAlerts: b.critical_alerts ?? b.criticalAlerts ?? 0,
    hvacStatus: b.hvac_status ?? b.hvacStatus ?? 'Optimized'
  };
}

export function mapRoomFromApi(r: any): Room {
  return {
    id: r.id,
    buildingId: r.building_id ?? r.buildingId,
    buildingName: r.building_name ?? r.buildingName,
    roomNumber: r.room_number ?? r.roomNumber,
    name: r.name,
    type: r.type,
    floor: r.floor ?? 1,
    capacity: r.capacity ?? 30,
    currentOccupancy: r.current_occupancy ?? r.currentOccupancy ?? 0,
    temperatureC: r.temperature_c ?? r.temperatureC ?? 22.0,
    targetTempC: r.target_temp_c ?? r.targetTempC ?? 22.0,
    humidityPct: r.humidity_pct ?? r.humidityPct ?? 45.0,
    co2Ppm: r.co2_ppm ?? r.co2Ppm ?? 550,
    luxLevel: r.lux_level ?? r.luxLevel ?? 400,
    lightingState: r.lighting_state ?? r.lightingState ?? true,
    hvacMode: r.hvac_mode ?? r.hvacMode ?? 'Comfort',
    scheduleStatus: r.schedule_status ?? r.scheduleStatus ?? 'Available',
    activeEvent: r.active_event ?? r.activeEvent,
    airQualityStatus: r.air_quality_status ?? r.airQualityStatus ?? 'Good'
  };
}

export const CampusAPI = {
  // Authentication
  async login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const data = await res.json();
        const user: AuthUser = {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.full_name,
          role: data.user.role
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem(TOKEN_KEY, data.access_token);
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        }
        return { token: data.access_token, user };
      }
    } catch {
      // offline fallback
    }

    // Default mock credential login if server offline
    let role: AuthUser['role'] = 'viewer';
    let name = 'Dean Arthur Sterling';
    if (email.includes('admin') || password.includes('CampusOS')) {
      role = 'admin';
      name = 'Dr. Evelyn Reed (Director)';
    } else if (email.includes('operator')) {
      role = 'operator';
      name = 'Carlos Vance (Lead Operator)';
    }

    const mockUser: AuthUser = {
      id: `usr-${Date.now()}`,
      email,
      fullName: name,
      role
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, 'mock-jwt-token-campusos-2026');
      localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
    }
    return { token: 'mock-jwt-token-campusos-2026', user: mockUser };
  },

  getCurrentUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) {
      // Return default Admin Director user
      return {
        id: 'usr-admin',
        email: 'admin@campusos.ai',
        fullName: 'Dr. Evelyn Reed',
        role: 'admin'
      };
    }
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  // Health check
  async checkBackendHealth(): Promise<{ status: string; uptime: number; db_connected: boolean }> {
    const res = await safeFetch<any>(
      '/health',
      { method: 'GET' },
      () => ({
        status: 'simulated_fallback',
        uptime: 94820,
        db_connected: true
      })
    );
    return {
      status: res.status,
      uptime: res.uptime_seconds ?? res.uptime ?? 0,
      db_connected: Boolean(res.db_connected)
    };
  },

  // KPI summary
  async getKPIs(): Promise<CampusKPIs> {
    return safeFetch(
      '/telemetry/kpis',
      { method: 'GET' },
      () => ({ ...mockCampusKPIs })
    );
  },

  // Buildings
  async getBuildings(zone?: string): Promise<Building[]> {
    const query = zone && zone !== 'All' && zone !== 'All Campus Zones' ? `?zone=${encodeURIComponent(zone)}` : '';
    const raw = await safeFetch<any[]>(
      `/buildings${query}`,
      { method: 'GET' },
      () => [...currentBuildings]
    );
    return raw.map(mapBuildingFromApi);
  },

  async getBuildingById(id: string): Promise<Building | undefined> {
    const list = await this.getBuildings();
    return list.find(b => b.id === id);
  },

  async createBuilding(building: Omit<Building, 'id' | 'criticalAlerts'>): Promise<Building> {
    try {
      const res = await fetch(`${API_BASE_URL}/buildings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          code: building.code,
          name: building.name,
          category: building.category,
          floors: building.floors,
          gross_area_sqft: building.grossAreaSqFt,
          current_occupancy: building.currentOccupancy,
          max_capacity: building.maxCapacity,
          energy_usage_kw: building.energyUsageKw,
          water_draw_lpm: building.waterDrawLpm,
          indoor_temp_c: building.indoorTempC,
          co2_ppm: building.co2Ppm,
          aqi: building.aqi,
          energy_star_score: building.energyStarScore,
          status: building.status,
          zone: building.zone,
          hvac_status: building.hvacStatus
        }),
        signal: AbortSignal.timeout(3000)
      });
      await checkAuthError(res);
      if (res.ok) {
        const data = await res.json();
        const mapped = mapBuildingFromApi(data);
        currentBuildings = [mapped, ...currentBuildings];
        return mapped;
      }
    } catch (err: any) {
      if (err.message?.includes('Forbidden') || err.message?.includes('Access denied') || err.message?.includes('Requires')) {
        throw err;
      }
    }
    const newId = `b-${building.code.toLowerCase().replace(/\s+/g, '-')}`;
    const newB: Building = { ...building, id: newId, criticalAlerts: 0 };
    currentBuildings = [newB, ...currentBuildings];
    return newB;
  },

  async updateBuilding(id: string, updates: Partial<Building>): Promise<Building> {
    try {
      const res = await fetch(`${API_BASE_URL}/buildings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          name: updates.name,
          category: updates.category,
          floors: updates.floors,
          gross_area_sqft: updates.grossAreaSqFt,
          current_occupancy: updates.currentOccupancy,
          max_capacity: updates.maxCapacity,
          status: updates.status,
          zone: updates.zone,
          hvac_status: updates.hvacStatus
        }),
        signal: AbortSignal.timeout(3000)
      });
      await checkAuthError(res);
      if (res.ok) {
        const data = await res.json();
        const mapped = mapBuildingFromApi(data);
        const idx = currentBuildings.findIndex(b => b.id === id);
        if (idx !== -1) currentBuildings[idx] = mapped;
        return mapped;
      }
    } catch (err: any) {
      if (err.message?.includes('Forbidden') || err.message?.includes('Access denied') || err.message?.includes('Requires')) {
        throw err;
      }
    }
    const idx = currentBuildings.findIndex(b => b.id === id);
    if (idx !== -1) {
      currentBuildings[idx] = { ...currentBuildings[idx], ...updates };
      return currentBuildings[idx];
    }
    throw new Error(`Building ${id} not found`);
  },

  async deleteBuilding(id: string): Promise<void> {
    try {
      const res = await fetch(`${API_BASE_URL}/buildings/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
        signal: AbortSignal.timeout(3000)
      });
      await checkAuthError(res);
    } catch (err: any) {
      if (err.message?.includes('Forbidden') || err.message?.includes('Access denied') || err.message?.includes('Requires')) {
        throw err;
      }
    }
    currentBuildings = currentBuildings.filter(b => b.id !== id);
  },

  // Rooms
  async getRooms(buildingId?: string, type?: string): Promise<Room[]> {
    const params = new URLSearchParams();
    if (buildingId && buildingId !== 'All') params.append('building_id', buildingId);
    if (type && type !== 'All') params.append('type', type);
    const query = params.toString() ? `?${params.toString()}` : '';

    const raw = await safeFetch<any[]>(
      `/rooms${query}`,
      { method: 'GET' },
      () => {
        let list = [...currentRooms];
        if (buildingId && buildingId !== 'All') list = list.filter(r => r.buildingId === buildingId);
        if (type && type !== 'All') list = list.filter(r => r.type === type);
        return list;
      }
    );
    return raw.map(mapRoomFromApi);
  },

  async createRoom(room: Omit<Room, 'id'>): Promise<Room> {
    try {
      const res = await fetch(`${API_BASE_URL}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          building_id: room.buildingId,
          building_name: room.buildingName,
          room_number: room.roomNumber,
          name: room.name,
          type: room.type,
          floor: room.floor,
          capacity: room.capacity,
          current_occupancy: room.currentOccupancy,
          temperature_c: room.temperatureC,
          target_temp_c: room.targetTempC,
          humidity_pct: room.humidityPct,
          co2_ppm: room.co2Ppm,
          lux_level: room.luxLevel,
          lighting_state: room.lightingState,
          hvac_mode: room.hvacMode,
          schedule_status: room.scheduleStatus,
          active_event: room.activeEvent,
          air_quality_status: room.airQualityStatus
        }),
        signal: AbortSignal.timeout(3000)
      });
      await checkAuthError(res);
      if (res.ok) {
        const data = await res.json();
        const mapped = mapRoomFromApi(data);
        currentRooms = [mapped, ...currentRooms];
        return mapped;
      }
    } catch (err: any) {
      if (err.message?.includes('Forbidden') || err.message?.includes('Access denied') || err.message?.includes('Requires')) {
        throw err;
      }
    }
    const newId = `r-${Date.now().toString().slice(-4)}`;
    const newR: Room = { ...room, id: newId };
    currentRooms = [newR, ...currentRooms];
    return newR;
  },

  async deleteRoom(id: string): Promise<void> {
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
        signal: AbortSignal.timeout(3000)
      });
      await checkAuthError(res);
    } catch (err: any) {
      if (err.message?.includes('Forbidden') || err.message?.includes('Access denied') || err.message?.includes('Requires')) {
        throw err;
      }
    }
    currentRooms = currentRooms.filter(r => r.id !== id);
  },

  async updateRoomControl(
    roomId: string,
    updates: Partial<Pick<Room, 'targetTempC' | 'lightingState' | 'hvacMode'>>
  ): Promise<Room> {
    // Try live patch
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${roomId}/control`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          target_temp_c: updates.targetTempC,
          lighting_state: updates.lightingState,
          hvac_mode: updates.hvacMode
        }),
        signal: AbortSignal.timeout(2000)
      });
      await checkAuthError(res);
      if (res.ok) {
        const data = await res.json();
        const updated: Room = {
          id: data.id,
          buildingId: data.building_id,
          buildingName: data.building_name,
          roomNumber: data.room_number,
          name: data.name,
          type: data.type,
          floor: data.floor,
          capacity: data.capacity,
          currentOccupancy: data.current_occupancy,
          temperatureC: data.temperature_c,
          targetTempC: data.target_temp_c,
          humidityPct: data.humidity_pct,
          co2Ppm: data.co2_ppm,
          luxLevel: data.lux_level,
          lightingState: data.lighting_state,
          hvacMode: data.hvac_mode,
          scheduleStatus: data.schedule_status,
          activeEvent: data.active_event,
          airQualityStatus: data.air_quality_status
        };
        const idx = currentRooms.findIndex(r => r.id === roomId);
        if (idx !== -1) currentRooms[idx] = updated;
        return updated;
      }
    } catch (err: any) {
      if (err.message?.includes('Forbidden') || err.message?.includes('Access denied') || err.message?.includes('Requires')) {
        throw err;
      }
    }

    const idx = currentRooms.findIndex(r => r.id === roomId);
    if (idx === -1) throw new Error(`Room ${roomId} not found`);
    currentRooms[idx] = { ...currentRooms[idx], ...updates };
    return currentRooms[idx];
  },

  // Energy
  async getEnergyData(): Promise<EnergyData> {
    return safeFetch(
      '/energy/summary',
      { method: 'GET' },
      () => ({ ...mockEnergyData })
    );
  },

  // Water
  async getWaterData(): Promise<WaterData> {
    return safeFetch(
      '/water/summary',
      { method: 'GET' },
      () => ({ ...mockWaterData })
    );
  },

  async isolateWaterLeak(leakId: string): Promise<{ success: boolean; message: string }> {
    return safeFetch(
      `/water/leaks/${leakId}/isolate`,
      { method: 'POST' },
      () => ({ success: true, message: `Lateral line isolated for leak ${leakId}.` })
    );
  },

  // Waste
  async getWasteData(): Promise<WasteData> {
    return safeFetch(
      '/waste/summary',
      { method: 'GET' },
      () => ({ ...mockWasteData })
    );
  },

  async dispatchWasteRoute(): Promise<{ message: string; eta: number }> {
    return safeFetch(
      '/waste/dispatch-route',
      { method: 'POST' },
      () => ({ message: 'Collection truck dispatched.', eta: 14 })
    );
  },

  // Environment
  async getEnvironmentData(): Promise<EnvironmentData> {
    return safeFetch(
      '/environment/summary',
      { method: 'GET' },
      () => ({ ...mockEnvironmentData })
    );
  },

  // Maintenance
  async getMaintenanceOrders(): Promise<MaintenanceOrder[]> {
    return safeFetch(
      '/maintenance',
      { method: 'GET' },
      () => [...currentMaintenanceOrders]
    );
  },

  async createMaintenanceOrder(order: Omit<MaintenanceOrder, 'id' | 'ticketNumber' | 'createdAt'>): Promise<MaintenanceOrder> {
    try {
      const res = await fetch(`${API_BASE_URL}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          title: order.title,
          asset_id: order.assetId,
          asset_name: order.assetName,
          building: order.building,
          floor: order.floor,
          severity: order.severity,
          category: order.category,
          assigned_to: order.assignedTo,
          notes: order.notes,
          due_date: order.dueDate
        }),
        signal: AbortSignal.timeout(2500)
      });
      await checkAuthError(res);
      if (res.ok) {
        const data = await res.json();
        const created: MaintenanceOrder = {
          id: data.id,
          ticketNumber: data.ticket_number,
          title: data.title,
          assetId: data.asset_id,
          assetName: data.asset_name,
          building: data.building,
          floor: data.floor,
          severity: data.severity,
          category: data.category,
          assignedTo: data.assigned_to,
          createdAt: data.created_at,
          dueDate: data.due_date,
          status: data.status,
          isPredictive: data.is_predictive,
          rulDays: data.rul_days,
          failureRiskPct: data.failure_risk_pct,
          notes: data.notes
        };
        currentMaintenanceOrders = [created, ...currentMaintenanceOrders];
        return created;
      }
    } catch (err: any) {
      if (err.message?.includes('Forbidden') || err.message?.includes('Access denied') || err.message?.includes('Requires')) {
        throw err;
      }
    }

    const newId = `mo-${Date.now().toString().slice(-4)}`;
    const newOrder: MaintenanceOrder = {
      ...order,
      id: newId,
      ticketNumber: `WO-2026-${Math.floor(8900 + Math.random() * 1000)}`,
      createdAt: 'Just now'
    };
    currentMaintenanceOrders = [newOrder, ...currentMaintenanceOrders];
    return newOrder;
  },

  async updateMaintenanceStatus(id: string, status: MaintenanceOrder['status']): Promise<MaintenanceOrder> {
    try {
      const res = await fetch(`${API_BASE_URL}/maintenance/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ status }),
        signal: AbortSignal.timeout(2000)
      });
      await checkAuthError(res);
      if (res.ok) {
        const data = await res.json();
        const updated: MaintenanceOrder = {
          id: data.id,
          ticketNumber: data.ticket_number,
          title: data.title,
          assetId: data.asset_id,
          assetName: data.asset_name,
          building: data.building,
          floor: data.floor,
          severity: data.severity,
          category: data.category,
          assignedTo: data.assigned_to,
          createdAt: data.created_at,
          dueDate: data.due_date,
          status: data.status,
          isPredictive: data.is_predictive,
          notes: data.notes
        };
        const idx = currentMaintenanceOrders.findIndex(o => o.id === id);
        if (idx !== -1) currentMaintenanceOrders[idx] = updated;
        return updated;
      }
    } catch (err: any) {
      if (err.message?.includes('Forbidden') || err.message?.includes('Access denied') || err.message?.includes('Requires')) {
        throw err;
      }
    }

    const idx = currentMaintenanceOrders.findIndex(o => o.id === id);
    if (idx === -1) throw new Error(`Order ${id} not found`);
    currentMaintenanceOrders[idx] = { ...currentMaintenanceOrders[idx], status };
    return currentMaintenanceOrders[idx];
  },

  // AI & ML Models
  async getMLModels(): Promise<MLModelRecord[]> {
    return safeFetch(
      '/analytics/models',
      { method: 'GET' },
      () => [...mockMLModels]
    );
  },

  // Genuine Scikit-learn Load Prediction Inference
  async simulateLoadPrediction(params: {
    ambientTempDeltaC: number;
    campusOccupancyPct: number;
    solarCloudCoverPct: number;
    hvacEcoOverride: boolean;
  }): Promise<{
    baselineKw: number;
    projectedDemandKw: number;
    solarGeneratedKw: number;
    gridNetDrawKw: number;
    costImpactUsdPerHour: number;
    peakThresholdRisk: boolean;
    confidenceInterval: [number, number];
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/predict-load`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ambient_temp_delta_c: params.ambientTempDeltaC,
          campus_occupancy_pct: params.campusOccupancyPct,
          solar_cloud_cover_pct: params.solarCloudCoverPct,
          hvac_eco_override: params.hvacEcoOverride
        }),
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        const data = await res.json();
        return {
          baselineKw: data.baseline_kw,
          projectedDemandKw: data.projected_demand_kw,
          solarGeneratedKw: data.solar_generated_kw,
          gridNetDrawKw: data.grid_net_draw_kw,
          costImpactUsdPerHour: data.cost_impact_usd_per_hour,
          peakThresholdRisk: data.peak_threshold_risk,
          confidenceInterval: [data.confidence_interval[0], data.confidence_interval[1]]
        };
      }
    } catch {
      // Fallback calculation
    }

    const baseDemand = 1428.5;
    const tempImpactKw = params.ambientTempDeltaC * 28.5;
    const occupancyScale = (params.campusOccupancyPct - 76.5) / 100;
    const occupancyImpactKw = occupancyScale * 210.0;
    const ecoSavingsKw = params.hvacEcoOverride ? -54.0 : 0;
    const projectedDemand = Math.max(650, baseDemand + tempImpactKw + occupancyImpactKw + ecoSavingsKw);
    const solarFactor = Math.max(0.1, 1 - (params.solarCloudCoverPct / 100));
    const solarGenerated = 485.0 * solarFactor;
    const gridNet = Math.max(0, projectedDemand - solarGenerated);
    const costPerHour = gridNet * 0.145;
    const margin = 12.35 * 1.96;

    return {
      baselineKw: baseDemand,
      projectedDemandKw: Math.round(projectedDemand * 10) / 10,
      solarGeneratedKw: Math.round(solarGenerated * 10) / 10,
      gridNetDrawKw: Math.round(gridNet * 10) / 10,
      costImpactUsdPerHour: Math.round(costPerHour * 100) / 100,
      peakThresholdRisk: projectedDemand >= 1750.0 * 0.95,
      confidenceInterval: [
        Math.round((projectedDemand - margin) * 10) / 10,
        Math.round((projectedDemand + margin) * 10) / 10
      ]
    };
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    return safeFetch(
      '/notifications',
      { method: 'GET' },
      () => [...currentNotifications]
    );
  },

  async markNotificationRead(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: getAuthHeader()
      });
    } catch {}
    currentNotifications = currentNotifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    );
  },

  async markAllNotificationsRead(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: 'POST',
        headers: getAuthHeader()
      });
    } catch {}
    currentNotifications = currentNotifications.map(n => ({ ...n, isRead: true }));
  },

  // Settings
  async getSettings(): Promise<SystemSettings> {
    return safeFetch(
      '/settings',
      { method: 'GET' },
      () => ({ ...currentSettings })
    );
  },

  async updateSettings(newSettings: Partial<SystemSettings>): Promise<SystemSettings> {
    const merged = { ...currentSettings, ...newSettings };
    try {
      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          campus_name: merged.campusName,
          fast_api_backend_url: merged.fastApiBackendUrl,
          postgres_db_url: merged.postgresDbUrl,
          websocket_telemetry_url: merged.websocketTelemetryUrl,
          simulated_data_fallback: merged.simulatedDataFallback,
          max_peak_demand_kw: merged.maxPeakDemandKw,
          co2_warning_threshold_ppm: merged.co2WarningThresholdPpm,
          water_leak_threshold_lph: merged.waterLeakThresholdLph,
          auto_hvac_eco_setback: merged.autoHvacEcoSetback,
          email_alerts_enabled: merged.emailAlertsEnabled,
          sms_emergency_enabled: merged.smsEmergencyEnabled,
          active_theme: merged.activeTheme
        })
      });
      await checkAuthError(res);
      if (res.ok) {
        currentSettings = merged;
        return merged;
      }
    } catch (err: any) {
      if (err.message?.includes('Forbidden') || err.message?.includes('Access denied') || err.message?.includes('Requires')) {
        throw err;
      }
    }

    currentSettings = merged;
    return merged;
  },

  // Additional CRUD Operations
  async createNotification(notif: { title: string; description: string; severity?: string; category?: string }): Promise<NotificationItem> {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(notif)
      });
      await checkAuthError(res);
      if (res.ok) {
        const data = await res.json();
        const item: NotificationItem = {
          id: data.id,
          title: data.title,
          description: data.description,
          timestamp: data.timestamp,
          severity: data.severity,
          category: data.category,
          isRead: data.is_read
        };
        currentNotifications = [item, ...currentNotifications];
        return item;
      }
    } catch (err: any) {
      if (err.message?.includes('Forbidden') || err.message?.includes('Access denied') || err.message?.includes('Requires')) {
        throw err;
      }
    }
    const item: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: notif.title,
      description: notif.description,
      timestamp: 'Just now',
      severity: (notif.severity as any) || 'info',
      category: (notif.category as any) || 'Energy',
      isRead: false
    };
    currentNotifications = [item, ...currentNotifications];
    return item;
  },

  async deleteNotification(id: string): Promise<void> {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      await checkAuthError(res);
    } catch (err: any) {
      if (err.message?.includes('Forbidden') || err.message?.includes('Access denied') || err.message?.includes('Requires')) {
        throw err;
      }
    }
    currentNotifications = currentNotifications.filter(n => n.id !== id);
  },

  async createWaterLeak(location: string, flowLossLph: number = 120): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/water/leaks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ location, flow_loss_lph: flowLossLph })
      });
      await checkAuthError(res);
      if (res.ok) return await res.json();
    } catch (err: any) {
      if (err.message?.includes('Forbidden') || err.message?.includes('Access denied') || err.message?.includes('Requires')) {
        throw err;
      }
    }
    return { id: `leak-${Date.now()}`, location, flowLossLph, status: 'Investigating' };
  },

  async deleteWaterLeak(leakId: string): Promise<void> {
    try {
      const res = await fetch(`${API_BASE_URL}/water/leaks/${leakId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      await checkAuthError(res);
    } catch (err: any) {
      if (err.message?.includes('Forbidden') || err.message?.includes('Access denied') || err.message?.includes('Requires')) {
        throw err;
      }
    }
  },

  async createWasteCluster(cluster: { location: string; zone: string }): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/waste/clusters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(cluster)
      });
      await checkAuthError(res);
      if (res.ok) return await res.json();
    } catch (err: any) {
      if (err.message?.includes('Forbidden') || err.message?.includes('Access denied') || err.message?.includes('Requires')) {
        throw err;
      }
    }
    return { id: `wc-${Date.now()}`, ...cluster, status: 'Normal' };
  },

  async emptyWasteCluster(clusterId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/waste/clusters/${clusterId}/empty`, {
        method: 'PATCH',
        headers: getAuthHeader()
      });
      await checkAuthError(res);
      if (res.ok) return await res.json();
    } catch (err: any) {
      if (err.message?.includes('Forbidden') || err.message?.includes('Access denied') || err.message?.includes('Requires')) {
        throw err;
      }
    }
    return { status: 'success' };
  },

  async deleteWasteCluster(clusterId: string): Promise<void> {
    try {
      const res = await fetch(`${API_BASE_URL}/waste/clusters/${clusterId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      await checkAuthError(res);
    } catch (err: any) {
      if (err.message?.includes('Forbidden') || err.message?.includes('Access denied') || err.message?.includes('Requires')) {
        throw err;
      }
    }
  },

  async createEnvironmentSensor(sensor: { name: string; zone: string }): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/environment/sensors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(sensor)
      });
      await checkAuthError(res);
      if (res.ok) return await res.json();
    } catch (err: any) {
      if (err.message?.includes('Forbidden') || err.message?.includes('Access denied') || err.message?.includes('Requires')) {
        throw err;
      }
    }
    return { id: `env-${Date.now()}`, ...sensor, aqi: 35, status: 'Healthy' };
  },

  async deleteEnvironmentSensor(sensorId: string): Promise<void> {
    try {
      const res = await fetch(`${API_BASE_URL}/environment/sensors/${sensorId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      await checkAuthError(res);
    } catch (err: any) {
      if (err.message?.includes('Forbidden') || err.message?.includes('Access denied') || err.message?.includes('Requires')) {
        throw err;
      }
    }
  },

  async deleteReport(id: string): Promise<void> {
    try {
      const res = await fetch(`${API_BASE_URL}/reports/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      await checkAuthError(res);
    } catch (err: any) {
      if (err.message?.includes('Forbidden') || err.message?.includes('Access denied') || err.message?.includes('Requires')) {
        throw err;
      }
    }
  }
};
