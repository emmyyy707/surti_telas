import { useEffect, type RefObject } from "react";
import { Tooltip as BootstrapTooltip } from "bootstrap";

import "./tooltip.bootstrap.css";

type BsBoundary = NonNullable<
  ConstructorParameters<typeof BootstrapTooltip>[1]
>["boundary"];

export interface DelegatedTooltipOptions {
  selector?: string;
  placement?: "top" | "bottom" | "left" | "right" | "auto";
  trigger?: "hover" | "focus" | "click" | "hover focus" | "click hover" | "click focus";
  delay?: number | { show: number; hide: number };
  container?: string | Element | false;
  boundary?: "window" | "viewport" | "scrollParent" | Element;
}

/**
 * Inicializa UNA sola instancia de Bootstrap Tooltip en un contenedor y delega
 * el comportamiento a todos los elementos hijos que coincidan con `selector`
 * (por defecto `[data-bs-toggle="tooltip"]`).
 *
 * Estrategia de rendimiento recomendada para listas/DataTables grandes: en vez
 * de crear una instancia por fila, se crea una sola instancia por contenedor.
 * Cada hijo debe definir `data-bs-toggle="tooltip"` y `data-bs-title="..."`.
 */
export function useDelegatedTooltips(
  containerRef: RefObject<HTMLElement | null>,
  options: DelegatedTooltipOptions = {}
) {
  const {
    selector = '[data-bs-toggle="tooltip"]',
    placement = "top",
    trigger = "hover focus",
    delay = { show: 100, hide: 150 },
    container = "body",
    boundary = "window",
  } = options;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const instance = new BootstrapTooltip(el, {
      selector,
      placement,
      trigger,
      delay,
      container,
      boundary: boundary as BsBoundary,
      sanitize: true,
      customClass: "st-tooltip theme-tooltip",
    });

    return () => instance.dispose();
  }, [containerRef, selector, placement, trigger, delay, container, boundary]);
}
