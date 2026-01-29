'use client';

import React, { useState, useEffect } from 'react';
import { generateDailyPuzzle } from '@/utils/puzzle';
import { PuzzleData, GridState, CellState, Hint } from '@/types/game';
import Grid from '@/components/features/Grid';
import Clues from '@/components/features/Clues';
import FinalAnswer from '@/components/features/FinalAnswer';
import { Search, Settings, Share2, Terminal } from 'lucide-react';

export default function Home() {
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [gridState, setGridState] = useState<GridState>({});
  const [hints, setHints] = useState<Hint[]>([]);
  const [gameResult, setGameResult] = useState<'playing' | 'won' | 'lost'>('playing');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const generated = generateDailyPuzzle(today);
    setPuzzle(generated);
    setHints(generated.hints);
  }, []);

  const handleCellClick = (id1: string, id2: string) => {
    if (gameResult !== 'playing') return;

    const key = `${id1}:${id2}`;
    const currentState = gridState[key] || 'empty';
    let nextState: CellState;

    // New cycle: empty → circle → cross → empty
    if (currentState === 'empty') nextState = 'circle';
    else if (currentState === 'circle') nextState = 'cross';
    else nextState = 'empty';

    const newGridState = { ...gridState, [key]: nextState };

    // Auto-cross logic when circle is placed
    if (nextState === 'circle') {
      // Cross out other cells in the same row and column
      puzzle?.suspects.forEach(s => {
        if (s.id !== id1) {
          const rowKey = `${s.id}:${id2}`;
          if (newGridState[rowKey] !== 'circle') {
            newGridState[rowKey] = 'cross';
          }
        }
      });
      puzzle?.weapons.forEach(w => {
        if (w.id !== id2) {
          const colKey = `${id1}:${w.id}`;
          if (newGridState[colKey] !== 'circle') {
            newGridState[colKey] = 'cross';
          }
        }
      });
    }

    setGridState(newGridState);
  };

  const toggleHint = (id: string) => {
    setHints(hints.map(h => h.id === id ? { ...h, isStrikethrough: !h.isStrikethrough } : h));
  };

  const handleFinalCheck = (sId: string, wId: string, lId: string) => {
    if (!puzzle) return;
    if (sId === puzzle.solution.suspectId && wId === puzzle.solution.weaponId && lId === puzzle.solution.locationId) {
      setGameResult('won');
    } else {
      setGameResult('lost');
    }
  };

  const handleShare = () => {
    const text = `探偵ロジック: 日刊事件簿\n${gameResult === 'won' ? '事件解決 🟩' : '未解決 ⬛️'}\n#探偵ロジック`;
    navigator.clipboard.writeText(text);
    alert('結果をクリップボードにコピーしました！');
  };

  if (!puzzle) return <div className="min-h-screen bg-stone-100 flex items-center justify-center font-mono">事件ファイルを読み込み中...</div>;

  return (
    <main className="min-h-screen bg-stone-100 text-stone-900 font-sans p-4 md:p-8">
      {/* Header */}
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-12 border-b-4 border-stone-800 pb-4">
        <div>
          <h1 className="text-3xl font-serif font-black tracking-tighter text-stone-900 flex items-center gap-2">
            <Search className="w-8 h-8" />
            探偵ロジック
          </h1>
          <p className="text-xs font-bold font-mono text-stone-500">{puzzle.date} // 事件 #402</p>
        </div>
        <div className="flex gap-4">
          <button className="p-2 bg-stone-200 rounded-full hover:bg-stone-300 transition-colors">
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Clues */}
        <div className="lg:col-span-5">
          <Clues hints={hints} onToggleHint={toggleHint} />

          <div className="mt-8 bg-amber-50 border-l-4 border-amber-400 p-4 text-sm italic font-serif">
            「すべてのヒントが重要です、探偵。矛盾を見つけてください。」
          </div>
        </div>

        {/* Right Column: Grid and Final Answer */}
        <div className="lg:col-span-12 xl:col-span-7">
          <div className="mb-12">
            <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              証拠グリッド（容疑者 × 凶器）
            </h2>
            <Grid
              category1={puzzle.suspects}
              category2={puzzle.weapons}
              gridState={gridState}
              onCellClick={handleCellClick}
            />
          </div>

          <FinalAnswer
            suspects={puzzle.suspects}
            weapons={puzzle.weapons}
            locations={puzzle.locations}
            onCheck={handleFinalCheck}
          />
        </div>
      </div>

      {/* Result Modal / Overlay */}
      {gameResult !== 'playing' && (
        <div className="fixed inset-0 bg-stone-900/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-stone-50 p-12 rounded-2xl shadow-2xl max-w-md w-full text-center border-8 border-double border-stone-800 animate-in fade-in zoom-in duration-300">
            <h2 className={`text-5xl font-serif font-black mb-4 ${gameResult === 'won' ? 'text-green-700' : 'text-red-700'}`}>
              {gameResult === 'won' ? '事件解決' : '未解決'}
            </h2>
            <p className="text-stone-600 mb-8 font-mono">
              {gameResult === 'won'
                ? 'あなたの推理は完璧でした。真実が明らかになりました。'
                : '犯人は逃げました！メモを見直してもう一度挑戦してください。'}
            </p>
            <div className="flex flex-col gap-4">
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 bg-stone-800 text-white font-bold py-4 px-8 rounded-lg hover:bg-stone-700 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                結果を共有
              </button>
              <button
                onClick={() => setGameResult('playing')}
                className="text-stone-500 underline font-bold"
              >
                メモに戻る
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-4xl mx-auto mt-20 text-center text-stone-400 text-xs font-mono tracking-widest pb-8">
        &copy; 2026 探偵ロジック・エンジン // セキュア接続
      </footer>
    </main>
  );
}
