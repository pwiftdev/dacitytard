const CA = "3LwPSFPUjBXaSJuvuydJqHfS42NywBuRfJGAd371pump";
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- copy CA ---------- */
const toast = document.getElementById("toast");
let toastTimer;
async function copyCA() {
  try {
    await navigator.clipboard.writeText(CA);
  } catch {
    const t = document.createElement("textarea");
    t.value = CA;
    document.body.appendChild(t);
    t.select();
    document.execCommand("copy");
    t.remove();
  }
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}
document.querySelectorAll("[data-ca]").forEach((b) => b.addEventListener("click", copyCA));

/* ---------- reveal on scroll ---------- */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -5% 0px" }
);
document.querySelectorAll(".reveal, .blur-in").forEach((el) => io.observe(el));

/* ---------- ticker war: bubbles pop as you scroll ---------- */
const track = document.querySelector(".war-track");
const bubbles = [...document.querySelectorAll(".bubble")];
function updateChat() {
  const r = track.getBoundingClientRect();
  const total = r.height - innerHeight;
  const p = Math.min(1, Math.max(0, -r.top / total));
  // first bubble shows as soon as the section pins, last one before it unpins
  const shown = r.top < innerHeight * 0.35 ? Math.min(bubbles.length, 1 + Math.floor(p * (bubbles.length + 0.6))) : 0;
  bubbles.forEach((b, i) => {
    b.classList.toggle("on", i < shown);
    b.classList.toggle("current", i === shown - 1);
  });
}
addEventListener("scroll", updateChat, { passive: true });
addEventListener("resize", updateChat);
updateChat();

/* ---------- 3D wall of memes ---------- */
const MEMES = [
  "Dacitytard whispering into a painter's ear",
  "Dacitytard in a sunny alley: here we go again",
  "Dacitytard spotting $DCTY on a taco truck with binoculars",
  "Dacitytard looking back at another woman",
  "Dacitytard tweets about the community that gets it",
  "Dacitytard handing over a pink Dacity coin",
  "Dacitytard in dark armour",
  "Dacitytard talking on a phone made of cash",
  "Dacitytard reading the Dacity coin leak on his phone",
  "Dacitytard having a beer at a beach bar",
  "Dacitytards at a funeral: new CA just dropped",
  "Dacitytard holding roses",
  "A huge crowd of Dacitytards taking a selfie",
  "A group hug of Dacitytards",
  "Dacitytard at his computer late at night",
  "Dacitytard scrolling his phone in bed",
  "Dacitytard getting a Dacity tattoo",
  "The Dacity cycle: find lore, launch, shill, sell, repeat",
  "Dacitytard on the phone next to a tower of pink coins",
  "Dacitytard hugging a big guy",
].map((alt, i) => ({ src: `assets/memes/${String(i + 1).padStart(2, "0")}.webp`, alt }));

const wall = document.getElementById("wall");
function buildWall() {
  const cols = innerWidth < 640 ? 5 : innerWidth < 1024 ? 6 : 8;
  const perCol = 10;
  wall.innerHTML = "";
  for (let c = 0; c < cols; c++) {
    const col = document.createElement("div");
    col.className = "wall-col" + (c % 2 ? " down" : "");
    const track = document.createElement("div");
    track.className = "wall-track";
    track.style.setProperty("--dur", `${60 + ((c * 13) % 5) * 9}s`);
    // each column gets a different slice of the memes, then a copy for the seamless loop
    const items = [];
    for (let k = 0; k < perCol; k++) items.push(MEMES[(c * 7 + k * 3) % MEMES.length]);
    for (const m of [...items, ...items]) {
      const b = document.createElement("button");
      b.className = "tile";
      b.type = "button";
      const img = document.createElement("img");
      img.src = m.src;
      img.alt = m.alt;
      img.loading = "lazy";
      img.decoding = "async";
      b.appendChild(img);
      track.appendChild(b);
    }
    col.appendChild(track);
    wall.appendChild(col);
  }
}
buildWall();
let wallCols = wall.children.length;
addEventListener("resize", () => {
  const want = innerWidth < 640 ? 5 : innerWidth < 1024 ? 6 : 8;
  if (want !== wallCols) { buildWall(); wallCols = want; }
});

/* ---------- wall of memes lightbox ---------- */
const lb = document.getElementById("lightbox");
const lbImg = lb.querySelector("img");
wall.addEventListener("click", (e) => {
  const tile = e.target.closest(".tile");
  if (!tile) return;
  const img = tile.querySelector("img");
  lbImg.src = img.src;
  lbImg.alt = img.alt;
  lb.hidden = false;
});
const closeLb = () => { lb.hidden = true; lbImg.src = ""; };
lb.addEventListener("click", closeLb);
addEventListener("keydown", (e) => e.key === "Escape" && !lb.hidden && closeLb());

