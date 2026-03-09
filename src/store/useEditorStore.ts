'use client';

import { create } from 'zustand';
import type { Product } from '@/lib/products';

export type ActiveTool = 'ai' | 'image' | 'text' | 'shape' | 'layers';
export type GenerationMode = 'real' | 'demo' | 'fallback' | null;

export interface EditorState {
  // Product context
  product: Product | null;
  setProduct: (product: Product | null) => void;
  activeFace: string;
  setActiveFace: (face: string) => void;

  // Canvas reference (not serialized)
  canvasRef: any | null; // fabric.Canvas
  setCanvas: (canvas: any | null) => void;

  // Selection
  selectedObjectIds: string[];
  setSelectedObjectIds: (ids: string[]) => void;

  // AI generation
  prompt: string;
  setPrompt: (prompt: string) => void;
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
  removeBackground: boolean;
  setRemoveBackground: (v: boolean) => void;
  generationMode: GenerationMode;
  setGenerationMode: (mode: GenerationMode) => void;

  // Generation history (image URLs from AI)
  generationHistory: string[];
  addToGenerationHistory: (url: string) => void;

  // History (undo/redo canvas snapshots)
  historyStack: string[];
  historyIndex: number;
  pushHistory: (json: string) => void;
  setHistoryIndex: (index: number) => void;

  // UI state
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  isMockupMode: boolean;
  setIsMockupMode: (v: boolean) => void;
  isSaving: boolean;
  setIsSaving: (v: boolean) => void;
  zoom: number;
  setZoom: (zoom: number) => void;

  // Per-face canvas state storage
  faceCanvasStates: Record<string, string>;
  saveFaceState: (faceId: string, json: string) => void;
  getFaceState: (faceId: string) => string | undefined;

  // Loading
  loading: boolean;
  setLoading: (v: boolean) => void;
}

export const useEditorStore = create<EditorState>()((set, get) => ({
  product: null,
  setProduct: (product) => set({ product }),
  activeFace: 'front',
  setActiveFace: (face) => set({ activeFace: face }),

  canvasRef: null,
  setCanvas: (canvas) => set({ canvasRef: canvas }),

  selectedObjectIds: [],
  setSelectedObjectIds: (ids) => set({ selectedObjectIds: ids }),

  prompt: '',
  setPrompt: (prompt) => set({ prompt }),
  isGenerating: false,
  setIsGenerating: (v) => set({ isGenerating: v }),
  selectedStyle: 'Artistic',
  setSelectedStyle: (style) => set({ selectedStyle: style }),
  removeBackground: false,
  setRemoveBackground: (v) => set({ removeBackground: v }),
  generationMode: null,
  setGenerationMode: (mode) => set({ generationMode: mode }),

  generationHistory: [],
  addToGenerationHistory: (url) =>
    set((state) => ({ generationHistory: [...state.generationHistory, url] })),

  historyStack: [],
  historyIndex: -1,
  pushHistory: (json) =>
    set((state) => {
      const newStack = state.historyStack.slice(0, state.historyIndex + 1);
      newStack.push(json);
      // Keep max 50 snapshots
      if (newStack.length > 50) newStack.shift();
      return { historyStack: newStack, historyIndex: newStack.length - 1 };
    }),
  setHistoryIndex: (index) => set({ historyIndex: index }),

  activeTool: 'ai',
  setActiveTool: (tool) => set({ activeTool: tool }),
  isMockupMode: true,
  setIsMockupMode: (v) => set({ isMockupMode: v }),
  isSaving: false,
  setIsSaving: (v) => set({ isSaving: v }),
  zoom: 1,
  setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(4, zoom)) }),

  faceCanvasStates: {},
  saveFaceState: (faceId, json) =>
    set((state) => ({
      faceCanvasStates: { ...state.faceCanvasStates, [faceId]: json },
    })),
  getFaceState: (faceId) => get().faceCanvasStates[faceId],

  loading: true,
  setLoading: (v) => set({ loading: v }),
}));
