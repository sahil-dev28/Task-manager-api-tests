import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router";

import { AppShell } from "@/components/app-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { NewTaskContext } from "@/features/tasks/new-task-context";
import { OverviewPage } from "@/features/tasks/overview-page";
import { TaskFormDialog } from "@/features/tasks/task-form-dialog";

// GETs retry once; writes never do, since a repeated POST would create twice.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
});

export default function App() {
  const [creating, setCreating] = useState(false);
  const openNewTask = useCallback(() => setCreating(true), []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <NewTaskContext.Provider value={openNewTask}>
            <AppShell>
              <Routes>
                <Route path="/" element={<OverviewPage />} />
                <Route path="/tasks/:id" element={<OverviewPage />} />
              </Routes>
            </AppShell>
            <TaskFormDialog open={creating} onOpenChange={setCreating} />
          </NewTaskContext.Provider>
          <Toaster position="bottom-right" />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
