import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateStages, createPyramidGrid, createRotatedPyramidGrid } from '../src/difference.ts';
import { presets } from '../src/presets.ts';

const square = presets.find((preset) => preset.name === 'ピラミッド（正方形）');
const rotated = presets.find((preset) => preset.name === 'ピラミッド（ひし形）');

test('7×7 のピラミッドは指定された 3×3 の形を中心に持つ', () => {
  assert.deepEqual(square.inputGrid.slice(2, 5).map((row) => row.slice(2, 5)), [
    ['3', '3', '3'],
    ['3', '4', '3'],
    ['3', '3', '3'],
  ]);
  assert.deepEqual(createPyramidGrid(3), [
    ['1', '1', '1'],
    ['1', '2', '1'],
    ['1', '1', '1'],
  ]);
  assert.deepEqual(createRotatedPyramidGrid(3), [
    ['0', '1', '0'],
    ['1', '2', '1'],
    ['0', '1', '0'],
  ]);
  assert.equal(square.inputGrid[3][3], '4');
  assert.equal(rotated.inputGrid[3][3], '4');
});

test('最終差分の非ゼロ更新点数はサイズで増えない', () => {
  for (const size of [3, 7, 11]) {
    const squareLast = calculateStages(createPyramidGrid(size), square.sequence).at(-1);
    const rotatedLast = calculateStages(createRotatedPyramidGrid(size), rotated.sequence).at(-1);
    assert.equal(squareLast.values.flat().filter((value) => value !== 0).length, 8);
    assert.equal(rotatedLast.values.flat().filter((value) => value !== 0).length, 16);
  }
});
