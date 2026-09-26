import {
  createChebyshevGrid,
  createConstantGrid,
  createManhattanGrid,
  createMultiplicationGrid,
  createPyramidGrid,
  createRotatedPyramidGrid,
  createRotatedSquareGrid,
  directions,
  type Direction,
} from './difference.ts';

export type Preset = {
  name: string;
  description?: string;
  inputGrid: string[][];
  sequence: Direction[];
};

const direction = (dx: Direction['dx'], dy: Direction['dy']) =>
  directions.find((item) => item.dx === dx && item.dy === dy)!;

const right = direction(1, 0);
const down = direction(0, 1);

export const presets: Preset[] = [
  {
    name: 'チェビシェフ距離',
    description: '中心からのチェビシェフ距離',
    inputGrid: createChebyshevGrid(7),
    sequence: [right, down, direction(1, 1), direction(-1, 1)],
  },
  {
    name: 'マンハッタン距離（正方形）',
    description: '中心からのマンハッタン距離',
    inputGrid: createManhattanGrid(7),
    sequence: [right, right, down, down],
  },
  {
    name: 'マンハッタン距離（距離3）',
    description: '距離3までを書いた配列',
    inputGrid: createManhattanGrid(7, 3),
    sequence: [right, down, direction(1, 1), direction(-1, 1)],
  },
  {
    name: 'ピラミッド（正方形）',
    description: '中心に近いほど値が大きい',
    inputGrid: createPyramidGrid(7),
    sequence: [right, down, direction(1, 1), direction(-1, 1)],
  },
  {
    name: 'ピラミッド（ひし形）',
    description: '中心に近いほど値が大きい',
    inputGrid: createRotatedPyramidGrid(7),
    sequence: [right, down, direction(1, 1), direction(1, -1)],
  },
  {
    name: '45度回転した正方形',
    description: 'ひし形の定数配列',
    inputGrid: createRotatedSquareGrid(7),
    sequence: [direction(1, 1), direction(1, -1)],
  },
  {
    name: '2次元0次いもす',
    description: '定数配列',
    inputGrid: createConstantGrid(7, 1),
    sequence: [right, down],
  },
  {
    name: '九九',
    description: '1から9までの掛け算表',
    inputGrid: createMultiplicationGrid(9),
    sequence: [right, right, down, down],
  },
  {
    name: '1次元0次いもす',
    description: '定数関数',
    inputGrid: [['0', '0', '1', '1', '1', '1', '1', '1', '1', '0', '0']],
    sequence: [right],
  },
  {
    name: '1次元1次いもす',
    description: '1次関数 x',
    inputGrid: [['0', '0', '0', '1', '2', '3', '4', '5', '6', '0', '0']],
    sequence: [right, right],
  },
  {
    name: '1次元2次いもす',
    description: '2次関数 x²',
    inputGrid: [['0', '0', '0', '1', '4', '9', '16', '25', '36', '0', '0']],
    sequence: [right, right, right],
  },
];
