# KT12 – Unit & E2E Testing

## Bestandsaufnahme und Umfang

Vorhanden waren zwei App-Unit-Tests, ein Erstellungstest der statischen
Beispielkarte (`src/app/blog-card`) und ein veralteter E2E-Test für die
Willkommensseite. Diese Beispielkarte ist nicht die BlogCardComponent der Übersicht.
Die bestehenden Unit-Tests bleiben erhalten; der veraltete E2E-Test wird ersetzt.

Ein BlogStateService war nicht vorhanden. Nach Rückfrage wurde ein separater
Service ergänzt: leere Blog-Liste und `loading = false` als Initialzustand,
`loadBlogs()` über den vorhandenen BlogService, schreibgeschützte Signals und
`blogCount` als `computed()`. Bei Fehlern wird Loading zurückgesetzt und der
bisherige Zustand erhalten. Der Fehler wird an den Aufrufer weitergegeben.
Der Service ist noch nicht in die Seiten eingebunden; bestehende Funktionen,
Routing und Darstellung wurden nicht verändert.

## Unit-Tests mit Vitest

`src/app/shared/blog-state.service.spec.ts` (6 Tests):

- Initialzustand: keine Blogs, kein Loading, blogCount 0, kein automatisches Laden.
- Laden: Loading ist während des Ladens true, danach false; Daten und Anzahl stimmen.
- Reaktivität: blogCount und ein abhängiges computed() aktualisieren sich bei 0 → 1 → 3 → 0 Blogs.
- Fehler: Loading wird zurückgesetzt, vorherige Blogs und Anzahl bleiben erhalten.
- Zwei Randfälle: Liefert der gemockte BlogService entgegen seinem Typvertrag
  null oder undefined, wird mit TypeError abgelehnt; Loading wird zurückgesetzt
  und der bisherige Zustand bleibt erhalten. Dazu wird ausschliesslich im Test
  der Rückgabetyp bewusst umgangen. Ein leeres Array ist dagegen gültig.

Der BlogStateService verwendet keinen effect(); der optionale Effect-Test entfällt.
Ein HttpClient-Mock ist nicht nötig, da BlogService lokale JSON-Daten liest.

`src/app/shared/blog-card/blog-card.component.spec.ts` (3 Tests):

- Erstellung mit gesetztem Pflicht-Input und Router-Provider.
- Titelanzeige sowie Aktualisierung nach Änderung des Signal-Inputs.
- Ein Klick auf den Like-Button emittiert die Blog-ID genau einmal.

Die Tests verwenden isolierte Beispieldaten bzw. einen BlogService-Mock.
Sie verändern die produktiven JSON-Daten nicht.

## E2E-Akzeptanzkriterien

### Blog-Liste: drei Kriterien

1. Beim Öffnen von `/` sind Toolbar, Überschrift und alle Blog-Einträge sichtbar;
   pro Datensatz gibt es genau eine Karte.
2. Jede Karte zeigt den korrekten Titel und die Zusammenfassung (`contentPreview`).
3. Jede Karte enthält einen Details-Link auf `/blog/:id` für den jeweiligen Beitrag.

### Navigation und Detailseite: vier Kriterien

1. Ein Klick auf «Details» eines Beitrags öffnet `/blog/:id` mit der passenden ID.
2. Die Detailseite zeigt den Titel des ausgewählten Beitrags.
3. Die Detailseite zeigt die Zusammenfassung desselben Beitrags.
4. Ein Klick auf «Blog» in der Hauptnavigation führt zu `/` zurück; die
   Überschrift und alle Blog-Karten erscheinen wieder.

