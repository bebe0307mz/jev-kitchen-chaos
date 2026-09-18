"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChaosType,
  getJevLine,
  moodColors,
  moodEmoji,
  JevLine,
} from "./jev-responses";
import {
  Order,
  Station,
  GameState,
  DISHES,
  STATION_TEMPLATES,
} from "./game-types";

// ---- Helpers ----
let orderCounter = 0;
function makeOrder(stationIdx: number, speedMult: number): Order {
  const d = DISHES[Math.floor(Math.random() * DISHES.length)];
  const maxTime = Math.max(3, Math.floor(8 + Math.random() * 7) / speedMult);
  return {
    id: `ord-${++orderCounter}`,
    dish: d.dish,
    emoji: d.emoji,
    timeLeft: maxTime,
    maxTime,
    status: "cooking",
    stationIdx,
  };
}

function kdRatio(completed: number, deaths: number): string {
  if (deaths === 0) return completed > 0 ? `${completed}.0` : "0.0";
  return (completed / deaths).toFixed(1);
}

// ---- Share Card ----
function generateShareText(state: GameState): string {
  const kd = kdRatio(
    state.ordersCompleted,
    state.ordersBurned + state.ordersSentBack
  );
  const worst = state.worstChaos || "the dinner rush";
  const end = state.isRageQuit
    ? "Jev rage-quit"
    : state.isExploded
    ? "the kitchen exploded"
    : "somehow survived";
  return `I achieved ${kd} K/D and ${end} at round ${state.round}. Worst moment: ${worst}. Can you break an AI chef faster?`;
}

function tweetUrl(state: GameState, url: string): string {
  const text = generateShareText(state);
  return `https://x.com/intent/tweet?text=${encodeURIComponent(
    text + "\n\n" + url
  )}`;
}

// ---- Station Visual ----
function StationBlock({
  station,
  onClickOrder,
}: {
  station: Station;
  onClickOrder: (s: Station) => void;
}) {
  const pct = station.order
    ? (station.order.timeLeft / station.order.maxTime) * 100
    : 0;
  const barColor =
    pct > 50 ? "#47a347" : pct > 25 ? "#f0b429" : "#c41e1e";
  const isBurning = station.onFire;

  return (
    <motion.div
      className={`relative rounded-lg border-2 p-2 sm:p-3 cursor-pointer select-none ${
        isBurning
          ? "border-red-500 fire-glow"
          : station.order
          ? "border-amber-700"
          : "border-stone-700"
      }`}
      style={{
        background: isBurning
          ? "linear-gradient(180deg, #3a0a00 0%, #1a0800 100%)"
          : "linear-gradient(180deg, #2a1f14 0%, #1a1108 100%)",
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onClickOrder(station)}
      layout
    >
      {/* Fire overlay */}
      {isBurning && (
        <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-1/4 w-3 h-6 bg-orange-500 rounded-full flame-anim opacity-80" />
          <div
            className="absolute bottom-0 left-1/2 w-4 h-8 bg-red-500 rounded-full flame-anim opacity-90"
            style={{ animationDelay: "0.1s" }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-3 h-5 bg-yellow-400 rounded-full flame-anim opacity-70"
            style={{ animationDelay: "0.2s" }}
          />
        </div>
      )}

      {/* Smoke */}
      {station.smokeLevel > 0.3 && (
        <div className="absolute -top-4 left-1/2 w-6 h-6 bg-stone-400 rounded-full smoke-anim opacity-40 pointer-events-none" />
      )}

      <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
        {station.name}
      </div>

      {station.order ? (
        <div className={station.order.status === "burned" ? "opacity-50" : ""}>
          <div
            className={`text-xs sm:text-sm font-semibold truncate ${
              station.order.timeLeft < 2
                ? "text-red-400 flash-anim"
                : "text-amber-100"
            }`}
          >
            {station.order.dish}
          </div>
          {/* Timer bar */}
          <div className="mt-1 h-1.5 bg-stone-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: barColor }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          {station.order.status === "burned" && (
            <div className="text-[10px] text-red-400 font-bold mt-0.5">
              BURNED
            </div>
          )}
          {station.order.status === "ready" && (
            <div className="text-[10px] text-green-400 font-bold mt-0.5">
              READY - CLICK TO SERVE
            </div>
          )}
        </div>
      ) : (
        <div className="text-stone-600 text-xs italic">empty</div>
      )}
    </motion.div>
  );
}

