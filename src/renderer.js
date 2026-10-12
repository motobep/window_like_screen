import { vs, fs } from './data/penger.js'
// import { vs, fs } from './data/cube.js'

const BACKGROUND = "#101010"
const FOREGROUND = "#50FF50"

game.width = 800
game.height = 800
const ctx = game.getContext("2d")

function clear() {
    ctx.fillStyle = BACKGROUND
    ctx.fillRect(0, 0, game.width, game.height)
}

export function point(ctx, { x, y }, s = 2) {
    ctx.fillStyle = FOREGROUND
    ctx.fillRect(x - s / 2, y - s / 2, s, s)
}

export function line(ctx, p1, p2) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = FOREGROUND
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}

export function screen(p, canvas) {
    // -1..1 => 0..2 => 0..1 => 0..w
    return {
        x: (p.x + 1) / 2 * canvas.width,
        y: (1 - (p.y + 1) / 2) * canvas.height,
    }
}

const n = 1

function project({ x, y, z }, eye) {
    let x0 = eye.x
    let y0 = eye.y
    let z0 = eye.z

    return {
        x: (n - z0) * ((x - x0) / (z - z0)),
        y: (n - z0) * ((y - y0) / (z - z0)),
    }
}

const FPS = 60;

function translate_z({ x, y, z }, dz) {
    return { x, y, z: z + dz };
}

function rotate_xz({ x, y, z }, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return {
        x: x * c - z * s,
        y,
        z: x * s + z * c,
    };
}

export let eye = { x: 0, y: 0, z: 0 }

function frame() {
    clear()
    // for (const v of vs) {
    //     point(screen(project(v)))
    // }
    for (const f of fs) {
        for (let i = 0; i < f.length; ++i) {
            const a = vs[f[i]];
            const b = vs[f[(i + 1) % f.length]];
            line(ctx, screen(project(translate_z(rotate_xz(a, Math.PI * 1), 1.5), eye), game),
                 screen(project(translate_z(rotate_xz(b, Math.PI * 1), 1.5), eye), game))
        }
    }
    setTimeout(frame, 1000 / FPS);
}

export function runRender() {
    setTimeout(frame, 1000 / FPS);
}
