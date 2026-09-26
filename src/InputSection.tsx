import { useState } from 'react';
import { createInputGrid, gridToText, isNumberInput, parseGrid, parseTextGrid } from './difference';
import GridView from './GridView';
import { isTextGridInput, preventInvalidInsertion, restoreRejectedInput } from './inputEvents';
import { presets } from './presets';
import { presetHref } from './urlState';

export default function InputSection({ initialGrid, inputGrid, negativeValuesEmphasized, onGridChange, onReset }: {
  initialGrid: string[][];
  inputGrid: string[][];
  negativeValuesEmphasized: boolean;
  onGridChange: (grid: string[][]) => void;
  onReset: (grid: string[][]) => void;
}) {
  const [rowCount, setRowCount] = useState(String(initialGrid.length));
  const [columnCount, setColumnCount] = useState(String(initialGrid[0].length));
  const [textInput, setTextInput] = useState(() => gridToText(initialGrid));
  const [textError, setTextError] = useState<string | null>(null);

  const resetGrid = () => {
    const rows = Number(rowCount);
    const columns = Number(columnCount);
    if (!Number.isInteger(rows) || !Number.isInteger(columns) || rows < 1 || columns < 1) return;
    const nextGrid = createInputGrid(Math.min(rows, 30), Math.min(columns, 30));
    setTextInput(gridToText(nextGrid));
    setTextError(null);
    onReset(nextGrid);
  };

  const updateCell = (row: number, column: number, value: string) => {
    if (!isNumberInput(value)) return false;
    const normalizedValue = value !== '' && Number.isFinite(Number(value)) ? String(Number(value)) : value;
    const nextGrid = inputGrid.map((currentRow, rowIndex) =>
      currentRow.map((currentValue, columnIndex) =>
        rowIndex === row && columnIndex === column ? normalizedValue : currentValue,
      ),
    );
    setTextInput(gridToText(nextGrid));
    setTextError(null);
    onGridChange(nextGrid);
    return true;
  };

  const checkTextInput = (text: string) => {
    const result = parseTextGrid(text);
    setTextError(result.error);
    return result;
  };

  const applyTextInput = () => {
    const result = checkTextInput(textInput);
    if (result.values === null) return;
    onGridChange(result.values);
    setTextInput(gridToText(result.values));
    setRowCount(String(result.values.length));
    setColumnCount(String(result.values[0].length));
  };

  return (
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
          onBeforeInput={(event) => preventInvalidInsertion(event, isTextGridInput)}
          onChange={(event) => {
            const nextText = event.target.value;
            if (!isTextGridInput(nextText)) {
              restoreRejectedInput(event.currentTarget, textInput);
              return;
            }
            setTextInput(nextText);
            checkTextInput(nextText);
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
        grid={parseGrid(inputGrid)}
        editableValues={inputGrid}
        negativeValuesEmphasized={negativeValuesEmphasized}
        onChange={updateCell}
      />
      <details className="preset-details">
        <summary>プリセット</summary>
        <div className="preset-list">
          {presets.map((preset) => (
            <a className="preset-link" href={presetHref(preset.inputGrid, preset.sequence)} key={preset.name}>
              <strong>{preset.name}</strong>
              <span>{preset.description}</span>
            </a>
          ))}
        </div>
      </details>
    </section>
  );
}
