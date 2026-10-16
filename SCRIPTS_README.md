# Adding scripts for new inventory

The page reads hand-written scripts from `scripts.json` (`scripts` → stock number → 3 variants).
Each variant is `{"shot": "...", "script": "..."}`. The page shows variant `(3-day period index) mod 3`
(periods start 2026-10-12 ET), so each car rotates through its 3 scripts every 9 days.

Cars in inventory with no entry in `scripts.json` still get an auto-generated script and show a red
**needs script** badge on their card.

To add a car:
1. Take the stock number and facts from inventory (data.json): year/make/model/trim, color/interior,
   miles, price (if listed), drive, fuel, EV battery health/range/chemistry, Carfax (owners, accidents, service records).
2. Write 3 scripts, 70-85 words each (~30 s), enthusiastic, each with a different hook, angle and CTA
   (story, question, price/value, "who it's for", vs new, walkaround, light humor). Use only facts from the data.
   Don't mention price if it isn't listed, and only say "no accidents" when the Carfax shows none.
3. Give each script its own shot line.
4. Add under `"scripts"` in scripts.json, keyed by the stock number as a string, then commit and push.
   The live site updates within ~1-2 minutes. Sold cars can stay in the file (they're ignored).
