import Image from "next/image";
import TerminalWindow from "./vimulator/terminalWindow";

export default function Home() {
  return (
    <div className="h-screen max-h-screen">
        <TerminalWindow />
    </div>
  );
}
