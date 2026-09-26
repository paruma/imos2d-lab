import assert from 'node:assert/strict';
import test from 'node:test';
import { directions } from '../src/difference.ts';
import { parseUrlState, presetHref, serializeUrlState } from '../src/urlState.ts';

const right = directions.find(({ dx, dy }) => dx === 1 && dy === 0);
const down = directions.find(({ dx, dy }) => dx === 0 && dy === 1);

test('URL は負数・小数・繰り返しの方向を往復できる', () => {
  const grid = [['0', '-2.5'], ['3', '0']];
  const sequence = [right, right, down];
  const href = presetHref(grid, sequence);
  assert.deepEqual(parseUrlState(href), { inputGrid: grid, sequence });
});

test('方向列を空にすると directions だけを消し、他のパラメータは保つ', () => {
  const params = new URLSearchParams('foo=bar&directions=1%2C0');
  const nextParams = serializeUrlState([['1', '2']], [], params);
  assert.equal(nextParams.get('foo'), 'bar');
  assert.equal(nextParams.get('grid'), '1,2');
  assert.equal(nextParams.has('directions'), false);
  assert.equal(params.get('directions'), '1,0');
});

test('不正な URL の方向列は捨て、グリッドは維持する', () => {
  assert.deepEqual(parseUrlState('?grid=1%2C2%3B3%2C4&directions=2%2C0'), {
    inputGrid: [['1', '2'], ['3', '4']],
    sequence: [],
  });
});

test('不正なグリッドは採用しない', () => {
  assert.deepEqual(parseUrlState('?grid=1%2C2%3B3'), { inputGrid: null, sequence: [] });
});
