import { QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { BrowserRouter } from "react-router";

import { LiveRegionProvider } from "./LiveRegion";
import { createQueryClient } from "./queryClient";
import { ThemeProvider } from "./theme";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <LiveRegionProvider>{children}</LiveRegionProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
