import { useCallback, useEffect, useRef, useState } from 'react';
import { GameShell } from '@/components/GameShell';
import { useGameSession } from '@/hooks/useGameSession';
import { useGameSounds } from '@/hooks/useGameSounds';
import { drawGlossyBubble, drawSkyBackdrop } from '@/games/canvas/pokiCanvasDraw';
import { confettiMatchBurst } from '@/utils/gameFx';
import { poki } from '@/theme/pokiGameTheme';

const GAME_ID = 'bubble-shooter';
const COLS = 8;
const ROWS = 10;
const COLORS = ['#f43f5e', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];

type Grid = (number | null)[][];

function emptyGrid(): Grid {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null) as (number | null)[]);
}

function cluster(g: Grid, r: number, c: number, color: number): Set<string> {
  const seen = new Set<string>();
  const stack: [number, number][] = [[r, c]];
  while (stack.length) {
    const [y, x] = stack.pop()!;
    const k = `${y},${x}`;
    if (seen.has(k)) continue;
    if (y < 0 || x < 0 || y >= ROWS || x >= COLS) continue;
    if (g[y][x] !== color) continue;
    seen.add(k);
    stack.push([y + 1, x], [y - 1, x], [y, x + 1], [y, x - 1]);
  }
  return seen;
}

function connectedToTop(g: Grid): Set<string> {
  const seen = new Set<string>();
  const q: [number, number][] = [];
  for (let c = 0; c < COLS; c++) {
    if (g[0][c] !== null) {
      q.push([0, c]);
      seen.add(`0,${c}`);
    }
  }
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ] as const;
  while (q.length) {
    const [r, c] = q.shift()!;
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      const k = `${nr},${nc}`;
      if (nr < 0 || nc < 0 || nr >= ROWS || nc >= COLS) continue;
      if (seen.has(k)) continue;
      if (g[nr][nc] === null) continue;
      seen.add(k);
      q.push([nr, nc]);
    }
  }
  return seen;
}

function dropFloating(g: Grid): { grid: Grid; dropped: number } {
  const anchored = connectedToTop(g);
  let dropped = 0;
  const next = g.map((row) => [...row]);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (next[r][c] !== null && !anchored.has(`${r},${c}`)) {
        next[r][c] = null;
        dropped++;
      }
    }
  }
  return { grid: next, dropped };
}

function gridCenter(
  c: number,
  r: number,
  originX: number,
  originY: number,
  cell: number
): { x: number; y: number } {
  return { x: originX + c * cell + cell / 2, y: originY + r * cell + cell / 2 };
}

function neighbors4(r: number, c: number): [number, number][] {
  return [
    [r - 1, c],
    [r + 1, c],
    [r, c - 1],
    [r, c + 1],
  ];
}

