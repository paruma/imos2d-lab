import { useEffect, useMemo, useState } from 'react';
import {
  createChebyshevGrid,
  createInputGrid,
  difference,
  directions,
  gridToText,
  parseGrid,
  parseTextGrid,
  type Direction,
  type PositionedGrid,
} from './difference';

type Stage = PositionedGrid & { direction?: Direction };

const sampleGrid = createChebyshevGrid(7);

const formatNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toLocaleString('en-US', { maximumFractionDigits: 4 });

type UrlState = {
  inputGrid: string[][] | null;
  sequence: Direction[];
};

const parseUrlGrid = (value: string): string[][] | null => {
  const result = parseTextGrid(value.replaceAll(';', '\n').replaceAll(',', ' '));
  return result.values;
};

const parseUrlDirections = (value: string): Direction[] | null => {
  if (value === '') return [];

  const parsed = value.split(';').map((item) => {
    const parts = item.split(',');
    if (parts.length !== 2 || parts.some((part) => part === '')) return null;
    const [dxText, dyText] = parts;
    const dx = Number(dxText);
    const dy = Number(dyText);
    return directions.find((direction) => direction.dx === dx && direction.dy === dy) ?? null;
  });
  return parsed.every((direction) => direction !== null)
    ? parsed as Direction[]
    : null;
};

const readUrlState = (): UrlState => {
  if (typeof window === 'undefined') return { inputGrid: null, sequence: [] };

  const params = new URLSearchParams(window.location.search);
  const gridText = params.get('grid');
  const directionsText = params.get('directions');
  const inputGrid = gridText === null ? null : parseUrlGrid(gridText);
  const sequence = directionsText === null ? [] : parseUrlDirections(directionsText);

  return {
    inputGrid,
    sequence: sequence ?? [],
  };
};

const updateUrl = (inputGrid: string[][], sequence: Direction[]) => {
  const url = new URL(window.location.href);
  const normalizedGrid = parseGrid(inputGrid).values;
  url.searchParams.set('grid', normalizedGrid.map((row) => row.join(',')).join(';'));
  if (sequence.length > 0) {
    url.searchParams.set('directions', sequence.map(({ dx, dy }) => `${dx},${dy}`).join(';'));
  } else {
    url.searchParams.delete('directions');
  }

  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
};

