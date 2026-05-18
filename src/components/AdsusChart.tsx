import React from 'react';

interface AdsusChartProps {
  pScores: number[];
  aScores: number[];
  dScores: number[];
  pEnabled: boolean[];
  aEnabled: boolean[];
  dEnabled: boolean[];
  finalScore: number;
  stagePEnabled: boolean;
  stageAEnabled: boolean;
  stageDEnabled: boolean;
}

const AdsusChart: React.FC<AdsusChartProps> = ({ 
  pScores, aScores, dScores, 
  pEnabled, aEnabled, dEnabled,
  finalScore,
  stagePEnabled, stageAEnabled, stageDEnabled
}) => {
  const w = 500;
  const h = 260;
  const cx = 250;
  const cy = 240;

  const rCriteriaOut = 230;
  const rCriteriaIn = 190;
  const rStageOut = 188;
  const rStageIn = 145;
  const rGlobalOut = 135;
  const rGlobalIn = 125;

  const totalItems = 15;
  const sliceDeg = 180 / totalItems;
  const gap = 0.5;

  const getColor = (val: number, enabled: boolean = true) => {
    if (!enabled) return "#cbd5e1"; // Gray-300
    if (val >= 0.85) return "#2ecc71";
    if (val >= 0.65) return "#8bc34a";
    if (val >= 0.45) return "#f1c40f";
    if (val >= 0.25) return "#e67e22";
    return "#c0392b";
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 180) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const createSlicePath = (x: number, y: number, rOuter: number, rInner: number, startAngle: number, endAngle: number) => {
    const startOuter = polarToCartesian(x, y, rOuter, endAngle);
    const endOuter = polarToCartesian(x, y, rOuter, startAngle);
    const startInner = polarToCartesian(x, y, rInner, endAngle);
    const endInner = polarToCartesian(x, y, rInner, startAngle);
    const largeArc = (endAngle - startAngle) <= 180 ? "0" : "1";

    return [
      "M", startOuter.x, startOuter.y,
      "A", rOuter, rOuter, 0, largeArc, 0, endOuter.x, endOuter.y,
      "L", endInner.x, endInner.y,
      "A", rInner, rInner, 0, largeArc, 1, startInner.x, startInner.y,
      "Z"
    ].join(" ");
  };

  const getTextPos = (x: number, y: number, radius: number, angle: number) => {
    return polarToCartesian(x, y, radius, angle);
  };

  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const scoreP = avg(pScores);
  const scoreA = avg(aScores);
  const scoreD = avg(dScores);

  let currentAngle = 0;

  const criteriaData = [
    ...pScores.map((s, i) => ({ score: s, enabled: stagePEnabled && pEnabled[i] })),
    ...aScores.map((s, i) => ({ score: s, enabled: stageAEnabled && aEnabled[i] })),
    ...dScores.map((s, i) => ({ score: s, enabled: stageDEnabled && dEnabled[i] })),
  ];

  return (
    <div className="w-full max-w-[500px] mx-auto overflow-hidden">
      <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} className="font-sans">
        {/* Individual Criteria */}
        {criteriaData.map((item, i) => {
          const start = currentAngle + gap;
          const end = currentAngle + sliceDeg - gap;
          const mid = (start + end) / 2;
          const path = createSlicePath(cx, cy, rCriteriaOut, rCriteriaIn, start, end);
          const txtPos = getTextPos(cx, cy, (rCriteriaOut + rCriteriaIn) / 2, mid);
          currentAngle += sliceDeg;
          
          // Numbering logic: 1-6 for P, 1-5 for A, 1-4 for D
          let num = 0;
          if (i < 6) num = i + 1;
          else if (i < 11) num = i - 5;
          else num = i - 10;

          return (
            <g key={`crit-${i}`}>
              <path d={path} fill={getColor(item.score, item.enabled)} stroke="#fff" strokeWidth="1" />
              <text
                x={txtPos.x}
                y={txtPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[10px] font-bold fill-white pointer-events-none"
              >
                {num}
              </text>
            </g>
          );
        })}

        {/* Stages */}
        {[
          { id: "P", count: 6, score: scoreP, enabled: stagePEnabled },
          { id: "A", count: 5, score: scoreA, enabled: stageAEnabled },
          { id: "D", count: 4, score: scoreD, enabled: stageDEnabled }
        ].reduce((acc: { angle: number, elements: React.ReactNode[] }, stage) => {
          const spanDeg = stage.count * sliceDeg;
          const start = acc.angle + gap;
          const end = acc.angle + spanDeg - gap;
          const mid = (start + end) / 2;
          const path = createSlicePath(cx, cy, rStageOut, rStageIn, start, end);
          const txtPos = getTextPos(cx, cy, (rStageOut + rStageIn) / 2, mid);
          
          acc.elements.push(
            <g key={`stage-${stage.id}`}>
              <path d={path} fill={getColor(stage.score, stage.enabled)} stroke="#fff" strokeWidth="1" />
              <text
                x={txtPos.x}
                y={txtPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-lg font-black fill-white pointer-events-none"
              >
                {stage.id}
              </text>
            </g>
          );
          acc.angle += spanDeg;
          return acc;
        }, { angle: 0, elements: [] }).elements}

        {/* Global Score Arc */}
        <path d={createSlicePath(cx, cy, rGlobalOut, rGlobalIn, 0, 180)} fill={getColor(finalScore)} />

        {/* Global Score Text */}
        <text
          x={cx}
          y={cy - 25}
          textAnchor="middle"
          dominantBaseline="alphabetic"
          className="text-6xl font-black"
          fill="#333"
        >
          {finalScore.toFixed(2)}
        </text>
      </svg>
    </div>
  );
};

export default AdsusChart;
