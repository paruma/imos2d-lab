import { useState } from 'react';
import type { PositionedGrid, Stage } from './difference';
import GridView from './GridView';
import { formatNumber } from './gridFormatting';

export default function DifferenceHistory({ stages, negativeValuesEmphasized, onNegativeValuesEmphasizedChange }: {
  stages: Stage[];
  negativeValuesEmphasized: boolean;
  onNegativeValuesEmphasizedChange: (value: boolean) => void;
}) {
  const [copiedStage, setCopiedStage] = useState<string | null>(null);
  const [copyActionsVisible, setCopyActionsVisible] = useState(true);

  const copyStage = async (stage: PositionedGrid, stageIndex: number, delimiter: ' ' | '\t') => {
    const text = stage.values.map((row) => row.map(formatNumber).join(delimiter)).join('\n');
    await navigator.clipboard.writeText(text);
    const copyKey = `${stageIndex}:${delimiter === '\t' ? 'tab' : 'space'}`;
    setCopiedStage(copyKey);
    window.setTimeout(() => setCopiedStage((current) => current === copyKey ? null : current), 1400);
  };

  return (
    <section className="stages-section" aria-labelledby="stages-title">
      <div className="section-heading stages-heading">
        <div>
          <p className="section-kicker">DIFFERENCE HISTORY</p>
          <h2 id="stages-title">差分の履歴</h2>
        </div>
        <div className="display-controls">
          <label className="switch-control">
            <input
              checked={copyActionsVisible}
              onChange={(event) => setCopyActionsVisible(event.target.checked)}
              type="checkbox"
            />
            <span>コピー操作を表示</span>
          </label>
          <label className="switch-control">
            <input
              checked={negativeValuesEmphasized}
              onChange={(event) => onNegativeValuesEmphasizedChange(event.target.checked)}
              type="checkbox"
            />
            <span>負の数を強調</span>
          </label>
        </div>
      </div>
      <div className="stage-list">
        {stages.map((stage, index) => (
          <article className="stage-card" key={index}>
            <div className="stage-card-heading">
              <div>
                <span className="stage-index">{String(index).padStart(2, '0')}</span>
                <h3>{index === 0 ? '初期配列' : `差分 ${index}`}</h3>
              </div>
              {stage.direction && (
                <span className="direction-chip">{stage.direction.label} ({stage.direction.dx}, {stage.direction.dy})</span>
              )}
            </div>
            <GridView grid={stage} negativeValuesEmphasized={negativeValuesEmphasized} />
            {copyActionsVisible && (
              <div className="copy-actions">
                <span>コピー:</span>
                <button
                  className="copy-button"
                  onClick={() => copyStage(stage, index, ' ')}
                  type="button"
                >
                  {copiedStage === `${index}:space` ? 'コピー済み' : '空白区切り'}
                </button>
                <button
                  className="copy-button"
                  onClick={() => copyStage(stage, index, '\t')}
                  type="button"
                >
                  {copiedStage === `${index}:tab` ? 'コピー済み' : 'タブ区切り'}
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
