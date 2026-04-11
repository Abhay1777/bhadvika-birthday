/* shared.js — common logic used on every page */
"use strict";

const $ = (id) => document.getElementById(id);
const rand = (a, b) => Math.random() * (b - a) + a;

/* ── LOADER ───────────────────────────────────────── */
window.addEventListener("DOMContentLoaded", () => {
  createStars();
  createBalloons();
  setTimeout(() => {
    const loader = $("loader");
    if (loader) loader.classList.add("hidden");
    if (typeof onPageReady === "function") onPageReady();
  }, 1900);
});

// Auto-start music on first interaction (required by browsers)
document.addEventListener("click", () => {
  if (!audioCtx) {
    toggleMusic();
  }
}, { once: true });

// Intercept clicks on links to show the loader before navigating
document.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if (link && !link.target && !link.hasAttribute("download") && link.href && link.origin === window.location.origin) {
    if (!link.href.includes("#") && link.href !== window.location.href) {
      e.preventDefault();
      const loader = $("loader");
      if (loader) {
        loader.classList.remove("hidden");
        setTimeout(() => {
          window.location.href = link.href;
        }, 1100); // Wait 1.1s to show the transition before actually changing the page
      } else {
        window.location.href = link.href;
      }
    }
  }
});

/* ── STAR DOTS ───────────────────────────────────── */
function createStars() {
  const c = document.querySelector(".stars-bg");
  if (!c) return;
  for (let i = 0; i < 100; i++) {
    const s = document.createElement("div");
    s.className = "star-dot";
    const sz = rand(1, 3.2);
    s.style.cssText = `width:${sz}px;height:${sz}px;top:${rand(0,100)}%;left:${rand(0,100)}%;
      animation-duration:${rand(2,5)}s;animation-delay:${rand(0,4)}s;`;
    c.appendChild(s);
  }
}

/* ── BALLOONS ─────────────────────────────────────── */
const BALLOON_COLORS = [
  "#ff6eb4","#f9c70a","#74b9ff","#55efc4","#fd79a8",
  "#a29bfe","#ff7675","#00cec9","#fdcb6e","#e17055"
];
function createBalloons() {
  const c = document.getElementById("balloons");
  if (!c) return;
  for (let i = 0; i < 16; i++) {
    const b = document.createElement("div");
    b.className = "balloon";
    const color = BALLOON_COLORS[Math.floor(rand(0, BALLOON_COLORS.length))];
    const sz = rand(36, 60);
    b.style.cssText = `left:${rand(2,96)}%;width:${sz}px;height:${sz*1.3}px;
      background:${color};opacity:${rand(0.45,0.8)};
      animation-duration:${rand(7,15)}s;animation-delay:-${rand(0,12)}s;`;
    c.appendChild(b);
  }
}

/* ── CONFETTI ─────────────────────────────────────── */
let confettiParticles = [];
let confettiRAF = null;
const CONF_COLORS = ["#ff6eb4","#f9c70a","#74b9ff","#55efc4","#fd79a8","#a29bfe","#ff7675","#ffffff"];

function makeParticle(x, y) {
  return {
    x: x ?? rand(0, window.innerWidth),
    y: y ?? rand(-40, -10),
    r: rand(5, 10), d: rand(1.2, 3.8),
    color: CONF_COLORS[Math.floor(rand(0, CONF_COLORS.length))],
    tAngle: 0, tInc: rand(.07, .15),
    shape: Math.random() > .5 ? "circle" : "rect",
    alpha: 1,
  };
}

function launchConfetti(duration = 4500, burst = false, bx, by) {
  const canvas = $("confettiCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const n = burst ? 110 : 130;
  for (let i = 0; i < n; i++)
    confettiParticles.push(makeParticle(burst ? bx + rand(-55,55) : null, burst ? by + rand(-55,55) : null));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiParticles.forEach((p, i) => {
      ctx.save(); ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color;
      ctx.beginPath();
      if (p.shape === "circle") ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      else ctx.rect(p.x, p.y, p.r*1.7, p.r*.6);
      ctx.fill(); ctx.restore();
      p.y += p.d + .4; p.x += Math.sin(p.tAngle) * 1.4;
      p.tAngle += p.tInc; p.alpha -= .003;
      if (p.y > canvas.height || p.alpha <= 0)
        confettiParticles.splice(i, 1, makeParticle());
    });
    if (confettiParticles.length) confettiRAF = requestAnimationFrame(draw);
  }
  cancelAnimationFrame(confettiRAF);
  confettiRAF = requestAnimationFrame(draw);
  setTimeout(() => { confettiParticles = []; }, duration + 1800);
}