| Szenario                                   | Ausgangslage / Aktion                                           | Erwartetes Ergebnis                                                                                                                                                    |
| ------------------------------------------ | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Blog-Übersicht                             | Nutzer öffnet `/`.                                              | Toolbar und Überschrift «Blog-Übersicht» sind sichtbar. Für jeden Eintrag in `blogs.json` erscheint genau eine Karte mit korrektem Titel und Details-Link `/blog/:id`. |
| Navigation                                 | Nutzer öffnet `/` und klickt beim ersten Beitrag auf «Details». | URL ist `/blog/:id`; Detailseite zeigt den zugehörigen Titel und Vorschautext.                                                                                         |
| Rücknavigation (Teil des Navigationstests) | Nutzer klickt in der Hauptnavigation auf «Blog».                | URL ist `/`; Überschrift und alle Blog-Karten erscheinen wieder.                                                                                                       |

Implementiert in `e2e/app.spec.ts` als zwei voneinander unabhängige Tests.
Die Erwartungen verwenden die lokalen Blog-Daten; externe Bilder sind kein
Akzeptanzkriterium. Playwright wartet mit seinen Assertions auf die Darstellung.

### AI-Prompt und Review

Die Tests wurden mit Codex erstellt und anhand des vollständigen Arbeitsblatts
ergänzt. Der folgende Prompt dokumentiert die konkrete Generierungsanweisung
für den fertigen Testumfang:

```text
Schreibe zwei Playwright-E2E-Tests für die oben genannten drei Akzeptanzkriterien
der Blog-Liste und vier Kriterien für Navigation und Detailseite.
Die App läuft auf http://localhost:4200. Nutze TypeScript und @playwright/test.
Verwende blogs.json als erwartete Daten. Prüfe bei jeder Karte Titel,
Zusammenfassung und Details-Link. Klicke im Navigationstest auf Details und
danach in der Hauptnavigation auf Blog. Prüfe die URLs und den Seiteninhalt.
Verwende passende Rollen und vorhandene Angular-Material-Selektoren sowie
automatisch wartende Assertions statt fester Wartezeiten.
```

Review am 15.10.2026:

- Selektoren mit den echten Templates abgeglichen: `app-blog-card`,
  `mat-card-title`, `mat-card-content` und `article` existieren. «Details» ist ein
  Link; die Hauptnavigation hat den zugänglichen Namen «Hauptnavigation».
- Den alten Willkommensseiten-Test ersetzt; dieser passte nicht mehr zur App.
- Die fehlende Assertion für Zusammenfassungen in der Übersicht ergänzt.
- Karten über ihren Titel eingegrenzt; URLs und Inhalte gegen die zugehörigen
  lokalen Datensätze geprüft. Beide Tests beginnen unabhängig mit `page.goto('/')`.
- Auf feste Sleeps verzichtet; `await expect(...)` wartet auf URL und Darstellung.
- Bonus umgesetzt: `screenshot: 'only-on-failure'` in `playwright.config.ts`.
  Fehler-Screenshots landen in `test-results/`; bei erfolgreichen Tests entstehen
  keine Screenshots. Die Fehlerausgabe wurde nicht absichtlich provoziert.

### Abgleich mit dem Arbeitsblatt

| Aufgabe                 | Umsetzung                                                                                    |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| 1 – Vitest / Service    | Version prüfen; Initialzustand, Loading und Anzahl testen; kein echter HTTP-Aufruf.          |
| 2 – Komponente          | Erstellung, Titel und Klick-Event; Signal-Input über `componentRef.setInput()`.              |
| 3 – Signals / Randfälle | Drei Blogs → leeres Array; abhängiges computed(); null und undefined; kein Effect vorhanden. |
| 4 – Blog-Liste E2E      | Drei Kriterien, AI-generierter und geprüfter Test inkl. Zusammenfassungen.                   |
| 5 – Weitere Funktion    | Vier Navigationskriterien, zusätzlicher E2E-Test und Screenshot-Bonus.                       |

Die Nachbereitung erfolgt auf dem Branch `feature/kt12-testing` mit Commit,
Push und Pull Request. Die GitHub-CI wird anschliessend kontrolliert.

## Ausführung

