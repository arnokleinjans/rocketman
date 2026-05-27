# 🚀 ROCKETMAN ADVENTURE — VOLLEDIG BLAUWDRUK & ANALYSE

*Geschreven voor implementatie in Antigravity *

---

## DEEL 1: OVERZICHT & CONTEXT

### Het doel
Jouw twee bestaande spellen (Rocketmanspace en rocketmanflight samenvoegen in een **levelgestuurd avontuur** met een verhaal:
- Papa Rocketman reddingsactie naar familie door melkweg
- Elk level een ander familielid + anders gameplaymode
- Level 1 & 2 & 4 als proof of concept (flight/space/flight)
- State machine voor level-transitie, saves, leaderboards per level

### Bestaande assets die we hergebruiken
- **Alle audio** (playTone, explosions, milestones) uit Rocketmanspace.html
- **Alle sprites** (rocket.png, papa1-3, mama1-3, meisje1-4, neef1-3, zoon1-3, coin1-9)
- **Alle coin-types & mechanics** (goud +5, ammo, schild, blauw ×2, rood/skull, zwart gat, klok)
- **HUD-elementen** (score, ammo counter, shield timer, milestones)
- **Besturing Flight** (mouse/touch/arrows in vrij 2D-vliegtuig, laserobstakels)
- **Besturing Space** (boost+schiet, gravity/flappy-bird-achtig, kometen van rechts)

---

## DEEL 2: PROJECTSTRUCTUUR

```
RocketmanAdventure.html              ← ENTRY POINT (enige HTML)
│
├── js/
│   ├── engine/                       ← GEDEELDE MODULES (hergebruikbaar)
│   │   ├── audio.js                  ← Web Audio API wrapper
│   │   ├── images.js                 ← Image loader + cache
│   │   ├── particles.js              ← Particle system (spawn/update/draw)
│   │   ├── shapes.js                 ← Canvas-drawn shapes (skull, diamond, clock)
│   │   ├── input.js                  ← Unified input handler (keyboard/mouse/touch)
│   │   ├── storage.js                ← LocalStorage: leaderboards per level, level-unlock
│   │   └── state.js                  ← Global game state (rocket, coins, comets, etc)
│   │
│   ├── levels/
│   │   ├── baseLevel.js              ← ABSTRACT Level-class
│   │   ├── level1_liftoff.js         ← Level 1: Flight-mode training
│   │   ├── level2_mars.js            ← Level 2: Space-mode (Flappy)
│   │   └── level4_ruins.js           ← Level 4: Flight-mode with lasers
│   │
│   ├── levelManager.js               ← Level-select, transitions, progression
│   ├── game.js                       ← MAIN LOOP, event listeners
│   └── main.js                       ← Bootstrap (init, loadImages, start)
│
└── resources/                        ← Alle je bestaande sprites
    ├── rocket.png
    ├── papa1.png, papa2.png, papa3.png
    ├── mama1.png, mama2.png, mama3.png
    ├── meisje1.png ... meisje4.png
    ├── neef1.png, neef2.png, neef3.png
    ├── zoon1.png, zoon2.png, zoon3.png
    └── coin1.png ... coin9.png
```

**Waarom deze structuur?**
- **Modulair:** Elk level is een klasse, dus je kunt makkelijk Level 3, 5, etc. toevoegen
- **DRY:** Audio, particles, shapes, input worden niet herhaald
- **State separation:** Globale state (rocket.x, coins[], comets[]) wordt tussen levels gereset
- **ES6 modules:** Geen buildstep nodig, werkt direct in browser via `<script type="module">`

---

## DEEL 3: KERNMODULES — GEDETAILLEERDE SPEC

### 3.1 — `engine/audio.js`

**Doel:** Web Audio API wrapper. Elk level kan eigen melodie/tempo zetten.

**Key exports:**
```javascript
export function initAudio(canvas)           // Init AudioContext, start music
export function setMelody(melody, tempo, speedModFn)  // Level's custom melody
export function setMusicActive(bool)        // Play/pause background
export function playTone(freq, duration, type, volume)
export function playRecord()                // Record beat (4 tonen oplopend)
export function playMilestone()             // Milestone fanfare
export function playShot()                  // Schot-geluid (space-mode schieten)
export function playExplosion()             // Explosie-ruis
export function playBonus()                 // Dubbelklapper jingle
export function playAmmo()                  // Ammo pickup
export function playSlowdown()              // Klok-pickup (slow-mo effect)
export function playShieldTick(invul)       // Schild tick (varieert met remaining time)
export function playShieldDown()            // Schild afgelopen
export function playDeath()                 // Dood-jingle
export function playLevelComplete()         // NIEUW: Level victorie (ascending notes)
```

**Interne state:**
- `audioCtx` — AudioContext instance (lazy init)
- `currentMelody` — default `[130, 146, 164, 174, 196, 220, 246, 261]`
- `musicTempo` — default 250ms (kan per level)
- `musicActive` — boolean
- `getSpeedMod` — callback die level geeft (bijv. `() => score * 0.1` voor pitch-up)

**Gebruik in levels:**
```javascript
// Bij level-init:
setMelody([196, 220, 246, 261, 293], 300, () => rockete.y * 0.5);
setMusicActive(true);

// Bij state changes (game-over etc):
playDeath();
```

---

### 3.2 — `engine/images.js`

**Doel:** Lazy-load alle sprites. Levels vragen via `hasImage(key)` / `getImage(key)`.

**Exports:**
```javascript
export const images = {};           // image element map
export const imageStatus = {};      // { [key]: boolean } — loaded?
export function loadImages(callback) // Load all imagePaths async
export function hasImage(key)       // bool — sprite beschikbaar?
export function getImage(key)       // Image element of null
```

**Image keys (van jouw bestanden):**
```
rocket
papa1, papa2, papa3
mama1, mama2, mama3
meisje1, meisje2, meisje3, meisje4
neef1, neef2, neef3
zoon1, zoon2, zoon3
coin1 ... coin9
```

**In levels:**
```javascript
if (hasImage('papa1')) {
    ctx.drawImage(getImage('papa1'), x, y, w, h);
} else {
    // Fallback: emoji of canvas-drawn shape
    ctx.font = '30px sans'; ctx.fillText('👨', x, y);
}
```

---

### 3.3 — `engine/particles.js`

**Doel:** Centraal particle-systeem voor explosies, confetti, stofwolken.

**Exports:**
```javascript
export const particles = [];        // Snelle deeltjes (explosies)
export const confetti = [];         // Langzame animatie-deeltjes
export const explosions = [];       // Ring-explosies (HUD-effect)

export function resetParticles()    // Clear all (bij level-start)
export function spawnParticle(x, y, color, speedX, size)
export function spawnExhaust(x, y, direction)  // 'left' | 'down'
export function spawnExplosion(cx, cy, hue)
export function spawnConfettiBurst(cx, cy, colors, count)
export function updateParticles()   // Call elke frame
export function drawParticles(ctx)
export function drawConfetti(ctx)
export function drawExplosions(ctx)
```

**Particle structure:**
```javascript
// Particle (snelle, kleine deeltjes)
{ x, y, vx, vy, life: 0..1, c: color, s: size, decay: rate }

// Confetti (langzame, roterende flarden)
{ x, y, vx, vy, life: 0..1, decay, size, c: color, rot: radians, rotSpeed }

// Explosion (ring-effect)
{ x, y, radius, life: 0..1, hue }
```

**Lifecycle:** Elk frame:
1. Update position & life
2. Verwijder als `life <= 0`
3. Draw samen in canvas-context

**Gebruik:**
```javascript
// Rocket boost:
for (let i = 0; i < 3; i++) {
    spawnExhaust(rocket.x + 5, rocket.y + 20, 'down');
}

// Coin pickup:
spawnConfettiBurst(coin.x, coin.y,
    ['#FFD700', '#ff6b35', '#fff'], 20);

// Komeet geraakt:
spawnExplosion(comet.x + 50, comet.y + 50, comet.hue);
```

---

### 3.4 — `engine/shapes.js`

**Doel:** Canvas-gebaseerde shapes voor coins/menu (geen images nodig als fallback).

**Exports:**
```javascript
export function drawSkullShape(ctx, x, y, r)     // Red coin (dood)
export function drawDiamondShape(ctx, x, y, r)   // Blue coin (×2)
export function drawSilverClockShape(ctx, x, y, r) // Klok (slow)
```

**Jouw bestaande code** (uit Rocketmanspace.html) is hier perfect voor. Copy-paste de `drawSkullShape`, `drawDiamondShape`, `drawSilverClockShape` functies.

**Gebruik in draw-loop:**
```javascript
coins.forEach(c => {
    if (c.type === 'red') {
        ctx.save(); ctx.translate(c.x + 18, c.y + 18);
        drawSkullShape(ctx, 0, 0, 17);
        ctx.restore();
    }
});
```

---

### 3.5 — `engine/input.js`

**Doel:** Unified input handler. Levels registreren handlers via `setInputMode(mode)`.

**Exports:**
```javascript
export const keys = {};             // { [code]: boolean } voor held keys
export let touchPos = null;         // { x, y } of null (current touch)
export let touchFiring = false;     // bool — right-side touch?

export function setInputMode(mode) // 'space' | 'flight'
export function onKeyDown(callback)
export function onKeyUp(callback)
export function onMouseDown(callback)
export function onMouseUp(callback)
export function onTouchStart(callback)
export function onTouchEnd(callback)

export function getTouchPos(touch, canvas)  // Canv-coords
```

**Modi:**
- **'space'** — horizontale Flappy-achtige: spatie/links-tap = boost, pijl-rechts/rechts-tap = schiet
- **'flight'** — verticale vrij-vliegen: pijlen/drag = bewegen, spatie/tap = schieten

**Voorbeeld in level:**
```javascript
setInputMode('space');
onKeyDown((code) => {
    if (code === 'Space') boost();
    if (code === 'ArrowRight') shoot();
});
```

---

### 3.6 — `engine/storage.js`

**Doel:** LocalStorage API wrapper voor leaderboards + level-progress.

**Exports:**
```javascript
export function getLeaderboard(levelId)        // Top 5 scores voor level
export function saveScore(levelId, name, score)
export function getLevelStats(levelId)         // { bestScore, unlocked, starCount }
export function unlockLevel(levelId)
export function setStar(levelId, starCount)    // 1-3 sterren voor level
```

**Data-structuur in localStorage:**
```
localStorage['rocketman.leaderboards'] = {
    level1: [
        { name: 'ALEX', score: 150, date: '2025-04-23' },
        ...
    ],
    level2: [ ... ],
    ...
}

localStorage['rocketman.progress'] = {
    level1: { bestScore: 150, unlocked: true, stars: 3 },
    level2: { bestScore: 0, unlocked: false, stars: 0 },
    ...
}
```

---

### 3.7 — `engine/state.js`

**Doel:** Globale game-state shared tussen levels.

**Exports:**
```javascript
export const gameState = {
    // Level info
    currentLevelId: 1,
    
    // Rocket
    rocket: { x: 0, y: 0, vx: 0, vy: 0, angle: 0, invul: 0 },
    
    // Obstacles & collectibles
    comets: [],        // { x, y, t: { n, c }, hue, dead, s: scored }
    coins: [],         // { x, y, type: 'gold'|'ammo'|... dead }
    bullets: [],       // { x, y, dead }
    lasers: [],        // Flight-mode: { x, y, timer, active }
    
    // Scoring
    score: 0,
    coinScore: 0,
    ammo: 0,
    
    // Effects
    screenShake: 0,
    deathFlash: 0,
    popup: { text: '', timer: 0, color: '#FFD700' },
    
    // Milestones
    nextMilestoneIdx: 0,
    MILESTONES: [25, 50, 100, 200, 300, 500, 750, 1000],
    MILESTONE_EMOJI: ['✨','⭐','🚀','🔥','⚡','🏆','💎','👑'],
    
    // Timers
    frameCount: 0,
    shootCooldown: 0,
};

export function resetState()         // Clear voor nieuw level
export function updateFrameCount()
```

**Waarom globaal?** Levels delen explosies, bullets, particles. Makkelijker dan alles per level.

---

## DEEL 4: BASELEVELS ARCHITECTUUR

### 4.0 — Abstracte `Level` klasse in `levels/baseLevel.js`

```javascript
export class Level {
    constructor(id, name, description, controlMode) {
        this.id = id;
        this.name = name;
        this.desc = description;
        this.controlMode = controlMode;  // 'space' | 'flight'
        
        // Override in subclass:
        this.W = 480;
        this.H = 720;
        this.melody = [130, 146, 164, 174, 196, 220, 246, 261];
        this.melodyTempo = 250;
        
        this.state = 'waiting';  // waiting, playing, dying, dead, complete
        this.deathTimer = 0;
    }
    
    // Overschrijf in subclass:
    init()           { }           // Called bij level-start
    reset()          { }           // Reset for replay
    spawnObstacles() { }           // Spawn comets, coins
    update()         { }           // Game logic per frame
    draw(ctx)        { }           // Render
    onCollision(type, data) { }    // Collision handlers
    
    // Base methods:
    die() { this.state = 'dying'; playDeath(); /* ... */ }
    complete() { this.state = 'complete'; playLevelComplete(); /* ... */ }
    
    canJoinLevel()   { return !config.levelUnlocked[this.id] ? false : true; }
}
```

**Lifecycle:**
```
level-select → Level.init() → waiting
                              ↓
                           playing (update/draw loop)
                              ↓
                           [collision → die()] OR [winCondition → complete()]
                              ↓
                            dying (170 frames of anim)
                              ↓
                            dead/complete (show game-over overlay)
                              ↓
                         restart | menu
```

---

## DEEL 5: DRIE LEVELS IN DETAIL

### 5.1 — LEVEL 1: "Opstijgen vanaf Aarde" (FLIGHT-MODE)

**File:** `levels/level1_liftoff.js`

**Karakteristieken:**
- Soort: **Verticale flight** (omhoog vliegen, rocket omlaag/middenonder)
- Duur: 30 seconden OR 25 punten
- Besturing: **Pijlen/drag** (vrij vliegen) + **Space/tap** (schiet)
- Moeilijkheid: **Easy** (tutorial)
- Verhaal: Opstijgen van Aarde, meisje1 verschijnt (gered in cutscene)

**Achtergrond-progression:**
```
Frame 0-200:   Blauwe lucht (gradient #2a82fb → #0f7dff)
Frame 200-400: Stratosfeer (violet #5e3aee → zwart)
Frame 400+:    Zwart met sterren (diepte effect)
```

**Obstacles:**
```javascript
// Clouds (eenvoudig, puur om uit te wijken)
{
    x: Math.random() * W,
    y: -50,
    w: 80, h: 40,
    dy: 2,  // valt omlaag
    emoji: '☁️'
}

// Birds (ronde obstakels)
{
    x: Math.random() * W,
    y: -60,
    r: 15,
    dy: 1.5,
    emoji: '🐦'
}

// Satellite (rare, grotere obstakels)
// (50% kans per 200 frames)
{
    x: W/2,
    y: -100,
    w: 60, h: 40,
    dy: 2.2,
    emoji: '🛰️'
}
```

**Coins:**
- Alleen **goud** (+5 punten): veel spawn
- Alleen **ammo** (+10): zeldzaam (10%)
- Geen dood-coins, geen schild, geen blauw/zwart/klok

**Gameplay:**
```
Rocket = centerBottom (y = H - 150)
Update:
  - Pijlen/touch → beweging (50px/frame max)
  - Cloud/bird/satelliet raakt → die()
  - Goud oppikken → +5 score
  - Score >= 25 → winCondition!
  - 30 sec → timeout (sterven?)

Draw:
  - Background (gradient shift per frameCount)
  - Stars (parallax scroll)
  - Obstacles (emoji of geeft canvas-drawn shape)
  - Rocket (gecentreerd onderin)
  - HUD: score, ammo, "SPATIE = SCHIET"
```

**Win-condition:**
```
score >= 25  →  complete()
  ↓
Cutscene (2 sec):
  "🚀 Papa Rocketman doorbreekt de atmosfeer! 🌍 ✨"
  Meisje1-sprite verschijnt
  "🎉 Meisje gered!"
  playLevelComplete()
  ↓
Level 2 unlocked
```

**Code sketch:**
```javascript
export class Level1 extends Level {
    constructor() {
        super(1, "Opstijgen", "Vlieg omhoog naar Meisje!", 'flight');
        this.clouds = [];
        this.birds = [];
        this.satellites = [];
        this.durationFrames = 30 * 60;  // 30 sec à 60fps
        this.frameLimit = 0;
    }
    
    init() {
        setInputMode('flight');
        setMelody([262, 294, 330, 349, 392], 280);
        setMusicActive(true);
        resetParticles();
        resetState();
        this.frameLimit = this.durationFrames;
        this.state = 'waiting';
    }
    
    spawnObstacles() {
        if (frameCount % 80 === 0) {
            // Cloud
            this.clouds.push({
                x: Math.random() * (W - 80),
                y: -50, w: 80, h: 40,
                dy: 2
            });
        }
        if (frameCount % 100 === 0 && Math.random() < 0.7) {
            // Bird
            this.birds.push({
                x: Math.random() * (W - 30),
                y: -60, r: 15, dy: 1.5
            });
        }
        if (frameCount % 200 === 0 && Math.random() < 0.3) {
            // Satellite
            this.satellites.push({
                x: W/2 - 30, y: -100,
                w: 60, h: 40, dy: 2.2
            });
        }
    }
    
    update() {
        if (this.state !== 'playing') return;
        
        // Timeout?
        if (frameCount >= this.frameLimit) {
            // Optional: Game over (of toch volle 30 sec)
        }
        
        // Win?
        if (gameState.score >= 25) {
            this.complete();
            return;
        }
        
        // Collision checks
        this.clouds.forEach(c => {
            c.y += c.dy;
            if (hitTest(rocket, c)) this.die();
        });
        this.birds.forEach(b => {
            b.y += b.dy;
            if (circleTest(rocket, b)) this.die();
        });
        this.satellites.forEach(s => {
            s.y += s.dy;
            if (hitTest(rocket, s)) this.die();
        });
        
        // Coin checks
        gameState.coins.forEach(c => {
            c.y += 3;  // Coins vallen (anders dan clouds — zij gaan omlaag)
            if (hitTest(rocket, c)) {
                if (c.type === 'gold') gameState.score += 5;
                c.dead = true;
            }
        });
    }
    
    draw(ctx) {
        // Background
        const t = frameCount / this.durationFrames;
        const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
        bgGrad.addColorStop(0, `hsl(210, 80%, ${85 - t*70}%)`);
        bgGrad.addColorStop(1, `hsl(270, 60%, ${60 - t*50}%)`);
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);
        
        // Stars (fade in)
        ctx.globalAlpha = Math.min(1, t * 2);
        stars.forEach(s => {
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.fillRect(s.x, s.y + frameCount * 0.5, 2, 2);
        });
        ctx.globalAlpha = 1;
        
        // Obstacles
        this.clouds.forEach(c => {
            ctx.font = '40px sans'; ctx.fillText('☁️', c.x, c.y);
        });
        this.birds.forEach(b => {
            ctx.font = '30px sans'; ctx.fillText('🐦', b.x, b.y);
        });
        this.satellites.forEach(s => {
            ctx.font = '35px sans'; ctx.fillText('🛰️', s.x, s.y);
        });
        
        // Rocket
        ctx.save();
        ctx.translate(rocket.x + 25, rocket.y + 40);
        drawRocket(ctx, rocket.angle);
        ctx.restore();
        
        // HUD
        drawHUD(ctx, gameState.score);
    }
}
```

---

### 5.2 — LEVEL 2: "Astroïdenveld bij Mars" (SPACE-MODE)

**File:** `levels/level2_mars.js`

**Karakteristieken:**
- Soort: **Horizontale Flappy-achtige** (rocket beweegt naar rechts, jij boost omhoog/schiet)
- Duur: 60 seconden OF 75 punten
- Besturing: **Spatie/links-tap** = boost, **pijl-rechts/rechts-tap** = schiet
- Moeilijkheid: **Medium** (intro to space-mode)
- Verhaal: Mama-kometen erkennen (mama texture), Mama-boss verslaag, mama1 gered

**Achtergrond:**
- Grote Mars-planeet rechts (roestkleur, langzaam roterend)
- Stofwolken links-rechts (parallax)
- Vaste blauwe space-achtergrond met gradient

**Obstacles:**
```javascript
// Mama-kometen (gelijk aan jouw bestaande 'mama' type)
// Deze tellen extra (dubbele punten als je ze doorkomt)
{
    x: W + 150,
    y: 50 + Math.random() * (H - 100),
    t: { n: 'mama', c: 3 },  // 3-frame animatie
    hue: Math.floor(Math.random() * 360),
    s: false,  // scored?
    dead: false
}

// Kloks (rare spawn als speed > 7)
{
    x: W + 50,
    y: 50 + Math.random() * (H - 100),
    type: 'clock',
    dead: false
}
```

**Coins:**
- Goud (veel)
- Ammo (normaal)
- Schild (10%)
- Blauw dubbelklapper (5%)
- GEEN dood, GEEN zwart gat (nog niet)

**Boss-mechanic:**
Mama-boss verschijnt op 75 punten:
```javascript
if (score >= 75) {
    // Spawn "De Moederkomeet" (grote mama-sprite, zigzags)
    boss = {
        x: W/2,
        y: H/2,
        hp: 5,
        pattern: 'zigzag',  // zigzag beweging
        ...
    };
    // Elk hit → -1 HP, explosie
    // HP === 0 → winCondition, mama1-sprite verschijnt
}
```

**Gameplay:**
```
Rocket zit op linkerkant, beweegt naar rechts (gravity)
  - Spatie/links-tap → boost (omhoog)
  - Pijl-rechts/rechts-tap → schiet
  - Kometen van rechts, je weikt uit + schiet ze weg
  - Mama-kometen geven +2 als voorbij (i.p.v. +1)
  - Boss is moeilijker (zigzag pattern)
  
Win: Boss HP === 0 → mama1 bevrijd
```

**Code sketch:**
```javascript
export class Level2 extends Level {
    constructor() {
        super(2, "Mars", "Mama redden van kometen!", 'space');
        this.boss = null;
        this.bossStarted = false;
        this.durationFrames = 60 * 60;
    }
    
    init() {
        setInputMode('space');
        setMelody([196, 220, 246, 261, 293], 300, () => gameState.score * 0.1);
        setMusicActive(true);
        resetState();
        this.state = 'waiting';
    }
    
    spawnObstacles() {
        // Mama-kometen
        if (frameCount % 60 === 0) {
            gameState.comets.push({
                x: W + 150,
                y: 50 + Math.random() * (H - 100),
                t: { n: 'mama', c: 3 },
                hue: Math.floor(Math.random() * 360),
                s: false, dead: false
            });
        }
        
        // Boss spawn
        if (!this.bossStarted && gameState.score >= 75) {
            this.bossStarted = true;
            this.boss = {
                x: W / 2, y: H / 2,
                hp: 5, maxHp: 5,
                angle: 0, radius: 60
            };
        }
    }
    
    update() {
        if (this.state !== 'playing') return;
        
        // Normal comet logic
        gameState.comets.forEach(c => {
            c.x -= effSpeed;
            if (!c.s && c.x < rocket.x) {
                c.s = true;
                gameState.score += (c.t.n === 'mama' ? 2 : 1);
            }
            if (collision(rocket, c)) this.die();
        });
        
        // Boss logic
        if (this.boss && !this.boss.dead) {
            // Zigzag movement
            this.boss.angle += 0.1;
            this.boss.y = H/2 + Math.sin(this.boss.angle) * 100;
            
            // Check bullet collision
            gameState.bullets.forEach(b => {
                if (distance(b, this.boss) < 40) {
                    b.dead = true;
                    this.boss.hp--;
                    spawnExplosion(this.boss.x, this.boss.y, 20);
                    if (this.boss.hp <= 0) {
                        this.boss.dead = true;
                        this.complete();
                    }
                }
            });
        }
        
        // Win check
        if (gameState.score >= 75 && this.boss && this.boss.dead) {
            this.complete();
        }
    }
    
    draw(ctx) {
        // Background
        const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
        bgGrad.addColorStop(0, '#2a82fb');
        bgGrad.addColorStop(1, '#1346af');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);
        
        // Mars (far right, slow parallax)
        const marsX = W - 100 + (frameCount * 0.3) % 20;
        drawPlanet(ctx, marsX, H/3, 80, '#c85a2a');  // rusty orange
        
        // Obstacles & rocket (existing draw code)
        // ...
        
        // Boss draw
        if (this.boss && !this.boss.dead) {
            ctx.save();
            ctx.translate(this.boss.x, this.boss.y);
            ctx.globalAlpha = this.boss.hp / this.boss.maxHp;  // Flicker op schade
            drawMamaCommet(ctx, this.boss.x, this.boss.y, 60);
            ctx.restore();
            
            // Boss healthbar
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(W/2 - 60, 30, 120, 8);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(W/2 - 60, 30, 120 * (this.boss.hp / this.boss.maxHp), 8);
        }
    }
}
```

---

### 5.3 — LEVEL 4: "De Verdwaalde Flight tussen Ruïnes" (FLIGHT-MODE + LASERS)

**File:** `levels/level4_ruins.js`

**Karakteristieken:**
- Soort: **Verticale flight** (omhoog vliegen, verticale oriëntatie)
- Duur: **Exact 45 seconden** (vast)
- Besturing: **Pijlen/drag** = vliegen, **Space/tap** = schiet
- Moeilijkheid: **Hard** (lasers, oriëntatie-omslag)
- Verhaal: Crash in ruïnes, moet laser-puzzel door, zoon1 gered

**Achtergrond:**
- Kristalblauw (ruïnes-kleur), geometrische patronen
- Animering: scan-lines (horizontale animatie-lijnen), glitchy effects
- Asteroïden/ruïne-debrisbrokken als visueel element

**Obstacles:**
```javascript
// Lasers (binair: aan/uit pattern)
{
    x: 50,  // verticale lijn-positie
    y: 0,
    w: 20,  // laser-breedte
    h: H,
    onFrames: [0, 30],  // aan in frames 0-30, 60-90, etc
    period: 120,        // cyclus
    active: false
}

// Honeycombs (kometen van onderen, tegengesteld)
{
    x: Math.random() * W,
    y: H + 50,          // onderuit komend
    t: { n: 'neef', c: 3 },
    hue: Math.random() * 360,
    dy: -2,             // omhoog
    dead: false
}
```

**Coins:**
- **Geen regular spawn!** Alleen **sleutelfragmenten** (custom coin-type):
  ```javascript
  {
      x, y,
      type: 'keyFragment',
      id: 1,  // fragment #1, #2, #3
      collected: false
  }
  ```
- Spawn op vaste momenten (15s, 30s, 45s)

**Special mechanic:**
- **Oriëntatie-omslag** — normaal je vliegt recht omhoog (0,0 top-left)
- Hier draait hele canvas: omhoog = naar beneden in screen-coördinaten
- Dit voelt **totaal anders** dan Level 1 → mentale uitdaging

**Gameplay:**
```
Exact 45 sec countdown
  - Ontwijken lasers (timing-puzzle)
  - Kometen van onderen (tegenwind)
  - 3 sleutelfragmenten oppikken (op 15s, 30s, 45s)
  
Als laser je raakt → die()
Overleven 45s + alle 3 fragmenten → win!
```

**Code sketch:**
```javascript
export class Level4 extends Level {
    constructor() {
        super(4, "Ruïnes", "Ontsnap uit laserlabyrinth!", 'flight');
        this.lasers = [];
        this.keyFragments = [];
        this.duration = 45 * 60;  // 45 sec exact
        this.elapsed = 0;
    }
    
    init() {
        setInputMode('flight');
        setMelody([262, 294, 330, 349, 392, 349, 330, 294], 200);  // sneller tempo
        setMusicActive(true);
        resetState();
        
        // Setup lasers (vaste patronen)
        this.setupLasers();
        
        // Key fragments (vaste timing)
        for (let i = 0; i < 3; i++) {
            this.keyFragments.push({
                x: Math.random() * (W - 50),
                y: -100 - i * 300,  // aparecem em 15s, 30s, 45s
                type: 'keyFragment',
                id: i + 1,
                collected: false
            });
        }
        
        this.state = 'waiting';
    }
    
    setupLasers() {
        // Laser patterns (verticale linies, aan/uit)
        const laserXs = [80, 200, 320];
        laserXs.forEach((lx, i) => {
            this.lasers.push({
                x: lx, y: 0, w: 20, h: H,
                onFrames: [0, 30],
                period: 120 + i * 10,  // offset per laser
                offset: i * 40,
                active: false
            });
        });
    }
    
    update() {
        if (this.state !== 'playing') return;
        
        this.elapsed++;
        
        // Check timeout
        if (this.elapsed >= this.duration) {
            if (this.keyFragments.every(kf => kf.collected)) {
                this.complete();  // Won!
            } else {
                this.die();  // Out of time w/o all keys
            }
            return;
        }
        
        // Update lasers (on/off cycle)
        this.lasers.forEach(laser => {
            const cyclePos = (this.elapsed + laser.offset) % laser.period;
            laser.active = cyclePos >= laser.onFrames[0] && cyclePos < laser.onFrames[1];
            
            // Laser hit rocket?
            if (laser.active && rectOverlap(rocket, laser)) {
                this.die();
            }
        });
        
        // Update honeycomb-kometen (van onder omhoog)
        gameState.comets.forEach(c => {
            c.y -= 2;  // Omhoog vliegen (tegengesteld)
            if (collision(rocket, c)) this.die();
            if (c.y < -100) c.dead = true;
        });
        
        // Spawn honeycomb-wave
        if (this.elapsed % 80 === 0) {
            gameState.comets.push({
                x: Math.random() * (W - 100),
                y: H + 50,
                t: { n: 'neef', c: 3 },
                hue: Math.random() * 360,
                dy: -2, dead: false
            });
        }
        
        // Key fragments (move down = verschijnen)
        this.keyFragments.forEach(kf => {
            kf.y += 1;
            if (!kf.collected && collision(rocket, kf)) {
                kf.collected = true;
                spawnConfettiBurst(kf.x, kf.y, ['#40E0D0', '#00ffff'], 20);
                playAmmo();  // reuse sound
            }
        });
    }
    
    draw(ctx) {
        // Background: kristalblauw met scan-lines
        const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
        bgGrad.addColorStop(0, '#0f2a4d');
        bgGrad.addColorStop(0.5, '#1a4d7a');
        bgGrad.addColorStop(1, '#0f2a4d');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);
        
        // Scan lines (animated)
        ctx.strokeStyle = 'rgba(0, 255, 200, 0.05)';
        ctx.lineWidth = 1;
        for (let y = 0; y < H; y += 10) {
            ctx.beginPath();
            ctx.moveTo(0, (y + frameCount) % H);
            ctx.lineTo(W, (y + frameCount) % H);
            ctx.stroke();
        }
        
        // Lasers (draw als glowing linies)
        this.lasers.forEach(laser => {
            if (laser.active) {
                ctx.save();
                ctx.shadowColor = 'rgba(255, 100, 100, 0.8)';
                ctx.shadowBlur = 20;
                ctx.strokeStyle = '#ff3333';
                ctx.lineWidth = laser.w;
                ctx.beginPath();
                ctx.moveTo(laser.x + laser.w/2, 0);
                ctx.lineTo(laser.x + laser.w/2, H);
                ctx.stroke();
                ctx.restore();
            }
        });
        
        // Rocket (center-bottom, omhoog)
        ctx.save();
        ctx.translate(rocket.x + 25, rocket.y + 40);
        ctx.rotate(rocket.angle * Math.PI / 180);
        drawRocket(ctx, 0);
        ctx.restore();
        
        // Key fragments
        this.keyFragments.forEach(kf => {
            const scale = kf.collected ? 0.7 : 1;
            ctx.save();
            ctx.translate(kf.x, kf.y);
            ctx.scale(scale, scale);
            ctx.font = '30px sans';
            ctx.fillText('🔑', 0, 0);
            ctx.restore();
        });
        
        // HUD: Time remaining + keys
        ctx.fillStyle = '#40E0D0';
        ctx.font = 'bold 20px sans';
        ctx.fillText(`${Math.ceil((this.duration - this.elapsed) / 60)}s`, 20, 40);
        ctx.fillText(`🔑 ${this.keyFragments.filter(kf => kf.collected).length}/3`, W - 120, 40);
    }
}
```

---

## DEEL 6: MAIN GAME LOOP & BOOTSTRAP

### 6.1 — `game.js` (Main loop)

```javascript
import * as Audio from './engine/audio.js';
import { gameState, resetState } from './engine/state.js';
import { particles, confetti, explosions, updateParticles, drawParticles, drawConfetti, drawExplosions } from './engine/particles.js';
import { Level1 } from './levels/level1_liftoff.js';
import { Level2 } from './levels/level2_mars.js';
import { Level4 } from './levels/level4_ruins.js';
import { setInputMode, keys } from './engine/input.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width = 480;
const H = canvas.height = 720;

let currentLevel = null;
let gameMode = 'menu';  // 'menu', 'levelSelect', 'playing', 'gameOver'
let frameCount = 0;

const levels = {
    1: new Level1(),
    2: new Level2(),
    4: new Level4(),
};

export function startLevel(levelId) {
    currentLevel = levels[levelId];
    if (!currentLevel) return;
    
    currentLevel.init();
    gameMode = 'playing';
    frameCount = 0;
    Audio.initAudio(canvas);
    Audio.setMusicActive(true);
}

export function goToMenu() { gameMode = 'menu'; Audio.setMusicActive(false); }
export function goToLevelSelect() { gameMode = 'levelSelect'; }

function update() {
    frameCount++;
    gameState.frameCount = frameCount;
    
    if (gameMode === 'playing' && currentLevel) {
        currentLevel.update();
        updateParticles();
        
        // Check state transitions
        if (currentLevel.state === 'dying') {
            currentLevel.deathTimer--;
            if (currentLevel.deathTimer <= 0) {
                currentLevel.state = 'dead';
                gameMode = 'gameOver';
            }
        }
        if (currentLevel.state === 'complete') {
            gameMode = 'levelComplete';
            // Show overlay, unlock next level, etc.
        }
    }
}

function draw() {
    ctx.save();
    
    if (gameMode === 'menu') {
        drawMainMenu();
    } else if (gameMode === 'levelSelect') {
        drawLevelSelect();
    } else if (gameMode === 'playing') {
        currentLevel.draw(ctx);
        drawParticles(ctx);
        drawConfetti(ctx);
        drawExplosions(ctx);
    } else if (gameMode === 'gameOver') {
        currentLevel.draw(ctx);
        drawGameOverOverlay();
    } else if (gameMode === 'levelComplete') {
        currentLevel.draw(ctx);
        drawLevelCompleteOverlay();
    }
    
    ctx.restore();
    requestAnimationFrame(draw);
}

// Bootstrap
Audio.initAudio(canvas);
draw();
```

### 6.2 — `main.js` (Bootstrap & Image loading)

```javascript
import { loadImages } from './engine/images.js';
import { startLevel, goToMenu } from './game.js';

const canvas = document.getElementById('gameCanvas');

// Load all images, then start menu
loadImages(() => {
    console.log('✅ All images loaded');
    goToMenu();
});

// Event listeners
document.addEventListener('keydown', (e) => {
    // Route to input handler
});

canvas.addEventListener('mousedown', (e) => {
    // Route to input handler
});

canvas.addEventListener('touchstart', (e) => {
    // Route to input handler
});
```

---

## DEEL 7: HELPERS & UTILITIES

### 7.1 — Collision Detection

```javascript
export function rectOverlap(a, b) {
    return a.x < b.x + b.w &&
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
}

export function circleTest(rocket, circle) {
    const dx = rocket.x + 25 - (circle.x + circle.r);
    const dy = rocket.y + 25 - (circle.y + circle.r);
    return Math.sqrt(dx*dx + dy*dy) < rocket.r + circle.r;
}

export function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx*dx + dy*dy);
}
```

### 7.2 — Draw Helpers

```javascript
export function drawRocket(ctx, angle) {
    ctx.save();
    ctx.rotate(angle * Math.PI / 180);
    if (hasImage('rocket')) {
        ctx.drawImage(getImage('rocket'), -70, -20, 140, 40);
    } else {
        // Canvas fallback
        ctx.fillStyle = '#ff6b35';
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(30, -5);
        ctx.lineTo(30, 5);
        ctx.lineTo(0, 15);
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();
}

export function drawPlanet(ctx, x, y, r, color) {
    const grad = ctx.createRadialGradient(x - r*0.3, y - r*0.3, 0, x, y, r);
    grad.addColorStop(0, lighter(color, 50));
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, darker(color, 30));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
}

function lighter(hex, pct) { /* ... */ }
function darker(hex, pct) { /* ... */ }
```

### 7.3 — HUD Draw

```javascript
export function drawHUD(ctx, score) {
    // Score pill (top center)
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.roundRect(W/2 - 70, 10, 140, 50, 25);
    ctx.fill();
    
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
    ctx.shadowBlur = 12;
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(score, W/2, 47);
    ctx.shadowBlur = 0;
    
    // Ammo indicator (bottom left)
    ctx.fillStyle = gameState.ammo > 0 ? '#FFD700' : 'rgba(255,215,0,0.3)';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('🔫×' + gameState.ammo, 20, H - 20);
}
```

---

## DEEL 8: HTML ENTRY POINT

**File:** `RocketmanAdventure.html`

```html
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚀 Rocketman Adventure</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: #0a0e27;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            font-family: 'Arial Rounded MT Bold', sans-serif;
            overflow: hidden;
        }
        canvas {
            display: block;
            border-radius: 10px;
            box-shadow: 0 0 60px rgba(255, 107, 53, 0.4);
            max-width: 100vw;
            max-height: 100vh;
        }
    </style>
</head>
<body>
    <canvas id="gameCanvas" width="480" height="720"></canvas>
    <script type="module" src="js/main.js"></script>
</body>
</html>
```

---

## DEEL 9: QUICK-START CHECKLIST VOOR JOUW VS CODE

1. **Copy je bestaande files:**
   - `Rocketmanspace.html` → extraheer de audio-functies naar `js/engine/audio.js`
   - `rocketmanflight.html` → extraheer de input/besturings-logica naar `js/engine/input.js`
   - Alle `resources/*.png` files in `resources/` map

2. **Bouw module voor module:**
   - `engine/audio.js` ✅ (ik heb al begonnen)
   - `engine/images.js` ✅ (afgemaakt)
   - `engine/particles.js` ✅ (afgemaakt)
   - `engine/shapes.js` (copy-paste jouw drawSkull/drawDiamond/drawClock)
   - `engine/input.js` (input-handler, per-mode)
   - `engine/storage.js` (localStorage wrapper)
   - `engine/state.js` (globale state object)

3. **Levels bouwen:**
   - `levels/baseLevel.js` (abstract class)
   - `levels/level1_liftoff.js` (eenvoudig)
   - `levels/level2_mars.js` (medium, boss)
   - `levels/level4_ruins.js` (hard, lasers)

4. **Game loop:**
   - `game.js` (main loop + mode management)
   - `levelManager.js` (level-select screen)
   - `main.js` (bootstrap)

5. **HTML entry:**
   - `RocketmanAdventure.html` (single HTML, module imports)

---

## DEEL 10: VERWACHTINGEN & TIPS

### Wat je krijgt
- Modulaire codebase waarmee je makkelijk levels toevoegt (Level 3, 5, etc.)
- Schone scheiding: assets/audio/input/particles/state
- Reusable Level-klasse met lifecycle (init/update/draw/complete/die)
- Volledige verhaal-arc over 3 levels (hoop-training → gemiddeld → lasers)

### Wat je nog moet doen
1. **Input-routen:** Zorg dat keyboard/mouse/touch juist naar setInputMode/callbacks gaat
2. **Collision-details:** Test hitboxes — jouw originele comets zijn 100×100, coins 36×36
3. **Visual polish:** Prijkt de rocket goed in canvas? Loopt animatie smooth?
4. **Saving/unlocking:** Level 2 unlock na Level 1 win, etc.

### Performance
- 480×720 canvas, 60fps target → op mobiel moet je passen met particle-count
- Particles.length < 500 voor smooth
- Confetti.length < 200

### Debugging
```javascript
// Console-helpers
window.startLevel = (id) => { import('./game.js').then(g => g.startLevel(id)); };
window.skipLevel = () => { currentLevel.complete(); };
window.godmode = true;  // Disable die()
```

---

## DEEL 11: VOLGENDE STAPPEN (NA DEZE 3 LEVELS)

Eenmaal Level 1/2/4 werkt:

1. **Level 3 — Saturnusringen** (space-mode met ring-obstacles)
2. **Level 5 — Zonnestorm** (space-mode, wind-effect, omgekeerde schild)
3. **Level 6 — Kosmische Bruiloft** (relaxte scoring-level, rewards)
4. **Level 7 — Zwarte Gat** (space-mode, inward-gravity spiral)
5. **Level 8 — Terugkeer** (combo flight→space, final boss)

Plus: upgrade-systeem, cutscenes, achievements, etc.

---

**EINDE BLAUWDRUK**

Veel sterkte in VS Code! Dit is een solide fundament. Vraag me alles wat onduidelijk is.