// ---- Monologue Display ----
function Monologue({ line }: { line: JevLine | null }) {
  if (!line) return null;
  return (
    <motion.div
      key={line.text}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="mono-text text-center px-4"
    >
      <span className="text-stone-500 mr-2">[{moodEmoji[line.mood]}]</span>
      <span style={{ color: moodColors[line.mood] }} className="text-sm sm:text-base font-bold">
        {line.text}
      </span>
    </motion.div>
  );
}

// ---- Order Queue Ticket ----
function OrderTicket({
  order,
  idx,
}: {
  order: Order;
  idx: number;
}) {
  return (
    <motion.div
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -60, opacity: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="bg-amber-50 text-stone-900 rounded px-2 py-1 text-xs font-bold shadow-md border-l-4 border-amber-600 whitespace-nowrap"
    >
      {order.dish}
    </motion.div>
  );
}

// ---- Crowd Meter ----
function CrowdMeter({ value, max }: { value: number; max: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const isMax = pct >= 100;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] sm:text-xs uppercase tracking-wider text-stone-400 font-bold">
        Crowd
      </span>
      <div className="w-24 sm:w-32 h-3 bg-stone-800 rounded-full overflow-hidden border border-stone-700">
        <motion.div
          className={`h-full rounded-full ${
            isMax ? "flash-anim" : ""
          }`}
          style={{
            background: isMax
              ? "linear-gradient(90deg, #c41e1e, #ff4444)"
              : pct > 70
              ? "linear-gradient(90deg, #e8592f, #f0b429)"
              : "linear-gradient(90deg, #47a347, #5cb85c)",
          }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      {isMax && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
          className="text-red-400 text-xs font-black"
        >
          MAX
        </motion.span>
      )}
    </div>
  );
}

// ---- Chaos Buttons ----
const CHAOS_BUTTONS: {
  id: ChaosType;
  label: string;
  desc: string;
  color: string;
  hoverColor: string;
}[] = [
  {
    id: "rush_hour",
    label: "RUSH HOUR",
    desc: "12 orders slam in",
    color: "#e8592f",
    hoverColor: "#ff6b3d",
  },
  {
    id: "health_inspector",
    label: "HEALTH INSPECTOR",
    desc: "Clipboard man arrives",
    color: "#2563eb",
    hoverColor: "#3b82f6",
  },
  {
    id: "karen",
    label: "KAREN AT TABLE 4",
    desc: "Everything is wrong",
    color: "#9333ea",
    hoverColor: "#a855f7",
  },
  {
    id: "literal_fire",
    label: "LITERAL FIRE",
    desc: "Stations catch fire",
    color: "#c41e1e",
    hoverColor: "#ef4444",
  },
];

