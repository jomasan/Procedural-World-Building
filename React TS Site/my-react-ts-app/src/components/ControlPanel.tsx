import React, { useState } from 'react';
import { PlanetSettings, NoiseLayer, NoiseType, ShaderStyle, TerrainColorMode, ColorStop } from '../types/planet';
import './ControlPanel.css';

type SectionId = 'shape' | 'terrain' | 'ocean' | 'atmosphere' | 'biomes' | 'shaders';

interface Props {
  settings: PlanetSettings;
  onSettingsChange: (settings: PlanetSettings) => void;
}

const RESOLUTIONS = [8, 16, 32, 64, 128, 256, 512] as const;
const NOISE_TYPES: NoiseType[] = ['perlin', 'ridged', 'warp'];
const SHADER_STYLES: ShaderStyle[] = ['standard-lit', 'unlit'];
const COLOR_MODES: TerrainColorMode[] = ['solid', 'gradient', 'stepped'];
const MAX_STOPS = 5;

interface LayerControlsProps {
  layer: NoiseLayer;
  onChange: (patch: Partial<NoiseLayer>) => void;
}

const LayerControls: React.FC<LayerControlsProps> = ({ layer, onChange }) => (
  <div className="layer-controls">
    <div className="ctrl-btn-group">
      {NOISE_TYPES.map((t) => (
        <button key={t} type="button"
          className={`ctrl-seg-btn ${layer.noiseType === t ? 'active' : ''}`}
          onClick={() => onChange({ noiseType: t })}>{t}</button>
      ))}
    </div>
    <label className="ctrl-row"><span className="ctrl-label">Scale</span><span className="ctrl-value">{layer.scale.toFixed(1)}</span></label>
    <input type="range" className="ctrl-slider" min={0.2} max={10.0} step={0.1} value={layer.scale} onChange={(e) => onChange({ scale: parseFloat(e.target.value) })} />
    <label className="ctrl-row"><span className="ctrl-label">Octaves</span><span className="ctrl-value">{layer.octaves}</span></label>
    <input type="range" className="ctrl-slider" min={1} max={8} step={1} value={layer.octaves} onChange={(e) => onChange({ octaves: parseInt(e.target.value, 10) })} />
    <label className="ctrl-row"><span className="ctrl-label">Persistence</span><span className="ctrl-value">{layer.persistence.toFixed(2)}</span></label>
    <input type="range" className="ctrl-slider" min={0.1} max={1.0} step={0.05} value={layer.persistence} onChange={(e) => onChange({ persistence: parseFloat(e.target.value) })} />
    <label className="ctrl-row"><span className="ctrl-label">Lacunarity</span><span className="ctrl-value">{layer.lacunarity.toFixed(1)}</span></label>
    <input type="range" className="ctrl-slider" min={1.0} max={4.0} step={0.1} value={layer.lacunarity} onChange={(e) => onChange({ lacunarity: parseFloat(e.target.value) })} />
    <label className="ctrl-row"><span className="ctrl-label">Strength</span><span className="ctrl-value">{layer.strength.toFixed(2)}</span></label>
    <input type="range" className="ctrl-slider" min={0.0} max={2.0} step={0.05} value={layer.strength} onChange={(e) => onChange({ strength: parseFloat(e.target.value) })} />
  </div>
);

