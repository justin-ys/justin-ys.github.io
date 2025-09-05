import TerminalContainer from "./vimulator/terminalContainer";
import { promises as fs } from 'fs';
import path from "path";

export default async function Home() {
  const data = await fs.readFile(path.join(process.cwd(), 'src/app/assets/welcome.vtxt'), 'utf8');

  return (
    <div className="h-screen max-h-screen">
        <TerminalContainer data={data}/>
    </div>
  );
}