// ---- Explosion Overlay ----
function ExplosionOverlay({
  state,
  onRestart,
  onShare,
}: {
  state: GameState;
  onRestart: () => void;
  onShare: () => void;
}) {
  const kd = kdRatio(
    state.ordersCompleted,
    state.ordersBurned + state.ordersSentBack
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: state.isExploded
          ? "radial-gradient(circle, #ff440055 0%, #1a1108ee 60%, #000000 100%)"
          : "radial-gradient(circle, #c41e1e33 0%, #1a1108ee 60%, #000000 100%)",
      }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15 }}
        className="bg-stone-950 border-2 border-amber-700 rounded-xl p-6 sm:p-8 max-w-md mx-4 text-center"
      >
        <div className="text-4xl sm:text-5xl mb-2 font-black">
          {state.isExploded ? "BOOM" : "JEV QUIT"}
        </div>
        <div className="text-stone-400 text-sm mb-4">
          {state.isExploded
            ? "The kitchen is gone. Reduced to atoms."
            : "Jev has left the building. Apron on the floor."}
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <div className="text-2xl font-black text-green-400">
              {state.ordersCompleted}
            </div>
            <div className="text-[10px] uppercase text-stone-500">Cooked</div>
          </div>
          <div>
            <div className="text-2xl font-black text-red-400">
              {state.ordersBurned + state.ordersSentBack}
            </div>
            <div className="text-[10px] uppercase text-stone-500">Died</div>
          </div>
          <div>
            <div
              className="text-2xl font-black"
              style={{
                color:
                  parseFloat(kd) >= 1
                    ? "#47a347"
                    : parseFloat(kd) >= 0.5
                    ? "#f0b429"
                    : "#c41e1e",
              }}
            >
              {kd}
            </div>
            <div className="text-[10px] uppercase text-stone-500">K/D</div>
          </div>
        </div>
        <div className="text-xs text-stone-400 mb-1">Round {state.round}</div>
        <div className="text-xs text-stone-500 mb-6 italic">
          Worst moment: {state.worstChaos || "the dinner rush"}
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onRestart}
            className="px-5 py-2.5 bg-amber-700 hover:bg-amber-600 rounded-lg font-bold text-sm transition-colors"
          >
            TRY AGAIN
          </button>
          <button
            onClick={onShare}
            className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 border border-stone-600 rounded-lg font-bold text-sm transition-colors"
          >
            SHARE K/D
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---- Start Screen ----
function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-stone-950">
      {/* Ambient kitchen glow */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 50% 80%, #e8592f22 0%, transparent 60%)",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative text-center px-6"
      >
        <div className="text-6xl sm:text-8xl font-black tracking-tighter mb-2">
          <span className="text-amber-100">JEV</span>
        </div>
        <div className="text-3xl sm:text-5xl font-black tracking-tight text-stone-500 mb-4">
          KITCHEN CHAOS
        </div>
        <div className="text-stone-500 text-sm sm:text-base max-w-sm mx-auto mb-8">
          Slam the kitchen with chaos events. Watch Jev lose it. Try not to hit
          0.0 K/D. You will fail.
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="px-8 py-4 bg-amber-700 hover:bg-amber-600 rounded-xl font-black text-lg tracking-wide transition-colors"
        >
          OPEN THE KITCHEN
        </motion.button>
        <div className="mt-6 text-stone-600 text-xs">
          Cook / Die ratio tracked. Share your worst.
        </div>
      </motion.div>
    </div>
  );
}

