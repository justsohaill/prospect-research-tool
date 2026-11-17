// Synthesises an original music bed for the video: 120 BPM, 65s, calm and warm.
// Everything is generated here from sine waves and noise; no samples, nothing licensed.
//   node scripts/make-music.js   ->   out/music.wav
const fs = require('fs');
const path = require('path');

const SR = 44100, DUR = 65, N = SR * DUR, BEAT = 0.5, BAR = 2;
const L = new Float32Array(N), R = new Float32Array(N);
let seed = 7;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 * 2 - 1; };
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
const add = (buf, t, v) => { const i = Math.round(t * SR); if (i >= 0 && i < N) buf[i] += v; };

// Section levels follow the edit: logo, tagline, product story (full), comment CTA (pulled back), end card.
const level = (t, pts) => { // piecewise-linear envelope from [time, value] points
  for (let i = 1; i < pts.length; i++) if (t < pts[i][0]) { const [t0, v0] = pts[i - 1], [t1, v1] = pts[i]; return v0 + (v1 - v0) * (t - t0) / (t1 - t0); }
  return pts[pts.length - 1][1];
};
const DRUMS = [[0, 0], [6.0, 0], [6.5, 1], [48.5, 1], [49, 0.45], [59, 0.45], [59.5, 0], [65, 0]];
const ARP = [[0, 0.55], [2, 0.85], [6.5, 1], [49, 0.8], [59.5, 0.55], [62, 0.35], [65, 0]];
const PAD = [[0, 0], [1.2, 0.8], [6.5, 1], [59.5, 1], [62.5, 0.8], [65, 0]];

// I – vi – IV – V in D major, two bars each (4s), voiced as soft seventh chords.
const CHORDS = [
  { root: 38, notes: [62, 66, 69, 73] }, // Dmaj7
  { root: 35, notes: [59, 62, 66, 69] }, // Bm7
  { root: 31, notes: [55, 59, 62, 66] }, // Gmaj7
  { root: 33, notes: [57, 61, 64, 69] }, // A (add9 colour from the arp)
];
const chordAt = (t) => (t >= 59.5 ? CHORDS[0] : CHORDS[Math.floor(t / 4) % 4]);

// Pad: detuned sine stacks with slow attack, re-voiced every chord. The end card resolves to D and rings out.
function pad(t0, ch, len) {
  for (const [k, m] of ch.notes.entries()) {
    for (const det of [-0.06, 0.07]) {
      const f = hz(m + det), pan = 0.5 + (k - 1.5) * 0.18 + det * 2, j0 = Math.round(t0 * SR);
      for (let i = 0; i < len * SR && j0 + i < N; i++) {
        const t = i / SR, env = Math.min(1, t / 0.9) * Math.min(1, (len - t) / 0.7);
        const s = (Math.sin(2 * Math.PI * f * t) + 0.32 * Math.sin(4 * Math.PI * f * t) + 0.1 * Math.sin(6 * Math.PI * f * t)) * env * 0.058 * level(t0 + t, PAD);
        L[j0 + i] += s * (1 - pan); R[j0 + i] += s * pan;
      }
    }
  }
}
for (let t0 = 0; t0 <= 56; t0 += 4) pad(t0, chordAt(t0), t0 === 56 ? 4.2 : 4.6);
pad(59.5, CHORDS[0], 5.5);

// Sub bass: one soft note per bar on the chord root, a pickup on the last eighth.
for (let t0 = 6.5; t0 < 59.5; t0 += BEAT) {
  const pos = Math.round((t0 % BAR) / 0.25);
  if (pos !== 0 && pos !== 6) continue;
  const f = hz(chordAt(t0).root), len = pos === 0 ? 1.3 : 0.45, g = 0.2 * level(t0, DRUMS) + 0.05;
  for (let i = 0; i < len * SR; i++) {
    const t = i / SR, env = Math.min(1, t / 0.02) * Math.exp(-t * 2.2);
    const s = (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(4 * Math.PI * f * t)) * env * g;
    add(L, t0 + t, s); add(R, t0 + t, s);
  }
}

{ // one long root note under the end card
  const f = hz(38);
  for (let i = 0; i < 5 * SR; i++) { const t = i / SR, v = Math.sin(2 * Math.PI * f * t) * Math.min(1, t / 0.03) * Math.exp(-t * 0.7) * 0.16; add(L, 59.5 + t, v); add(R, 59.5 + t, v); }
}

