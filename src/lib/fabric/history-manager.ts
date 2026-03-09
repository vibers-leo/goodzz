'use client';

import { useEditorStore } from '@/store/useEditorStore';

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const CUSTOM_PROPS = ['id', 'selectable', 'evented', '_isBgMockup', '_isPrintZone'];

/**
 * Capture current canvas state into the history stack.
 * Debounced by 300ms to avoid excessive captures during drag.
 */
export function captureHistory(canvas: any) {
  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    const json = JSON.stringify(canvas.toJSON(CUSTOM_PROPS));
    useEditorStore.getState().pushHistory(json);
  }, 300);
}

/**
 * Undo: go back one step in history.
 */
export async function undo(canvas: any) {
  const state = useEditorStore.getState();
  if (state.historyIndex <= 0) return;

  const newIndex = state.historyIndex - 1;
  const snapshot = state.historyStack[newIndex];
  if (!snapshot) return;

  await canvas.loadFromJSON(JSON.parse(snapshot));
  canvas.renderAll();
  state.setHistoryIndex(newIndex);
}

/**
 * Redo: go forward one step in history.
 */
export async function redo(canvas: any) {
  const state = useEditorStore.getState();
  if (state.historyIndex >= state.historyStack.length - 1) return;

  const newIndex = state.historyIndex + 1;
  const snapshot = state.historyStack[newIndex];
  if (!snapshot) return;

  await canvas.loadFromJSON(JSON.parse(snapshot));
  canvas.renderAll();
  state.setHistoryIndex(newIndex);
}
