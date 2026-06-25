export type NoiseType = 'perlin' | 'ridged' | 'warp';
export type ShaderStyle = 'standard-lit' | 'unlit';
export type TerrainColorMode = 'solid' | 'gradient' | 'stepped';

/** One stop in an elevation color ramp. position is 0 (lowest) → 1 (highest). */
export interface ColorStop {
  color: string;
  position: number;
}

export interface NoiseLayer {
  noiseType: NoiseType;
  scale: number;
  octaves: number;
  persistence: number;
  lacunarity: number;
  strength: number;
}

export interface ShapeSettings {
  radius: number;
  resolution: number;
}

export interface TerrainSettings {
  enabled: boolean;
  elevationScale: number;
  macro: NoiseLayer;
  micro: NoiseLayer;
}

export interface OceanSettings {
  enabled: boolean;
  seaLevel: number;
  resolution: number;
  // Animation
  rippleSpeed: number;
  rippleScale: number;
  rippleHeight: number;
  // Colors
  deepColor: string;
  shallowColor: string;
  foamColor: string;
  // Coastline foam
  foamEnabled: boolean;
  foamDepth: number;      // view-space depth threshold for coastline band
  foamSoftness: number;   // 0 = sharp edge, 1 = wide soft fade
  // Coastline ripples — animated contour lines parallel to the shore
  rippleEnabled: boolean;
  rippleWidth: number;    // spacing/thickness of each contour line
  rippleDistance: number; // how far from the shore the ripples reach
}

export interface ShaderSettings {
  style: ShaderStyle;
  terrainColor: string;          // used when colorMode === 'solid'
  colorMode: TerrainColorMode;
  ramp: ColorStop[];             // elevation ramp, max 5 stops (gradient/stepped)
}

export interface AtmosphereSettings {
  enabled: boolean;
}

export interface BiomeSettings {
  enabled: boolean;
}

export interface PlanetSettings {
  shape: ShapeSettings;
  terrain: TerrainSettings;
  ocean: OceanSettings;
  shaders: ShaderSettings;
  atmosphere: AtmosphereSettings;
  biomes: BiomeSettings;
}

export const defaultPlanetSettings: PlanetSettings = {
  shape: {
    radius: 1,
    resolution: 64,
  },
  terrain: {
    enabled: false,
    elevationScale: 0.25,
    macro: {
      noiseType: 'perlin',
      scale: 1.2,
      octaves: 4,
      persistence: 0.5,
      lacunarity: 2.0,
      strength: 1.0,
    },
    micro: {
      noiseType: 'ridged',
      scale: 5.0,
      octaves: 3,
      persistence: 0.45,
      lacunarity: 2.2,
      strength: 0.25,
    },
  },
  ocean: {
    enabled: false,
    seaLevel: 0.02,
    resolution: 64,
    rippleSpeed: 0.8,
    rippleScale: 1.0,
    rippleHeight: 0.003,
    deepColor: '#1a4a8c',
    shallowColor: '#3a9ad9',
    foamColor: '#cce8ff',
    foamEnabled: true,
    foamDepth: 0.15,
    foamSoftness: 0.5,
    rippleEnabled: true,
    rippleWidth: 0.05,
    rippleDistance: 0.12,
  },
  shaders: {
    style: 'standard-lit',
    terrainColor: '#2e6b3e',
    colorMode: 'gradient',
    ramp: [
      { color: '#1f4e2e', position: 0.0 },   // low ground — deep green
      { color: '#3e7d3e', position: 0.3 },   // plains
      { color: '#8a7a4a', position: 0.55 },  // foothills — earthy
      { color: '#7a6a5a', position: 0.75 },  // mountain rock
      { color: '#ffffff', position: 1.0 },   // snow caps
    ],
  },
  atmosphere: {
    enabled: false,
  },
  biomes: {
    enabled: false,
  },
};
