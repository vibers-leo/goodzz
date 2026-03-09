'use client';

import { undo, redo } from './history-manager';

/**
 * Attach keyboard shortcuts to the editor.
 * Returns a cleanup function to remove the listener.
 */
export function attachKeyboardShortcuts(canvas: any): () => void {
  let clipboard: any[] = [];

  const handler = async (e: KeyboardEvent) => {
    // Don't capture shortcuts when typing in input/textarea
    const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    // Also skip if editing text on canvas
    if (canvas.isEditing) return;

    const isMeta = e.metaKey || e.ctrlKey;

    // Delete / Backspace
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const active = canvas.getActiveObjects();
      if (active.length > 0) {
        e.preventDefault();
        active.forEach((obj: any) => {
          if (!obj._isBgMockup && !obj._isPrintZone) {
            canvas.remove(obj);
          }
        });
        canvas.discardActiveObject();
        canvas.renderAll();
      }
    }

    // Ctrl+Z: Undo
    if (isMeta && !e.shiftKey && e.key === 'z') {
      e.preventDefault();
      await undo(canvas);
    }

    // Ctrl+Shift+Z: Redo
    if (isMeta && e.shiftKey && e.key === 'z') {
      e.preventDefault();
      await redo(canvas);
    }

    // Ctrl+C: Copy
    if (isMeta && e.key === 'c') {
      const active = canvas.getActiveObjects();
      if (active.length > 0) {
        e.preventDefault();
        clipboard = [];
        for (const obj of active) {
          const cloned = await obj.clone();
          clipboard.push(cloned);
        }
      }
    }

    // Ctrl+V: Paste
    if (isMeta && e.key === 'v' && clipboard.length > 0) {
      e.preventDefault();
      canvas.discardActiveObject();
      const pasted: any[] = [];
      for (const obj of clipboard) {
        const cloned = await obj.clone();
        cloned.set({
          left: (cloned.left || 0) + 10,
          top: (cloned.top || 0) + 10,
        });
        (cloned as any).id = `obj_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        canvas.add(cloned);
        pasted.push(cloned);
      }
      if (pasted.length === 1) {
        canvas.setActiveObject(pasted[0]);
      }
      canvas.renderAll();
    }

    // Ctrl+A: Select all
    if (isMeta && e.key === 'a') {
      e.preventDefault();
      const objects = canvas.getObjects().filter(
        (o: any) => !o._isBgMockup && !o._isPrintZone && o.selectable !== false
      );
      if (objects.length > 0) {
        const fabric = await import('fabric');
        const selection = new fabric.ActiveSelection(objects, { canvas });
        canvas.setActiveObject(selection);
        canvas.renderAll();
      }
    }

    // Arrow keys: nudge
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      const active = canvas.getActiveObject();
      if (!active) return;
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;

      switch (e.key) {
        case 'ArrowUp':
          active.set('top', active.top - step);
          break;
        case 'ArrowDown':
          active.set('top', active.top + step);
          break;
        case 'ArrowLeft':
          active.set('left', active.left - step);
          break;
        case 'ArrowRight':
          active.set('left', active.left + step);
          break;
      }
      active.setCoords();
      canvas.renderAll();
    }
  };

  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}