// ---- Main Game ----
export default function KitchenGame() {
  const [gameState, setGameState] = useState<GameState>({
    round: 1,
    ordersCompleted: 0,
    ordersBurned: 0,
    ordersSentBack: 0,
    crowdMeter: 0,
    maxCrowd: 100,
    isExploded: false,
    isRageQuit: false,
    activeChaos: new Set(),
    gameStarted: false,
    worstChaos: "",
  });

  const [stations, setStations] = useState<Station[]>(
    STATION_TEMPLATES.map((t, i) => ({
      id: i,
      name: t.name,
      emoji: t.emoji,
      order: null,
      onFire: false,
      smokeLevel: 0,
    }))
  );

  const [orderQueue, setOrderQueue] = useState<Order[]>([]);
  const [monologue, setMonologue] = useState<JevLine | null>(null);
  const [shaking, setShaking] = useState(false);
  const [chaosFlash, setChaosFlash] = useState<string | null>(null);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const monologueTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameStateRef = useRef(gameState);
  const stationsRef = useRef(stations);
  const orderQueueRef = useRef(orderQueue);

  // Keep refs in sync
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);
  useEffect(() => {
    stationsRef.current = stations;
  }, [stations]);
  useEffect(() => {
    orderQueueRef.current = orderQueue;
  }, [orderQueue]);

  const triggerShake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 400);
  }, []);

  const showMonologue = useCallback((type: ChaosType) => {
    const line = getJevLine(type);
    setMonologue(line);
    if (monologueTimerRef.current) clearTimeout(monologueTimerRef.current);
    monologueTimerRef.current = setTimeout(() => {
      setMonologue(null);
    }, 3500);
  }, []);

  // Auto-spawn orders periodically
  const spawnOrder = useCallback(() => {
    const gs = gameStateRef.current;
    if (gs.isExploded || gs.isRageQuit) return;

    const emptyStations = stationsRef.current.filter(
      (s) => !s.order && !s.onFire
    );
    if (emptyStations.length > 0) {
      const target =
        emptyStations[Math.floor(Math.random() * emptyStations.length)];
      const speedMult = 1 + gs.round * 0.1;
      const order = makeOrder(target.id, speedMult);

      setStations((prev) =>
        prev.map((s) => (s.id === target.id ? { ...s, order } : s))
      );
    } else {
      // Overflow: add to queue
      const speedMult = 1 + gs.round * 0.1;
      const order = makeOrder(-1, speedMult);
      setOrderQueue((prev) => [...prev, order].slice(-8));
    }
  }, []);

  // Serve an order (click on ready station)
  const handleServe = useCallback(
    (station: Station) => {
      if (!station.order) return;

      if (station.order.status === "ready") {
        setStations((prev) =>
          prev.map((s) => (s.id === station.id ? { ...s, order: null } : s))
        );
        setGameState((prev) => ({
          ...prev,
          ordersCompleted: prev.ordersCompleted + 1,
          crowdMeter: Math.max(0, prev.crowdMeter - 5),
        }));
        showMonologue("order_complete");

        // Pull from queue
        const q = orderQueueRef.current;
        if (q.length > 0) {
          const next = { ...q[0], stationIdx: station.id, status: "cooking" as const };
          setOrderQueue((prev) => prev.slice(1));
          setStations((prev) =>
            prev.map((s) => (s.id === station.id ? { ...s, order: next } : s))
          );
        }
      } else if (station.order.status === "burned") {
        // Trash burned order
        setStations((prev) =>
          prev.map((s) =>
            s.id === station.id ? { ...s, order: null, smokeLevel: 0 } : s
          )
        );
      } else if (station.onFire) {
        // Extinguish fire by clicking
        setStations((prev) =>
          prev.map((s) =>
            s.id === station.id ? { ...s, onFire: false } : s
          )
        );
        setGameState((prev) => ({
          ...prev,
          crowdMeter: Math.max(0, prev.crowdMeter - 3),
        }));
      }
    },
    [showMonologue]
  );

  // Chaos event handlers
  const triggerChaos = useCallback(
    (type: ChaosType) => {
      const gs = gameStateRef.current;
      if (gs.isExploded || gs.isRageQuit) return;

      const chaosNames: Record<string, string> = {
        rush_hour: "RUSH HOUR",
        health_inspector: "HEALTH INSPECTOR",
        karen: "KAREN AT TABLE 4",
        literal_fire: "LITERAL FIRE",
      };

      setGameState((prev) => ({
        ...prev,
        worstChaos: chaosNames[type] || prev.worstChaos,
        crowdMeter: Math.min(
          prev.maxCrowd,
          prev.crowdMeter +
            (type === "literal_fire"
              ? 30
              : type === "rush_hour"
              ? 20
              : type === "karen"
              ? 15
              : 10)
        ),
      }));

      setChaosFlash(type);
      setTimeout(() => setChaosFlash(null), 600);
      triggerShake();
      showMonologue(type);

      switch (type) {
        case "rush_hour": {
          // Slam 4-6 orders
          const count = 4 + Math.floor(Math.random() * 3);
          for (let i = 0; i < count; i++) {
            setTimeout(() => spawnOrder(), i * 300);
          }
          // Advance round
          setGameState((prev) => ({ ...prev, round: prev.round + 1 }));
          break;
        }
        case "health_inspector": {
          // Random orders get "sent back"
          setStations((prev) =>
            prev.map((s) => {
              if (s.order && s.order.status === "cooking" && Math.random() > 0.5) {
                return {
                  ...s,
                  order: { ...s.order, status: "sent_back" as const },
                };
              }
              return s;
            })
          );
          setTimeout(() => {
            setStations((prev) =>
              prev.map((s) => {
                if (s.order && s.order.status === "sent_back") {
                  setGameState((g) => ({
                    ...g,
                    ordersSentBack: g.ordersSentBack + 1,
                  }));
                  return { ...s, order: null };
                }
                return s;
              })
            );
            showMonologue("order_sent_back");
          }, 2000);
          break;
        }
        case "karen": {
          // Send back a random ready/cooking order
          setStations((prev) => {
            const cooking = prev.filter(
              (s) => s.order && s.order.status === "cooking"
            );
            if (cooking.length > 0) {
              const target =
                cooking[Math.floor(Math.random() * cooking.length)];
              return prev.map((s) => {
                if (s.id === target.id && s.order) {
                  return {
                    ...s,
                    order: { ...s.order, status: "sent_back" as const },
                  };
                }
                return s;
              });
            }
            return prev;
          });
          setTimeout(() => {
            setStations((prev) =>
              prev.map((s) => {
                if (s.order && s.order.status === "sent_back") {
                  setGameState((g) => ({
                    ...g,
                    ordersSentBack: g.ordersSentBack + 1,
                    crowdMeter: Math.min(g.maxCrowd, g.crowdMeter + 5),
                  }));
                  return { ...s, order: null };
                }
                return s;
              })
            );
          }, 1500);
          break;
        }
        case "literal_fire": {
          // Set 1-3 stations on fire
          setStations((prev) => {
            const count = 1 + Math.floor(Math.random() * 2);
            const indices = Array.from({ length: prev.length }, (_, i) => i).sort(() => Math.random() - 0.5);
            return prev.map((s, i) => {
              if (indices.indexOf(i) < count) {
                return { ...s, onFire: true, smokeLevel: 1 };
              }
              return s;
            });
          });
          // Fire spreads if not clicked out
          setTimeout(() => {
            setStations((prev) => {
              const anyFire = prev.some((s) => s.onFire);
              if (anyFire) {
                return prev.map((s) => {
                  if (s.onFire && s.order) {
                    setGameState((g) => ({
                      ...g,
                      ordersBurned: g.ordersBurned + 1,
                    }));
                    return { ...s, order: { ...s.order, status: "burned" as const } };
                  }
                  return s;
                });
              }
              return prev;
            });
          }, 3000);
          break;
        }
      }
    },
    [triggerShake, showMonologue, spawnOrder]
  );

  // Game loop
  const startGame = useCallback(() => {
    orderCounter = 0;
    setGameState({
      round: 1,
      ordersCompleted: 0,
      ordersBurned: 0,
      ordersSentBack: 0,
      crowdMeter: 0,
      maxCrowd: 100,
      isExploded: false,
      isRageQuit: false,
      activeChaos: new Set(),
      gameStarted: true,
      worstChaos: "",
    });
    setStations(
      STATION_TEMPLATES.map((t, i) => ({
        id: i,
        name: t.name,
        emoji: t.emoji,
        order: null,
        onFire: false,
        smokeLevel: 0,
      }))
    );
    setOrderQueue([]);
    showMonologue("idle");

    // Initial orders
    setTimeout(() => spawnOrder(), 500);
    setTimeout(() => spawnOrder(), 1200);

    if (gameLoopRef.current) clearInterval(gameLoopRef.current);

    gameLoopRef.current = setInterval(() => {
      const gs = gameStateRef.current;
      if (gs.isExploded || gs.isRageQuit) {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        return;
      }

      // Tick down orders
      setStations((prev) =>
        prev.map((s) => {
          if (s.order && s.order.status === "cooking") {
            const newTime = s.order.timeLeft - 0.5;
            if (newTime <= 0) {
              // 70% chance ready, 30% burned
              if (Math.random() > 0.3) {
                return {
                  ...s,
                  order: { ...s.order, timeLeft: 0, status: "ready" },
                };
              } else {
                setGameState((g) => ({
                  ...g,
                  ordersBurned: g.ordersBurned + 1,
                  crowdMeter: Math.min(g.maxCrowd, g.crowdMeter + 8),
                }));
                showMonologue("order_burned");
                return {
                  ...s,
                  order: { ...s.order, timeLeft: 0, status: "burned" },
                  smokeLevel: 1,
                };
              }
            }
            return {
              ...s,
              order: { ...s.order, timeLeft: newTime },
              smokeLevel: newTime < 2 ? 0.5 : 0,
            };
          }
          return s;
        })
      );

      // Auto-spawn orders
      if (Math.random() < 0.3 + gs.round * 0.05) {
        spawnOrder();
      }

      // Idle monologue
      if (Math.random() < 0.05) {
        showMonologue("idle");
      }

      // Natural crowd decay
      setGameState((prev) => ({
        ...prev,
        crowdMeter: Math.max(0, prev.crowdMeter - 0.5),
      }));

      // Check meltdown
      if (gs.crowdMeter >= gs.maxCrowd) {
        showMonologue("meltdown");
        setGameState((prev) => ({
          ...prev,
          isExploded: true,
        }));
        triggerShake();
      }
    }, 500);
  }, [showMonologue, spawnOrder, triggerShake]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (monologueTimerRef.current) clearTimeout(monologueTimerRef.current);
    };
  }, []);

  const kd = kdRatio(
    gameState.ordersCompleted,
    gameState.ordersBurned + gameState.ordersSentBack
  );

  const handleShare = () => {
    const url = "https://jev-kitchen-chaos.vercel.app";
    window.open(tweetUrl(gameState, url), "_blank");
  };

  if (!gameState.gameStarted) {
    return <StartScreen onStart={startGame} />;
  }

  return (
    <div
      className={`fixed inset-0 flex flex-col ${shaking ? "shake-screen" : ""}`}
      style={{
        background: chaosFlash
          ? chaosFlash === "literal_fire"
            ? "linear-gradient(180deg, #3a0a00 0%, #1a0800 50%, #0d0600 100%)"
            : "linear-gradient(180deg, #2a1800 0%, #1a1108 50%, #0d0600 100%)"
          : "linear-gradient(180deg, #1a1108 0%, #130d06 50%, #0a0600 100%)",
      }}
    >
      {/* Jev Monologue Bar */}
      <div className="flex-shrink-0 h-14 sm:h-16 flex items-center justify-center border-b border-stone-800 bg-stone-950/80 backdrop-blur-sm relative overflow-hidden">
        {/* Mood indicator line */}
        {monologue && (
          <motion.div
            className="absolute bottom-0 left-0 h-0.5"
            style={{ background: moodColors[monologue.mood] }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3.5 }}
          />
        )}
        <AnimatePresence mode="wait">
          <Monologue line={monologue} />
        </AnimatePresence>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
        {/* Kitchen Floor */}
        <div className="flex-1 p-3 sm:p-4 flex flex-col">
          {/* Scoreboard */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="text-center">
                <div className="text-lg sm:text-xl font-black text-green-400">
                  {gameState.ordersCompleted}
                </div>
                <div className="text-[9px] sm:text-[10px] uppercase text-stone-500 font-bold">
                  Cook
                </div>
              </div>
              <div className="text-stone-600 text-sm">/</div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-black text-red-400">
                  {gameState.ordersBurned + gameState.ordersSentBack}
                </div>
                <div className="text-[9px] sm:text-[10px] uppercase text-stone-500 font-bold">
                  Die
                </div>
              </div>
              <div className="text-stone-600 text-sm">=</div>
              <div className="text-center">
                <div
                  className="text-lg sm:text-xl font-black"
                  style={{
                    color:
                      parseFloat(kd) >= 1
                        ? "#47a347"
                        : parseFloat(kd) >= 0.5
                        ? "#f0b429"
                        : "#c41e1e",
                  }}
                >
                  {kd}
                </div>
                <div className="text-[9px] sm:text-[10px] uppercase text-stone-500 font-bold">
                  K/D
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-stone-500 font-bold">
                RND {gameState.round}
              </div>
              <CrowdMeter
                value={gameState.crowdMeter}
                max={gameState.maxCrowd}
              />
            </div>
          </div>

          {/* Stations Grid */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 content-start">
            {stations.map((s) => (
              <StationBlock
                key={s.id}
                station={s}
                onClickOrder={handleServe}
              />
            ))}
          </div>

          {/* Order Queue */}
          {orderQueue.length > 0 && (
            <div className="mt-2 sm:mt-3">
              <div className="text-[10px] uppercase text-stone-500 font-bold mb-1">
                Waiting Orders
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                <AnimatePresence>
                  {orderQueue.map((o, i) => (
                    <OrderTicket key={o.id} order={o} idx={i} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Chaos Panel (Right Side) */}
        <div className="flex-shrink-0 w-full sm:w-48 border-t sm:border-t-0 sm:border-l border-stone-800 bg-stone-950/50 p-3 sm:p-4 flex sm:flex-col gap-2">
          <div className="hidden sm:block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-1">
            Chaos Events
          </div>
          {CHAOS_BUTTONS.map((btn) => (
            <motion.button
              key={btn.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => triggerChaos(btn.id)}
              className="flex-1 sm:flex-none sm:w-full rounded-lg p-2 sm:p-3 text-left transition-all font-bold border"
              style={{
                background: `${btn.color}15`,
                borderColor: `${btn.color}40`,
                color: btn.color,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${btn.color}30`;
                e.currentTarget.style.borderColor = btn.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${btn.color}15`;
                e.currentTarget.style.borderColor = `${btn.color}40`;
              }}
            >
              <div className="text-[10px] sm:text-xs font-black tracking-wide">
                {btn.label}
              </div>
              <div
                className="text-[8px] sm:text-[10px] mt-0.5 opacity-60 font-normal hidden sm:block"
              >
                {btn.desc}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Game Over */}
      <AnimatePresence>
        {(gameState.isExploded || gameState.isRageQuit) && (
          <ExplosionOverlay
            state={gameState}
            onRestart={startGame}
            onShare={handleShare}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