const ControlPanel: React.FC<Props> = ({ settings, onSettingsChange }) => {
  const [openSections, setOpenSections] = useState<Record<SectionId, boolean>>({
    shape: true, terrain: false, ocean: false, atmosphere: false, biomes: false, shaders: false,
  });

  const toggle = (id: SectionId) => setOpenSections((p) => ({ ...p, [id]: !p[id] }));

  const set = <K extends keyof PlanetSettings>(key: K) =>
    (patch: Partial<PlanetSettings[K]>) =>
      onSettingsChange({ ...settings, [key]: { ...(settings[key] as object), ...patch } });

  const setShape    = set('shape');
  const setTerrain  = set('terrain');
  const setOcean    = set('ocean');
  const setShaders  = set('shaders');
  const setAtmo     = set('atmosphere');
  const setBiomes   = set('biomes');
  const setMacro    = (p: Partial<NoiseLayer>) => setTerrain({ macro: { ...settings.terrain.macro, ...p } });
  const setMicro    = (p: Partial<NoiseLayer>) => setTerrain({ micro: { ...settings.terrain.micro, ...p } });

  const ramp = settings.shaders.ramp;
  const updateStop = (i: number, patch: Partial<ColorStop>) =>
    setShaders({ ramp: ramp.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) });
  const addStop = () => {
    if (ramp.length >= MAX_STOPS) return;
    setShaders({ ramp: [...ramp, { color: '#ffffff', position: 1.0 }] });
  };
  const removeStop = (i: number) => {
    if (ramp.length <= 2) return;
    setShaders({ ramp: ramp.filter((_, idx) => idx !== i) });
  };

  const resBtns = (current: number, onChange: (r: number) => void) => (
    <div className="ctrl-btn-group ctrl-btn-group--wrap">
      {RESOLUTIONS.map((r) => (
        <button key={r} type="button"
          className={`ctrl-seg-btn ${current === r ? 'active' : ''}`}
          onClick={() => onChange(r)}>{r}</button>
      ))}
    </div>
  );

  return (
    <aside className="control-panel">
      <div className="panel-hdr"><span className="panel-hdr-title">layers</span></div>
      <div className="panel-scroll">

        {/* ── Shape ── */}
        <section className="ctrl-section foldable">
          <button type="button" className="section-hdr-btn" onClick={() => toggle('shape')} aria-expanded={openSections.shape}>
            <span className="section-hdr-label">Shape</span>
            <span className={`section-chevron ${openSections.shape ? 'open' : ''}`}>▼</span>
          </button>
          {openSections.shape && (
            <div className="section-body">
              <label className="ctrl-row"><span className="ctrl-label">Radius</span><span className="ctrl-value">{settings.shape.radius.toFixed(1)}</span></label>
              <input type="range" className="ctrl-slider" min={0.5} max={2.0} step={0.1} value={settings.shape.radius} onChange={(e) => setShape({ radius: parseFloat(e.target.value) })} />
              <label className="ctrl-row" style={{ marginTop: 10 }}><span className="ctrl-label">Resolution</span><span className="ctrl-value">{settings.shape.resolution}</span></label>
              {resBtns(settings.shape.resolution, (r) => setShape({ resolution: r }))}
            </div>
          )}
        </section>

        {/* ── Terrain ── */}
        <section className="ctrl-section foldable">
          <button type="button" className="section-hdr-btn" onClick={() => toggle('terrain')} aria-expanded={openSections.terrain}>
            <span className="section-hdr-label">Terrain</span>
            <span className={`section-chevron ${openSections.terrain ? 'open' : ''}`}>▼</span>
          </button>
          {openSections.terrain && (
            <div className="section-body">
              <label className="ctrl-row"><span className="ctrl-label">Enabled</span>
                <input type="checkbox" className="ctrl-checkbox" checked={settings.terrain.enabled} onChange={(e) => setTerrain({ enabled: e.target.checked })} /></label>
              <label className="ctrl-row"><span className="ctrl-label">Elevation scale</span><span className="ctrl-value">{settings.terrain.elevationScale.toFixed(2)}</span></label>
              <input type="range" className="ctrl-slider" min={0.0} max={0.8} step={0.01} value={settings.terrain.elevationScale} onChange={(e) => setTerrain({ elevationScale: parseFloat(e.target.value) })} />
              <div className="layer-divider">Macro</div>
              <LayerControls layer={settings.terrain.macro} onChange={setMacro} />
              <div className="layer-divider">Micro</div>
              <LayerControls layer={settings.terrain.micro} onChange={setMicro} />
            </div>
          )}
        </section>

        {/* ── Ocean ── */}
        <section className="ctrl-section foldable">
          <button type="button" className="section-hdr-btn" onClick={() => toggle('ocean')} aria-expanded={openSections.ocean}>
            <span className="section-hdr-label">Ocean</span>
            <span className={`section-chevron ${openSections.ocean ? 'open' : ''}`}>▼</span>
          </button>
          {openSections.ocean && (
            <div className="section-body">
              <label className="ctrl-row"><span className="ctrl-label">Enabled</span>
                <input type="checkbox" className="ctrl-checkbox" checked={settings.ocean.enabled} onChange={(e) => setOcean({ enabled: e.target.checked })} /></label>

              <label className="ctrl-row"><span className="ctrl-label">Sea level</span><span className="ctrl-value">{settings.ocean.seaLevel.toFixed(2)}</span></label>
              <input type="range" className="ctrl-slider" min={-0.5} max={0.5} step={0.01} value={settings.ocean.seaLevel} onChange={(e) => setOcean({ seaLevel: parseFloat(e.target.value) })} />

              <label className="ctrl-row" style={{ marginTop: 8 }}><span className="ctrl-label">Resolution</span><span className="ctrl-value">{settings.ocean.resolution}</span></label>
              {resBtns(settings.ocean.resolution, (r) => setOcean({ resolution: r }))}

              <div className="layer-divider">Colors</div>
              <label className="ctrl-row"><span className="ctrl-label">Deep</span>
                <input type="color" className="ctrl-color" value={settings.ocean.deepColor} onChange={(e) => setOcean({ deepColor: e.target.value })} /></label>
              <label className="ctrl-row"><span className="ctrl-label">Shallow</span>
                <input type="color" className="ctrl-color" value={settings.ocean.shallowColor} onChange={(e) => setOcean({ shallowColor: e.target.value })} /></label>
              <label className="ctrl-row"><span className="ctrl-label">Foam</span>
                <input type="color" className="ctrl-color" value={settings.ocean.foamColor} onChange={(e) => setOcean({ foamColor: e.target.value })} /></label>

              <div className="layer-divider">Surface</div>
              <label className="ctrl-row"><span className="ctrl-label">Speed</span><span className="ctrl-value">{settings.ocean.rippleSpeed.toFixed(1)}</span></label>
              <input type="range" className="ctrl-slider" min={0.0} max={5.0} step={0.1} value={settings.ocean.rippleSpeed} onChange={(e) => setOcean({ rippleSpeed: parseFloat(e.target.value) })} />
              <label className="ctrl-row"><span className="ctrl-label">Scale</span><span className="ctrl-value">{settings.ocean.rippleScale.toFixed(1)}</span></label>
              <input type="range" className="ctrl-slider" min={0.1} max={3.0} step={0.1} value={settings.ocean.rippleScale} onChange={(e) => setOcean({ rippleScale: parseFloat(e.target.value) })} />
              <label className="ctrl-row"><span className="ctrl-label">Height</span><span className="ctrl-value">{settings.ocean.rippleHeight.toFixed(3)}</span></label>
              <input type="range" className="ctrl-slider" min={0.0} max={0.05} step={0.001} value={settings.ocean.rippleHeight} onChange={(e) => setOcean({ rippleHeight: parseFloat(e.target.value) })} />

              <div className="layer-divider">Coastline</div>
              <label className="ctrl-row"><span className="ctrl-label">Foam enabled</span>
                <input type="checkbox" className="ctrl-checkbox" checked={settings.ocean.foamEnabled} onChange={(e) => setOcean({ foamEnabled: e.target.checked })} /></label>
              <label className="ctrl-row"><span className="ctrl-label">Depth</span><span className="ctrl-value">{settings.ocean.foamDepth.toFixed(2)}</span></label>
              <input type="range" className="ctrl-slider" min={0.01} max={0.5} step={0.01} value={settings.ocean.foamDepth} onChange={(e) => setOcean({ foamDepth: parseFloat(e.target.value) })} />
              <label className="ctrl-row"><span className="ctrl-label">Softness</span><span className="ctrl-value">{settings.ocean.foamSoftness.toFixed(2)}</span></label>
              <input type="range" className="ctrl-slider" min={0.0} max={1.0} step={0.05} value={settings.ocean.foamSoftness} onChange={(e) => setOcean({ foamSoftness: parseFloat(e.target.value) })} />

              <div className="layer-divider">Ripples</div>
              <label className="ctrl-row"><span className="ctrl-label">Enabled</span>
                <input type="checkbox" className="ctrl-checkbox" checked={settings.ocean.rippleEnabled} onChange={(e) => setOcean({ rippleEnabled: e.target.checked })} /></label>
              <label className="ctrl-row"><span className="ctrl-label">Width</span><span className="ctrl-value">{settings.ocean.rippleWidth.toFixed(3)}</span></label>
              <input type="range" className="ctrl-slider" min={0.01} max={0.3} step={0.005} value={settings.ocean.rippleWidth} onChange={(e) => setOcean({ rippleWidth: parseFloat(e.target.value) })} />
              <label className="ctrl-row"><span className="ctrl-label">Distance</span><span className="ctrl-value">{settings.ocean.rippleDistance.toFixed(2)}</span></label>
              <input type="range" className="ctrl-slider" min={0.02} max={0.5} step={0.01} value={settings.ocean.rippleDistance} onChange={(e) => setOcean({ rippleDistance: parseFloat(e.target.value) })} />
            </div>
          )}
        </section>

        {/* ── Atmosphere ── */}
        <section className="ctrl-section foldable">
          <button type="button" className="section-hdr-btn" onClick={() => toggle('atmosphere')} aria-expanded={openSections.atmosphere}>
            <span className="section-hdr-label">Atmosphere</span>
            <span className={`section-chevron ${openSections.atmosphere ? 'open' : ''}`}>▼</span>
          </button>
          {openSections.atmosphere && (
            <div className="section-body">
              <label className="ctrl-row"><span className="ctrl-label">Enabled</span>
                <input type="checkbox" className="ctrl-checkbox" checked={settings.atmosphere.enabled} onChange={(e) => setAtmo({ enabled: e.target.checked })} /></label>
              <p className="ctrl-coming-soon">Scattering shader coming soon</p>
            </div>
          )}
        </section>

        {/* ── Biomes ── */}
        <section className="ctrl-section foldable">
          <button type="button" className="section-hdr-btn" onClick={() => toggle('biomes')} aria-expanded={openSections.biomes}>
            <span className="section-hdr-label">Biomes</span>
            <span className={`section-chevron ${openSections.biomes ? 'open' : ''}`}>▼</span>
          </button>
          {openSections.biomes && (
            <div className="section-body">
              <label className="ctrl-row"><span className="ctrl-label">Enabled</span>
                <input type="checkbox" className="ctrl-checkbox" checked={settings.biomes.enabled} onChange={(e) => setBiomes({ enabled: e.target.checked })} /></label>
              <p className="ctrl-coming-soon">Elevation-based coloring coming soon</p>
            </div>
          )}
        </section>

        {/* ── Shaders ── */}
        <section className="ctrl-section foldable">
          <button type="button" className="section-hdr-btn" onClick={() => toggle('shaders')} aria-expanded={openSections.shaders}>
            <span className="section-hdr-label">Shaders</span>
            <span className={`section-chevron ${openSections.shaders ? 'open' : ''}`}>▼</span>
          </button>
          {openSections.shaders && (
            <div className="section-body">
              <label className="ctrl-row" style={{ marginBottom: 4 }}><span className="ctrl-label">Style</span></label>
              <div className="ctrl-btn-group">
                {SHADER_STYLES.map((s) => (
                  <button key={s} type="button"
                    className={`ctrl-seg-btn ${settings.shaders.style === s ? 'active' : ''}`}
                    onClick={() => setShaders({ style: s })}>{s}</button>
                ))}
              </div>
              <div className="layer-divider">Terrain color</div>
              <label className="ctrl-row" style={{ marginBottom: 4 }}><span className="ctrl-label">Mode</span></label>
              <div className="ctrl-btn-group">
                {COLOR_MODES.map((m) => (
                  <button key={m} type="button"
                    className={`ctrl-seg-btn ${settings.shaders.colorMode === m ? 'active' : ''}`}
                    onClick={() => setShaders({ colorMode: m })}>{m}</button>
                ))}
              </div>

              {settings.shaders.colorMode === 'solid' ? (
                <label className="ctrl-row" style={{ marginTop: 10 }}>
                  <span className="ctrl-label">Color</span>
                  <input type="color" className="ctrl-color" value={settings.shaders.terrainColor} onChange={(e) => setShaders({ terrainColor: e.target.value })} />
                </label>
              ) : (
                <div className="ramp-editor">
                  <div className="ramp-hint">low&nbsp;→&nbsp;high elevation</div>
                  {ramp.map((stop, i) => (
                    <div className="ramp-stop" key={i}>
                      <input type="color" className="ctrl-color" value={stop.color} onChange={(e) => updateStop(i, { color: e.target.value })} />
                      <input type="range" className="ctrl-slider ramp-stop-slider" min={0} max={1} step={0.01} value={stop.position} onChange={(e) => updateStop(i, { position: parseFloat(e.target.value) })} />
                      <span className="ctrl-value ramp-stop-pos">{stop.position.toFixed(2)}</span>
                      <button type="button" className="ramp-stop-del" disabled={ramp.length <= 2} onClick={() => removeStop(i)} title="Remove stop">×</button>
                    </div>
                  ))}
                  {ramp.length < MAX_STOPS && (
                    <button type="button" className="ramp-add-btn" onClick={addStop}>+ add stop</button>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

      </div>
    </aside>
  );
};

export default ControlPanel;
