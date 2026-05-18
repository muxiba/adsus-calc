import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Calculator, Info, Leaf, FlaskConical, Recycle } from 'lucide-react';
import { AdsusData, Equipment, D3Component, SustainabilityLevel } from './types';
import AdsusChart from './components/AdsusChart';

const INITIAL_DATA: AdsusData = {
  p_enabled: true,
  a_enabled: true,
  d_enabled: true,
  p1_enabled: true,
  p2_enabled: true,
  p3_enabled: true,
  p4_enabled: true,
  p5_enabled: true,
  p6_enabled: true,
  a1_enabled: true,
  a2_enabled: true,
  a3_enabled: true,
  a4_enabled: true,
  a5_enabled: true,
  d1_enabled: true,
  d2_enabled: true,
  d3_enabled: true,
  d4_enabled: true,
  p1_total: 0,
  p1_sus: 0,
  p2_tox: 0,
  p3_score: 1,
  p4_equipments: [{ id: '1', name: 'Oven', power: 0, time: 0 }],
  p4_mass: 1,
  p5_score: 1,
  p6_temp: 1,
  p6_pressure: 1,
  p6_ghs: 1,
  a1_score: 1,
  a2_score: 1,
  a3_score: 1,
  a4_score: 1,
  a5_score: 1,
  d1_score: 1,
  d2_score: 1,
  d3_components: [{ id: '1', name: 'Clay', fraction: 1, score: 1 }],
  d4_score: 1,
};

