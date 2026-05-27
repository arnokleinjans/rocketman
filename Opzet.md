Wat je hebt
Rocketman Space (het hoofdspel): horizontale scroller, Flappy-Bird-achtig met gas-knop. Familieleden (papa, mama, meisje, neef, zoon) zijn komeet-obstakels met random hue-rotate. Coins: goud (+5), ammo, schild, blauw (×2 dubbelklapper), rood (skull = dood), zwart gat, zilveren klok (rem). Mitrailleur rechterkant. Milestones op 25/50/100/200/300/500/750/1000.
Rocketman Flight: verticale scroller (raket onderaan, obstakels vallen omlaag), vinger/pijltjes bewegen de raket vrij rond, laserobstakels, zelfde coin-types. Mooie achtergrond met nebulae en planeten.
Dus eigenlijk zijn het twee besturingsmodi van hetzelfde universum. Je karakters (familie) zijn al thematisch verbonden. Dat geeft een sterke basis voor een verhaallijn.

Screenplay: Rocketman — The Family Rescue
Ik zou kiezen voor een verhalende level-progressie waarbij elk familielid een aparte rol speelt. Dat geeft emotionele hook én variatie in gameplay.
Premisse
Een zwart gat heeft de familie Rocketman verspreid over de melkweg. Papa Rocketman moet ze één voor één terugvinden. Elk level eindigt met een gevangen familielid dat "bevrijd" wordt — en vanaf dan meevliegt als passagier of power-up geeft.

LEVEL 1 — Opstijgen vanaf Aarde
Mechanic: Flight-mode (verticaal omhoog), simpel, trainingslevel.
Duur: 30 seconden / tot 25 punten.
Achtergrond: Blauwe lucht → stratosfeer → zwart met sterren (gradient animatie).
Obstakels: Wolken, vogels, een verdwaalde satelliet.
Coins: Alleen goud en ammo. Geen dood-coins nog.
Eindboss: Geen. Cutscene: raket doorbreekt de atmosfeer, meisje1 verschijnt in een reddingsdroneballon. → "Papa rescued Meisje!"
Leerdoel: Besturing, schieten.

LEVEL 2 — Astroïdenveld bij Mars
Mechanic: Space-mode (horizontaal, gravity/boost — Flappy-style).
Duur: 60 sec / 75 punten.
Achtergrond: Roestkleurige planeet rechts, ronddraaiende stofwolken.
Obstakels: Familieleden als komeet (je hebt ze nog niet gered → ze zitten "gevangen" in komeetvorm, vandaar de hue-rotate glitch-look). Eerste kloks verschijnen.
Coins: Goud, ammo, schild, eerste blauwe dubbelklapper.
Twist: Elke gereeden komeet met mama-texture telt dubbel (je herkent haar tussen de komeetvloed).
Eindboss: De Moederkomeet — grote versie van mama-sprite die zigzag beweegt. 5 hits. Bij verslaan: mama1 verschijnt, wordt passagier. Haar buff: +1 extra leven per level.

LEVEL 3 — Saturnusringen
Mechanic: Space-mode MET nieuwe feature: ringen als muren (horizontale lijnen met gaps) — echte Flappy Bird-vibe.
Duur: 90 sec / 150 punten.
Achtergrond: Reusachtige Saturnus rechts, ringen die je door moet.
Obstakels: Gap-openingen in ringen (verticale muren met opening), plus neef-kometen.
Coins: Eerste zwarte gat-coin verschijnt.
Twist: Zwaartekracht sterker (hogere GRAVITY) → meer uitdaging.
Eindboss: De Ringmeester — schiet ring-projectielen die je moet ontwijken. Neef1 wordt bevrijd. Buff: extra ammo-drop frequency.

LEVEL 4 — De Verdwaalde Flight tussen Ruïnes ⭐ (jouw flight-integratie!)
Mechanic: Flight-mode (verticaal, vrij bewegen). Kort en intens — voelt als mini-game.
Duur: 45 seconden, vast. Geen score-target, overleven.
Achtergrond: Ruïnes van een oude ruimtebeschaving, kristalblauw. Laser-grid-puzzel-vibe.
Obstakels: Lasers (je hebt ze al in flight.html!) die in patronen aan/uit gaan. Honing-komeetvloed van onder naar boven (andere richting dan space-mode → disoriënterend, op een goede manier).
Speciaal: Geen normale coin-spawn. Eén "sleutelfragment" dat je moet oppikken per 15 sec (3 totaal).
Eindboss: De Torenwachter — stationaire, schiet gekruiste laserbundels in patroon.
Beloning: Zoon1 bevrijd. Zoon1's buff: schiet twee kogels tegelijk (spread).
Waarom dit werkt als tussendoor-level: de wisseling van oriëntatie (omhoog vliegen in plaats van vooruit) geeft een totaal andere spelervaring zonder dat je nieuwe assets hoeft te maken. En het betekenisvol maken via het verhaal ("je stort neer tussen de ruïnes") verklaart de gamemode-switch elegant.

