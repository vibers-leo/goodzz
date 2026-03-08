export interface PrintZone {
  id: string;
  label: string;
  x: number; // percentage from left
  y: number; // percentage from top
  width: number; // percentage
  height: number; // percentage
}

export interface ProductPrintConfig {
  zones: PrintZone[];
}

// Default print zones by product category
export const PRINT_ZONES: Record<string, ProductPrintConfig> = {
  default: {
    zones: [{ id: 'front', label: '앞면', x: 20, y: 15, width: 60, height: 60 }],
  },
  fashion: {
    zones: [
      { id: 'front', label: '앞면', x: 25, y: 20, width: 50, height: 50 },
      { id: 'back', label: '뒷면', x: 25, y: 20, width: 50, height: 50 },
    ],
  },
  goods: {
    zones: [{ id: 'front', label: '전면', x: 15, y: 15, width: 70, height: 70 }],
  },
};

export function getPrintConfig(category: string): ProductPrintConfig {
  return PRINT_ZONES[category] || PRINT_ZONES.default;
}
