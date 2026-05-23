// Resizable.tsx — drag-to-resize handles. Edge-attached gripper that updates
// a CSS variable on document.documentElement when dragged. Mouse + touch.
import { useRef, useCallback, useEffect } from 'react';

interface ResizableProps {
  side: 'right' | 'left' | 'bottom' | 'top';
  cssVar?: string;
  min: number;
  max: number;
  defaultSize: number;
  onChange?: (size: number) => void;
}

export function Resizable({ side = 'right', cssVar, min = 160, max = 600, defaultSize, onChange }: ResizableProps) {
  const dragging = useRef(false);
  const startRef = useRef({ x: 0, y: 0, size: 0 });

  const apply = useCallback((size: number) => {
    const clamped = Math.min(max, Math.max(min, size));
    if (cssVar) document.documentElement.style.setProperty(cssVar, `${clamped}px`);
    onChange && onChange(clamped);
  }, [cssVar, min, max, onChange]);

  // Initial apply
  useEffect(() => { if (defaultSize) apply(defaultSize); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const isTouch = e.type.startsWith('touch');
    const getX = (ev: MouseEvent | TouchEvent) =>
      isTouch ? (ev as TouchEvent).touches[0].clientX : (ev as MouseEvent).clientX;
    const getY = (ev: MouseEvent | TouchEvent) =>
      isTouch ? (ev as TouchEvent).touches[0].clientY : (ev as MouseEvent).clientY;

    const curW = cssVar
      ? parseInt(getComputedStyle(document.documentElement).getPropertyValue(cssVar)) || defaultSize
      : defaultSize;
    const curH = cssVar
      ? parseInt(getComputedStyle(document.documentElement).getPropertyValue(cssVar)) || defaultSize
      : defaultSize;
    const startSize = (side === 'right' || side === 'left') ? curW : curH;

    const nativeE = e.nativeEvent as MouseEvent | TouchEvent;
    startRef.current = { x: getX(nativeE), y: getY(nativeE), size: startSize };
    dragging.current = true;
    document.body.classList.add(side === 'top' || side === 'bottom' ? 'resizing-v' : 'resizing-h');

    const move = (ev: MouseEvent | TouchEvent) => {
      if (!dragging.current) return;
      const dx = getX(ev) - startRef.current.x;
      const dy = getY(ev) - startRef.current.y;
      let delta = 0;
      if (side === 'right')  delta =  dx;
      if (side === 'left')   delta = -dx;
      if (side === 'bottom') delta =  dy;
      if (side === 'top')    delta = -dy;
      apply(startRef.current.size + delta);
    };

    const up = () => {
      dragging.current = false;
      document.body.classList.remove('resizing-h', 'resizing-v');
      window.removeEventListener(isTouch ? 'touchmove' : 'mousemove', move as EventListener);
      window.removeEventListener(isTouch ? 'touchend' : 'mouseup', up);
    };

    window.addEventListener(isTouch ? 'touchmove' : 'mousemove', move as EventListener, { passive: false });
    window.addEventListener(isTouch ? 'touchend' : 'mouseup', up);
  };

  const cls = (side === 'top' || side === 'bottom') ? 'rh rh-v' : 'rh rh-h';

  return (
    <div
      className={`${cls} rh-${side}`}
      onMouseDown={onDown}
      onTouchStart={onDown}
      onDoubleClick={() => apply(defaultSize)}
      title="Перетаскивай чтобы изменить размер · двойной клик — сброс"
      role="separator"
    >
      <div className="rh-grip" />
    </div>
  );
}

export default Resizable;
