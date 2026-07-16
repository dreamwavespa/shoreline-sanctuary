"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ITEMS, rollSpawn } from "@/lib/items";
import { useGame } from "@/lib/store";
import { SCENES } from "@/lib/media";

interface Spot {
  key: string;
  itemId: string;
  x: number;
  y: number;
}

function randomSpots(n: number): Spot[] {
  const spots: Spot[] = [];
  for (let i = 0; i < n; i++) {
    spots.push({
      key: `${Date.now()}-${i}-${Math.random()}`,
      itemId: rollSpawn(),
      x: 8 + Math.random() * 84,
      y: 38 + Math.random() * 52,
    });
  }
  return spots;
}

export default function BeachScene() {
  const { collectItem } = useGame();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [poppingKeys, setPoppingKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setSpots(randomSpots(9));
  }, []);

  const handleTap = (spot: Spot) => {
    if (poppingKeys[spot.key]) return;
    setPoppingKeys((p) => ({ ...p, [spot.key]: true }));
    collectItem(spot.itemId);
    window.setTimeout(() => {
      setSpots((cur) => cur.filter((s) => s.key !== spot.key));
      setSpots((cur) => {
        if (cur.length < 6) {
          return [...cur, ...randomSpots(1)];
        }
        return cur;
      });
    }, 220);
  };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-b-2xl select-none">
      <Image
        src={SCENES.beachMain}
        alt="Shoreline beach"
        fill
        priority
        unoptimized
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
      {spots.map((spot) => {
        const def = ITEMS[spot.itemId];
        const popping = poppingKeys[spot.key];
        return (
          <button
            key={spot.key}
            onClick={() => handleTap(spot)}
            aria-label={`Collect ${def.name}`}
            className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-white/70 backdrop-blur-sm shadow-lg ring-1 ring-white/60 transition-all duration-200 active:scale-90 ${
              popping ? "opacity-0 scale-150" : "opacity-100 scale-100 animate-bob"
            }`}
            style={{ left: `${spot.x}%`, top: `${spot.y}%`, width: 56, height: 56 }}
          >
            {def.isEmoji ? (
              <span className="text-2xl">{def.icon}</span>
            ) : (
              <Image src={def.icon} alt={def.name} width={40} height={40} unoptimized className="object-contain drop-shadow" />
            )}
          </button>
        );
      })}
    </div>
  );
}
