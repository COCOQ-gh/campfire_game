import React, { useEffect, useMemo, useRef, useState } from "react";

export default function CampfireGame() {
  const [fire, setFire] = useState(35);
  const [wood, setWood] = useState(6);
  const [survived, setSurvived] = useState(0);
  const [out, setOut] = useState(false);
  const [msg, setMsg] = useState("小さな焚き火が燃えている…");
  const [paused, setPaused] = useState(false);
  const [gustEffect, setGustEffect] = useState(false);

  const [coolChop, setCoolChop] = useState(0);
  const [coolStoke, setCoolStoke] = useState(0);
  const coolTimer = useRef<number | null>(null);

  const fireBarClass = useMemo(() => {
    if (fire >= 70) return "bg-orange-500";
    if (fire >= 40) return "bg-amber-400";
    if (fire >= 15) return "bg-yellow-300";
    return "bg-stone-300";
  }, [fire]);

  const tips = [
    "火が弱ってきたら早めに薪をくべよう",
    "炎が大きいほど安心だが、薪の減りも早い",
    "ときどき風が吹いて火が弱まるかも",
    "余裕があるうちに薪を確保！",
  ];

  useEffect(() => {
    if (out || paused) return;
    const id = setInterval(() => {
      setSurvived((s) => s + 1);

      setFire((f) => {
        if (f <= 0) return 0;
        const base = 0.6;
        const prop = 0.018 * f;
        let next = f - (base + prop);

        if (Math.random() < 0.15) {
          const gust = 10 - Math.min(7, Math.floor(f / 20));
          next -= gust;
          setGustEffect(true);
          setTimeout(() => setGustEffect(false), 1000);
          setMsg("🌬️ 突風が焚き火をあおった！");
        }

        if (next < 10) {
          const outProb = Math.min(0.85, (10 - Math.max(0, next)) / 12);
          if (Math.random() < outProb) {
            return 0;
          }
        }

        return Math.max(0, Math.min(100, next));
      });
    }, 1000);
    return () => clearInterval(id);
  }, [out, paused]);

  useEffect(() => {
    if (coolTimer.current) return;
    coolTimer.current = window.setInterval(() => {
      setCoolChop((c) => Math.max(0, c - 0.1));
      setCoolStoke((c) => Math.max(0, c - 0.1));
    }, 100);
    return () => {
      if (coolTimer.current) window.clearInterval(coolTimer.current);
      coolTimer.current = null;
    };
  }, []);

  useEffect(() => {
    if (fire <= 0 && !out) {
      setOut(true);
      setMsg("…火が消えてしまった。");
    }
  }, [fire, out]);

  const restart = () => {
    setFire(35);
    setWood(6);
    setSurvived(0);
    setOut(false);
    setMsg("また小さな焚き火が燃えはじめた…");
    setPaused(false);
    setCoolChop(0);
    setCoolStoke(0);
    setGustEffect(false);
  };

  const chop = () => {
    if (out || paused || coolChop > 0) return;
    const gain = 2 + Math.floor(Math.random() * 4);
    const crit = Math.random() < 0.1 ? 2 : 0;
    setWood((w) => Math.min(99, w + gain + crit));
    setMsg("パカーン！薪を手に入れた。");
    setCoolChop(1.2);
  };

  const stoke = (n: number) => {
    if (out || paused || coolStoke > 0) return;
    if (wood <= 0) {
      setMsg("薪が足りない！");
      return;
    }
    const use = Math.min(wood, n);
    setWood((w) => w - use);

    setFire((f) => {
      const efficiency = 0.7 + (100 - f) / 100;
      const add = use * 12 * efficiency;
      return Math.max(0, Math.min(100, f + add));
    });

    setMsg(`薪を${use}本くべた！`);
    setCoolStoke(0.8);
  };

  const pct = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

  return (
    <div className="min-h-svh w-full bg-stone-900 text-stone-100 flex items-center justify-center p-4 relative overflow-hidden">
      {gustEffect && (
        <div className="absolute inset-0 pointer-events-none z-0 animate-[gust_1s_ease-in-out] bg-gradient-to-r from-sky-400/10 via-sky-200/20 to-sky-400/10" />
      )}

      <style>{`
        @keyframes gust {
          0% { transform: translateX(-100%); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
      `}</style>

      <div className="w-full max-w-3xl relative z-10">
        <header className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold">焚き火サバイバル</h1>
          <p className="text-stone-300 text-sm md:text-base">炎を絶やすな。テキストとバーで遊べるミニゲーム。</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <InfoCard title="火力 (Fire)">
            <Progress value={pct(fire)} className={fireBarClass} />
            <p className="text-xs mt-1 text-stone-300">{pct(fire)} / 100</p>
          </InfoCard>
          <InfoCard title="薪 (Wood)">
            <Progress value={pct((wood / 99) * 100)} className="bg-lime-400" />
            <p className="text-xs mt-1 text-stone-300">{wood} 本</p>
          </InfoCard>
          <InfoCard title="生存時間">
            <p className="text-xl font-bold tabular-nums">{survived}s</p>
            <p className="text-xs text-stone-400">長く生き延びるほど高スコア</p>
          </InfoCard>
          <InfoCard title="状況">
            <p className="text-sm text-stone-200">{msg}</p>
            <p className="text-xs text-stone-400 mt-1">ヒント: {tips[survived % tips.length]}</p>
          </InfoCard>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Button onClick={chop} disabled={out || paused || coolChop > 0}>
            薪を割る {coolChop > 0 ? `(${coolChop.toFixed(1)}s)` : ""}
          </Button>
          <Button onClick={() => stoke(1)} disabled={out || paused || coolStoke > 0 || wood <= 0}>
            薪をくべる×1 {coolStoke > 0 ? `(${coolStoke.toFixed(1)}s)` : ""}
          </Button>
          <Button onClick={() => stoke(5)} disabled={out || paused || coolStoke > 0 || wood <= 0}>
            薪をくべる×5
          </Button>
          <Button variant="ghost" onClick={() => setPaused((p) => !p)} disabled={out}>
            {paused ? "再開" : "一時停止"}
          </Button>
          <Button variant="ghost" onClick={restart}>リスタート</Button>
        </div>

        <div className="text-xs text-stone-400 leading-relaxed">
          <p>
            仕様のコア: 炎が大きいほど消えにくい、ただし毎秒の消費が増える。風イベントでランダムに火力が落ちるため、余裕のある火力維持が重要。
          </p>
        </div>

        {out && (
          <div className="mt-6 p-4 rounded-2xl bg-stone-800 border border-stone-700">
            <p className="text-lg font-semibold mb-1">ゲームオーバー</p>
            <p className="text-sm text-stone-300 mb-3">生存 {survived} 秒。もう一度挑戦しよう！</p>
            <div className="flex gap-2">
              <Button onClick={restart}>もう一度</Button>
              <Button variant="ghost" onClick={() => { setPaused(false); }}>観戦モード</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-stone-700 bg-stone-800/60 p-3 shadow-sm">
      <p className="text-sm font-semibold mb-2">{title}</p>
      {children}
    </div>
  );
}

function Progress({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className="w-full h-3 rounded-full bg-stone-700 overflow-hidden">
      <div
        className={`h-full transition-all duration-500 ${className}`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function Button({
  children,
  onClick,
  disabled,
  variant = "solid",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "solid" | "ghost";
}) {
  const base =
    "px-4 py-2 rounded-2xl text-sm font-medium transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
  const solid = "bg-stone-100 text-stone-900 hover:bg-white";
  const ghost = "bg-transparent text-stone-100 hover:bg-stone-800 border border-stone-700";
  const cls = `${base} ${variant === "solid" ? solid : ghost}`;
  return (
    <button className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
