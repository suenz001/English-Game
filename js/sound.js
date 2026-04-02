// ===== 音效系統 (Web Audio API) =====
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let ctx = null;

// ===== 音量控制 =====
let sfxVolume = parseFloat(localStorage.getItem('vocabSpire_sfxVolume') ?? '0.8');
export function setSfxVolume(val) {
    sfxVolume = Math.max(0, Math.min(1, val));
    localStorage.setItem('vocabSpire_sfxVolume', sfxVolume);
}
export function getSfxVolume() { return sfxVolume; }

function getCtx() {
    if (!ctx) ctx = new AudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
}

function tone(freq, duration, type = 'sine', vol = 0.15) {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    const v = Math.min(1, vol * sfxVolume * 2.5);
    gain.gain.setValueAtTime(v, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
}

function sweep(f1, f2, dur, type = 'sawtooth', vol = 0.12) {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f1, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(f2, c.currentTime + dur);
    const v = Math.min(1, vol * sfxVolume * 2.5);
    gain.gain.setValueAtTime(v, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + dur);
}

// ===== 音效 =====
export function sfxAttack() {
    sweep(800, 200, 0.12, 'sawtooth', 0.1);
    setTimeout(() => sweep(400, 100, 0.08, 'square', 0.08), 50);
}

export function sfxHit() {
    sweep(300, 80, 0.15, 'square', 0.12);
    tone(60, 0.1, 'sine', 0.15);
}

export function sfxShield() {
    tone(600, 0.15, 'sine', 0.08);
    setTimeout(() => tone(800, 0.15, 'sine', 0.06), 80);
    setTimeout(() => tone(1000, 0.2, 'sine', 0.05), 160);
}

export function sfxHeal() {
    tone(523, 0.15, 'sine', 0.08);
    setTimeout(() => tone(659, 0.15, 'sine', 0.08), 120);
    setTimeout(() => tone(784, 0.25, 'sine', 0.07), 240);
}

export function sfxCardPlay() {
    sweep(1200, 600, 0.08, 'sine', 0.06);
}

export function sfxCorrect() {
    tone(523, 0.1, 'sine', 0.1);
    setTimeout(() => tone(784, 0.2, 'sine', 0.1), 100);
}

export function sfxWrong() {
    tone(200, 0.15, 'square', 0.08);
    setTimeout(() => tone(150, 0.2, 'square', 0.08), 120);
}

export function sfxVictory() {
    [523, 659, 784, 1047].forEach((f, i) => {
        setTimeout(() => tone(f, 0.3, 'sine', 0.1), i * 150);
    });
}

export function sfxDefeat() {
    [400, 350, 300, 200].forEach((f, i) => {
        setTimeout(() => tone(f, 0.4, 'sine', 0.08), i * 200);
    });
}

export function sfxEnemyAttack() {
    sweep(200, 500, 0.1, 'sawtooth', 0.1);
    setTimeout(() => sweep(500, 100, 0.15, 'square', 0.12), 80);
}

export function sfxDefenseQuiz() {
    tone(880, 0.08, 'square', 0.06);
    setTimeout(() => tone(880, 0.08, 'square', 0.06), 120);
    setTimeout(() => tone(1100, 0.12, 'square', 0.06), 240);
}

// ===== 新增音效 =====
export function sfxUI() {
    tone(900, 0.05, 'sine', 0.05);
}

export function sfxDraw() {
    sweep(300, 700, 0.08, 'sine', 0.07);
}

export function sfxShuffle() {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => sweep(500, 250, 0.07, 'sine', 0.05), i * 70);
    }
}

export function sfxTurnStart() {
    tone(440, 0.08, 'sine', 0.07);
    setTimeout(() => tone(550, 0.12, 'sine', 0.06), 90);
}

export function sfxEndTurn() {
    sweep(500, 250, 0.15, 'sine', 0.07);
}

export function sfxPoison() {
    sweep(150, 350, 0.18, 'sawtooth', 0.08);
    setTimeout(() => tone(200, 0.15, 'sine', 0.05), 120);
}

export function sfxPoisonTick() {
    tone(170, 0.12, 'sawtooth', 0.06);
    setTimeout(() => tone(140, 0.1, 'sawtooth', 0.05), 80);
}

export function sfxRegenTick() {
    tone(660, 0.1, 'sine', 0.05);
    setTimeout(() => tone(880, 0.12, 'sine', 0.04), 80);
}

export function sfxDebuff() {
    sweep(350, 150, 0.2, 'square', 0.07);
}

export function sfxEnemyBuff() {
    sweep(200, 450, 0.18, 'sawtooth', 0.08);
}

export function sfxEnemyDeath() {
    sweep(350, 60, 0.28, 'sawtooth', 0.11);
    setTimeout(() => tone(80, 0.2, 'square', 0.09), 120);
}

export function sfxThorns() {
    sweep(700, 350, 0.08, 'square', 0.07);
    setTimeout(() => tone(500, 0.06, 'sine', 0.05), 60);
}