/* ---------- make it rain dacity coins ---------- */
const zero = document.getElementById("zero");
const canvas = document.getElementById("rain");
const ctx = canvas.getContext("2d");
const coinImg = new Image();
coinImg.src = "assets/coin.png";
let coins = [];
let running = false;
let dpr = 1;

function sizeCanvas() {
  dpr = Math.min(2, devicePixelRatio || 1);
  canvas.width = zero.clientWidth * dpr;
  canvas.height = zero.clientHeight * dpr;
}
sizeCanvas();
addEventListener("resize", sizeCanvas);

function burst(x, y, n = 28) {
  for (let i = 0; i < n; i++) {
    const s = 26 + Math.random() * 46;
    coins.push({
      x: x + (Math.random() - 0.5) * 60,
      y: y + (Math.random() - 0.5) * 30,
      vx: (Math.random() - 0.5) * 9,
      vy: -6 - Math.random() * 9,
      r: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
      s,
      flip: Math.random() * Math.PI * 2,
    });
  }
  if (!running) { running = true; requestAnimationFrame(tick); }
}

function shower(n = 40) {
  const w = zero.clientWidth;
  for (let i = 0; i < n; i++) {
    const s = 26 + Math.random() * 46;
    coins.push({
      x: Math.random() * w,
      y: -60 - Math.random() * zero.clientHeight * 0.8,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 2,
      r: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.2,
      s,
      flip: Math.random() * Math.PI * 2,
    });
  }
  if (!running) { running = true; requestAnimationFrame(tick); }
}

function tick() {
  const h = zero.clientHeight;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  coins = coins.filter((c) => c.y < h + 80);
  for (const c of coins) {
    c.vy += 0.32;
    c.vx *= 0.99;
    c.x += c.vx;
    c.y += c.vy;
    c.r += c.vr;
    c.flip += 0.12;
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.r);
    ctx.scale(Math.max(0.15, Math.abs(Math.cos(c.flip))), 1);
    ctx.drawImage(coinImg, -c.s / 2, -c.s / 2, c.s, c.s);
    ctx.restore();
  }
  if (coins.length) requestAnimationFrame(tick);
  else running = false;
}

zero.addEventListener("pointerdown", (e) => {
  const r = zero.getBoundingClientRect();
  burst(e.clientX - r.left, e.clientY - r.top, reduceMotion ? 8 : 28);
});

// one free shower the first time the section shows up
if (!reduceMotion) {
  const once = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      setTimeout(() => shower(46), 450);
      once.disconnect();
    }
  }, { threshold: 0.5 });
  once.observe(zero);
}

/* ---------- socials glow follows the cursor ---------- */
const soc = document.getElementById("socials");
soc.addEventListener("pointermove", (e) => {
  const r = soc.getBoundingClientRect();
  soc.style.setProperty("--mx", `${e.clientX - r.left}px`);
  soc.style.setProperty("--my", `${e.clientY - r.top}px`);
});

/* ---------- hero: the chase (fake DCTY tickers fading in and out) ---------- */
(function chase() {
  const layer = document.getElementById("chase");
  const hero = document.getElementById("top");
  const SRCS = [1, 2, 3, 4, 5].map((n) => `assets/cards/${n}.webp`);
  // spots spread around the hero (in % of width / height); cards jitter around these
  const SPOTS_WIDE = [[4, 12], [27, 8], [50, 14], [70, 6], [8, 40], [36, 30], [60, 34], [80, 30], [14, 66], [44, 58], [74, 60], [86, 78]];
  const SPOTS_NARROW = [[4, 12], [52, 8], [8, 26], [50, 30], [4, 48], [46, 52], [14, 70], [54, 72]];
  const taken = new Set();
  let idx = 0;

  const rand = (a, b) => a + Math.random() * (b - a);

  function pickSpot(spots) {
    const free = spots.map((_, i) => i).filter((i) => !taken.has(i));
    const i = free[Math.floor(Math.random() * free.length)];
    taken.add(i);
    return i;
  }

  function launch(img, delay) {
    const narrow = innerWidth < 640;
    const spots = narrow ? SPOTS_NARROW : SPOTS_WIDE;
    const spot = pickSpot(spots);
    const [px, py] = spots[spot];
    const w = narrow ? rand(150, 190) : rand(210, 300);
    img.style.width = `${w}px`;
    img.src = SRCS[idx++ % SRCS.length];

    const W = hero.clientWidth, H = hero.clientHeight;
    const x = Math.min(W - w - 8, (px / 100) * W + rand(-20, 20));
    const y = (py / 100) * H + rand(-14, 14);
    const dx = rand(-60, 60), dy = rand(-40, 20);
    const r0 = rand(-7, 7), r1 = r0 + rand(-5, 5);
    const peak = narrow ? 0.26 : rand(0.26, 0.38);
    const dur = rand(7000, 11000);

    const anim = img.animate(
      [
        { opacity: 0, transform: `translate(${x}px, ${y + 16}px) rotate(${r0}deg) scale(.94)`, filter: "blur(3px)" },
        { opacity: peak, offset: 0.18, filter: "blur(0px)" },
        { opacity: peak, offset: 0.78, filter: "blur(0px)" },
        { opacity: 0, transform: `translate(${x + dx}px, ${y + dy}px) rotate(${r1}deg) scale(1.02)`, filter: "blur(3px)" },
      ],
      { duration: dur, delay, easing: "linear", fill: "both" }
    );
    anim.onfinish = () => {
      taken.delete(spot);
      launch(img, rand(200, 1600));
    };
  }

  if (reduceMotion) return;
  const count = innerWidth < 640 ? 4 : 7;
  for (let i = 0; i < count; i++) {
    const img = document.createElement("img");
    img.alt = "";
    img.decoding = "async";
    layer.appendChild(img);
    launch(img, 600 + i * 1300);
  }
})();