```powershell
npm ci
npx vitest --version
npm run lint
npm run build
npm run test:ci
npx playwright install chromium
npm run e2e -- --reporter=list
```

`test:ci` führt Vitest einmalig mit Coverage aus. Lokal startet Playwright den
Angular-Entwicklungsserver selbst. Mit gesetztem `CI` wird der zuvor erstellte
Build über `serve:e2e` verwendet. Es wird ausschliesslich Chromium getestet.
Die Angular-CLI übernimmt dabei die Angular-Kompilierung und TestBed-Initialisierung
für Vitest; deshalb werden die Tests über `npm run test:ci` statt direkt mit dem
im Arbeitsblatt beispielhaft genannten `npx vitest` ausgeführt.

## Prüfprotokoll

Ausgeführt am 15.10.2026 unter Windows mit portabler Node.js-Laufzeit
v24.22.0 und npm 11.19.1. Node/npm waren zunächst nicht im PATH verfügbar;
die temporäre Laufzeit wurde von nodejs.org geladen und per SHA-256 geprüft.
Abhängigkeiten wurden unverändert mit `npm ci` installiert, Chromium über Playwright.

| Prüfung                          | Ergebnis                                                      |
| -------------------------------- | ------------------------------------------------------------- |
| `npm run lint`                   | Bestanden, keine Lintfehler.                                  |
| `npm run build`                  | Bestanden, Produktionsbuild; initiales Bundle 439,47 kB.      |
| `npm run test:ci`                | Bestanden: 4 Testdateien, 12 Tests (9 neue und 3 bestehende). |
| `npm run e2e -- --reporter=list` | Bestanden: 2 Tests in Chromium, 2 Worker, 5,2 Sekunden.       |

Nach dem Abgleich mit dem vollständigen Arbeitsblatt wurden alle vier Prüfungen
erneut ausgeführt. `npx vitest --version` bestätigt Vitest 4.1.8.
Der erste Wiederholungslauf von Build, Unit-Tests und E2E-Server scheiterte an
Sandbox-Dateirechten (`Cannot read directory "../..": Access is denied`).
Die Wiederholung ausserhalb der Sandbox bestand ohne weitere Codekorrekturen.

Vitest-Coverage der erfassten Dateien: Statements 88,52 %, Branches 80,35 %,
Functions 60 %, Lines 86,3 %. Dies ist keine vollständige App- oder E2E-Coverage.

Der erste Lintlauf meldete einen bestehenden Fehler in `blog.model.ts`:
`consistent-type-definitions` verlangt ein Interface. Die Deklaration wurde
von `type Blog` auf `interface Blog` umgestellt, ohne Laufzeitverhalten zu ändern.
Anschliessend wurden Lint, Build und Unit-Tests erneut erfolgreich ausgeführt.

### Verbleibende Befunde

- `npm ci` meldete 31 Sicherheitsbefunde in den bestehenden Abhängigkeiten:
  2 low, 9 moderate, 17 high, 3 critical. Keine automatischen Dependency-Updates
  durchgeführt; eine Analyse und Behebung bleibt ein separater Auftrag.
- npm meldete die bestehende Deprecation von `@angular/animations` sowie Hinweise
  zu Installationsskripten. Build und Tests waren davon nicht beeinträchtigt.
- Playwright meldete eine Umgebungswarnung zu gleichzeitig gesetzten `NO_COLOR`
  und `FORCE_COLOR`. Beide Tests bestanden.
- Der neue BlogStateService ist separat getestet, aber absichtlich noch nicht in
  die bestehenden Seiten eingebunden. Die App nutzt weiterhin BlogService.
- Es wurde nur Chromium geprüft; Firefox und WebKit waren nicht Teil des Laufs.

Die lokalen Prüfergebnisse oben beziehen sich auf den Stand vor Commit und Push.
Der abschliessende GitHub-CI-Status wird im Pull Request kontrolliert.