function GridView({ grid, editable, onChange }: {
  grid: PositionedGrid;
  editable?: boolean;
  onChange?: (row: number, column: number, value: string) => void;
}) {
  const width = grid.values[0]?.length ?? 0;

  return (
    <div className="grid-scroll" role="region" aria-label="配列">
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${width}, 1.75rem)` }}
      >
        {grid.values.map((row, rowIndex) => row.map((value, columnIndex) => {
          const absoluteRow = grid.rowOrigin + rowIndex;
          const absoluteColumn = grid.columnOrigin + columnIndex;
          const key = `${absoluteRow}:${absoluteColumn}`;
          const isNonZero = value !== 0;

          return (
            <div
              className={`cell${isNonZero ? ' cell-nonzero' : ''}`}
              key={key}
              title={`(${absoluteRow}, ${absoluteColumn})`}
            >
              {editable ? (
                <input
                  aria-label={`行${absoluteRow} 列${absoluteColumn}`}
                  inputMode="decimal"
                  value={String(value)}
                  onChange={(event) => onChange?.(rowIndex, columnIndex, event.target.value)}
                />
              ) : (
                <span>{formatNumber(value)}</span>
              )}
            </div>
          );
        }))}
      </div>
      <div className="coordinates">
        行の範囲: {grid.rowOrigin} 〜 {grid.rowOrigin + grid.values.length - 1}
        <span aria-hidden="true"> · </span>
        列の範囲: {grid.columnOrigin} 〜 {grid.columnOrigin + width - 1}
      </div>
    </div>
  );
}

function DirectionPicker({ onSelect, disabled }: {
  onSelect: (direction: Direction) => void;
  disabled: boolean;
}) {
  return (
    <div className="direction-picker" aria-label="差分方向">
      {directions.map((direction) => (
        <button
          className="direction-button"
          disabled={disabled}
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
  );
}

export default function App() {
  const [urlState] = useState(readUrlState);
  const initialGrid = urlState.inputGrid ?? sampleGrid;
  const [rowCount, setRowCount] = useState(String(initialGrid.length));
  const [columnCount, setColumnCount] = useState(String(initialGrid[0].length));
  const [inputGrid, setInputGrid] = useState<string[][]>(initialGrid);
  const [textInput, setTextInput] = useState(() => gridToText(initialGrid));
  const [textError, setTextError] = useState<string | null>(null);
  const [sequence, setSequence] = useState<Direction[]>(urlState.sequence);
  const [copiedStage, setCopiedStage] = useState<string | null>(null);

  useEffect(() => {
    updateUrl(inputGrid, sequence);
  }, [inputGrid, sequence]);

  const stages = useMemo<Stage[]>(() => {
    const result: Stage[] = [{ ...parseGrid(inputGrid) }];
    for (const direction of sequence) {
      const next = difference(result[result.length - 1], direction);
      result.push({ ...next, direction });
    }
    return result;
  }, [inputGrid, sequence]);

  const resetGrid = () => {
    const rows = Number(rowCount);
    const columns = Number(columnCount);
    if (!Number.isInteger(rows) || !Number.isInteger(columns) || rows < 1 || columns < 1) return;
    const nextGrid = createInputGrid(Math.min(rows, 30), Math.min(columns, 30));
    setInputGrid(nextGrid);
    setTextInput(gridToText(nextGrid));
    setTextError(null);
    setSequence([]);
  };

  const updateCell = (row: number, column: number, value: string) => {
    const nextGrid = inputGrid.map((currentRow, rowIndex) =>
      currentRow.map((currentValue, columnIndex) =>
        rowIndex === row && columnIndex === column ? value : currentValue,
      ),
    );
    setInputGrid(nextGrid);
    setTextInput(gridToText(nextGrid));
    setTextError(null);
    setSequence([]);
  };

  const checkTextInput = (text: string) => {
    const result = parseTextGrid(text);
    setTextError(result.error);
    return result;
  };

  const applyTextInput = () => {
    const result = checkTextInput(textInput);
    if (result.values === null) return;
    setInputGrid(result.values);
    setTextInput(gridToText(result.values));
    setRowCount(String(result.values.length));
    setColumnCount(String(result.values[0].length));
    setSequence([]);
  };

  const applyDirection = (direction: Direction) => setSequence((current) => [...current, direction]);

  const clearStages = () => setSequence((current) => current.slice(0, -1));

  const copyStage = async (stage: PositionedGrid, stageIndex: number, delimiter: ' ' | '\t') => {
    const text = stage.values.map((row) => row.map(formatNumber).join(delimiter)).join('\n');
    await navigator.clipboard.writeText(text);
    const copyKey = `${stageIndex}:${delimiter === '\t' ? 'tab' : 'space'}`;
    setCopiedStage(copyKey);
    window.setTimeout(() => setCopiedStage((current) => current === copyKey ? null : current), 1400);
  };

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">2D DIFFERENCE EXPERIMENT</p>
        <h1>imos2d-lab</h1>
        <p className="lead">
          完成後の配列に方向差分を順番に適用して、2次元いもす法の更新点表現を試す実験室。
        </p>
      </header>

      <section className="panel setup-panel" aria-labelledby="setup-title">
        <div className="section-heading">
          <div>
            <p className="section-kicker">STARTING ARRAY</p>
            <h2 id="setup-title">初期配列</h2>
          </div>
        </div>
        <div className="size-controls">
          <label>
            行数
            <input min="1" max="30" onChange={(event) => setRowCount(event.target.value)} type="number" value={rowCount} />
          </label>
          <label>
            列数
            <input min="1" max="30" onChange={(event) => setColumnCount(event.target.value)} type="number" value={columnCount} />
          </label>
          <button className="secondary-button" onClick={resetGrid} type="button">グリッドを作り直す</button>
        </div>
        <div className="text-entry">
          <div className="text-entry-heading">
            <div>
              <strong>テキストで入力</strong>
              <span>行は空白区切り・タブ区切りに対応。</span>
            </div>
            <button className="secondary-button" disabled={textError !== null} onClick={applyTextInput} type="button">
              グリッドに反映
            </button>
          </div>
          <textarea
            aria-label="初期配列のテキスト入力"
            className={textError ? 'text-input has-error' : 'text-input'}
            onChange={(event) => {
              setTextInput(event.target.value);
              checkTextInput(event.target.value);
            }}
            onKeyDown={(event) => {
              if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault();
                applyTextInput();
              }
            }}
            placeholder={'1 2 3 4\n5 6 7 8\n9 10 11 12'}
            spellCheck={false}
            value={textInput}
          />
          <div aria-live="polite" className={textError ? 'text-status error' : 'text-status'}>
            {textError ?? 'Ctrl + Enter でも反映できます。'}
          </div>
        </div>
        <p className="hint">グリッドのセルを直接編集することもできます。空欄は0として計算します。</p>
        <GridView
          editable
          grid={stages[0]}
          onChange={updateCell}
        />
      </section>

      <section className="panel direction-panel" aria-labelledby="direction-title">
        <div className="section-heading">
          <div>
            <p className="section-kicker">NEXT DIFFERENCE</p>
            <h2 id="direction-title">次の差分方向</h2>
          </div>
          <span className="formula">A[r, c] − A[r − dy, c − dx]</span>
        </div>
        <p className="hint">方向を押すと、現在の配列に差分を1回適用します。配列外は0です。</p>
        <DirectionPicker disabled={false} onSelect={applyDirection} />
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
              <button className="text-button" onClick={clearStages} type="button">差分をクリア</button>
            </div>
          </div>
        )}
      </section>

      <section className="stages-section" aria-labelledby="stages-title">
        <div className="section-heading stages-heading">
          <div>
            <p className="section-kicker">EXPERIMENT TRAIL</p>
            <h2 id="stages-title">差分の履歴</h2>
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
              <GridView grid={stage} />
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
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
