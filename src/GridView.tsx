import { isNumberInput, type PositionedGrid } from './difference';
import { cellFontSize, formatNumber } from './gridFormatting';
import { preventInvalidInsertion, restoreRejectedInput } from './inputEvents';

export default function GridView({ grid, editableValues, negativeValuesEmphasized, onChange }: {
  grid: PositionedGrid;
  editableValues?: string[][];
  negativeValuesEmphasized: boolean;
  onChange?: (row: number, column: number, value: string) => boolean;
}) {
  const width = grid.values[0]?.length ?? 0;

  return (
    <div className="grid-scroll" role="region" aria-label="配列">
      <div className="grid-with-index">
        <div className="grid-index-corner" aria-hidden="true" />
        <div
          className="column-indexes"
          style={{ gridTemplateColumns: `repeat(${width}, 1.75rem)` }}
        >
          {Array.from({ length: width }, (_, columnIndex) => (
            <div className="grid-index" aria-hidden="true" key={`column-index-${columnIndex}`}>
              {grid.columnOrigin + columnIndex}
            </div>
          ))}
        </div>
        <div
          className="row-indexes"
          style={{ gridTemplateRows: `repeat(${grid.values.length}, 1.75rem)` }}
        >
          {grid.values.map((row, rowIndex) => (
            <div className="grid-index" aria-hidden="true" key={`row-index-${rowIndex}`}>
              {grid.rowOrigin + rowIndex}
            </div>
          ))}
        </div>
        <div className="grid" style={{ gridTemplateColumns: `repeat(${width}, 1.75rem)` }}>
          {grid.values.map((row, rowIndex) => row.map((value, columnIndex) => {
            const absoluteRow = grid.rowOrigin + rowIndex;
            const absoluteColumn = grid.columnOrigin + columnIndex;
            const key = `${absoluteRow}:${absoluteColumn}`;
            const isNonZero = value !== 0;
            const isNegative = value < 0;
            const editableValue = editableValues?.[rowIndex]?.[columnIndex];
            const displayValue = editableValue ?? formatNumber(value);

            return (
              <div
                className={`cell${isNonZero ? ' cell-nonzero' : ' cell-zero'}${negativeValuesEmphasized && isNegative ? ' cell-negative' : ''}`}
                key={key}
                style={{ fontSize: cellFontSize(displayValue) }}
              >
                {editableValues ? (
                  <input
                    aria-label={`行${absoluteRow} 列${absoluteColumn}`}
                    inputMode="decimal"
                    onBeforeInput={(event) => preventInvalidInsertion(event, isNumberInput)}
                    value={editableValue ?? String(value)}
                    onChange={(event) => {
                      const previousValue = editableValue ?? String(value);
                      const accepted = onChange?.(rowIndex, columnIndex, event.target.value) ?? true;
                      if (!accepted) restoreRejectedInput(event.currentTarget, previousValue);
                    }}
                  />
                ) : (
                  <span>{displayValue}</span>
                )}
              </div>
            );
          }))}
        </div>
      </div>
    </div>
  );
}
