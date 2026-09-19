// Deterministic SVG QR Code Generator for tokens
export function generateQRCodeMatrix(text: string, size: number = 21): boolean[][] {
  const matrix: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));
  
  // Hash text to generate pseudo-random bits for the data area
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }

  // Draw 3 corner position markers (7x7 squares)
  const drawCorner = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (
          i === 0 || i === 6 || j === 0 || j === 6 ||
          (i >= 2 && i <= 4 && j >= 2 && j <= 4)
        ) {
          matrix[r + i][c + j] = true;
        }
      }
    }
  };

  drawCorner(0, 0); // Top-left
  drawCorner(0, size - 7); // Top-right
  drawCorner(size - 7, 0); // Bottom-left

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Populate data area deterministically
  let bitIndex = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Avoid corner markers
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      const inTiming = r === 6 || c === 6;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !inTiming) {
        const charVal = text.charCodeAt(bitIndex % text.length);
        const shiftVal = (hash ^ (r * size + c) ^ (charVal * 31));
        matrix[r][c] = (shiftVal % 2 === 0);
        bitIndex++;
      }
    }
  }

  return matrix;
}
