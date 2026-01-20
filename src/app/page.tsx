import TerminalContainer from "./vimulator/terminalContainer";

export default async function Home() {
  return (
    <div className="h-screen max-h-screen">
        <TerminalContainer />
    </div>
  );
}