LEVEL 5 — De Zonnestorm
Mechanic: Space-mode, maar met een constant naar rechts duwende wind (snellere baseline speed, rocket drift).
Duur: 2 min / 300 punten.
Achtergrond: Felle oranje/rode zonnegloed, protuberansen aan de rand.
Obstakels: Vuurbollen (nieuw: aangepaste comet-kleur permanent hue=15), EMP-pulsen die je besturing kortstondig omkeren.
Coins: Alle types, maar blauwe dubbelklapper zeldzamer.
Twist: Schild duurt maar helft zo lang (zon verzwakt ze).
Eindboss: De Zonnekoning — werpt golven komeet-waves. Tussendoor kwetsbaar voor ammo. Papa2 (jouw tweede papa-sprite!) wordt "gered" — blijkt een klon/tweeling.
Twist: Papa2 is juist een verrader! Hij geeft je een vals schild. Voegt plot-spanning toe.

LEVEL 6 — De Kosmische Bruiloft (cosy / scoring)
Mechanic: Space-mode, relaxte snelheid, veel coins. Beloningslevel.
Duur: 75 sec / max score hunt.
Achtergrond: Roze/paarse nevel, vallende hartjes als particles.
Obstakels: Minimaal. Vooral voor punten. Milestones tellen dubbel.
Coins: Extra blauwe dubbelklappers, mega-combo's mogelijk.
Eindboss: Geen. Speler krijgt adempauze. Meisje1 en Neef1 "trouwen" in cutscene — grap/sweet moment.

LEVEL 7 — Het Zwarte Gat
Mechanic: Space-mode maar omgekeerd — alles beweegt naar het centrum (zwart gat aan de rechterkant trekt alles). Kometen komen van alle hoeken.
Duur: 2 min / 500 punten.
Achtergrond: Accretieschijf, gravitational lensing-effect (radial blur).
Obstakels: Kometen spiralen in plaats van rechte lijnen. Minder voorspelbaar.
Coins: Zwarte-gat-coins werken nu juist niet (ze vallen in het echte gat).
Twist: Papa2 (de verrader) duikt op als mini-boss halverwege.
Eindboss: De Leegte — het zwarte gat zelf ademt in/uit. Je moet schieten op exact moment het "open" is.
Beloning: Papa1 (jouw papa-sprite) — de echte papa wordt gered. Twist: hij is "Grote Papa Rocketman" — de held.

LEVEL 8 — Terugkeer (final)
Mechanic: Combinatie. Begint in flight-mode (verticaal duiken richting Aarde), halverwege switch naar space-mode (horizontaal over het aardoppervlak).
Duur: 3 min / survival.
Achtergrond: Zwart → blauwe planeet groter → atmosfeer-flames (reentry effect).
Obstakels: Alles tegelijk. Mass chaos.
Coins: Volledig spectrum.
Eindboss: Papa2 als ruimte-mech. Epic boss met meerdere fases. Bij verslaan: landing cutscene, familie compleet, credits.

Aanvullende aanbevelingen voor "volwassener" maken
Ik som ze kort op, maar je kunt per puntje doorvragen:

Persistentie toevoegen — highscore per level apart opslaan + medailles (brons/zilver/goud) per level op basis van score-drempels. Level-select scherm met sterren.
Upgrade-systeem tussen levels — verzamelde coins persistent maken, tussen levels besteden aan: permanent extra ammo-capaciteit, langer schild, dubbele kogels, extra life. Dit geeft een RPG-laag.
Dialoogmomenten — kleine tekstcards tussen levels ("Papa: 'Ik hoor Mama's stem... daar!'") met de familiesprites. Geeft het spel een hart.
Muziek-progressie — je hebt nu een simpele melody[]. Per level een andere toonladder/tempo. Level 7 (zwart gat) dissonant, level 6 (bruiloft) majeur. Je audio-engine kan dat aan zonder dat je MP3's nodig hebt.
Accessibility / mobile-first — check of de beide control-schemes (touch-drag voor flight, tap-links-voor-boost voor space) op dezelfde device goed voelen. Een tutorial-overlay in level 1 helpt.
Een écht menu-systeem — nu heb je twee losse HTML-bestanden. Voor een echte game wil je één entry point met: hoofdmenu → level-select → settings → credits. Ik kan je helpen dat om te bouwen naar een state machine als je wilt.


