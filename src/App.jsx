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
  const [gameOver, setGameOver] = useState('');
  const [setupOpen, setSetupOpen] = useState(false);
  const [moveTimer, setMoveTimer] = useState(DEFAULT_SETTINGS.moveLimit);
  const lastTickRef = useRef(Date.now());

  const updateSettings = useCallback((newSettings) => {
    setSettings({
      mainTime: Number(newSettings.mainTime) * 60,
      moveLimit: Number(newSettings.moveLimit),
      increment: Number(newSettings.increment),
    });
    setTimeLeft({
      red: Number(newSettings.mainTime) * 60,
      black: Number(newSettings.mainTime) * 60,
    });
    setMoveCounts({ red: 0, black: 0 });
    setActiveSide('red');
    setIsRunning(false);
    setIsPaused(false);
    setGameOver('');
    setMoveTimer(Number(newSettings.moveLimit));
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
      setMoveTimer(settings.moveLimit > 0 ? settings.moveLimit : 0);
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
          setGameOver(`${activeSide === 'red' ? 'Đỏ' : 'Đen'} đã hết giờ!`);
          return next;
        }

        next[activeSide] = remaining;
        return next;
      });

      if (settings.moveLimit > 0) {
        setMoveTimer((previous) => {
          const nextValue = Math.max(0, previous - deltaSeconds);

          if (nextValue <= 0) {
            switchTurn();
            return settings.moveLimit;
          }

          return nextValue;
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [activeSide, gameOver, isPaused, isRunning, settings.moveLimit, switchTurn]);

  const sideLabel = {
    red: 'Đỏ',
    black: 'Đen',
  };

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

                    <div className="flex flex-1 flex-col justify-center">
                    <div className="mt-1 flex items-center justify-center whitespace-nowrap text-[clamp(1.7rem,6vw,5.2rem)] font-black leading-none tracking-tight text-white sm:rotate-0">
                      <span className="inline-block rotate-90 sm:rotate-0">{formatClock(timeLeft[side])}</span>
                      </div>
                    </div>

                    {settings.moveLimit > 0 && (
                      <div className="rounded-xl border border-white/10 bg-black/10 p-2 backdrop-blur-sm sm:rounded-2xl sm:p-3">
                        <div className="mb-1 flex items-center justify-between text-[7px] uppercase tracking-[0.14em] text-white/65 sm:text-[10px]">
                          <span>Move limit</span>
                          <span className="rotate-90 sm:rotate-0">{formatClock(moveTimer)}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-amber-300 transition-all duration-200"
                            style={{ width: `${(moveTimer / settings.moveLimit) * 100}%` }}
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
    </div>
  );
}

export default App;
