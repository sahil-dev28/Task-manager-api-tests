import { Route, Routes } from "react-router";

import { OverviewPage } from "@/features/tasks/OverviewPage";

import { AppShell } from "./AppShell";
import { Providers } from "./providers";

export default function App() {
  return (
    <Providers>
      <AppShell>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/tasks/:id" element={<OverviewPage />} />
        </Routes>
      </AppShell>
    </Providers>
  );
}