const NumberInput = ({ value, onChange, disabled, className }: { value: number, onChange?: (v: number) => void, disabled?: boolean, className?: string }) => {
  const [localVal, setLocalVal] = useState(value === 0 ? '' : String(value));

  React.useEffect(() => {
    if (value !== parseFloat(localVal)) {
      setLocalVal(value === 0 ? '' : String(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/,/g, '.').replace(/[^0-9.]/g, '');
    const parts = v.split('.');
    if (parts.length > 2) v = parts[0] + '.' + parts.slice(1).join('');
    setLocalVal(v);
    if (onChange) onChange(parseFloat(v) || 0);
  };

  return (
    <input 
      type="text"
      inputMode="decimal"
      value={localVal}
      onChange={handleChange}
      disabled={disabled}
      className={className}
    />
  );
};

export default function App() {
  const [data, setData] = useState<AdsusData>(INITIAL_DATA);

  // Individual Score Calculations
  const p1_score = useMemo(() => {
    if (!data.p1_enabled) return 0;
    if (data.p1_total <= 0) return 0;
    return Math.min(1, data.p1_sus / data.p1_total);
  }, [data.p1_total, data.p1_sus, data.p1_enabled]);

  const p2_score = useMemo(() => {
    if (!data.p2_enabled) return 0;
    if (data.p1_total <= 0) return 1;
    const pctTox = (data.p2_tox / data.p1_total) * 100;
    if (pctTox === 0) return 1.0;
    if (pctTox <= 5) return 0.75;
    if (pctTox <= 10) return 0.50;
    if (pctTox <= 20) return 0.25;
    return 0.0;
  }, [data.p1_total, data.p2_tox, data.p2_enabled]);

  const p4_score = useMemo(() => {
    if (!data.p4_enabled) return 0;
    const totalKwh = data.p4_equipments.reduce((acc, eq) => acc + (eq.power * eq.time) / 1000, 0);
    const ratio = totalKwh / (data.p4_mass || 1);
    if (ratio <= 0.5) return 1.0;
    if (ratio <= 2) return 0.75;
    if (ratio <= 5) return 0.60;
    if (ratio <= 10) return 0.45;
    if (ratio <= 25) return 0.30;
    if (ratio <= 50) return 0.15;
    return 0.0;
  }, [data.p4_equipments, data.p4_mass, data.p4_enabled]);

  const p6_score = useMemo(() => {
    if (!data.p6_enabled) return 0;
    return (data.p6_temp + data.p6_pressure + data.p6_ghs) / 3;
  }, [data.p6_temp, data.p6_pressure, data.p6_ghs, data.p6_enabled]);

  const d3_score = useMemo(() => {
    if (!data.d3_enabled) return 0;
    const totalFrac = data.d3_components.reduce((acc, c) => acc + c.fraction, 0);
    if (totalFrac <= 0) return 0;
    return data.d3_components.reduce((acc, c) => acc + (c.fraction * c.score), 0) / totalFrac;
  }, [data.d3_components, data.d3_enabled]);

  const pScores = [
    data.p1_enabled ? p1_score : 0,
    data.p2_enabled ? p2_score : 0,
    data.p3_enabled ? data.p3_score : 0,
    data.p4_enabled ? p4_score : 0,
    data.p5_enabled ? data.p5_score : 0,
    data.p6_enabled ? p6_score : 0
  ];
  const aScores = [
    data.a1_enabled ? data.a1_score : 0,
    data.a2_enabled ? data.a2_score : 0,
    data.a3_enabled ? data.a3_score : 0,
    data.a4_enabled ? data.a4_score : 0,
    data.a5_enabled ? data.a5_score : 0
  ];
  const dScores = [
    data.d1_enabled ? data.d1_score : 0,
    data.d2_enabled ? data.d2_score : 0,
    data.d3_enabled ? d3_score : 0,
    data.d4_enabled ? data.d4_score : 0
  ];

  const pAvg = useMemo(() => pScores.reduce((a, b) => a + b, 0) / pScores.length, [pScores]);
  const aAvg = useMemo(() => aScores.reduce((a, b) => a + b, 0) / aScores.length, [aScores]);
  const dAvg = useMemo(() => dScores.reduce((a, b) => a + b, 0) / dScores.length, [dScores]);

  const finalScore = useMemo(() => {
    const all = [...pScores, ...aScores, ...dScores];
    return all.reduce((a, b) => a + b, 0) / all.length;
  }, [pScores, aScores, dScores]);

  const classification = useMemo(() => {
    if (finalScore >= 0.85) return { level: SustainabilityLevel.EXCELLENT, color: 'text-excellent' };
    if (finalScore >= 0.65) return { level: SustainabilityLevel.GOOD, color: 'text-good' };
    if (finalScore >= 0.45) return { level: SustainabilityLevel.INTERMEDIATE, color: 'text-inter' };
    if (finalScore >= 0.25) return { level: SustainabilityLevel.LOW, color: 'text-low' };
    return { level: SustainabilityLevel.UNSUSTAINABLE, color: 'text-unsustainable' };
  }, [finalScore]);

  const warningLabel = useMemo(() => {
    if ((data.a5_enabled && data.a5_score === 0) || (data.d4_enabled && data.d4_score === 0)) {
      return "HARMFUL";
    }
    if (!data.a5_enabled || !data.d4_enabled) {
      return "POTENTIALLY HARMFUL";
    }
    return null;
  }, [data.a5_enabled, data.a5_score, data.d4_enabled, data.d4_score]);

  const addEquipment = () => {
    setData(prev => ({
      ...prev,
      p4_equipments: [...prev.p4_equipments, { id: Math.random().toString(), name: '', power: 0, time: 0 }]
    }));
  };

  const removeEquipment = (id: string) => {
    setData(prev => ({
      ...prev,
      p4_equipments: prev.p4_equipments.filter(e => e.id !== id)
    }));
  };

  const updateEquipment = (id: string, field: keyof Equipment, value: any) => {
    setData(prev => ({
      ...prev,
      p4_equipments: prev.p4_equipments.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const addD3Component = () => {
    setData(prev => ({
      ...prev,
      d3_components: [...prev.d3_components, { id: Math.random().toString(), name: '', fraction: 0.5, score: 1 }]
    }));
  };

  const removeD3Component = (id: string) => {
    setData(prev => ({
      ...prev,
      d3_components: prev.d3_components.filter(c => c.id !== id)
    }));
  };

  const updateD3Component = (id: string, field: keyof D3Component, value: any) => {
    setData(prev => ({
      ...prev,
      d3_components: prev.d3_components.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        <header className="bg-primary p-8 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2"
          >
            <h1 className="text-4xl font-black tracking-tighter">ADSUS</h1>
          </motion.div>
          <p className="text-slate-300 font-medium tracking-wide uppercase text-sm">Adsorbent Sustainability Index</p>
        </header>

        <main className="p-6 sm:p-10 space-y-12">
          {/* PRODUCTION STAGE */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-6 h-6 text-secondary" />
                <h3 className="text-2xl font-bold text-primary">Production Stage (P)</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Average P</div>
                  <div className="text-xl font-black text-secondary">{pAvg.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* P1 */}
              <div className={`criteria-card ${!data.p1_enabled ? 'grayscale opacity-60' : ''}`}>
                <div className="input-group">
                  <div className="flex items-center justify-between mb-1">
                    <label className="mb-0">P1: Renewable Raw Material (%S)</label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!data.p1_enabled}
                        onChange={e => setData(prev => ({ ...prev, p1_enabled: !e.target.checked }))}
                        className="w-3 h-3 accent-secondary"
                      />
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Not available information</span>
                    </label>
                  </div>
                  <p className="desc-text">Total mass used in preparation and mass of sustainable material.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase">Total Mass (g)</label>
                      <NumberInput
                        value={data.p1_total}
                        onChange={v => setData(prev => ({ ...prev, p1_total: v }))}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase">Sustainable Mass (g)</label>
                      <NumberInput
                        value={data.p1_sus}
                        onChange={v => setData(prev => ({ ...prev, p1_sus: v }))}
                      />
                    </div>
                  </div>
                </div>
                <div className="score-box">
                  <span className="score-label">Score P1</span>
                  <span className="score-value">{p1_score.toFixed(2)}</span>
                </div>
              </div>

              {/* P2 */}
              <div className={`criteria-card ${!data.p2_enabled ? 'grayscale opacity-60' : ''}`}>
                <div className="input-group">
                  <div className="flex items-center justify-between mb-1">
                    <label className="mb-0">P2: Toxic Raw Material (%T)</label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!data.p2_enabled}
                        onChange={e => setData(prev => ({ ...prev, p2_enabled: !e.target.checked }))}
                        className="w-3 h-3 accent-secondary"
                      />
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Not available information</span>
                    </label>
                  </div>
                  <p className="desc-text">Mass of toxic/aggressive material, excluding solvent.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase">Total Mass (g)</label>
                      <NumberInput value={data.p1_total} disabled className="bg-slate-50 text-slate-400" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase">Toxic Mass (g)</label>
                      <NumberInput
                        value={data.p2_tox}
                        onChange={v => setData(prev => ({ ...prev, p2_tox: v }))}
                      />
                    </div>
                  </div>
                </div>
                <div className="score-box">
                  <span className="score-label">Score P2</span>
                  <span className="score-value">{p2_score.toFixed(2)}</span>
                </div>
              </div>

              {/* P3 */}
              <div className={`criteria-card ${!data.p3_enabled ? 'grayscale opacity-60' : ''}`}>
                <div className="input-group">
                  <div className="flex items-center justify-between mb-1">
                    <label className="mb-0">P3: Use of Toxic Solvents</label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!data.p3_enabled}
                        onChange={e => setData(prev => ({ ...prev, p3_enabled: !e.target.checked }))}
                        className="w-3 h-3 accent-secondary"
                      />
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Not available information</span>
                    </label>
                  </div>
                  <select value={data.p3_score} onChange={e => setData(prev => ({ ...prev, p3_score: parseFloat(e.target.value) }))}>
                    <option value="1">1.00 - Green (Water, Ethanol, Ethyl Lactate)</option>
                    <option value="0.9">0.90 - Low Tox + Biodegradable (Ethyl Acetate)</option>
                    <option value="0.8">0.80 - Low Tox + Persistent (PEG, DMSO)</option>
                    <option value="0.75">0.75 - Mod. Tox + Biodegradable (Acetonitrile)</option>
                    <option value="0.6">0.60 - Mod. Tox + Persistent (DMF)</option>
                    <option value="0.45">0.45 - Toxic (Methanol, THF)</option>
                    <option value="0.3">0.30 - Toxic and Flammable (Toluene)</option>
                    <option value="0.15">0.15 - Toxic and Bioaccumulative (NMP)</option>
                    <option value="0">0.00 - Prohibited/Dangerous (Benzene)</option>
                  </select>
                </div>
                <div className="score-box">
                  <span className="score-label">Score P3</span>
                  <span className="score-value">{data.p3_score.toFixed(2)}</span>
                </div>
              </div>

              {/* P4 */}
              <div className={`criteria-card ${!data.p4_enabled ? 'grayscale opacity-60' : ''}`}>
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1">
                    <label className="mb-0">P4: Energy Consumption</label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!data.p4_enabled}
                        onChange={e => setData(prev => ({ ...prev, p4_enabled: !e.target.checked }))}
                        className="w-3 h-3 accent-secondary"
                      />
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Not available information</span>
                    </label>
                  </div>
                  <p className="desc-text">Total consumption (kWh) divided by produced mass (kg).</p>
                  <div className="overflow-x-auto">
                    <table>
                      <thead>
                        <tr>
                          <th>Equipment</th>
                          <th>Power (W)</th>
                          <th>Time (h)</th>
                          <th>Energy (kWh)</th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.p4_equipments.map(eq => (
                          <tr key={eq.id}>
                            <td><input type="text" value={eq.name} onChange={e => updateEquipment(eq.id, 'name', e.target.value)} placeholder="Ex: Oven" className="border-none p-1" /></td>
                            <td><input type="number" value={eq.power || ''} onChange={e => updateEquipment(eq.id, 'power', parseFloat(e.target.value) || 0)} className="border-none p-1 text-center" /></td>
                            <td><input type="number" value={eq.time || ''} onChange={e => updateEquipment(eq.id, 'time', parseFloat(e.target.value) || 0)} className="border-none p-1 text-center" /></td>
                            <td className="font-mono text-xs">{((eq.power * eq.time) / 1000).toFixed(3)}</td>
                            <td>
                              <button onClick={() => removeEquipment(eq.id)} className="text-danger hover:text-red-700 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                    <button onClick={addEquipment} className="btn-secondary flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Equipment
                    </button>
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <label className="mb-0">Produced Mass (kg):</label>
                      <input
                        type="number"
                        value={data.p4_mass || ''}
                        onChange={e => setData(prev => ({ ...prev, p4_mass: parseFloat(e.target.value) || 0 }))}
                        className="w-20"
                      />
                      <div className="text-primary font-bold border-l pl-3 border-slate-300">
                        { (data.p4_equipments.reduce((acc, eq) => acc + (eq.power * eq.time) / 1000, 0) / (data.p4_mass || 1)).toFixed(2) } kWh/kg
                      </div>
                    </div>
                  </div>
                </div>
                <div className="score-box mt-4 sm:mt-0">
                  <span className="score-label">Score P4</span>
                  <span className="score-value">{p4_score.toFixed(2)}</span>
                </div>
              </div>

              {/* P5 */}
              <div className={`criteria-card ${!data.p5_enabled ? 'grayscale opacity-60' : ''}`}>
                <div className="input-group">
                  <div className="flex items-center justify-between mb-1">
                    <label className="mb-0">P5: Waste Generated (E-factor)</label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!data.p5_enabled}
                        onChange={e => setData(prev => ({ ...prev, p5_enabled: !e.target.checked }))}
                        className="w-3 h-3 accent-secondary"
                      />
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Not available information</span>
                    </label>
                  </div>
                  <select value={data.p5_score} onChange={e => setData(prev => ({ ...prev, p5_score: parseFloat(e.target.value) }))}>
                    <option value="1">1.00 - No waste (E = 0)</option>
                    <option value="0.85">0.85 - x ≤ 1 g/g (E ≤ 1)</option>
                    <option value="0.6">0.60 - 1 &lt; x ≤ 5 g/g</option>
                    <option value="0.35">0.35 - 5 &lt; x ≤ 10 g/g</option>
                    <option value="0.1">0.10 - x &gt; 10 g/g</option>
                    <option value="0">0.00 - Hazardous Waste</option>
                  </select>
                </div>
                <div className="score-box">
                  <span className="score-label">Score P5</span>
                  <span className="score-value">{data.p5_score.toFixed(2)}</span>
                </div>
              </div>

              {/* P6 */}
              <div className={`criteria-card ${!data.p6_enabled ? 'grayscale opacity-60' : ''}`}>
                <div className="input-group">
                  <div className="flex items-center justify-between mb-1">
                    <label className="mb-0">P6: Operator Safety</label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!data.p6_enabled}
                        onChange={e => setData(prev => ({ ...prev, p6_enabled: !e.target.checked }))}
                        className="w-3 h-3 accent-secondary"
                      />
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Not available information</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                    <div>
                      <label className="text-[10px] uppercase">Temp (ST)</label>
                      <select value={data.p6_temp} onChange={e => setData(prev => ({ ...prev, p6_temp: parseFloat(e.target.value) }))}>
                        <option value="1">≤ 40 °C</option>
                        <option value="0.75">40-80 °C</option>
                        <option value="0.5">80-150 °C</option>
                        <option value="0.25">150-250 °C</option>
                        <option value="0">&gt; 250 °C</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase">Pressure (SP)</label>
                      <select value={data.p6_pressure} onChange={e => setData(prev => ({ ...prev, p6_pressure: parseFloat(e.target.value) }))}>
                        <option value="1">Ambient</option>
                        <option value="0.75">1-5 bar</option>
                        <option value="0.5">5-20 bar</option>
                        <option value="0.25">20-50 bar</option>
                        <option value="0">&gt; 50 bar</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase">GHS Risk (SG)</label>
                      <select value={data.p6_ghs} onChange={e => setData(prev => ({ ...prev, p6_ghs: parseFloat(e.target.value) }))}>
                        <option value="1">None</option>
                        <option value="0.75">Low (Irritant)</option>
                        <option value="0.5">Medium (Flamm/Tox)</option>
                        <option value="0.25">High (Corrosive)</option>
                        <option value="0">Critical (Explos/Cancer)</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="score-box">
                  <span className="score-label">Score P6</span>
                  <span className="score-value">{p6_score.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* APPLICATION STAGE */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calculator className="w-6 h-6 text-secondary" />
                <h3 className="text-2xl font-bold text-primary">Application Stage (A)</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Average A</div>
                  <div className="text-xl font-black text-secondary">{aAvg.toFixed(2)}</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { id: 'a1', label: 'A1: Adsorption Capacity (qe,max)', options: [
                  { v: 1, t: '1.00 - q > 1.50' },
                  { v: 0.75, t: '0.75 - 0.75 < q ≤ 1.50' },
                  { v: 0.5, t: '0.50 - 0.30 < q ≤ 0.75' },
                  { v: 0.25, t: '0.25 - 0.03 < q ≤ 0.30' },
                  { v: 0, t: '0.00 - q ≤ 0.03' }
                ]},
                { id: 'a2', label: 'A2: Reuse (Cycles)', options: [
                  { v: 1, t: '1.00 - ≥ 6 cycles' },
                  { v: 0.75, t: '0.75 - 4 to 5 cycles' },
                  { v: 0.5, t: '0.50 - 2 to 3 cycles' },
                  { v: 0.25, t: '0.25 - 1 cycle' },
                  { v: 0, t: '0.00 - 0 cycle' }
                ]},
                { id: 'a3', label: 'A3: Real Conditions', options: [
                  { v: 1, t: '1.00 - ≥80% in real/simulated + interferents' },
                  { v: 0.75, t: '0.75 - <80% real, but ≥80% with pH adjustment' },
                  { v: 0.5, t: '0.50 - ≥80% lab with interfering species' },
                  { v: 0.25, t: '0.25 - ≥80% lab without interfering species' },
                  { v: 0, t: '0.00 - No criteria met' }
                ]},
                { id: 'a4', label: 'A4: Regeneration Solvent', options: [
                  { v: 1, t: '1.00 - Preferred green solvents' },
                  { v: 0.75, t: '0.75 - Acceptable regeneration media' },
                  { v: 0.5, t: '0.50 - Intermediate concern solvent' },
                  { v: 0.25, t: '0.25 - Problematic regeneration media' },
                  { v: 0, t: '0.00 - Highly hazardous regeneration media' }
                ]},
                { id: 'a5', label: 'A5: Secondary Leaching (Application)', options: [
                  { v: 1, t: '1.00 - No toxic species' },
                  { v: 0.75, t: '0.75 - With species, No leaching' },
                  { v: 0.5, t: '0.50 - With species, Below limit' },
                  { v: 0.25, t: '0.25 - With species, No study' },
                  { v: 0, t: '0.00 - With species, Above limit' }
                ]}
              ].map(crit => (
                <div key={crit.id} className={`criteria-card ${(data as any)[`${crit.id}_enabled`] === false ? 'grayscale opacity-60' : ''}`}>
                  <div className="input-group">
                    <div className="flex items-center justify-between mb-1">
                      <label className="mb-0">{crit.label}</label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!(data as any)[`${crit.id}_enabled`]}
                          onChange={e => setData(prev => ({ ...prev, [`${crit.id}_enabled`]: !e.target.checked }))}
                          className="w-3 h-3 accent-secondary"
                        />
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Not available information</span>
                      </label>
                    </div>
                    <select
                      value={(data as any)[`${crit.id}_score`]}
                      onChange={e => setData(prev => ({ ...prev, [`${crit.id}_score`]: parseFloat(e.target.value) }))}
                    >
                      {crit.options.map(opt => <option key={opt.v} value={opt.v}>{opt.t}</option>)}
                    </select>
                  </div>
                  <div className="score-box">
                    <span className="score-label">Score {crit.id.toUpperCase()}</span>
                    <span className="score-value">{(data as any)[`${crit.id}_score`].toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* DISPOSAL STAGE */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Recycle className="w-6 h-6 text-secondary" />
                <h3 className="text-2xl font-bold text-primary">Disposal Stage (D)</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Average D</div>
                  <div className="text-xl font-black text-secondary">{dAvg.toFixed(2)}</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {/* D1 */}
              <div className={`criteria-card ${!data.d1_enabled ? 'grayscale opacity-60' : ''}`}>
                <div className="input-group">
                  <div className="flex items-center justify-between mb-1">
                    <label className="mb-0">D1: Chemical Stability (ΔpH)</label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!data.d1_enabled}
                        onChange={e => setData(prev => ({ ...prev, d1_enabled: !e.target.checked }))}
                        className="w-3 h-3 accent-secondary"
                      />
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Not available information</span>
                    </label>
                  </div>
                  <select value={data.d1_score} onChange={e => setData(prev => ({ ...prev, d1_score: parseFloat(e.target.value) }))}>
                    <option value="1">1.00 - ΔpH ≤ 0.5 (High)</option>
                    <option value="0.5">0.50 - 0.5 &lt; ΔpH ≤ 1.5 (Moderate)</option>
                    <option value="0">0.00 - ΔpH &gt; 1.5 (Low)</option>
                  </select>
                </div>
                <div className="score-box">
                  <span className="score-label">Score D1</span>
                  <span className="score-value">{data.d1_score.toFixed(2)}</span>
                </div>
              </div>

              {/* D2 */}
              <div className={`criteria-card ${!data.d2_enabled ? 'grayscale opacity-60' : ''}`}>
                <div className="input-group">
                  <div className="flex items-center justify-between mb-1">
                    <label className="mb-0">D2: Secondary Contamination (Disposal)</label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!data.d2_enabled}
                        onChange={e => setData(prev => ({ ...prev, d2_enabled: !e.target.checked }))}
                        className="w-3 h-3 accent-secondary"
                      />
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Not available information</span>
                    </label>
                  </div>
                  <select value={data.d2_score} onChange={e => setData(prev => ({ ...prev, d2_score: parseFloat(e.target.value) }))}>
                    <option value="1">1.00 - No toxic species</option>
                    <option value="0.75">0.75 - With species, No leaching</option>
                    <option value="0.5">0.50 - With species, Below limit</option>
                    <option value="0.25">0.25 - With species, No study</option>
                    <option value="0">0.00 - With species, Above limit</option>
                  </select>
                </div>
                <div className="score-box">
                  <span className="score-label">Score D2</span>
                  <span className="score-value">{data.d2_score.toFixed(2)}</span>
                </div>
              </div>

              {/* D3 */}
              <div className={`criteria-card ${!data.d3_enabled ? 'grayscale opacity-60' : ''}`}>
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1">
                    <label className="mb-0">D3: Waste Composition</label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!data.d3_enabled}
                        onChange={e => setData(prev => ({ ...prev, d3_enabled: !e.target.checked }))}
                        className="w-3 h-3 accent-secondary"
                      />
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Not available information</span>
                    </label>
                  </div>
                  <div className="overflow-x-auto">
                    <table>
                      <thead>
                        <tr>
                          <th>Component</th>
                          <th>Fraction (f)</th>
                          <th>Score (S)</th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.d3_components.map(c => (
                          <tr key={c.id}>
                            <td><input type="text" value={c.name} onChange={e => updateD3Component(c.id, 'name', e.target.value)} placeholder="Ex: Clay" className="border-none p-1" /></td>
                            <td><input type="number" value={c.fraction || ''} step="0.1" max="1" min="0" onChange={e => updateD3Component(c.id, 'fraction', parseFloat(e.target.value) || 0)} className="border-none p-1 text-center" /></td>
                            <td>
                              <select value={c.score} onChange={e => updateD3Component(c.id, 'score', parseFloat(e.target.value))} className="border-none p-1">
                                <option value="1">1.00 - Reused/Green</option>
                                <option value="0.75">0.75 - Natural/Non-toxic</option>
                                <option value="0.5">0.50 - Green synthetic</option>
                                <option value="0.25">0.25 - Synthetic/Natural tox.</option>
                                <option value="0">0.00 - Toxic/Difficult disposal</option>
                              </select>
                            </td>
                            <td>
                              <button onClick={() => removeD3Component(c.id)} className="text-danger hover:text-red-700 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button onClick={addD3Component} className="btn-secondary mt-4 flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Component
                  </button>
                </div>
                <div className="score-box mt-4 sm:mt-0">
                  <span className="score-label">Score D3</span>
                  <span className="score-value">{d3_score.toFixed(2)}</span>
                </div>
              </div>

              {/* D4 */}
              <div className={`criteria-card ${!data.d4_enabled ? 'grayscale opacity-60' : ''}`}>
                <div className="input-group">
                  <div className="flex items-center justify-between mb-1">
                    <label className="mb-0">D4: Adsorbent-Pollutant Stability</label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!data.d4_enabled}
                        onChange={e => setData(prev => ({ ...prev, d4_enabled: !e.target.checked }))}
                        className="w-3 h-3 accent-secondary"
                      />
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Not available information</span>
                    </label>
                  </div>
                  <select value={data.d4_score} onChange={e => setData(prev => ({ ...prev, d4_score: parseFloat(e.target.value) }))}>
                    <option value="1">1.00 - Does not release pollutant</option>
                    <option value="0">0.00 - Releases pollutant</option>
                  </select>
                </div>
                <div className="score-box">
                  <span className="score-label">Score D4</span>
                  <span className="score-value">{data.d4_score.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* RESULTS SECTION */}
          <section className="bg-slate-50 -mx-6 sm:-mx-10 p-8 sm:p-12 border-t border-slate-200">
            <div className="text-center space-y-8">
              <h2 className="text-2xl font-bold text-primary">Sustainability Index</h2>

              <div className="relative max-w-lg mx-auto">
                <AdsusChart
                  pScores={pScores}
                  aScores={aScores}
                  dScores={dScores}
                  pEnabled={[data.p1_enabled, data.p2_enabled, data.p3_enabled, data.p4_enabled, data.p5_enabled, data.p6_enabled]}
                  aEnabled={[data.a1_enabled, data.a2_enabled, data.a3_enabled, data.a4_enabled, data.a5_enabled]}
                  dEnabled={[data.d1_enabled, data.d2_enabled, data.d3_enabled, data.d4_enabled]}
                  finalScore={finalScore}
                  stagePEnabled={true}
                  stageAEnabled={true}
                  stageDEnabled={true}
                />
              </div>

              <div className="space-y-2 flex flex-col items-center">
                <motion.h2
                  key={classification.level}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`text-3xl sm:text-4xl font-black uppercase tracking-tight ${classification.color}`}
                >
                  {classification.level}
                </motion.h2>
                {warningLabel && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xl sm:text-2xl font-black text-red-600 uppercase tracking-tight mt-1"
                  >
                    {warningLabel}
                  </motion.div>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch max-w-4xl mx-auto">
                {/* Legend Box */}
                <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left space-y-3">
                  {[
                    { range: '0.85 – 1.00', label: 'Excellent (Green Adsorbent)', color: 'bg-excellent' },
                    { range: '0.65 – 0.84', label: 'Good sustainability', color: 'bg-good' },
                    { range: '0.45 – 0.64', label: 'Intermediate sustainability', color: 'bg-inter' },
                    { range: '0.25 – 0.44', label: 'Low sustainability', color: 'bg-low' },
                    { range: '0.00 – 0.24', label: 'Unsustainable', color: 'bg-unsustainable' },
                  ].map(item => (
                    <div key={item.range} className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-sm shrink-0 ${item.color}`} />
                      <div className="text-sm">
                        <span className="font-bold text-slate-700">{item.range}:</span>{' '}
                        <span className="text-slate-500">{item.label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stage Averages Box */}
                <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left flex flex-col justify-center space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Stage Averages</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${data.p_enabled ? 'bg-secondary' : 'bg-slate-300'}`} />
                        <span className="text-sm font-bold text-slate-600">Production (P)</span>
                      </div>
                      <span className={`text-xl font-black ${data.p_enabled ? 'text-primary' : 'text-slate-300'}`}>{pAvg.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${data.a_enabled ? 'bg-secondary' : 'bg-slate-300'}`} />
                        <span className="text-sm font-bold text-slate-600">Application (A)</span>
                      </div>
                      <span className={`text-xl font-black ${data.a_enabled ? 'text-primary' : 'text-slate-300'}`}>{aAvg.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${data.d_enabled ? 'bg-secondary' : 'bg-slate-300'}`} />
                        <span className="text-sm font-bold text-slate-600">Disposal (D)</span>
                      </div>
                      <span className={`text-xl font-black ${data.d_enabled ? 'text-primary' : 'text-slate-300'}`}>{dAvg.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-slate-50 p-8 text-center border-t border-slate-200">
          <p className="text-slate-400 text-xs font-medium">© 2026 ADSUS - Adsorbent Sustainability Index</p>
        </footer>
      </div>
    </div>
  );
}
