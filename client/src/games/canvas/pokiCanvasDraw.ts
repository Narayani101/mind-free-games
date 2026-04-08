/** Canvas helpers for glossy / Poki-style 2D visuals (no external image assets). */

function shadeHex(hex: string, amt: number): string {
  const n = hex.replace('#', '');
  if (n.length !== 6) return hex;
  const num = parseInt(n, 16);
  let r = (num >> 16) + amt;
  let g = ((num >> 8) & 0x00ff) + amt;
  let b = (num & 0x0000ff) + amt;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function drawGlossyBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string
) {
  const g = ctx.createRadialGradient(x - r * 0.45, y - r * 0.45, r * 0.05, x, y, r);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.2, color);
  g.addColorStop(0.75, color);
  g.addColorStop(1, shadeHex(color, -45));
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = Math.max(1.2, r / 8);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x - r * 0.38, y - r * 0.38, r * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fill();
}

export function drawSkyBackdrop(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#38bdf8');
  sky.addColorStop(0.45, '#7dd3fc');
  sky.addColorStop(0.75, '#bae6fd');
  sky.addColorStop(1, '#e0f2fe');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  for (let i = 0; i < 5; i++) {
    const cx = (w / 6) * (i + 1) + Math.sin(i * 1.7) * 20;
    const cy = 40 + i * 18;
    ctx.beginPath();
    ctx.arc(cx, cy, 22 + i * 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawRoadScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scroll: number,
  laneCount: number
) {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, w, h);
  const grass = ctx.createLinearGradient(0, 0, w, 0);
  grass.addColorStop(0, '#14532d');
  grass.addColorStop(0.15, '#166534');
  grass.addColorStop(0.85, '#166534');
  grass.addColorStop(1, '#14532d');
  ctx.fillStyle = grass;
  ctx.fillRect(0, 0, w * 0.08, h);
  ctx.fillRect(w * 0.92, 0, w * 0.08, h);
  const roadGrad = ctx.createLinearGradient(0, 0, w, 0);
  roadGrad.addColorStop(0, '#334155');
  roadGrad.addColorStop(0.5, '#475569');
  roadGrad.addColorStop(1, '#334155');
  ctx.fillStyle = roadGrad;
  const rx = w * 0.08;
  const rw = w * 0.84;
  ctx.fillRect(rx, 0, rw, h);
  const laneW = rw / laneCount;
  ctx.strokeStyle = 'rgba(250,250,250,0.35)';
  ctx.lineWidth = 2;
  ctx.setLineDash([18, 22]);
  for (let i = 1; i < laneCount; i++) {
    const lx = rx + laneW * i;
    ctx.beginPath();
    let y = (-scroll % 40) - 20;
    while (y < h + 40) {
      ctx.moveTo(lx, y);
      ctx.lineTo(lx, y + 18);
      y += 40;
    }
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

/** Stylized car (side-ish view) for lane runners */
export function drawStylizedCar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  body: string,
  accent: string
) {
  ctx.save();
  ctx.translate(x, y);
  const bodyGrad = ctx.createLinearGradient(0, 0, w, h);
  bodyGrad.addColorStop(0, shadeHex(body, 40));
  bodyGrad.addColorStop(0.5, body);
  bodyGrad.addColorStop(1, shadeHex(body, -30));
  ctx.fillStyle = bodyGrad;
  ctx.fillRect(2, h * 0.28, w - 4, h * 0.52);
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(6, h * 0.42);
  ctx.lineTo(w * 0.55, h * 0.12);
  ctx.lineTo(w - 8, h * 0.38);
  ctx.lineTo(w - 8, h * 0.55);
  ctx.lineTo(6, h * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(15,23,42,0.85)';
  ctx.fillRect(8, h * 0.48, w - 16, h * 0.14);
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(10, h - 6, 5, 0, Math.PI * 2);
  ctx.arc(w - 10, h - 6, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(2, h * 0.28, w - 4, h * 0.52);
  ctx.restore();
}
