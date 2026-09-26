import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateStages, difference, directions, parseGrid } from '../src/difference.ts';

const direction = (dx, dy) => directions.find((item) => item.dx === dx && item.dy === dy);

test('右差分は配列外を 0 として末尾まで出力する', () => {
  const result = difference(parseGrid([['1', '2', '4']]), direction(1, 0));
  assert.deepEqual(result, { values: [[1, 1, 2, -4]], rowOrigin: 0, columnOrigin: 0 });
});

test('左上差分では負の添字側にも領域が広がる', () => {
  const result = difference(parseGrid([['3']]), direction(-1, -1));
  assert.deepEqual(result, { values: [[-3, 0], [0, 3]], rowOrigin: -1, columnOrigin: -1 });
});

test('差分履歴は各段階の方向と値を順に保持する', () => {
  const stages = calculateStages([['1', '2', '4']], [direction(1, 0), direction(1, 0)]);
  assert.deepEqual(stages.map(({ values }) => values[0]), [
    [1, 2, 4],
    [1, 1, 2, -4],
    [1, 0, 1, -6, 4],
  ]);
  assert.equal(stages[1].direction?.label, '右');
  assert.equal(stages[2].direction?.label, '右');
});
