'use client';

/**
 * Export the full canvas (including background) as a PNG download.
 */
export async function exportToPNG(canvas: any, productName: string) {
  const dataUrl = canvas.toDataURL({
    format: 'png',
    multiplier: 3, // 3x for high quality (1800x1800 from 600x600)
  });

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${productName}-design.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export only the design objects (without background mockup and print zone).
 */
export async function exportDesignOnly(canvas: any, productName: string) {
  const objects = canvas.getObjects();

  // Hide system objects temporarily
  const hidden: any[] = [];
  objects.forEach((obj: any) => {
    if (obj._isBgMockup || obj._isPrintZone) {
      if (obj.visible !== false) {
        obj.set('visible', false);
        hidden.push(obj);
      }
    }
  });

  // Store original background
  const origBg = canvas.backgroundColor;
  canvas.backgroundColor = 'transparent';
  canvas.renderAll();

  const dataUrl = canvas.toDataURL({
    format: 'png',
    multiplier: 3,
  });

  // Restore
  hidden.forEach((obj) => obj.set('visible', true));
  canvas.backgroundColor = origBg;
  canvas.renderAll();

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${productName}-design-only.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Get a data URL for the design (for uploading to storage).
 */
export function getDesignDataUrl(canvas: any, multiplier = 1): string {
  return canvas.toDataURL({
    format: 'png',
    multiplier,
  });
}
