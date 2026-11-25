<!-- deploy-regel-v1 -->
> **⛔ Deploy-regel (geldt voor ALLE projecten):** Push NOOIT naar GitHub en deploy NOOIT naar Vercel of enige andere hosting/remote, tenzij Arno daar in dít bericht expliciet om vraagt. Lokaal committen en branchen mag; maar `git push`, het aanmaken van remote repos, `vercel`/deploy-commando's, en het wijzigen van remote secrets/omgevingsvariabelen vereisen telkens een nieuwe, expliciete opdracht. Toestemming voor één push/deploy geldt niet voor de volgende. Bij twijfel: eerst vragen.

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
- `test_spritesheet.html`, de proefpagina's en ongebruikte sprites staan sinds 25-11-2026 in `_Archief/Rocketman-backup-2026-11-25/` (zie CHANGELOG-sessies.md). Terugzetten naar deze map als je ze weer nodig hebt.
- Raket, munten, bekers, Mars en Saturnus worden in code getekend, niet meer met sprites.
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
Score-drempelwaarden per level (`medailles` in `LEVELS`):
- Level 1: brons=100, zilver=250, goud=500
- Level 2: brons=150, zilver=375, goud=750
- Level 3: brons=200, zilver=500, goud=1000
- Level 4: brons=300, zilver=750, goud=1500
- Level 5: brons=150, zilver=300, goud=500

Cups worden getoond op de level-kaart (top-rechts, 80×80) en in de naam-invoer overlay.
Functie: `getCupKey(lid, score)` → `'cup_bronze'` / `'cup_silver'` / `'cup_gold'` / `null`
Functie: `drawCupFrame(ctx, key, dx, dy, dw, dh)` → tekent huidig animatieframe van de beker

---

## Levels: de lijst `LEVELS`

Alles wat bij een level hoort staat in één blok in `LEVELS` (in `RocketmanAdventure.html`, bij de medailles):
`id`, `mode` (`FLIGHT` of `SPACE`), `kleur`, `medailles`, `legenda` (iconen op het intro-scherm), `familie` (optioneel) en de functies `init`, `update` en `teken`.
Menu, kaarten, bekers, intro, cutscene, ontgrendelen, `?preview=` en `?play=` lezen allemaal uit deze lijst. `ruimteLevel()` is `mode === 'SPACE'`.

Teksten blijven in de vertaaltabel, per taal: `lv<id>.naam`, `.kaart`, `.verhaal`, `.doel`, `.besturing` en voor de cutscene `cs<id>.kop`, `.zegt`, `.buff`.

### Nieuw level toevoegen
1. Schrijf `initLevel5()`, `updateLevel5()` en `drawLevel5()`. `init` zet raket, achtergrond, melodie en timers; `startLevel` doet de algemene reset al.
2. Voeg een blok toe aan `LEVELS`.
3. Voeg de `lv5.…`-teksten toe in NL en EN.
4. Zonder `familie` toont de kaart geen komeet, komt er niemand bij in de familierij en geeft de cutscene "Voltooid!".

### Hoofdstukken
Elk level heeft `hoofdstuk` (1 of 2). Het menu toont één hoofdstuk tegelijk, vier kaarten in een raster van 2 breed (`kaartPlek(i)`, index binnen het hoofdstuk). `menuHoofdstuk` bepaalt welk hoofdstuk zichtbaar is. Het wordt gezet bij opstarten en na een cutscene (`kiesHoofdstuk()`: het hoogste hoofdstuk met een ontgrendeld level), en met de tabs Hoofdstuk 1 / Hoofdstuk 2 in het verhaalvak. De tabs verschijnen pas als hoofdstuk 2 open is; daarvoor staat er de ondertitel.
- Hoofdstuk 1: de familie bevrijden uit kometen (level 1-4), verhaal `menu.verhaal1-4`.
- Hoofdstuk 2: vliegles van Rocketman, verhaal `menu2.verhaal1-4`. Dezelfde volgorde als hoofdstuk 1: meisje, mama, neef, zoon.
- `KOMENDE_KAARTEN` geeft lege kaarten met "Binnenkort" voor levels die nog niet bestaan. Haal een naam weg zodra dat level in `LEVELS` staat.
- Bij opstarten: wie level 4 al had, krijgt level 5 ontgrendeld.
- `?preview=4` en de cutscene van level 4 doorklikken ontgrendelt level 5 en zet het menu op hoofdstuk 2.

