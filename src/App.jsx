import { useCallback, useEffect, useRef, useState } from 'react';
import { Clock3, Cog, Pause, Play, RefreshCcw } from 'lucide-react';

const DEFAULT_SETTINGS = {
  mainTime: 15,
  moveLimit: 0,
  increment: 5,
};

const formatClock = (seconds) => {
  const value = Math.max(0, Math.ceil(seconds));
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const remainingSeconds = value % 60;

  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(remainingSeconds).padStart(2, '0');

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${paddedMinutes}:${paddedSeconds}`;
  }

  return `${paddedMinutes}:${paddedSeconds}`;
};

function App() {
  const [settings, setSettings] = useState({
    mainTime: DEFAULT_SETTINGS.mainTime * 60,
    moveLimit: DEFAULT_SETTINGS.moveLimit,
    increment: DEFAULT_SETTINGS.increment,
  });
  const [pendingSettings, setPendingSettings] = useState({
    mainTime: DEFAULT_SETTINGS.mainTime,
    moveLimit: DEFAULT_SETTINGS.moveLimit,
    increment: DEFAULT_SETTINGS.increment,
  });
  const [timeLeft, setTimeLeft] = useState({
    red: DEFAULT_SETTINGS.mainTime * 60,
    black: DEFAULT_SETTINGS.mainTime * 60,
  });
  const [activeSide, setActiveSide] = useState('red');
  const [moveCounts, setMoveCounts] = useState({ red: 0, black: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(null);
  const [setupOpen, setSetupOpen] = useState(false);
  const [moveTimer, setMoveTimer] = useState({
    red: DEFAULT_SETTINGS.moveLimit,
    black: DEFAULT_SETTINGS.moveLimit,
  });
  const lastTickRef = useRef(Date.now());

  const updateSettings = useCallback((newSettings) => {
    const mainTime = Number(newSettings.mainTime);
    const moveLimit = Number(newSettings.moveLimit);
    const increment = Number(newSettings.increment);

    setSettings({
      mainTime: mainTime * 60,
      moveLimit,
      increment,
    });
    setTimeLeft({
      red: mainTime * 60,
      black: mainTime * 60,
    });
    setMoveCounts({ red: 0, black: 0 });
    setActiveSide('red');
    setIsRunning(false);
    setIsPaused(false);
    setGameOver(null);
    setMoveTimer({ red: moveLimit, black: moveLimit });
    lastTickRef.current = Date.now();
  }, []);

  const switchTurn = useCallback(
    (nextSide = activeSide === 'red' ? 'black' : 'red') => {
      if (gameOver) {
        return;
      }

      setMoveCounts((previous) => ({
        ...previous,
        [activeSide]: previous[activeSide] + 1,
      }));
      setTimeLeft((previous) => ({
        ...previous,
        [activeSide]: Math.max(0, previous[activeSide] + settings.increment),
      }));
      setActiveSide(nextSide);
      setMoveTimer({ red: settings.moveLimit, black: settings.moveLimit });
      lastTickRef.current = Date.now();
    },
    [activeSide, gameOver, settings.increment, settings.moveLimit]
  );

  const handlePrimaryAction = () => {
    if (gameOver) {
      return;
    }

    if (!isRunning) {
      lastTickRef.current = Date.now();
      setIsRunning(true);
      setIsPaused(false);
      return;
    }

    if (isPaused) {
      lastTickRef.current = Date.now();
      setIsPaused(false);
      return;
    }

    setIsPaused(true);
  };

  const handleReset = () => {
    updateSettings({
      mainTime: settings.mainTime / 60,
      moveLimit: settings.moveLimit,
      increment: settings.increment,
    });
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code !== 'Space') {
        return;
      }

      event.preventDefault();
      if (gameOver) {
        return;
      }

      if (!isRunning) {
        lastTickRef.current = Date.now();
        setIsRunning(true);
        setIsPaused(false);
        return;
      }

      switchTurn();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isRunning, switchTurn]);

  useEffect(() => {
    if (!isRunning || isPaused || gameOver) {
      return undefined;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSeconds = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      setTimeLeft((previous) => {
        const next = { ...previous };
        const remaining = Math.max(0, next[activeSide] - deltaSeconds);

        if (remaining <= 0) {
          next[activeSide] = 0;
          setIsRunning(false);
          setGameOver((result) => result || {
            loser: activeSide,
            reason: 'Hết thời gian',
          });
          return next;
        }

        next[activeSide] = remaining;
        return next;
      });

      if (settings.moveLimit > 0) {
        setMoveTimer((previous) => {
          const nextValue = Math.max(0, previous[activeSide] - deltaSeconds);

          if (nextValue <= 0) {
            setIsRunning(false);
            setGameOver((result) => result || {
              loser: activeSide,
              reason: 'Hết thời gian nước đi',
            });
            return {
              ...previous,
              [activeSide]: 0,
            };
          }

          return {
            ...previous,
            [activeSide]: nextValue,
          };
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [activeSide, gameOver, isPaused, isRunning, settings.moveLimit]);

  const sideLabel = {
    red: 'Đỏ',
    black: 'Đen',
  };
  const winner = gameOver ? (gameOver.loser === 'red' ? 'black' : 'red') : null;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1f2937,_#020617_60%)] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-2 py-3 sm:px-4 sm:py-6">
        <header className="mb-2 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 shadow-lg shadow-black/20 backdrop-blur sm:mb-3 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-xl bg-amber-400/20 p-2 text-amber-300">
              <Clock3 size={18} className="sm:h-[22px] sm:w-[22px]" />
            </div>
            <div>
              <h1 className="text-[10px] uppercase tracking-[0.2em] text-slate-400 sm:text-xs">Chess Timer</h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSetupOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-100 transition hover:border-amber-400 hover:text-amber-300 sm:px-3 sm:py-2 sm:text-sm"
          >
            <Cog size={14} className="sm:h-4 sm:w-4" />
            Cài đặt
          </button>
        </header>

        <main className="flex flex-1 flex-col gap-2 sm:gap-3">
          <div className="grid flex-1 grid-cols-1 grid-rows-2 gap-2 sm:gap-3 md:grid-cols-2 md:grid-rows-1">
            {['red', 'black'].map((side) => {
              const isActive = activeSide === side;
              const label = sideLabel[side];
              const sideColor = side === 'red' ? 'from-red-700 via-red-600 to-red-500' : 'from-slate-700 via-slate-700 to-slate-500';
              const moveLimitProgress = settings.moveLimit > 0
                ? Math.min(1, Math.max(0, moveTimer[side] / settings.moveLimit))
                : 0;
              const moveLimitCircumference = 2 * Math.PI * 25;
              const sideBorderPathLength = 100;

              return (
                <button
                  key={side}
                  type="button"
                  onClick={() => isActive && switchTurn()}
                  className={`group relative min-h-[35vh] overflow-hidden rounded-[20px] border border-white/10 bg-gradient-to-br ${sideColor} p-2 text-left shadow-2xl shadow-black/30 transition-all duration-300 sm:min-h-[unset] sm:rounded-[28px] sm:p-4 md:min-h-[unset] ${
                    isActive ? 'scale-[1.01] ring-2 ring-amber-300/60 sm:ring-4' : 'opacity-90'
                  }`}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_55%)]" />
                  {settings.moveLimit > 0 && (
                    <svg
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 z-20 h-full w-full sm:hidden"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M50 1H80Q99 1 99 20V80Q99 99 80 99H20Q1 99 1 80V20Q1 1 20 1H50"
                        fill="none"
                        stroke="rgb(252,211,77)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        pathLength={sideBorderPathLength}
                        strokeDasharray={`${moveLimitProgress * sideBorderPathLength} ${sideBorderPathLength}`}
                        style={{ transition: 'stroke-dasharray 100ms linear' }}
                      />
                    </svg>
                  )}
                  <div className="relative z-10 flex h-full flex-col justify-between gap-2 sm:gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 sm:block">
                      <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-white/70 sm:text-xs">Bên {label}</p>
                      <p className="text-[10px] font-black text-white sm:mt-2 sm:text-2xl">{isActive ? 'Đang đi' : 'Sẵn sàng'}</p>
                      </div>
                      <div className="rounded-full border border-white/20 bg-black/10 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-white/80 sm:px-3 sm:text-xs">
                        {moveCounts[side]} nước
                      </div>
                    </div>

                    <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="inline-block rotate-90 whitespace-nowrap text-[clamp(1.7rem,6vw,5.2rem)] font-black leading-none tracking-tight text-white sm:rotate-0">
                          {formatClock(timeLeft[side])}
                        </span>
                      </div>
                    </div>

                    {settings.moveLimit > 0 && (
                      <div className="flex justify-center sm:hidden">
                        <div className="relative flex h-16 w-16 items-center justify-center">
                          <svg
                            aria-hidden="true"
                            className="-rotate-90 absolute inset-0 h-full w-full"
                            viewBox="0 0 56 56"
                          >
                            <circle
                              cx="28"
                              cy="28"
                              r="25"
                              fill="none"
                              stroke="rgba(255,255,255,0.2)"
                              strokeWidth="3"
                            />
                            <circle
                              cx="28"
                              cy="28"
                              r="25"
                              fill="none"
                              stroke="rgb(252,211,77)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeDasharray={moveLimitCircumference}
                              strokeDashoffset={moveLimitCircumference * (1 - moveLimitProgress)}
                              style={{
                                transition: 'stroke-dashoffset 100ms linear',
                              }}
                            />
                          </svg>
                          <div className="relative z-10 text-center">
                            <span className="block text-[7px] font-semibold uppercase tracking-wide text-white/65">Nước đi</span>
                            <span className="block text-xs font-bold tabular-nums text-white">{formatClock(moveTimer[side])}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {settings.moveLimit > 0 && (
                      <div className="hidden rounded-xl border border-white/10 bg-black/10 p-2 backdrop-blur-sm sm:block sm:rounded-2xl sm:p-3">
                        <div className="mb-1 flex items-center justify-between text-[7px] uppercase tracking-[0.14em] text-white/65 sm:text-[10px]">
                          <span>Move limit</span>
                          <span>{formatClock(moveTimer[side])}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-amber-300 transition-all duration-200"
                            style={{ width: `${moveLimitProgress * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-row flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 shadow-lg shadow-black/20 backdrop-blur sm:gap-3 sm:px-4 sm:py-3">
            <div className="text-[9px] uppercase tracking-[0.18em] text-slate-400 sm:text-xs">
              {gameOver ? 'Trận đấu kết thúc' : isPaused ? 'Tạm dừng' : isRunning ? 'Đang chạy' : 'Chưa bắt đầu'}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handlePrimaryAction}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-3 py-2 text-[11px] font-semibold text-slate-950 transition hover:bg-amber-300 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
              >
                {isRunning && !isPaused ? <Pause size={16} /> : <Play size={16} />}
                {isRunning && !isPaused ? 'Tạm dừng' : isPaused ? 'Tiếp tục' : 'Bắt đầu'}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-[11px] font-semibold text-slate-100 transition hover:border-slate-500 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
              >
                <RefreshCcw size={16} />
                Reset
              </button>
            </div>
          </div>
        </main>
      </div>

      {setupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl shadow-black/40">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Thiết lập</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Cài đặt thời gian</h2>
              </div>
              <button
                type="button"
                onClick={() => setSetupOpen(false)}
                className="rounded-full border border-slate-700 px-2 py-1 text-sm text-slate-300"
              >
                Đóng
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">Thời gian ván đấu (phút)</span>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={pendingSettings.mainTime}
                  onChange={(event) =>
                    setPendingSettings((previous) => ({
                      ...previous,
                      mainTime: Number(event.target.value) || 1,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none ring-0 transition focus:border-amber-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">Giới hạn thời gian mỗi nước (giây)</span>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={pendingSettings.moveLimit}
                  onChange={(event) =>
                    setPendingSettings((previous) => ({
                      ...previous,
                      moveLimit: Math.max(0, Number(event.target.value) || 0),
                    }))
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none ring-0 transition focus:border-amber-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">Thời gian cộng dồn (giây)</span>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={pendingSettings.increment}
                  onChange={(event) =>
                    setPendingSettings((previous) => ({
                      ...previous,
                      increment: Math.max(0, Number(event.target.value) || 0),
                    }))
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none ring-0 transition focus:border-amber-400"
                />
              </label>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSetupOpen(false)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 font-medium text-slate-200"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  updateSettings(pendingSettings);
                  setSetupOpen(false);
                }}
                className="rounded-xl bg-amber-400 px-4 py-2.5 font-semibold text-slate-950"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}

      {gameOver && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/85 px-4 backdrop-blur-sm"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="game-over-title"
          aria-describedby="game-over-reason"
        >
          <div className="w-full max-w-sm rounded-3xl border border-red-400/30 bg-slate-900 p-6 text-center shadow-2xl shadow-black/50">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-300">Trận đấu kết thúc</p>
            <h2 id="game-over-title" className="mt-3 text-3xl font-black text-white">
              Bên {sideLabel[gameOver.loser]} thua
            </h2>
            <p id="game-over-reason" className="mt-2 text-slate-300">
              Lý do: {gameOver.reason}
            </p>
            <p className="mt-1 text-sm font-medium text-amber-300">
              Bên {sideLabel[winner]} chiến thắng
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              <RefreshCcw size={18} />
              Chơi ván mới
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
