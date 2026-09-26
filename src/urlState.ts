import { directions, parseGrid, parseTextGrid, type Direction } from './difference.ts';

export type UrlState = {
  inputGrid: string[][] | null;
  sequence: Direction[];
};

const parseUrlGrid = (value: string): string[][] | null =>
  parseTextGrid(value.replaceAll(';', '\n').replaceAll(',', ' ')).values;

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

export const parseUrlState = (search: string): UrlState => {
  const params = new URLSearchParams(search);
  const gridText = params.get('grid');
  const directionsText = params.get('directions');
  return {
    inputGrid: gridText === null ? null : parseUrlGrid(gridText),
    sequence: directionsText === null ? [] : parseUrlDirections(directionsText) ?? [],
  };
};

export const serializeUrlState = (
  inputGrid: string[][],
  sequence: Direction[],
  currentParams = new URLSearchParams(),
) => {
  const params = new URLSearchParams(currentParams);
  const normalizedGrid = parseGrid(inputGrid).values;
  params.set('grid', normalizedGrid.map((row) => row.join(',')).join(';'));
  if (sequence.length > 0) {
    params.set('directions', sequence.map(({ dx, dy }) => `${dx},${dy}`).join(';'));
  } else {
    params.delete('directions');
  }
  return params;
};

export const presetHref = (inputGrid: string[][], sequence: Direction[]) =>
  `?${serializeUrlState(inputGrid, sequence).toString()}`;
