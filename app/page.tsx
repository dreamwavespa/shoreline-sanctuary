import { GameProvider } from "@/lib/store";
import GameShell from "@/components/GameShell";

export default function Home() {
  return (
    <GameProvider>
      <GameShell />
    </GameProvider>
  );
}