export default function BubbleShooterGame() {
  const { reportScore, saveState } = useGameSession(GAME_ID);
  const { playPop } = useGameSounds();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [, setAngleUi] = useState(-Math.PI / 2);
  const angleRef = useRef(-Math.PI / 2);
  const scoreRef = useRef(0);
  scoreRef.current = score;

  const stateRef = useRef({
    grid: emptyGrid() as Grid,
    nextColor: 0,
    currentColor: 0,
    proj: null as null | { x: number; y: number; vx: number; vy: number; color: number },
    animBubbles: [] as { x: number; y: number; vy: number; color: number; life: number }[],
    shooting: false,
    cell: 30,
    originX: 24,
    originY: 36,
  });

  const initGrid = useCallback(() => {
    const g = emptyGrid();
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < COLS; c++) {
        g[r][c] = Math.floor(Math.random() * COLORS.length);
      }
    }
    return g;
  }, []);

  useEffect(() => {
    const s = stateRef.current;
    s.grid = initGrid();
    s.nextColor = Math.floor(Math.random() * COLORS.length);
    s.currentColor = Math.floor(Math.random() * COLORS.length);
  }, [initGrid]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const speed = 10;

    const shoot = () => {
      const s = stateRef.current;
      if (s.shooting || s.proj) return;
      const sx = canvas.width / 2;
      const sy = canvas.height - 28;
      const a = angleRef.current;
      const vx = Math.cos(a) * speed;
      const vy = Math.sin(a) * speed;
      if (vy >= -0.5) return;
      s.shooting = true;
      s.proj = { x: sx, y: sy, vx, vy, color: s.currentColor };
    };

    const onPointer = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const sx = rect.left + rect.width / 2;
      const sy = rect.top + rect.height - 28 * (rect.height / canvas.height);
      const x = clientX - sx;
      const y = clientY - sy;
      let a = Math.atan2(y, x);
      const minA = (-Math.PI * 175) / 180;
      const maxA = (-Math.PI * 5) / 180;
      if (a < minA) a = minA;
      if (a > maxA) a = maxA;
      angleRef.current = a;
      setAngleUi(a);
    };

    const onMove = (e: PointerEvent) => onPointer(e.clientX, e.clientY);
    const onDown = (e: PointerEvent) => {
      onPointer(e.clientX, e.clientY);
      shoot();
    };

    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerdown', onDown);

    const bubbleR = 12;

    const attachBubble = (gr: number, gc: number, color: number) => {
      const s = stateRef.current;
      if (gr < 0 || gc < 0 || gr >= ROWS || gc >= COLS) return;
      if (s.grid[gr][gc] !== null) return;
      s.grid[gr][gc] = color;
      const cl = cluster(s.grid, gr, gc, color);
      let ns = scoreRef.current;
      if (cl.size >= 3) {
        playPop();
        void confettiMatchBurst();
        cl.forEach((k) => {
          const [y, x] = k.split(',').map(Number);
          const colIdx = s.grid[y][x]!;
          const { x: bx, y: by } = gridCenter(x, y, s.originX, s.originY, s.cell);
          s.animBubbles.push({
            x: bx,
            y: by,
            vy: 2 + Math.random() * 2,
            color: colIdx,
            life: 1,
          });
          s.grid[y][x] = null;
        });
        ns += cl.size * 15;
        const before = s.grid.map((row) => [...row]);
        const { grid: afterDrop, dropped } = dropFloating(s.grid);
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            if (before[r][c] !== null && afterDrop[r][c] === null) {
              const colIdx = before[r][c]!;
              const { x: bx, y: by } = gridCenter(c, r, s.originX, s.originY, s.cell);
              s.animBubbles.push({
                x: bx,
                y: by,
                vy: 3 + Math.random() * 3,
                color: colIdx,
                life: 1,
              });
            }
          }
        }
        s.grid = afterDrop;
        ns += dropped * 8;
        setScore(ns);
        void reportScore(ns);
        saveState({ score: ns });
      } else {
        saveState({ score: ns });
      }
      s.currentColor = s.nextColor;
      s.nextColor = Math.floor(Math.random() * COLORS.length);
      s.proj = null;
      s.shooting = false;
    };

    const findAttachCell = (hitR: number, hitC: number, px: number, py: number) => {
      const s = stateRef.current;
      const { cell, originX, originY } = s;
      const cand: [number, number][] = [];
      for (const [nr, nc] of neighbors4(hitR, hitC)) {
        if (nr >= 0 && nc >= 0 && nr < ROWS && nc < COLS && s.grid[nr][nc] === null) {
          cand.push([nr, nc]);
        }
      }
      if (!cand.length) return null;
      let best = cand[0]!;
      let bestD = Infinity;
      for (const [nr, nc] of cand) {
        const { x, y } = gridCenter(nc, nr, originX, originY, cell);
        const d = (x - px) ** 2 + (y - py) ** 2;
        if (d < bestD) {
          bestD = d;
          best = [nr, nc];
        }
      }
      return best;
    };

    const tick = () => {
      const s = stateRef.current;
      const { width, height } = canvas;
      s.cell = Math.min(34, Math.max(24, Math.floor((width - 48) / COLS)));
      s.originX = (width - COLS * s.cell) / 2;
      s.originY = 32;

      ctx.clearRect(0, 0, width, height);
      drawSkyBackdrop(ctx, width, height);

      const sx = width / 2;
      const sy = height - 28;
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      const aimLen = 220;
      const a = angleRef.current;
      ctx.lineTo(sx + Math.cos(a) * aimLen, sy + Math.sin(a) * aimLen);
      ctx.stroke();
      ctx.setLineDash([]);

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const col = s.grid[r][c];
          if (col === null) continue;
          const { x, y } = gridCenter(c, r, s.originX, s.originY, s.cell);
          drawGlossyBubble(ctx, x, y, bubbleR, COLORS[col]);
        }
      }

      for (const b of s.animBubbles) {
        ctx.globalAlpha = Math.max(0, b.life);
        drawGlossyBubble(ctx, b.x, b.y, bubbleR * 0.85, COLORS[b.color]);
        ctx.globalAlpha = 1;
      }

      if (s.proj) {
        const p = s.proj;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < bubbleR + s.originX) {
          p.x = bubbleR + s.originX;
          p.vx *= -1;
        }
        if (p.x > width - bubbleR - s.originX) {
          p.x = width - bubbleR - s.originX;
          p.vx *= -1;
        }
        if (p.y < s.originY + bubbleR) {
          let gc = Math.round((p.x - s.originX - s.cell / 2) / s.cell);
          gc = Math.max(0, Math.min(COLS - 1, gc));
          let col = gc;
          if (s.grid[0][col] !== null) {
            let best = -1;
            let bd = Infinity;
            for (let c = 0; c < COLS; c++) {
              if (s.grid[0][c] !== null) continue;
              const { x } = gridCenter(c, 0, s.originX, s.originY, s.cell);
              const d = Math.abs(p.x - x);
              if (d < bd) {
                bd = d;
                best = c;
              }
            }
            col = best;
          }
          if (col >= 0) attachBubble(0, col, p.color);
          else {
            s.proj = null;
            s.shooting = false;
          }
        } else {
          let hit: { r: number; c: number } | null = null;
          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              if (s.grid[r][c] === null) continue;
              const { x, y } = gridCenter(c, r, s.originX, s.originY, s.cell);
              const d = Math.hypot(p.x - x, p.y - y);
              if (d < bubbleR * 2 - 2) {
                hit = { r, c };
                break;
              }
            }
            if (hit) break;
          }
          if (hit) {
            const slot = findAttachCell(hit.r, hit.c, p.x, p.y);
            if (slot) attachBubble(slot[0], slot[1], p.color);
            else {
              s.proj = null;
              s.shooting = false;
            }
          } else if (p.y > height + 40) {
            s.proj = null;
            s.shooting = false;
          }
        }
        if (s.proj) {
          drawGlossyBubble(ctx, s.proj.x, s.proj.y, bubbleR, COLORS[s.proj.color]);
        }
      }

      drawGlossyBubble(ctx, sx, sy, bubbleR + 2, COLORS[s.currentColor]);
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(sx, sy, bubbleR + 2, 0, Math.PI * 2);
      ctx.stroke();

      const nx = sx + 52;
      ctx.font = 'bold 11px system-ui,sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillText('Next', nx - 8, sy - 18);
      drawGlossyBubble(ctx, nx, sy, bubbleR - 1, COLORS[s.nextColor]);

      s.animBubbles = s.animBubbles
        .map((b) => ({ ...b, y: b.y + b.vy, life: b.life - 0.04 }))
        .filter((b) => b.life > 0);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [reportScore, saveState, playPop]);

  useEffect(() => {
    const el = wrapRef.current;
    const canvas = canvasRef.current;
    if (!el || !canvas) return;
    const ro = new ResizeObserver(() => {
      const w = Math.min(420, el.clientWidth);
      canvas.width = w;
      canvas.height = Math.round(w * 1.15);
    });
    ro.observe(el);
    const w = Math.min(420, el.clientWidth || 360);
    canvas.width = w;
    canvas.height = Math.round(w * 1.15);
    return () => ro.disconnect();
  }, []);

  return (
    <GameShell
      gameId={GAME_ID}
      title="Bubble Shooter"
      hud={
        <span className={poki.hudStat}>
          Score <span className="font-mono text-[#FF8A65]">{score}</span>
        </span>
      }
    >
      <div ref={wrapRef} className="mx-auto w-full max-w-[420px]">
        <canvas ref={canvasRef} className="game-canvas w-full touch-none rounded-2xl border-2 border-slate-200 dark:border-slate-600" />
      </div>
    </GameShell>
  );
}
