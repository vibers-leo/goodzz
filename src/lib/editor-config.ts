export interface PrintZone {
  id: string;
  label: string;
  x: number; // percentage from left
  y: number; // percentage from top
  width: number; // percentage
  height: number; // percentage
  // Physical print dimensions
  printWidthMM?: number;
  printHeightMM?: number;
  dpi?: number;
  mockupImageUrl?: string;
}

export interface ProductPrintConfig {
  zones: PrintZone[];
  canvasAspectRatio?: number; // default 1 (square)
}

// Default print zones by product category
export const PRINT_ZONES: Record<string, ProductPrintConfig> = {
  default: {
    zones: [{
      id: 'front', label: '앞면', x: 20, y: 15, width: 60, height: 60,
      printWidthMM: 200, printHeightMM: 200, dpi: 300,
    }],
  },
  fashion: {
    zones: [
      {
        id: 'front', label: '앞면', x: 25, y: 20, width: 50, height: 50,
        printWidthMM: 280, printHeightMM: 350, dpi: 300,
      },
      {
        id: 'back', label: '뒷면', x: 25, y: 20, width: 50, height: 50,
        printWidthMM: 280, printHeightMM: 350, dpi: 300,
      },
    ],
  },
  goods: {
    zones: [{
      id: 'front', label: '전면', x: 15, y: 15, width: 70, height: 70,
      printWidthMM: 180, printHeightMM: 180, dpi: 300,
    }],
  },
  phone: {
    zones: [{
      id: 'front', label: '전면', x: 10, y: 5, width: 80, height: 90,
      printWidthMM: 70, printHeightMM: 140, dpi: 300,
    }],
  },
  mug: {
    zones: [{
      id: 'front', label: '전면', x: 10, y: 20, width: 80, height: 50,
      printWidthMM: 200, printHeightMM: 80, dpi: 300,
    }],
  },
  businesscard: {
    zones: [
      {
        id: 'front', label: '앞면', x: 10, y: 15, width: 80, height: 70,
        printWidthMM: 90, printHeightMM: 50, dpi: 300,
      },
      {
        id: 'back', label: '뒷면', x: 10, y: 15, width: 80, height: 70,
        printWidthMM: 90, printHeightMM: 50, dpi: 300,
      },
    ],
    canvasAspectRatio: 1.8, // 90mm / 50mm = 1.8
  },
};

export function getPrintConfig(category: string): ProductPrintConfig {
  return PRINT_ZONES[category] || PRINT_ZONES.default;
}
