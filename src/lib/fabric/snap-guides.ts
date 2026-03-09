'use client';

const SNAP_THRESHOLD = 5; // pixels

interface GuideLines {
  vertical: any[];
  horizontal: any[];
}

let guideLines: GuideLines = { vertical: [], horizontal: [] };

/**
 * Attach snap guide logic to a Fabric.js canvas.
 * Shows alignment guides when objects are dragged near edges/centers of other objects.
 */
export function attachSnapGuides(canvas: any) {
  canvas.on('object:moving', (e: any) => {
    const target = e.target;
    if (!target) return;

    clearGuides(canvas);

    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();

    // Target bounds
    const tBound = target.getBoundingRect();
    const tCenterX = tBound.left + tBound.width / 2;
    const tCenterY = tBound.top + tBound.height / 2;
    const tLeft = tBound.left;
    const tRight = tBound.left + tBound.width;
    const tTop = tBound.top;
    const tBottom = tBound.top + tBound.height;

    // Collect snap points from other objects
    const snapPoints: { x: number[]; y: number[] } = {
      x: [canvasWidth / 2], // canvas center
      y: [canvasHeight / 2],
    };

    const objects = canvas.getObjects();
    for (const obj of objects) {
      if (obj === target || obj._isBgMockup || obj._isPrintZone) continue;

      const bound = obj.getBoundingRect();
      const cx = bound.left + bound.width / 2;
      const cy = bound.top + bound.height / 2;

      snapPoints.x.push(bound.left, cx, bound.left + bound.width);
      snapPoints.y.push(bound.top, cy, bound.top + bound.height);
    }

    // Check snapping
    const targetXPoints = [tLeft, tCenterX, tRight];
    const targetYPoints = [tTop, tCenterY, tBottom];

    for (const sx of snapPoints.x) {
      for (const tx of targetXPoints) {
        if (Math.abs(tx - sx) < SNAP_THRESHOLD) {
          // Snap horizontally
          const offset = sx - tx;
          target.set('left', target.left + offset);
          addVerticalGuide(canvas, sx);
          break;
        }
      }
    }

    for (const sy of snapPoints.y) {
      for (const ty of targetYPoints) {
        if (Math.abs(ty - sy) < SNAP_THRESHOLD) {
          // Snap vertically
          const offset = sy - ty;
          target.set('top', target.top + offset);
          addHorizontalGuide(canvas, sy);
          break;
        }
      }
    }

    canvas.renderAll();
  });

  canvas.on('object:modified', () => {
    clearGuides(canvas);
  });

  canvas.on('object:scaling', () => {
    clearGuides(canvas);
  });
}

async function addVerticalGuide(canvas: any, x: number) {
  const { Line } = await import('fabric');
  const line = new Line([x, 0, x, canvas.getHeight()], {
    stroke: '#3b82f6',
    strokeWidth: 1,
    selectable: false,
    evented: false,
    excludeFromExport: true,
    opacity: 0.7,
  } as any);
  (line as any)._isGuide = true;
  canvas.add(line);
  guideLines.vertical.push(line);
}

async function addHorizontalGuide(canvas: any, y: number) {
  const { Line } = await import('fabric');
  const line = new Line([0, y, canvas.getWidth(), y], {
    stroke: '#3b82f6',
    strokeWidth: 1,
    selectable: false,
    evented: false,
    excludeFromExport: true,
    opacity: 0.7,
  } as any);
  (line as any)._isGuide = true;
  canvas.add(line);
  guideLines.horizontal.push(line);
}

function clearGuides(canvas: any) {
  [...guideLines.vertical, ...guideLines.horizontal].forEach((line) => {
    canvas.remove(line);
  });
  guideLines = { vertical: [], horizontal: [] };
}

export function detachSnapGuides(canvas: any) {
  clearGuides(canvas);
  canvas.off('object:moving');
  canvas.off('object:modified');
  canvas.off('object:scaling');
}
