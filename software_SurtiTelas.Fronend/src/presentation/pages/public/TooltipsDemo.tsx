import { useCallback, useRef, useState } from "react";
import { Button } from "@/shared/ui";
import {
  Tooltip,
  useDelegatedTooltips,
  type TooltipHandle,
  type TooltipTrigger,
} from "@/shared/components/Tooltip";

import "./TooltipsDemo.css";

const positions = [
  { placement: "top", label: "Arriba" },
  { placement: "bottom", label: "Abajo" },
  { placement: "left", label: "Izquierda" },
  { placement: "right", label: "Derecha" },
] as const;

const triggers: { trigger: TooltipTrigger; label: string }[] = [
  { trigger: "hover", label: "Solo hover" },
  { trigger: "focus", label: "Solo focus" },
  { trigger: "click", label: "Solo click" },
  { trigger: "hover focus", label: "Hover + focus" },
];

const CodeBlock = ({ code }: { code: string }) => (
  <pre className="demo-code">
    <code>{code}</code>
  </pre>
);

export default function TooltipsDemo() {
  const controlledRef = useRef<TooltipHandle>(null);
  const [enabled, setEnabled] = useState(true);
  const [log, setLog] = useState<string[]>([]);

  const appendLog = useCallback((event: string) => {
    setLog((prev) => [`${event} · ${new Date().toLocaleTimeString()}`, ...prev].slice(0, 6));
  }, []);

  const handleShow = useCallback(() => appendLog("show"), [appendLog]);
  const handleShown = useCallback(() => appendLog("shown"), [appendLog]);
  const handleHide = useCallback(() => appendLog("hide"), [appendLog]);
  const handleHidden = useCallback(() => appendLog("hidden"), [appendLog]);
  const handleInserted = useCallback(() => appendLog("inserted"), [appendLog]);

  const perfRef = useRef<HTMLDivElement>(null);
  useDelegatedTooltips(perfRef);
  const bigList = Array.from({ length: 800 }, (_, i) => i + 1);

  return (
    <main className="tooltips-demo">
      <div className="container">
        <header className="demo-header">
          <span className="demo-badge">Bootstrap 5</span>
          <h1>Tooltips de Bootstrap</h1>
          <p>
            Implementación completa con el componente <code>Tooltip</code>: todas
            las opciones, métodos imperativos y eventos de Bootstrap,
            inicializados por JavaScript dentro de React.
          </p>
        </header>

        {/* ============ 1. MARCADO HTML ============ */}
        <section className="demo-section">
          <h2>1. Marcado HTML de los elementos destino</h2>
          <p>
            El texto va en <code>data-bs-title</code> (v5) y se requiere{" "}
            <code>data-bs-toggle="tooltip"</code>. Los elementos no enfocables
            necesitan <code>tabindex="0"</code> para el trigger de focus.
          </p>
          <CodeBlock
            code={`<button type="button" class="btn"
        data-bs-toggle="tooltip"
        data-bs-title="Mensaje del tooltip">
  Pasa el cursor
</button>

<span class="badge" tabindex="0"
      data-bs-toggle="tooltip"
      data-bs-title="Tooltip en un span">
  Span con tooltip
</span>`}
          />
          <div className="demo-row">
            <Tooltip title="Mensaje del tooltip">
              <Button variant="primary">Botón con tooltip</Button>
            </Tooltip>
            <Tooltip title="Tooltip en un span" customClass="demo-tooltip">
              <span className="demo-badge">Span con tooltip (tabindex)</span>
            </Tooltip>
          </div>
        </section>

        {/* ============ 2. INICIALIZACIÓN JS ============ */}
        <section className="demo-section">
          <h2>2. Inicialización en JavaScript</h2>
          <p>
            El componente crea la instancia con{" "}
            <code>new bootstrap.Tooltip(el, options)</code> en un{" "}
            <code>useEffect</code> y la destruye con <code>dispose()</code> al
            desmontar.
          </p>
          <CodeBlock
            code={`const instance = new bootstrap.Tooltip(element, {
  title: "Soporte técnico 24/7",
  placement: "right",
  trigger: "hover focus",
});

// Al desmontar:
instance.dispose();`}
          />
        </section>

        {/* ============ 3. POSICIONES ============ */}
        <section className="demo-section">
          <h2>3. Posiciones (top · bottom · left · right)</h2>
          <div className="demo-grid">
            {positions.map((p) => (
              <Tooltip key={p.placement} title={`Posición: ${p.label}`} placement={p.placement}>
                <Button variant="secondary">{p.label}</Button>
              </Tooltip>
            ))}
          </div>
          <CodeBlock
            code={`<Tooltip title="Arriba" placement="top"><Button>Top</Button></Tooltip>
<Tooltip title="Abajo" placement="bottom"><Button>Bottom</Button></Tooltip>
<Tooltip title="Izquierda" placement="left"><Button>Left</Button></Tooltip>
<Tooltip title="Derecha" placement="right"><Button>Right</Button></Tooltip>`}
          />
        </section>

        {/* ============ 4. TRIGGERS ============ */}
        <section className="demo-section">
          <h2>4. Tipos de activación (hover y focus)</h2>
          <div className="demo-grid">
            {triggers.map((t) => (
              <Tooltip key={t.trigger} title={`Trigger: ${t.label}`} trigger={t.trigger}>
                <Button variant="outline">{t.label}</Button>
              </Tooltip>
            ))}
          </div>
          <CodeBlock
            code={`<Tooltip title="Hover" trigger="hover"><Button>Hover</Button></Tooltip>
<Tooltip title="Focus" trigger="focus"><Button>Focus</Button></Tooltip>
<Tooltip title="Click" trigger="click"><Button>Click</Button></Tooltip>
<Tooltip title="Ambos" trigger="hover focus"><Button>Hover+Focus</Button></Tooltip>`}
          />
        </section>

        {/* ============ 5. OPCIONES AVANZADAS ============ */}
        <section className="demo-section">
          <h2>5. Opciones avanzadas</h2>
          <p>
            <code>delay</code>, <code>html</code>, <code>animation</code>,{" "}
            <code>customClass</code>, <code>offset</code>, <code>container</code>,{" "}
            <code>fallbackPlacements</code> y <code>boundary</code>.
          </p>
          <div className="demo-row">
            <Tooltip title="Aparece con retardo" delay={{ show: 300, hide: 150 }}>
              <Button variant="primary">Delay (show 300ms)</Button>
            </Tooltip>
            <Tooltip
              title="<strong>Texto en <em>negrita</em></strong><br/>con salto de línea"
              html
              customClass="demo-tooltip-html"
            >
              <Button variant="secondary">Contenido HTML</Button>
            </Tooltip>
            <Tooltip title="Sin animación de fade" animation={false}>
              <Button variant="outline">animation=false</Button>
            </Tooltip>
            <Tooltip title="Desplazado 12px" offset={[0, 12]}>
              <Button variant="ghost">offset [0,12]</Button>
            </Tooltip>
            <Tooltip
              title="Forzado a la izquierda"
              placement="right"
              fallbackPlacements={["left", "top"]}
            >
              <Button variant="outline">fallbackPlacements</Button>
            </Tooltip>
          </div>
        </section>

        {/* ============ 6. MÉTODOS IMPERATIVOS ============ */}
        <section className="demo-section">
          <h2>6. Métodos imperativos (show · hide · toggle · enable · disable)</h2>
          <p>
            Vía <code>ref</code> puedes invocar{" "}
            <code>show()</code>, <code>hide()</code>, <code>toggle()</code>,{" "}
            <code>enable()</code>, <code>disable()</code>,{" "}
            <code>toggleEnabled()</code>, <code>update()</code> y{" "}
            <code>setContent()</code>.
          </p>
          <div className="demo-row">
            <Tooltip
              ref={controlledRef}
              title={enabled ? "Tooltip controlado" : "Tooltip deshabilitado"}
              trigger="manual"
            >
              <Button variant="primary">Tooltip controlado</Button>
            </Tooltip>
            <Button variant="outline" onClick={() => controlledRef.current?.show()}>
              show()
            </Button>
            <Button variant="outline" onClick={() => controlledRef.current?.hide()}>
              hide()
            </Button>
            <Button variant="ghost" onClick={() => controlledRef.current?.toggle()}>
              toggle()
            </Button>
            <Button
              variant={enabled ? "danger" : "success"}
              onClick={() => {
                if (enabled) controlledRef.current?.disable();
                else controlledRef.current?.enable();
                setEnabled((v) => !v);
              }}
            >
              {enabled ? "disable()" : "enable()"}
            </Button>
          </div>
          <CodeBlock
            code={`const ref = useRef<TooltipHandle>(null);

<Tooltip ref={ref} title="Controlado" trigger="manual">
  <Button>Tooltip controlado</Button>
</Tooltip>

ref.current?.show();
ref.current?.hide();
ref.current?.toggle();
ref.current?.enable();
ref.current?.disable();`}
          />
        </section>

        {/* ============ 7. EVENTOS ============ */}
        <section className="demo-section">
          <h2>7. Eventos (show · shown · hide · hidden · inserted)</h2>
          <p>
            El componente expone callbacks <code>onShow</code>,{" "}
            <code>onShown</code>, <code>onHide</code>, <code>onHidden</code> y{" "}
            <code>onInserted</code>.
          </p>
          <div className="demo-row">
            <Tooltip
              title="Observa la consola/registro"
              trigger="hover focus"
              onShow={handleShow}
              onShown={handleShown}
              onHide={handleHide}
              onHidden={handleHidden}
              onInserted={handleInserted}
            >
              <Button variant="secondary">Dispara eventos</Button>
            </Tooltip>
            <div className="demo-log" aria-live="polite">
              <strong>Registro:</strong>
              {log.length === 0 ? (
                <span className="demo-log-empty"> (aún sin eventos)</span>
              ) : (
                <ul>
                  {log.map((entry, i) => (
                    <li key={i}>{entry}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* ============ 8. RENDIMIENTO (delegación) ============ */}
        <section className="demo-section">
          <h2>8. Rendimiento: delegación de eventos</h2>
          <p>
            Para listas o <code>DataTable</code> grandes, crea <strong>una sola
            instancia</strong> por contenedor con <code>useDelegatedTooltips</code>{" "}
            en lugar de una instancia por fila. La cuadrícula de abajo tiene{" "}
            {bigList.length} elementos y usa una única instancia delegada.
          </p>
          <div className="demo-perf-grid" ref={perfRef} role="list">
            {bigList.map((n) => (
              <button
                key={n}
                type="button"
                className="demo-perf-item"
                data-bs-toggle="tooltip"
                data-bs-title={`Fila #${n}`}
              >
                {n}
              </button>
            ))}
          </div>
          <CodeBlock
            code={`const ref = useRef<HTMLDivElement>(null);
useDelegatedTooltips(ref, { selector: '[data-bs-toggle="tooltip"]' });

// Una sola instancia para toda la lista:
<div ref={ref}>
  {items.map((item) => (
    <button data-bs-toggle="tooltip" data-bs-title={item.label}>
      {item.label}
    </button>
  ))}
</div>`}
          />
          <p className="demo-hint">
            Recomendado para <code>DataTable</code> y tablas con muchas filas:
            reduce drásticamente el número de instancias de Popper y mejora el
            rendimiento. Mantén <code>sanitize</code> activado y no uses{" "}
            <code>html: true</code> con contenido de usuario para evitar XSS.
          </p>
        </section>

        <p className="demo-note">
          Pasa el cursor, haz clic o usa <kbd>Tab</kbd> para navegar con el
          teclado sobre cada elemento.
        </p>
      </div>
    </main>
  );
}
