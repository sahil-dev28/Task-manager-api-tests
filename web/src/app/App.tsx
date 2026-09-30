import { AppShell } from "./AppShell";
import { Providers } from "./providers";

export default function App() {
  return (
    <Providers>
      <AppShell>
        <h1 className="pt-8 text-title-1">Overview</h1>
      </AppShell>
    </Providers>
  );
}