/* ---------- hero: drifting smoky fog (WebGL) ---------- */
(function smoke() {
  const cv = document.getElementById("smoke");
  const gl = cv.getContext("webgl", { antialias: false, premultipliedAlpha: false });
  if (!gl) return; // CSS gradient stays as the fallback

  const vs = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;
  const fs = `
    precision mediump float;
    uniform vec2 r;
    uniform float t;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p){
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3. - 2. * f);
      return mix(mix(hash(i), hash(i + vec2(1., 0.)), u.x),
                 mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x), u.y);
    }
    float fbm(vec2 p){
      float v = 0., a = .5;
      mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
      for (int i = 0; i < 5; i++){ v += a * noise(p); p = m * p; a *= .5; }
      return v;
    }
    void main(){
      vec2 uv = gl_FragCoord.xy / r;
      vec2 p = uv * vec2(r.x / r.y, 1.) * 2.2;
      float tt = t * .045;
      vec2 q = vec2(fbm(p + vec2(0., tt)), fbm(p + vec2(5.2, 1.3) - tt * .7));
      vec2 w = vec2(fbm(p + 3.5 * q + vec2(1.7, 9.2) + tt * 1.2),
                    fbm(p + 3.5 * q + vec2(8.3, 2.8) - tt));
      float f = fbm(p + 3. * w);

      vec3 pink   = vec3(1.00, 0.31, 0.56);
      vec3 coral  = vec3(1.00, 0.42, 0.49);
      vec3 orange = vec3(1.00, 0.56, 0.38);
      vec3 peach  = vec3(1.00, 0.72, 0.36);
      float y = uv.y;
      vec3 col = mix(peach, orange, smoothstep(0., .38, y));
      col = mix(col, coral, smoothstep(.3, .7, y));
      col = mix(col, pink, smoothstep(.62, 1., y));

      // darker magenta smoke in the folds, warm light haze on the crests
      vec3 deep  = vec3(.78, .14, .44);
      vec3 haze  = vec3(1.00, .90, .80);
      col = mix(col, deep, smoothstep(.35, .85, length(w) * .75) * .38);
      col = mix(col, haze, smoothstep(.55, .95, f) * .42);

      // film grain
      float g = hash(gl_FragCoord.xy + fract(t * 7.) * 100.) - .5;
      col += g * .07;
      gl_FragColor = vec4(col, 1.);
    }`;

  function sh(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uR = gl.getUniformLocation(prog, "r");
  const uT = gl.getUniformLocation(prog, "t");

  const SCALE = 0.5; // render at half res, it's fog anyway
  function resize() {
    cv.width = Math.max(1, Math.round(cv.clientWidth * SCALE));
    cv.height = Math.max(1, Math.round(cv.clientHeight * SCALE));
    gl.viewport(0, 0, cv.width, cv.height);
    gl.uniform2f(uR, cv.width, cv.height);
  }
  resize();
  addEventListener("resize", resize);

  let visible = true;
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; if (visible) loop(); }).observe(cv);

  const start = performance.now();
  let raf = 0;
  function draw() {
    gl.uniform1f(uT, (performance.now() - start) / 1000 + 20);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function loop() {
    cancelAnimationFrame(raf);
    const frame = () => {
      if (!visible) return;
      draw();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  }
  draw();
  cv.classList.add("ready");
  if (!reduceMotion) loop();
})();
