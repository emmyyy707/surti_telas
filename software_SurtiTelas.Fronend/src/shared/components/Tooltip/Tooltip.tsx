import {
  createElement,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type ElementType,
  type ReactNode,
} from "react";
import { Tooltip as BootstrapTooltip } from "bootstrap";

import "./tooltip.bootstrap.css";

type BootstrapTooltipOptions = NonNullable<
  ConstructorParameters<typeof BootstrapTooltip>[1]
>;

export type TooltipPlacement = "top" | "bottom" | "left" | "right" | "auto";

export type TooltipTrigger =
  | "hover"
  | "focus"
  | "click"
  | "manual"
  | "click hover"
  | "click focus"
  | "hover focus"
  | "click hover focus";

export type TooltipSetContent = Record<
  string,
  string | Element | (() => string | Element | null) | null
>;

export interface TooltipProps {
  title: string;
  animation?: boolean;
  container?: string | Element | false;
  delay?: number | { show: number; hide: number };
  html?: boolean;
  placement?: TooltipPlacement | (() => TooltipPlacement);
  selector?: string | false;
  template?: string;
  trigger?: TooltipTrigger;
  offset?: [number, number] | string | (() => [number, number]);
  fallbackPlacements?: string[];
  boundary?: "window" | "viewport" | "scrollParent" | Element;
  customClass?: string | (() => string);
  sanitize?: boolean;
  allowList?: Record<string, (string | RegExp)[]>;
  popperConfig?:
    | Record<string, unknown>
    | ((defaultConfig: Record<string, unknown>) => Record<string, unknown>)
    | null;
  as?: ElementType;
  className?: string;
  tabIndex?: number;
  children: ReactNode;
  onShow?: () => void;
  onShown?: () => void;
  onHide?: () => void;
  onHidden?: () => void;
  onInserted?: () => void;
}

export interface TooltipHandle {
  show: () => void;
  hide: () => void;
  toggle: () => void;
  enable: () => void;
  disable: () => void;
  toggleEnabled: () => void;
  update: () => void;
  setContent: (content: TooltipSetContent) => void;
  dispose: () => void;
  getInstance: () => BootstrapTooltip | null;
}

export const Tooltip = forwardRef<TooltipHandle, TooltipProps>(function Tooltip(
  {
    title,
    animation = true,
    container = "body",
    delay = { show: 100, hide: 150 },
    html = false,
    placement = "top",
    selector = false,
    template,
    trigger = "hover focus",
    offset,
    fallbackPlacements,
    boundary = "window",
    customClass,
    sanitize = true,
    allowList,
    popperConfig,
    as: Tag = "span",
    className,
    tabIndex = 0,
    children,
    onShow,
    onShown,
    onHide,
    onHidden,
    onInserted,
  },
  ref
) {
  const elementRef = useRef<HTMLElement | null>(null);
  const instanceRef = useRef<BootstrapTooltip | null>(null);

  const finalCustomClass = ["st-tooltip", "theme-tooltip", customClass]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const instance = new BootstrapTooltip(el, {
      title,
      animation,
      container,
      delay,
      html,
      placement,
      selector,
      ...(template !== undefined ? { template } : {}),
      trigger,
      ...(offset !== undefined ? { offset } : {}),
      ...(fallbackPlacements !== undefined ? { fallbackPlacements } : {}),
      boundary: boundary as BootstrapTooltipOptions["boundary"],
      customClass: finalCustomClass,
      sanitize,
      ...(allowList !== undefined ? { allowList } : {}),
      ...(popperConfig !== undefined ? { popperConfig } : {}),
    });
    instanceRef.current = instance;

    const handlers: [string, (() => void) | undefined][] = [
      ["show.bs.tooltip", onShow],
      ["shown.bs.tooltip", onShown],
      ["hide.bs.tooltip", onHide],
      ["hidden.bs.tooltip", onHidden],
      ["inserted.bs.tooltip", onInserted],
    ];
    handlers.forEach(([evt, handler]) => {
      if (handler) el.addEventListener(evt, handler as EventListener);
    });

    return () => {
      handlers.forEach(([evt, handler]) => {
        if (handler) el.removeEventListener(evt, handler as EventListener);
      });
      instance.dispose();
      instanceRef.current = null;
    };
  }, [
    title,
    animation,
    container,
    delay,
    html,
    placement,
    selector,
    template,
    trigger,
    offset,
    fallbackPlacements,
    boundary,
    customClass,
    finalCustomClass,
    sanitize,
    allowList,
    popperConfig,
    onShow,
    onShown,
    onHide,
    onHidden,
    onInserted,
  ]);

  useImperativeHandle(
    ref,
    () => ({
      show: () => instanceRef.current?.show(),
      hide: () => instanceRef.current?.hide(),
      toggle: () => instanceRef.current?.toggle(),
      enable: () => instanceRef.current?.enable(),
      disable: () => instanceRef.current?.disable(),
      toggleEnabled: () => instanceRef.current?.toggleEnabled(),
      update: () => instanceRef.current?.update(),
      setContent: (content) => instanceRef.current?.setContent(content),
      dispose: () => instanceRef.current?.dispose(),
      getInstance: () => instanceRef.current,
    }),
    []
  );

  return createElement(
    Tag,
    {
      ref: elementRef,
      className,
      "data-bs-toggle": "tooltip",
      tabIndex,
    },
    children
  );
});

export default Tooltip;
