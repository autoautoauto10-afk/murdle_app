'use client';

import React, { useState, useEffect } from 'react';
import { generateDailyPuzzle } from '@/utils/puzzle';
import { PuzzleData, MultiGridState, CellMark, Hint } from '@/types/game';
import MultiGrid from '@/components/features/MultiGrid';
import Clues from '@/components/features/Clues';
import FinalAnswer from '@/components/features/FinalAnswer';
import { Search, Settings, Share2 } from 'lucide-react';

export default function Home() {
  const [puzzleSeed, setPuzzleSeed] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [gridState, setGridState] = useState<MultiGridState>({
    suspectWeapon: {},
    suspectLocation: {},
    weaponLocation: {},
  });
  const [hints, setHints] = useState<Hint[]>([]);
  const [gameResult, setGameResult] = useState<'playing' | 'won' | 'lost'>('playing');

  useEffect(() => {
    console.log('=== Puzzle Generation ===');
    console.log('Current Seed String:', puzzleSeed);
    const generated = generateDailyPuzzle(puzzleSeed);
    console.log('Generated Puzzle:');
    console.log('  - Solution:', generated.solution);
    console.log('  - Identity Clue:', generated.hints.find(h => h.type === 'identity')?.text);
    setPuzzle(generated);
    setHints(generated.hints);
  }, [puzzleSeed]);

  const handleCellClick = (
    gridType: 'suspectWeapon' | 'suspectLocation' | 'weaponLocation',
    id1: string,
    id2: string
  ) => {
    if (gameResult !== 'playing' || !puzzle) return;

    const key = `${id1}:${id2}`;
    const currentGrid = gridState[gridType];
    const currentMark: CellMark = currentGrid[key] || { state: 'empty', isAutoFilled: false };

    // CRITICAL: Auto-filled crosses are READ-ONLY and cannot be manually changed
    if (currentMark.isAutoFilled && currentMark.state === 'cross') {
      return; // Block any interaction with auto-filled crosses
    }

    // Helper function: Check if placing a circle would violate exclusivity
    const canPlaceCircle = (): boolean => {
      if (gridType === 'suspectWeapon') {
        // Check if row (id1) or column (id2) already has a circle
        for (const weapon of puzzle.weapons) {
          const k = `${id1}:${weapon.id}`;
          if (k !== key && gridState.suspectWeapon[k]?.state === 'circle') return false;
        }
        for (const suspect of puzzle.suspects) {
          const k = `${suspect.id}:${id2}`;
          if (k !== key && gridState.suspectWeapon[k]?.state === 'circle') return false;
        }
      } else if (gridType === 'suspectLocation') {
        for (const location of puzzle.locations) {
          const k = `${id1}:${location.id}`;
          if (k !== key && gridState.suspectLocation[k]?.state === 'circle') return false;
        }
        for (const suspect of puzzle.suspects) {
          const k = `${suspect.id}:${id2}`;
          if (k !== key && gridState.suspectLocation[k]?.state === 'circle') return false;
        }
      } else if (gridType === 'weaponLocation') {
        for (const location of puzzle.locations) {
          const k = `${id1}:${location.id}`;
          if (k !== key && gridState.weaponLocation[k]?.state === 'circle') return false;
        }
        for (const weapon of puzzle.weapons) {
          const k = `${weapon.id}:${id2}`;
          if (k !== key && gridState.weaponLocation[k]?.state === 'circle') return false;
        }
      }
      return true;
    };

    // Cycle: empty → circle (if allowed) OR cross → cross → empty
    let nextState: CellMark;
    if (currentMark.state === 'empty') {
      // Check if we can place a circle (no other circle in same row/column)
      if (canPlaceCircle()) {
        nextState = { state: 'circle', isAutoFilled: false };
      } else {
        // Skip circle, go directly to cross
        nextState = { state: 'cross', isAutoFilled: false };
      }
    } else if (currentMark.state === 'circle') {
      nextState = { state: 'cross', isAutoFilled: false };
    } else {
      nextState = { state: 'empty', isAutoFilled: false };
    }

    // Clone all grids
    const newGridState: MultiGridState = {
      suspectWeapon: { ...gridState.suspectWeapon },
      suspectLocation: { ...gridState.suspectLocation },
      weaponLocation: { ...gridState.weaponLocation },
    };

    // IMPORTANT: If we're removing a circle, clear auto-filled crosses BUT preserve those from other circles
    if (currentMark.state === 'circle' && nextState.state !== 'circle') {
      // First, identify which cells should be preserved (from other circles)
      const cellsToPreserve = new Set<string>();

      if (gridType === 'suspectWeapon') {
        // Find other circles in this grid and mark their auto-crosses for preservation
        for (const suspect of puzzle.suspects) {
          for (const weapon of puzzle.weapons) {
            const k = `${suspect.id}:${weapon.id}`;
            if (k !== key && newGridState.suspectWeapon[k]?.state === 'circle') {
              // This circle should preserve crosses in its row and column
              puzzle.weapons.forEach(w => {
                if (w.id !== weapon.id) cellsToPreserve.add(`${suspect.id}:${w.id}`);
              });
              puzzle.suspects.forEach(s => {
                if (s.id !== suspect.id) cellsToPreserve.add(`${s.id}:${weapon.id}`);
              });
            }
          }
        }

        // Now clear auto-filled crosses that are NOT preserved
        puzzle.weapons.forEach(w => {
          if (w.id !== id2) {
            const k = `${id1}:${w.id}`;
            if (newGridState.suspectWeapon[k]?.isAutoFilled && !cellsToPreserve.has(k)) {
              delete newGridState.suspectWeapon[k];
            }
          }
        });
        puzzle.suspects.forEach(s => {
          if (s.id !== id1) {
            const k = `${s.id}:${id2}`;
            if (newGridState.suspectWeapon[k]?.isAutoFilled && !cellsToPreserve.has(k)) {
              delete newGridState.suspectWeapon[k];
            }
          }
        });
      } else if (gridType === 'suspectLocation') {
        // Find other circles and mark their auto-crosses for preservation
        for (const suspect of puzzle.suspects) {
          for (const location of puzzle.locations) {
            const k = `${suspect.id}:${location.id}`;
            if (k !== key && newGridState.suspectLocation[k]?.state === 'circle') {
              puzzle.locations.forEach(l => {
                if (l.id !== location.id) cellsToPreserve.add(`${suspect.id}:${l.id}`);
              });
              puzzle.suspects.forEach(s => {
                if (s.id !== suspect.id) cellsToPreserve.add(`${s.id}:${location.id}`);
              });
            }
          }
        }

        puzzle.locations.forEach(l => {
          if (l.id !== id2) {
            const k = `${id1}:${l.id}`;
            if (newGridState.suspectLocation[k]?.isAutoFilled && !cellsToPreserve.has(k)) {
              delete newGridState.suspectLocation[k];
            }
          }
        });
        puzzle.suspects.forEach(s => {
          if (s.id !== id1) {
            const k = `${s.id}:${id2}`;
            if (newGridState.suspectLocation[k]?.isAutoFilled && !cellsToPreserve.has(k)) {
              delete newGridState.suspectLocation[k];
            }
          }
        });
      } else if (gridType === 'weaponLocation') {
        // Find other circles and mark their auto-crosses for preservation
        for (const weapon of puzzle.weapons) {
          for (const location of puzzle.locations) {
            const k = `${weapon.id}:${location.id}`;
            if (k !== key && newGridState.weaponLocation[k]?.state === 'circle') {
              puzzle.locations.forEach(l => {
                if (l.id !== location.id) cellsToPreserve.add(`${weapon.id}:${l.id}`);
              });
              puzzle.weapons.forEach(w => {
                if (w.id !== weapon.id) cellsToPreserve.add(`${w.id}:${location.id}`);
              });
            }
          }
        }

        puzzle.locations.forEach(l => {
          if (l.id !== id2) {
            const k = `${id1}:${l.id}`;
            if (newGridState.weaponLocation[k]?.isAutoFilled && !cellsToPreserve.has(k)) {
              delete newGridState.weaponLocation[k];
            }
          }
        });
        puzzle.weapons.forEach(w => {
          if (w.id !== id1) {
            const k = `${w.id}:${id2}`;
            if (newGridState.weaponLocation[k]?.isAutoFilled && !cellsToPreserve.has(k)) {
              delete newGridState.weaponLocation[k];
            }
          }
        });
      }
    }

    // Update the clicked cell
    newGridState[gridType][key] = nextState;

    // Auto-cross logic: when placing a circle
    if (nextState.state === 'circle') {
      if (gridType === 'suspectWeapon') {
        // Cross out other weapons for this suspect (ONLY if empty)
        puzzle.weapons.forEach(w => {
          if (w.id !== id2) {
            const k = `${id1}:${w.id}`;
            const cellMark = newGridState.suspectWeapon[k];
            // CRITICAL: Only auto-fill if cell is empty (never overwrite manual crosses)
            if (!cellMark || cellMark.state === 'empty') {
              newGridState.suspectWeapon[k] = { state: 'cross', isAutoFilled: true };
            }
          }
        });
        // Cross out other suspects for this weapon (ONLY if empty)
        puzzle.suspects.forEach(s => {
          if (s.id !== id1) {
            const k = `${s.id}:${id2}`;
            const cellMark = newGridState.suspectWeapon[k];
            // CRITICAL: Only auto-fill if cell is empty (never overwrite manual crosses)
            if (!cellMark || cellMark.state === 'empty') {
              newGridState.suspectWeapon[k] = { state: 'cross', isAutoFilled: true };
            }
          }
        });
      } else if (gridType === 'suspectLocation') {
        // Cross out other locations for this suspect (ONLY if empty)
        puzzle.locations.forEach(l => {
          if (l.id !== id2) {
            const k = `${id1}:${l.id}`;
            const cellMark = newGridState.suspectLocation[k];
            if (!cellMark || cellMark.state === 'empty') {
              newGridState.suspectLocation[k] = { state: 'cross', isAutoFilled: true };
            }
          }
        });
        // Cross out other suspects for this location (ONLY if empty)
        puzzle.suspects.forEach(s => {
          if (s.id !== id1) {
            const k = `${s.id}:${id2}`;
            const cellMark = newGridState.suspectLocation[k];
            if (!cellMark || cellMark.state === 'empty') {
              newGridState.suspectLocation[k] = { state: 'cross', isAutoFilled: true };
            }
          }
        });
      } else if (gridType === 'weaponLocation') {
        // Cross out other locations for this weapon (ONLY if empty)
        puzzle.locations.forEach(l => {
          if (l.id !== id2) {
            const k = `${id1}:${l.id}`;
            const cellMark = newGridState.weaponLocation[k];
            if (!cellMark || cellMark.state === 'empty') {
              newGridState.weaponLocation[k] = { state: 'cross', isAutoFilled: true };
            }
          }
        });
        // Cross out other weapons for this location (ONLY if empty)
        puzzle.weapons.forEach(w => {
          if (w.id !== id1) {
            const k = `${w.id}:${id2}`;
            const cellMark = newGridState.weaponLocation[k];
            if (!cellMark || cellMark.state === 'empty') {
              newGridState.weaponLocation[k] = { state: 'cross', isAutoFilled: true };
            }
          }
        });
      }
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

  const handleGenerateNewCase = () => {
    const confirmed = confirm('新しい事件を生成します。現在の進行状況はリセットされますがよろしいですか？');
    if (confirmed) {
      // Generate new random seed
      const newSeed = `random-${Date.now()}-${Math.random()}`;
      setPuzzleSeed(newSeed);

      // Reset all state
      setGridState({
        suspectWeapon: {},
        suspectLocation: {},
        weaponLocation: {},
      });
      setGameResult('playing');
    }
  };

  if (!puzzle) return <div className="min-h-screen bg-stone-100 flex items-center justify-center font-mono">事件ファイルを読み込み中...</div>;

  return (
    <main key={puzzleSeed} className="min-h-screen bg-stone-100 text-stone-900 font-sans p-4 md:p-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12 border-b-4 border-stone-800 pb-4">
        <div>
          <h1 className="text-3xl font-serif font-black tracking-tighter text-stone-900 flex items-center gap-2">
            <Search className="w-8 h-8" />
            探偵ロジック
          </h1>
          <p className="text-xs font-bold font-mono text-stone-500">
            {puzzle.date} // 事件 #402 // 難易度: {puzzle.difficulty} ({puzzle.gridSize}x{puzzle.gridSize})
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleGenerateNewCase}
            className="flex items-center gap-2 px-4 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-600 transition-colors font-bold text-sm"
          >
            🔄 別の事件を解決する
          </button>
          <button className="p-2 bg-stone-200 rounded-full hover:bg-stone-300 transition-colors">
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Clues */}
        <div className="lg:col-span-4">
          <Clues hints={hints} onToggleHint={toggleHint} />

          <div className="mt-8 bg-amber-50 border-l-4 border-amber-400 p-4 text-sm italic font-serif mb-8">
            「すべてのヒントが重要です、探偵。矛盾を見つけてください。」
          </div>
        </div>

        {/* Right Column: Multi-Grid */}
        <div className="lg:col-span-8">
          <h2 className="text-xl font-serif font-bold mb-6">証拠グリッド</h2>
          <MultiGrid
            suspects={puzzle.suspects}
            weapons={puzzle.weapons}
            locations={puzzle.locations}
            gridState={gridState}
            onCellClick={handleCellClick}
          />

          <div className="mt-8">
            <FinalAnswer
              suspects={puzzle.suspects}
              weapons={puzzle.weapons}
              locations={puzzle.locations}
              onCheck={handleFinalCheck}
            />
          </div>
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
      <footer className="max-w-6xl mx-auto mt-20 text-center text-stone-400 text-xs font-mono tracking-widest pb-8">
        &copy; 2026 探偵ロジック・エンジン // セキュア接続
      </footer>
    </main>
  );
}