/* ── FLOATING HEARTS ─────────────────────────────── */
const HEARTS = ["💖","💕","💗","💞","💓","❤️","🩷","💝"];
function spawnHearts(n = 12) {
  const overlay = $("heartsOverlay");
  if (!overlay) return;
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      const h = document.createElement("div");
      h.className = "floating-heart";
      h.textContent = HEARTS[Math.floor(rand(0, HEARTS.length))];
      h.style.cssText = `left:${rand(5,90)}%;bottom:0;font-size:${rand(1.2,2.4)}rem;
        animation-duration:${rand(3,7)}s;animation-delay:${rand(0,.8)}s;`;
      overlay.appendChild(h);
      h.addEventListener("animationend", () => h.remove());
    }, i * 170);
  }
}

/* ── CLICK → HEART ───────────────────────────────── */
document.addEventListener("click", (e) => {
  if (e.target.closest("button, a, .memory-card, .candle")) return;
  const h = document.createElement("div");
  h.className = "floating-heart";
  h.textContent = HEARTS[Math.floor(rand(0, HEARTS.length))];
  h.style.cssText = `left:${e.clientX-14}px;bottom:${window.innerHeight-e.clientY}px;
    font-size:${rand(1.3,2.1)}rem;animation-duration:${rand(2,4)}s;`;
  const o = $("heartsOverlay");
  if (o) { o.appendChild(h); h.addEventListener("animationend", () => h.remove()); }
});

/* ── SCROLL OBSERVER ─────────────────────────────── */
function initScrollObserver() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.animation = "fadeInUp .75s ease both";
        e.target.style.opacity = "1";
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.02 });
  document.querySelectorAll(".animate-on-scroll").forEach(el => {
    el.style.opacity = "0"; obs.observe(el);
  });
}

/* ── MUSIC (Web Audio API) ────────────────────────── */
let audioCtx = null, musicOn = false, noteTimer = null, melodyIdx = 0;
const NOTE = { C4:261.63,D4:293.66,E4:329.63,F4:349.23,G4:392,A4:440,B4:493.88,C5:523.25,A3:220,F3:174.61,G3:196 };
const MELODY = [
  ["C4",.3],["C4",.15],["D4",.3],["C4",.3],["F4",.3],["E4",.6],
  ["C4",.3],["C4",.15],["D4",.3],["C4",.3],["G4",.3],["F4",.6],
  ["C4",.3],["C4",.15],["C5",.3],["A4",.3],["F4",.3],["E4",.28],["D4",.45],
  ["A4",.15],["A4",.15],["A4",.3],["A4",.3],["F4",.3],["G4",.3],["F4",.6],
];
function playNote() {
  if (!musicOn || !audioCtx) return;
  const [n, d] = MELODY[melodyIdx++ % MELODY.length];
  const osc = audioCtx.createOscillator(), g = audioCtx.createGain();
  osc.connect(g); g.connect(audioCtx.destination);
  osc.type = "sine"; osc.frequency.setValueAtTime(NOTE[n], audioCtx.currentTime);
  g.gain.setValueAtTime(.18, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + d * .92);
  osc.start(); osc.stop(audioCtx.currentTime + d);
  noteTimer = setTimeout(playNote, d * 1000);
}
function toggleMusic() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  const btn = $("musicBtn");
  musicOn = !musicOn;
  btn.textContent = musicOn ? "🔊" : "🎵";
  btn.classList.toggle("playing", musicOn);
  if (musicOn) playNote(); else clearTimeout(noteTimer);
}
function playPop() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator(), g = audioCtx.createGain();
  osc.connect(g); g.connect(audioCtx.destination);
  osc.type = "triangle"; osc.frequency.setValueAtTime(700, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + .22);
  g.gain.setValueAtTime(.15, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + .22);
  osc.start(); osc.stop(audioCtx.currentTime + .22);
}

/* ── KEYBOARD SHORTCUTS ───────────────────────────── */
document.addEventListener("keydown", e => {
  if (e.key === "c" || e.key === "C") launchConfetti(5000);
  if (e.key === "h" || e.key === "H") spawnHearts(18);
  if (e.key === "m" || e.key === "M") toggleMusic();
  if (e.key === "Escape") { const mo = $("modalOverlay"); if (mo) mo.classList.remove("open"); }
});

window.addEventListener("resize", () => {
  const canvas = $("confettiCanvas");
  if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
});

/* ── NAV AUTO-HIDE ON SCROLL ─────────────────────── */
let lastScrollY = window.scrollY;
window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;
  const topNav = document.querySelector(".top-nav");
  if (!topNav) return;
  
  if (currentScrollY > lastScrollY && currentScrollY > 70) {
    topNav.classList.add("nav-hidden"); // Scrolled down = hide
  } else if (currentScrollY < lastScrollY) {
    topNav.classList.remove("nav-hidden"); // Scrolled up = show
  }
  lastScrollY = currentScrollY;
}, { passive: true });
