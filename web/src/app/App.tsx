import { Route, Routes } from "react-router";

import { NewTaskProvider, useNewTask } from "@/features/tasks/NewTaskProvider";
import { OverviewPage } from "@/features/tasks/OverviewPage";

import { AppShell } from "./AppShell";
import { Providers } from "./providers";

function Shell() {
  const openNewTask = useNewTask();
  return (
    <AppShell onNewTask={openNewTask}>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/tasks/:id" element={<OverviewPage />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <Providers>
      <NewTaskProvider>
        <Shell />
      </NewTaskProvider>
    </Providers>
  );
}
