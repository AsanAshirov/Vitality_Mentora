// Resizable.jsx — drag-to-resize handles. Edge-attached gripper that updates
// a CSS variable on a target element (or its parent) when dragged. Mouse + touch.

const { useRef: useRef_r, useCallback: useCb_r, useEffect: useEffect_r } = React;

function ResizeHandle({ side = "right", target, cssVar, min = 160, max = 600, defaultSize, onChange }) {
  // side: "right" | "left" | "bottom" | "top"
  //   right  → handle on right edge, drag right grows width
  //   left   → handle on left edge,  drag left grows width
  // target: ref to element whose width/height we set via cssVar OR style
  // cssVar: the CSS custom property name to set on document.documentElement (e.g. "--sidebar-w")
  //   if not provided, we set style on target directly
  const dragging = useRef_r(false);
  const startRef = useRef_r({ x: 0, y: 0, size: 0 });

  const apply = useCb_r((size) => {
    const clamped = Math.min(max, Math.max(min, size));
    if (cssVar) document.documentElement.style.setProperty(cssVar, `${clamped}px`);
    else if (target?.current) {
      if (side === "right" || side === "left") target.current.style.width = `${clamped}px`;
      else target.current.style.height = `${clamped}px`;
    }
    onChange && onChange(clamped);
  }, [cssVar, target, side, min, max, onChange]);

  // Initial apply
  useEffect_r(() => { if (defaultSize) apply(defaultSize); }, []);

  const onDown = (e) => {
    e.preventDefault();
    const isTouch = e.type.startsWith("touch");
    const getX = (ev) => isTouch ? ev.touches[0].clientX : ev.clientX;
    const getY = (ev) => isTouch ? ev.touches[0].clientY : ev.clientY;
    const el = target?.current;
    const curW = el ? el.getBoundingClientRect().width  : parseInt(getComputedStyle(document.documentElement).getPropertyValue(cssVar)) || defaultSize;
    const curH = el ? el.getBoundingClientRect().height : parseInt(getComputedStyle(document.documentElement).getPropertyValue(cssVar)) || defaultSize;
    const startSize = (side === "right" || side === "left") ? curW : curH;
    startRef.current = { x: getX(e), y: getY(e), size: startSize };
    dragging.current = true;
    document.body.classList.add(side === "top" || side === "bottom" ? "resizing-v" : "resizing-h");

    const move = (ev) => {
      if (!dragging.current) return;
      const dx = getX(ev) - startRef.current.x;
      const dy = getY(ev) - startRef.current.y;
      let delta = 0;
      if (side === "right")  delta =  dx;
      if (side === "left")   delta = -dx;
      if (side === "bottom") delta =  dy;
      if (side === "top")    delta = -dy;
      apply(startRef.current.size + delta);
    };
    const up = () => {
      dragging.current = false;
      document.body.classList.remove("resizing-h", "resizing-v");
      window.removeEventListener(isTouch ? "touchmove" : "mousemove", move);
      window.removeEventListener(isTouch ? "touchend" : "mouseup", up);
    };
    window.addEventListener(isTouch ? "touchmove" : "mousemove", move, { passive: false });
    window.addEventListener(isTouch ? "touchend" : "mouseup", up);
  };

  const cls = (side === "top" || side === "bottom") ? "rh rh-v" : "rh rh-h";
  return (
    <div className={`${cls} rh-${side}`}
         onMouseDown={onDown}
         onTouchStart={onDown}
         onDoubleClick={() => apply(defaultSize)}
         title="Перетаскивай чтобы изменить размер · двойной клик — сброс"
         role="separator">
      <div className="rh-grip" />
    </div>
  );
}

window.ResizeHandle = ResizeHandle;