// Pluck arpeggio: one note per eighth, the grid the caption words land on.
const PATTERN = [0, 2, 1, 3, 2, 1, 3, 2];
const dry = [new Float32Array(N), new Float32Array(N)];
for (let n = 0; n * 0.25 < DUR - 0.5; n++) {
  const t0 = n * 0.25, ch = chordAt(t0), g = level(t0, ARP);
  if (t0 < 2 && n % 4 !== 0) continue;            // sparse under the logo
  if (t0 >= 59.5 && n % 2 !== 0) continue;        // quarter notes on the end card
  const m = ch.notes[PATTERN[n % 8]] + 12, f = hz(m), pan = 0.5 + (n % 2 ? 0.22 : -0.22);
  const acc = n % 4 === 0 ? 1 : 0.72;
  for (let i = 0; i < 0.9 * SR; i++) {
    const t = i / SR, env = Math.min(1, t / 0.004) * Math.exp(-t * 6.5);
    const s = (Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t * 9) + 0.15 * Math.sin(6 * Math.PI * f * t) * Math.exp(-t * 14)) * env * 0.075 * g * acc;
    const j = Math.round(t0 * SR) + i;
    if (j < N) { dry[0][j] += s * (1 - pan); dry[1][j] += s * pan; }
  }
}
// Dotted-eighth echo on the plucks.
const D = Math.round(0.375 * SR);
for (let c = 0; c < 2; c++) {
  const buf = dry[c], out = c ? R : L, other = dry[1 - c];
  for (let i = 0; i < N; i++) {
    if (i >= D) buf[i] += other[i - D] * 0.34; // ping-pong feedback
    out[i] += buf[i];
  }
}

// Drums: soft kick on every beat, brushed noise on the off-beats, a light snap on 2 and 4.
for (let t0 = 6.5; t0 < 59.5; t0 += 0.25) {
  const g = level(t0, DRUMS), pos = Math.round((t0 % BAR) / 0.25);
  if (g <= 0) continue;
  if (pos % 2 === 0) { // kick
    for (let i = 0; i < 0.3 * SR; i++) {
      const t = i / SR, f = 48 + 70 * Math.exp(-t * 28), env = Math.exp(-t * 13);
      const s = Math.sin(2 * Math.PI * (48 * t + 70 / 28 * (1 - Math.exp(-t * 28)))) * env * 0.34 * g;
      add(L, t0 + t, s); add(R, t0 + t, s);
      void f;
    }
  } else { // hat
    let lp = 0;
    for (let i = 0; i < 0.06 * SR; i++) {
      const t = i / SR, n = rnd(); lp += (n - lp) * 0.35; const s = (n - lp) * Math.exp(-t * 70) * 0.05 * g;
      add(L, t0 + t, s * 0.8); add(R, t0 + t, s * 1.1);
    }
  }
  if (pos === 2 || pos === 6) { // snap
    let lp = 0;
    for (let i = 0; i < 0.12 * SR; i++) {
      const t = i / SR, n = rnd(); lp += (n - lp) * 0.18; const s = lp * Math.exp(-t * 34) * 0.16 * g;
      add(L, t0 + t, s * 1.05); add(R, t0 + t, s * 0.9);
    }
  }
}

// Small room: a few feedback delays shared by both channels, then a gentle limiter and fades.
const taps = [[0.0297, 0.5], [0.0371, 0.47], [0.0411, 0.44], [0.0437, 0.4]];
for (const [buf, off] of [[L, 0], [R, 0.0013]]) {
  const wet = new Float32Array(N);
  for (const [d, fb] of taps) {
    const k = Math.round((d + off) * SR), line = new Float32Array(N);
    for (let i = 0; i < N; i++) { line[i] = buf[i] + (i >= k ? line[i - k] * fb * 1.5 : 0) * 0.62; wet[i] += line[i] * 0.25; }
  }
  for (let i = 0; i < N; i++) buf[i] = buf[i] * 0.86 + wet[i] * 0.22;
}
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const gain = 0.82 / peak;
const pcm = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  const t = i / SR, fade = Math.min(1, t / 0.03) * Math.min(1, (DUR - t) / 2.2);
  for (const [c, buf] of [[0, L], [1, R]]) {
    const v = Math.tanh(buf[i] * gain * 1.15) / Math.tanh(1.15) * 0.89 * fade;
    pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), i * 4 + c * 2);
  }
}
const head = Buffer.alloc(44);
head.write('RIFF', 0); head.writeUInt32LE(36 + pcm.length, 4); head.write('WAVEfmt ', 8); head.writeUInt32LE(16, 16);
head.writeUInt16LE(1, 20); head.writeUInt16LE(2, 22); head.writeUInt32LE(SR, 24); head.writeUInt32LE(SR * 4, 28);
head.writeUInt16LE(4, 32); head.writeUInt16LE(16, 34); head.write('data', 36); head.writeUInt32LE(pcm.length, 40);
const file = path.join(__dirname, '../out/music.wav');
fs.writeFileSync(file, Buffer.concat([head, pcm]));
console.log('wrote', path.relative(path.join(__dirname, '..'), file), `${DUR}s, raw peak ${peak.toFixed(3)}`);
