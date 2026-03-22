'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface ResizeState {
  editorWidth: number;   // px, left column
  paneHeights: [number, number, number]; // [markup, css, js] in px
}

const MIN_PX = 36;

export function useResize(totalWidth: number, totalEditorHeight: number) {
  const [state, setState] = useState<ResizeState>({
    editorWidth: 0,
    paneHeights: [0, 0, 0],
  });

  // Initialize on first meaningful size
  useEffect(() => {
    if (totalWidth > 0 && state.editorWidth === 0) {
      const w = Math.round(totalWidth * 0.5);
      const h = Math.max(MIN_PX, Math.round((totalEditorHeight - 8) / 3));
      setState({ editorWidth: w, paneHeights: [h, h, h] });
    }
  }, [totalWidth, totalEditorHeight, state.editorWidth]);

  // ── Vertical divider drag ───────────────────────────────────────────────
  const vDrag = useRef<{ startX: number; startW: number } | null>(null);

  const onVMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      vDrag.current = { startX: e.clientX, startW: state.editorWidth };
      document.body.classList.add('resizing');
    },
    [state.editorWidth],
  );

  // ── Horizontal divider drag ─────────────────────────────────────────────
  const hDrag = useRef<{
    startY: number;
    topIdx: number;
    botIdx: number;
    startTop: number;
    startBot: number;
  } | null>(null);

  const onHMouseDown = useCallback(
    (e: React.MouseEvent, topIdx: 0 | 1, botIdx: 1 | 2) => {
      e.preventDefault();
      hDrag.current = {
        startY:   e.clientY,
        topIdx,
        botIdx,
        startTop: state.paneHeights[topIdx],
        startBot: state.paneHeights[botIdx],
      };
    },
    [state.paneHeights],
  );

  // ── Global mouse move / up ──────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (vDrag.current) {
        const newW = Math.max(160, Math.min(totalWidth - 160, vDrag.current.startW + (e.clientX - vDrag.current.startX)));
        setState(s => ({ ...s, editorWidth: newW }));
      }
      if (hDrag.current) {
        const { startY, topIdx, botIdx, startTop, startBot } = hDrag.current;
        const dy    = e.clientY - startY;
        const total = startTop + startBot;
        const newTop = Math.max(MIN_PX, Math.min(total - MIN_PX, startTop + dy));
        setState(s => {
          const heights = [...s.paneHeights] as [number, number, number];
          heights[topIdx] = newTop;
          heights[botIdx] = total - newTop;
          return { ...s, paneHeights: heights };
        });
      }
    };

    const onUp = () => {
      vDrag.current = null;
      hDrag.current = null;
      document.body.classList.remove('resizing');
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [totalWidth]);

  return { state, onVMouseDown, onHMouseDown };
}
