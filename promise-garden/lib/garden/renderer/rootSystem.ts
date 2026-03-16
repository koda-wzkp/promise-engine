/**
 * Underground root system renderer.
 *
 * Draws bezier curve root connections between dependent plants on the shared
 * overlay canvas, below the ground line. The garden scene has a visible
 * cross-section: sky above, ground line, then a soil layer below where roots
 * are visible — like looking at a terrarium or ant farm cut in half.
 *
 * Root visual properties encode dependency health:
 *
 * | Upstream Status  | Color           | Style  | Width | Animation         |
 * |------------------|-----------------|--------|-------|-------------------|
 * | verified/kept    | #8B7355 (brown) | solid  | 2px   | none              |
 * | declared         | #8B7355         | solid  | 1px   | none              |
 * | degraded         | #D4A574 (amber) | solid  | 2px   | pulse (3s)        |
 * | violated/broken  | #9CA3AF (grey)  | dashed | 1px   | none (dead)       |
 * | unverifiable     | #C4B5A0 (faded) | dotted | 1px   | none              |
 */

export interface RootConnection {
  fromPlantId: string;
  toPlantId: string;
  fromPosition: { x: number; y: number };
  toPosition: { x: number; y: number };
  upstreamStatus: string;
}

// Cascade particle traveling along a root
export interface RootParticle {
  connectionIndex: number; // Which root connection it follows
  progress: number;        // 0–1 along the bezier path
  color: string;           // Amber for degraded, red for violated
  speed: number;           // Progress units per frame (0.003–0.007)
}

// ─── ROOT STYLE LOOKUP ───

interface RootStyle {
  color: string;
  lineWidth: number;
  lineDash: number[];
  pulse: boolean;
}

function getRootStyle(upstreamStatus: string): RootStyle {
  switch (upstreamStatus) {
    case "verified":
    case "kept":
      return { color: "#8B7355", lineWidth: 2, lineDash: [], pulse: false };
    case "declared":
      return { color: "#8B7355", lineWidth: 1, lineDash: [], pulse: false };
    case "degraded":
      return { color: "#D4A574", lineWidth: 2, lineDash: [], pulse: true };
    case "violated":
    case "broken":
      return { color: "#9CA3AF", lineWidth: 1, lineDash: [3, 3], pulse: false };
    case "unverifiable":
    default:
      return { color: "#C4B5A0", lineWidth: 1, lineDash: [1, 2], pulse: false };
  }
}

// ─── BEZIER HELPERS ───

/**
 * Compute a point on a quadratic bezier curve at parameter t.
 * Control point is placed below the ground line for the underground arc.
 */
function bezierPoint(
  p0: { x: number; y: number },
  cp: { x: number; y: number },
  p1: { x: number; y: number },
  t: number
): { x: number; y: number } {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * cp.x + t * t * p1.x,
    y: u * u * p0.y + 2 * u * t * cp.y + t * t * p1.y,
  };
}

function getControlPoint(
  from: { x: number; y: number },
  to: { x: number; y: number },
  groundLineY: number,
  soilDepth: number
): { x: number; y: number } {
  // Control point is below the ground line, centered horizontally
  // Deeper for longer horizontal distances (longer chains go deeper)
  const dist = Math.abs(to.x - from.x);
  const depth = soilDepth * 0.3 + dist * 0.15;
  return {
    x: (from.x + to.x) / 2,
    y: Math.min(groundLineY + soilDepth * 0.9, groundLineY + depth),
  };
}

// ─── MAIN DRAW FUNCTIONS ───

/**
 * Draw root connections between dependent plants.
 *
 * @param ctx            Canvas 2D context for the overlay canvas.
 * @param connections    Array of root connections to render.
 * @param groundLineY    Y position of the ground line in the overlay canvas.
 * @param soilDepth      Height of the visible soil zone in pixels.
 * @param time           Animation time in ms.
 * @param reducedMotion  If true, skip pulse animation.
 */
export function drawRootSystem(
  ctx: CanvasRenderingContext2D,
  connections: RootConnection[],
  groundLineY: number,
  soilDepth: number,
  time: number,
  reducedMotion: boolean
): void {
  ctx.save();

  for (const conn of connections) {
    const style = getRootStyle(conn.upstreamStatus);
    const from = { x: conn.fromPosition.x, y: groundLineY };
    const to = { x: conn.toPosition.x, y: groundLineY };
    const cp = getControlPoint(from, to, groundLineY, soilDepth);

    ctx.lineWidth = style.lineWidth;
    ctx.setLineDash(style.lineDash);
    ctx.lineCap = "round";

    // Pulse animation for degraded roots
    if (style.pulse && !reducedMotion) {
      const pulse = 0.5 + 0.5 * Math.sin(time * 0.002 * (2 * Math.PI / 3));
      ctx.globalAlpha = 0.5 + pulse * 0.5;
    } else {
      ctx.globalAlpha = 0.75;
    }

    ctx.strokeStyle = style.color;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.quadraticCurveTo(cp.x, cp.y, to.x, to.y);
    ctx.stroke();

    // Root ball: small oval where trunk meets the root
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = style.color;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.ellipse(from.x, from.y + 3, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  ctx.setLineDash([]);
  ctx.restore();
}

/**
 * Spawn cascade particles when an upstream promise degrades or is violated.
 * Call this when you detect a status change.
 */
export function spawnRootParticles(
  connectionIndex: number,
  upstreamStatus: string,
  count = 3
): RootParticle[] {
  const color = upstreamStatus === "violated" || upstreamStatus === "broken"
    ? "#EF5350"   // Red for violated
    : "#D4A574";  // Amber for degraded

  const particles: RootParticle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      connectionIndex,
      // Stagger: particles start at different points along the path
      progress: (i / count) * 0.2,
      color,
      speed: 0.003 + Math.random() * 0.004,
    });
  }
  return particles;
}

/**
 * Update root particles and draw them on the overlay canvas.
 * Returns the updated particle array (expired particles removed).
 */
export function updateRootParticles(
  ctx: CanvasRenderingContext2D,
  particles: RootParticle[],
  connections: RootConnection[],
  groundLineY: number,
  soilDepth: number
): RootParticle[] {
  const surviving: RootParticle[] = [];

  for (const particle of particles) {
    const conn = connections[particle.connectionIndex];
    if (!conn) continue;

    // Advance particle
    const next = { ...particle, progress: particle.progress + particle.speed };
    if (next.progress >= 1) continue; // Reached destination, remove

    // Compute position on bezier
    const from = { x: conn.fromPosition.x, y: groundLineY };
    const to = { x: conn.toPosition.x, y: groundLineY };
    const cp = getControlPoint(from, to, groundLineY, soilDepth);
    const pos = bezierPoint(from, cp, to, next.progress);

    // Draw 2×2 particle
    ctx.fillStyle = next.color;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(pos.x - 1, pos.y - 1, 2, 2);

    surviving.push(next);
  }

  ctx.globalAlpha = 1;
  return surviving;
}
