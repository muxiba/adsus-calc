export enum SustainabilityLevel {
  EXCELLENT = "Excellent (Green Adsorbent)",
  GOOD = "Good sustainability",
  INTERMEDIATE = "Intermediate sustainability",
  LOW = "Low sustainability",
  UNSUSTAINABLE = "Unsustainable"
}

export interface Equipment {
  id: string;
  name: string;
  power: number; // Watts
  time: number; // Hours
}

export interface D3Component {
  id: string;
  name: string;
  fraction: number;
  score: number;
}

export interface AdsusData {
  // Stage enablement
  p_enabled: boolean;
  a_enabled: boolean;
  d_enabled: boolean;

  // Individual criterion enablement
  p1_enabled: boolean;
  p2_enabled: boolean;
  p3_enabled: boolean;
  p4_enabled: boolean;
  p5_enabled: boolean;
  p6_enabled: boolean;
  a1_enabled: boolean;
  a2_enabled: boolean;
  a3_enabled: boolean;
  a4_enabled: boolean;
  a5_enabled: boolean;
  d1_enabled: boolean;
  d2_enabled: boolean;
  d3_enabled: boolean;
  d4_enabled: boolean;

  // Production
  p1_total: number;
  p1_sus: number;
  p2_tox: number;
  p3_score: number;
  p4_equipments: Equipment[];
  p4_mass: number;
  p5_score: number;
  p6_temp: number;
  p6_pressure: number;
  p6_ghs: number;
  
  // Application
  a1_score: number;
  a2_score: number;
  a3_score: number;
  a4_score: number;
  a5_score: number;
  
  // Disposal
  d1_score: number;
  d2_score: number;
  d3_components: D3Component[];
  d4_score: number;
}
