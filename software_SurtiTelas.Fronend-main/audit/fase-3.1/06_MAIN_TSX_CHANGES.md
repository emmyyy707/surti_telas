# 06_MAIN_TSX_CHANGES.md — Fase 3.1

## main.tsx — Antes

```tsx
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./presentation/pages/App";

import "./index.css";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
```

## main.tsx — Después

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./presentation/pages/App";
import "./index.css";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { AppProviders } from "@/app/providers/AppProviders";

const queryClient = new QueryClient();

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppProviders>
        <App />
      </AppProviders>
    </QueryClientProvider>
  </React.StrictMode>
);
```

## Diff

```
+ import { AppProviders } from "@/app/providers/AppProviders";

- <QueryClientProvider client={queryClient}>
-     <App />
- </QueryClientProvider>

+ <QueryClientProvider client={queryClient}>
+   <AppProviders>
+     <App />
+   </AppProviders>
+ </QueryClientProvider>
```

## Razón

- La arquitectura canónica requiere que AppProviders envuelva toda la aplicación
- App.tsx ya tenía el wrapper pero no era la entrada principal adecuada
- Provider order: QueryClientProvider → AppProviders → App