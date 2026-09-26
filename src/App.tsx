import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { calculateStages, createChebyshevGrid, type Direction } from './difference';
import DifferenceHistory from './DifferenceHistory';
import DirectionSection from './DirectionSection';
import InputSection from './InputSection';
import { parseUrlState, serializeUrlState } from './urlState';

const readInitialState = () =>
  typeof window === 'undefined'
    ? { inputGrid: null, sequence: [] }
    : parseUrlState(window.location.search);

const sampleGrid = createChebyshevGrid(7);

export default function App() {
  const [initialState] = useState(readInitialState);
  const initialGrid = initialState.inputGrid ?? sampleGrid;
  const [inputGrid, setInputGrid] = useState<string[][]>(initialGrid);
  const [sequence, setSequence] = useState<Direction[]>(initialState.sequence);
  const [negativeValuesEmphasized, setNegativeValuesEmphasized] = useState(true);
  const pendingScrollY = useRef<number | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.search = serializeUrlState(inputGrid, sequence, url.searchParams).toString();
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }, [inputGrid, sequence]);

  useLayoutEffect(() => {
    if (pendingScrollY.current === null) return;
    // 差分履歴の削除でページの高さが変わっても、連打中の操作位置を保つ。
    window.scrollTo({ top: pendingScrollY.current, behavior: 'auto' });
    pendingScrollY.current = null;
  }, [sequence]);

  const stages = useMemo(() => calculateStages(inputGrid, sequence), [inputGrid, sequence]);

  const resetGrid = (nextGrid: string[][]) => {
    setInputGrid(nextGrid);
    setSequence([]);
  };

  const removeLastDirection = () => {
    pendingScrollY.current = window.scrollY;
    setSequence((current) => current.slice(0, -1));
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

      <InputSection
        initialGrid={initialGrid}
        inputGrid={inputGrid}
        negativeValuesEmphasized={negativeValuesEmphasized}
        onGridChange={setInputGrid}
        onReset={resetGrid}
      />
      <DirectionSection
        sequence={sequence}
        onSelect={(direction) => setSequence((current) => [...current, direction])}
        onRemoveLast={removeLastDirection}
      />
      <DifferenceHistory
        stages={stages}
        negativeValuesEmphasized={negativeValuesEmphasized}
        onNegativeValuesEmphasizedChange={setNegativeValuesEmphasized}
      />
    </main>
  );
}