`sw.js` serveert alles eerst uit de cache. Verhoog `CACHE` bij elke nieuwe versie, anders houdt een telefoon de oude versie.

### Velden voor hoofdstuk 2
- `piloot: { n, emoji, frames }`: wie er vliegt. De kaart toont dan het bevrijd-sprite in plaats van een komeet, en de cutscene speelt alleen de genoemde frames van `<n>_bevrijd_spritesheet`. Voor het meisje is dat alleen frame 5 (armen omhoog, sterren): ze komt niet meer uit een komeet.
- `raketStijl`: naam van een stijl in `GFX` (bijv. `'RAKET_MEISJE'`). `GFX.drawRaket` krijgt die als laatste argument. `RAKET_STD` zijn de kleuren van Rocketman. Een stijl bepaalt romp, vinnen, rand, handgrepen, pak, mouwen, handschoenen, `piloot` (`'prof'` of `'meisje'`, het hoofd in de patrijspoort) en `hartjes` (hartjes op de romp en als neuslamp).
- `schieten: false`: geen schietknop en geen schiet-aanraakvlak.

### Level 5: Vliegles Meisje
Verticaal zoals level 1 (`stuurVerticaal()` is de gedeelde besturing). Steeds één zwart gat (`gaten5`). Het zakt het scherm in, blijft hangen op `parkY` en sluit pas als alle munten in zijn baan gepakt zijn; daarna komt het volgende (`gatNr5` telt). Er zijn geen losse munten: alleen 5 munten in een baan rond het gat, +10 per munt. Bij elk derde gat (`DIAMANT_ELK`) is één munt een diamant die de score verdubbelt.

De moeilijkheid is de afstand van de baan tot de rode ring, niet de snelheid. Eerste gat `BAAN_START`·ring (2,4), elk volgend gat `BAAN_STAP` (0,16) dichterbij, tot `BAAN_MIN`·ring (1,0, precies op de ring).

Per gat met straal `r` (`GAT_R_MIN` 46 + tot `GAT_R_SPREIDING` 16): trekzone `GAT_ZONE`·r (3,5), trek `GAT_TREK` (9,5) op afstand r, rode stippelring op `GAT_RING`·r waar de trek gelijk is aan de vliegsnelheid 7. Kern 0,42·r slokt de raket op (`slok5`, 40 beelden draaien en krimpen, dan `triggerDeath`). Doel `DOEL5` = 100 (twee gaten), bekers 150/300/500.

Rocketman geeft lessen in een spreekballon (`geefLes`, teksten `les.1-5`, `les.diamant`, `les.goed`). Linksboven staat "Gat n • gepakt/5". Debugscherm (D) toont kern, ring, trekzone en baan.

In het menu van hoofdstuk 2 staat geen familierij, alleen Rocketman naast zijn raket.

Nog niet in de lijst, omdat ze alleen binnen één level spelen: `blackHoleTimer3`, de pop-up `pop.mamaVrij` en de botsingscirkels in het debugscherm (toets D).

De buffs in de cutscenes (+5 HP, extra leven, dubbele munitie, 2 kogels) zijn alleen tekst. Ze zitten niet in de gameplay.

---

## Status
Volledig functioneel spel met meerdere niveaus, physics-engine, leaderboard-systeem, geanimeerde families en sprite sheet systeem.
