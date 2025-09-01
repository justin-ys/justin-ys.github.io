import Image from "next/image";
import TerminalWindow from "./vimulator/terminalWindow";
import { promises as fs } from 'fs';
import path from "path";

export default async function Home() {
  const data = await fs.readFile(path.join(process.cwd(), 'src/app/assets/welcome.vtxt'), 'utf8');

  return (
    <div className="h-screen max-h-screen">
        <TerminalWindow title="test" prefill={data}/>
    </div>
  );
}
