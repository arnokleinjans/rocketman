# Rocketman Adventure - Samenvatting

## Overzicht
Interactief HTML5-Canvas spel met raket-karakter dat door niveaus moet navigeren. Gebouwd in pure JavaScript met realtime physics, collision detection en leaderboard systeem.

## Kernfeatures
- **Playerkarakter**: Rocketman die accelereert, rem en boost via controls
- **Niveaus**: Progressieve moeilijkheid met obstacles, enemies en collectibles
- **Physics**: Zwaartekracht, snelheid-limits, momentum-based movement
- **Visuele effecten**: Glow-effecten, particle systems, UI met gradients
- **Leaderboard**: Scorebijhouden met naam-overlay en record-tracking
- **Responsive**: Werkt op desktop en mobile met touch/keyboard controls

## Technische stack
- HTML5 Canvas 2D context
- Vanilla JavaScript (geen frameworks)
- LocalStorage voor scores
- CSS met animations en gradients

## Bestanden
- `RocketmanAdventure.html` - Main game file
- `resources/` - Assets (sprites, sounds, JSON configs)
- `test_spritesheet.html` - Tool om sprite sheets te testen en uitlijnen
- Documentatie: BLAUWDRUK_VOLLEDIGE_ANALYSE.md, Opzet.md

---

## Sprite Sheet Systeem

### Hoe het werkt
Geanimeerde sprites worden opgeslagen als sprite sheets (PNG met alle frames naast/onder elkaar). Per sprite sheet is er een JSON-configuratiebestand dat de uitlijning per frame vastlegt.

### JSON-configuratiebestand (`resources/<naam>.json`)
```json
{
  "sprite": "naam_van_spritesheet",
  "cols": 4,       // aantal kolommen in het grid
  "rows": 1,       // aantal rijen in het grid
  "frames": 4,     // totaal aantal frames
  "fps": 8,        // animatiesnelheid
  "padL": 50,      // globaal links bijsnijden (pixels)
  "padR": 0,       // globaal rechts bijsnijden
  "frameOffsets": [
    { "L": -65, "R": -42, "Y": 0 },  // frame 0: extra links/rechts/verticaal
    { "L": -20, "R": -45, "Y": 0 },  // frame 1
    ...
  ]
}
```
- **L/R**: extra pixels bijsnijden links/rechts bovenop de globale padL/padR
- **Y**: verticale verschuiving van het bronframe (omhoog bijsnijden)
- Negatieve waarden = minder bijsnijden (meer zichtbaar maken)

### In de game code (`RocketmanAdventure.html`)

**`ANIM_CONFIGS` object** (bovenaan bij MEDALS):
Startwaarden per sprite — worden **overschreven** door de JSON-bestanden bij laden.
Voeg een nieuwe sprite toe als lege entry: `naamVanSprite: {}`.

**`loadAnimConfigs(cb)`**:
Probeert via fetch de JSON-bestanden te laden en `ANIM_CONFIGS` te overschrijven.
**Werkt alleen op een webserver** — op `file://` blokkeert de browser fetch-requests.
Bij lokaal gebruik (file://) gelden altijd de hardcoded waarden in `ANIM_CONFIGS`.

**Workflow bij aanpassen van een sprite sheet config:**
1. Pas waarden aan in `test_spritesheet.html` en sla op als JSON
2. Kopieer de waarden ook handmatig naar `ANIM_CONFIGS` in `RocketmanAdventure.html`

**`drawAnimFrame(key, fi, dx, dy, dw, dh)`**:
Tekent frame `fi` van sprite `key` op positie `dx,dy` met afmeting `dw×dh`.
Past padL, padR en per-frame L/R/Y offsets toe op de bronregio.

**Animatieframe berekening — gebruik altijd `frameCount`:**
```js
const fi = Math.floor(frameCount / Math.round(60 / cfg.fps)) % cfg.frames;
```
Gebruik NIET `animFrame` — die telt slechts elke 8 frames op en geeft ~8x te trage animatie.

### Nieuwe sprite sheet toevoegen
1. Maak de sprite sheet PNG en zet in `resources/`
2. Open `test_spritesheet.html`, laad de PNG, stel grid in (cols/rows/frames)
3. Stel per frame de L/R/Y schuiven in totdat alle frames goed uitgelijnd zijn
4. Klik "💾 Sla op als JSON" → sla op als `resources/<naam>.json` (zelfde naam als de PNG, zonder extensie)
5. Voeg de PNG toe aan `imagePaths` in `RocketmanAdventure.html`
6. Voeg lege entry toe aan `ANIM_CONFIGS`: `naamVanSprite: {}`
7. Gebruik `drawAnimFrame(key, fi, dx, dy, dw, dh)` om te tekenen
   of voeg `sheet: 'naam'` toe aan een comet-type voor automatische rendering

### Comet types met sprite sheet
Comet types in level spawn code: `{ n: 'meisje', c: 4, sheet: 'meisje_komeet_spritesheet' }`
- Zonder `sheet`: gebruikt losse PNG bestanden (`meisje1.png`, `meisje2.png`, ...)
- Met `sheet`: gebruikt `drawAnimFrame` met de config uit `ANIM_CONFIGS`

---

## Animatie systeem (level select & cutscenes)

### Level select — bevrijd familielid
Onderaan het level select scherm verschijnen bevrijd familieleden als animated sprites.
Alleen het **laatste** bevrijde familielid animeert; oudere staan stil op frame 0.

Sprite configs voor de familie: `cols:3, rows:2, frames:6, fps:7` (allen 1024×1024).

### Level complete cutscene
Na het voltooien van een level wordt `showCutscene(data)` aangeroepen met:
```js
{ headline, sprite, emoji, rescued, buff, frames, cols, rows, fps }
```
De `drawCutscene()` functie detecteert `d.frames` en tekent een sprite sheet animatie.

### Bekers (cups)
Score-drempelwaarden per level (`MEDALS` object):
- Level 1: brons=100, zilver=250, goud=500
- Level 2: brons=150, zilver=375, goud=750
- Level 3: brons=200, zilver=500, goud=1000
- Level 4: brons=300, zilver=750, goud=1500

Cups worden getoond op de level-kaart (top-rechts, 80×80) en in de naam-invoer overlay.
Functie: `getCupKey(lid, score)` → `'cup_bronze'` / `'cup_silver'` / `'cup_gold'` / `null`
Functie: `drawCupFrame(ctx, key, dx, dy, dw, dh)` → tekent huidig animatieframe van de beker

---

## Status
Volledig functioneel spel met meerdere niveaus, physics-engine, leaderboard-systeem, geanimeerde families en sprite sheet systeem.