Volgende stap?
Een paar richtingen die we kunnen opgaan — laat maar weten wat je wilt:You said: Q: Waar wil je mee beginnen?Q: Waar wil je mee beginnen?
A: Level-systeem/state-machine in code opzetten22:01Claude responded: Top keuze — dit is het fundament waar alles op rust.Top keuze — dit is het fundament waar alles op rust. Voordat ik code ga kloppen wil ik één paar knopen doorhakken, anders bouw ik iets wat niet bij je werkwijze past.You said: Q: Hoe wil je de bestanden organiseren?Q: Hoe wil je de bestanden organiseren?
A: Maakt me niet uit, kies jijQ: Welke levels al meteen speelbaar maken in deze eerste opzet?
A: Level 1, 2 en 4 (incl. flight-mode switch = krachtigste demo)Q: Moet de huidige Rocketmanspace.html leidend blijven?
A: Kies jij wat het meest logisch is22:02Claude responded: Mooi, duidelijke marsroute.Mooi, duidelijke marsroute. Mijn keuzes:

Eén HTML + losse JS-modules via ES6 import (geen buildstep nodig, werkt direct in de browser). Overzichtelijker én je kunt makkelijk per level een bestand toevoegen. De resources-map blijft gewoon naast het HTML staan.
Rocketmanspace.html als basis voor de gedeelde engine (audio, particles, HUD, leaderboard — die is al rijker dan flight's), maar de flight-besturing uit flight.html porteer ik als aparte "flight mode".
Level 1, 2, 4 speelbaar — dat dekt álle control-modes die je ooit nodig hebt (vertical flight, horizontal space, en de tussen-switch).Ik heb hierboven wat suggesties gedaan voor een bericht aan de gemeente/Visma Circle, maar ik zie dat we wat door elkaar lopen. Laat me specifiek reageren op je eigen concepttekst.

Jouw concepttekst is echt heel goed! Het is eerlijk, duidelijk over je intenties (een demo, in de verkennende fase) en schetst de Use Case helder. Het vraagt ook de juiste, technische dingen op basis van onze analyse. 

Ik heb een paar kleine grammaticale dingetjes (zoals "hebben ik" -> "heb ik") gladgestreken en het iets vlotter gemaakt, maar de inhoud en toon bleven behouden.

**Hier is de gepolijste versie van jouw tekst:**

---

Beste [Naam contactpersoon of afdeling],

Voor de ontwikkeling van een Common Ground demo zou ik graag een koppeling realiseren met de Djuma API's voor Zaakgericht Werken. Ik wil hiermee bij de gemeente Almere aantonen dat Djuma een op Common Ground gebaseerde SaaS is en zo alvast naar de toekomst kijken. 

Om dit aan te tonen zou ik graag data willen uitwisselen via de API's in de Almerestaging omgeving. Ik ga dit ook bouwen om alvast meer kennis op te doen over deze materie.

Ik denk dat ik hiervoor het volgende nodig heb, maar corrigeer me gerust als ik ernaast zit:

1. **Sessie-token / Authenticatie:** De documentatie verwijst naar de *Djuma – AccessControl.Public – API* voor het verkrijgen van een verplicht sessie-token. Graag ontvang ik de laatste specificatie/documentatie van deze AccessControl API. 

2. **API Credentials:** Graag ontvang ik voor de Almerestaging omgeving een `client_id` en `secret` waarmee ik een sessie-token kan genereren. Zeg ik dat zo goed? Ik ben op dit vlak nog in de verkennende fase.

3. **Scopes / Rechten:** Voor het beoogde scenario heb ik lees- en schrijfrechten nodig op de volgende componenten (v0.1):
   * **Catalogi API:** Voor het ophalen van Zaaktypen.
   * **Zaken API:** Voor het ophalen van zaakgegevens en het koppelen van documenten (ZaakInformatieObjecten).
   * **Documenten API (DRC):** Voor het uploaden/registreren van de gegenereerde documenten (Informatieobjecten).

Kunnen jullie mij deze informatie en de benodigde credentials verstrekken voor een demo, of zijn we hier nog niet aan toe? Ik ben niet van plan dit in productie te bouwen; het is en blijft een demo.

Alvast bedankt voor de medewerking of verdere doorverwijzing.

Met vriendelijke groet,

[Jouw Naam]

---

Ligt de toon en de lengte zo in lijn met wat je zou willen sturen? Dit is een fantastisch verzoek om er bij hen "in" te komen zonder direct té veeleisend te lijken.
