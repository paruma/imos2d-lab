import { directions, type Direction } from './difference';

export default function DirectionSection({ sequence, onSelect, onRemoveLast }: {
  sequence: Direction[];
  onSelect: (direction: Direction) => void;
  onRemoveLast: () => void;
}) {
  return (
    <section className="panel direction-panel" aria-labelledby="direction-title">
      <div className="section-heading">
        <div>
          <p className="section-kicker">NEXT DIFFERENCE</p>
          <h2 id="direction-title">次の差分方向</h2>
        </div>
        <span className="formula">A[r, c] − A[r − dy, c − dx]</span>
      </div>
      <p className="hint">方向を押すと、現在の配列に差分を1回適用します。配列外は0です。</p>
      <div className="direction-picker" aria-label="差分方向">
        {directions.map((direction) => (
          <button
            className="direction-button"
            key={`${direction.dx},${direction.dy}`}
            onClick={() => onSelect(direction)}
            style={{ gridColumn: direction.dx + 2, gridRow: direction.dy + 2 }}
            type="button"
          >
            <span>{direction.label}</span>
            <small>({direction.dx}, {direction.dy})</small>
          </button>
        ))}
      </div>
      {sequence.length > 0 && (
        <div className="sequence-block">
          <div className="sequence-line">
            <span>適用済み:</span>
            {sequence.map((direction, index) => (
              <span className="sequence-item" key={`${index}-${direction.dx}-${direction.dy}`}>
                {index + 1}. {direction.label} ({direction.dx}, {direction.dy})
              </span>
            ))}
          </div>
          <div className="sequence-controls">
            <button className="text-button" onClick={onRemoveLast} type="button">差分をクリア</button>
          </div>
        </div>
      )}
    </section>
  );
}
