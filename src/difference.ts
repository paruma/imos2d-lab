export type Grid = number[][];

export type Direction = {
  dx: -1 | 0 | 1;
  dy: -1 | 0 | 1;
  label: string;
};

export type PositionedGrid = {
  values: Grid;
  rowOrigin: number;
  columnOrigin: number;
};

export const directions: Direction[] = [
  { dx: -1, dy: -1, label: '左上' },
  { dx: 0, dy: -1, label: '上' },
  { dx: 1, dy: -1, label: '右上' },
  { dx: -1, dy: 0, label: '左' },
  { dx: 1, dy: 0, label: '右' },
  { dx: -1, dy: 1, label: '左下' },
  { dx: 0, dy: 1, label: '下' },
  { dx: 1, dy: 1, label: '右下' },
];

const contains = (grid: PositionedGrid, row: number, column: number) =>
  row >= grid.rowOrigin &&
  row < grid.rowOrigin + grid.values.length &&
  column >= grid.columnOrigin &&
  column < grid.columnOrigin + (grid.values[0]?.length ?? 0);

const valueAt = (grid: PositionedGrid, row: number, column: number) =>
  contains(grid, row, column) ? grid.values[row - grid.rowOrigin][column - grid.columnOrigin] : 0;

export const difference = (grid: PositionedGrid, direction: Direction): PositionedGrid => {
  const height = grid.values.length;
  const width = grid.values[0]?.length ?? 0;
  const rowOrigin = grid.rowOrigin + Math.min(0, direction.dy);
  const columnOrigin = grid.columnOrigin + Math.min(0, direction.dx);
  const nextHeight = height + Math.abs(direction.dy);
  const nextWidth = width + Math.abs(direction.dx);

  const values = Array.from({ length: nextHeight }, (_, rowIndex) => {
    const row = rowOrigin + rowIndex;
    return Array.from({ length: nextWidth }, (_, columnIndex) => {
      const column = columnOrigin + columnIndex;
      return valueAt(grid, row, column) - valueAt(grid, row - direction.dy, column - direction.dx);
    });
  });

  return { values, rowOrigin, columnOrigin };
};

export const parseGrid = (values: string[][]): PositionedGrid => ({
  values: values.map((row) => row.map((value) => {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : 0;
  })),
  rowOrigin: 0,
  columnOrigin: 0,
});

export type TextGridResult =
  | { values: string[][]; error: null }
  | { values: null; error: string };

export const parseTextGrid = (text: string): TextGridResult => {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) return { values: null, error: '配列を入力してください。' };

  const values = lines.map((line) => line.split(/\s+/));
  const columnCount = values[0].length;
  if (columnCount === 0) return { values: null, error: '数値を入力してください。' };
  if (values.some((row) => row.length !== columnCount)) {
    return { values: null, error: '各行の列数をそろえてください。' };
  }
  if (values.some((row) => row.some((value) => !Number.isFinite(Number(value))))) {
    return { values: null, error: '数値ではない値が含まれています。' };
  }
  if (values.length > 30 || columnCount > 30) {
    return { values: null, error: '行数・列数は30以下にしてください。' };
  }
  return { values, error: null };
};

export const gridToText = (values: string[][]): string => values.map((row) => row.join(' ')).join('\n');

export const createInputGrid = (rows: number, columns: number): string[][] =>
  Array.from({ length: rows }, () => Array.from({ length: columns }, () => ''));

export const createChebyshevGrid = (size: number): string[][] => {
  const center = Math.floor(size / 2);
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) => String(Math.max(Math.abs(row - center), Math.abs(column - center)))),
  );
};

export const createManhattanGrid = (size: number, maxDistance = Number.POSITIVE_INFINITY): string[][] => {
  const center = Math.floor(size / 2);
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) => {
      const distance = Math.abs(row - center) + Math.abs(column - center);
      return String(distance <= maxDistance ? distance : 0);
    }),
  );
};

export const createMultiplicationGrid = (size: number): string[][] =>
  Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) => String((row + 1) * (column + 1))),
  );

export const createConstantGrid = (size: number, value: number): string[][] =>
  Array.from({ length: size }, () => Array.from({ length: size }, () => String(value)));

export const createRotatedSquareGrid = (size: number): string[][] => {
  const center = Math.floor(size / 2);
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) =>
      String(Math.abs(row - center) + Math.abs(column - center) <= center ? 1 : 0),
    ),
  );
};
