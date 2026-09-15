import { GameProvider } from "@/lib/store";
import GameShell from "@/components/GameShell";
import CadenceDuckyEncounter from "@/components/CadenceDuckyEncounter";

export default function Home() {
  return (
    <GameProvider>
      <GameShell />
      <CadenceDuckyEncounter />
    </GameProvider>
  );
}
