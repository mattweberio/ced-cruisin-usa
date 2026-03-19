# CED Cruisin' USA — Art & Music Swap Spec

All assets live in `/var/www/sandbox/ced-cruisin/`. Replace files in-place with the same filename and dimensions. The game loads from two compiled spritesheets (`images/background.png` and `images/sprites.png`) but those are built from the individual PNGs in `images/sprites/` and `images/background/`.

**To swap art**: Replace the individual PNGs in `images/sprites/` and `images/background/`, then recompile the spritesheets (or we can switch the code to load individual images directly — simpler for now).

**Format**: All sprites are PNG with transparency. Backgrounds are PNG, no transparency needed.

---

## HOW THE SPRITESHEET WORKS

The game currently loads ONE combined `images/sprites.png` (a spritesheet) and uses pixel coordinates to crop each sprite. The coordinates are defined in `game.js` under the `SPRITES` constant.

**You only need to replace the individual PNGs in `images/sprites/` and `images/background/`.**

You do NOT need to touch `sprites.png` or `background.png` (the compiled spritesheets). When you return the replaced PNGs, I will switch the code to load each image individually instead of from the spritesheet. No sprite packing tools needed on your end.

---

## PRIORITY 1: PLAYER CAR (Hero Identity)

These are the most important files. They define the car you see at the bottom of the screen.

| File | Current Size | What It Shows Now | What It Should Be |
|------|-------------|-------------------|-------------------|
| `sprites/player_straight.png` | 80x41 | Red Ferrari rear view, driving straight | **Ced's car** — blue sedan/convertible rear view, Ced visible (sunglasses, head). Straight driving pose. |
| `sprites/player_left.png` | 80x41 | Ferrari turning left | Same car, tilted/angled left |
| `sprites/player_right.png` | 80x41 | Ferrari turning right | Same car, tilted/angled right |
| `sprites/player_uphill_left.png` | 80x45 | Ferrari going uphill, turning left | Same car, slightly more of the underside visible (going uphill), turning left |
| `sprites/player_uphill_right.png` | 80x45 | Ferrari going uphill, turning right | Same car, uphill pose, turning right |
| `sprites/player_uphill_straight.png` | 80x45 | Ferrari going uphill, straight | Same car, uphill pose, driving straight |

**Key details for the car:**
- Must be 80px wide (straight) or 80px wide (uphill) — keep these exact dimensions
- Uphill variants are 45px tall (slightly taller to show more car bottom)
- Straight variants are 41px tall
- PNG with transparent background
- **Blue sedan or convertible** (not red Ferrari)
- **Ced visible**: head with sunglasses through rear window or above windshield if convertible
- Optional: Matt passenger silhouette, luggage on roof/trunk, bumper sticker
- Must read clearly at this small size — big shapes, high contrast

---

## PRIORITY 2: LANDMARK SIGNS (Biggest visual impact)

These replace the generic billboards. Each one is a roadside sign that appears on the left or right of the road.

| File | Current Size | What It Shows Now | What It Should Be |
|------|-------------|-------------------|-------------------|
| `sprites/billboard07.png` | 298x190 | Generic roadside billboard | **"CED CRUISIN' USA"** title sign |
| `sprites/billboard08.png` | 385x265 | Generic billboard | **"WELCOME TO NATIONAL PARKS"** wooden park entrance sign |
| `sprites/billboard09.png` | 328x282 | Generic billboard | **"GONE FISHING"** wooden fishing sign |
| `sprites/billboard06.png` | 298x190 | Generic billboard | **"TEE TIME AHEAD"** golf sign |
| `sprites/billboard05.png` | 298x190 | Generic billboard | **"SCENIC OVERLOOK"** viewpoint sign |
| `sprites/billboard01.png` | 300x170 | Generic billboard | **"RETIREMENT ROUTE OPEN"** highway sign |
| `sprites/billboard02.png` | 215x220 | Generic billboard | **"NO MEETINGS BEYOND THIS POINT"** fun sign |
| `sprites/billboard03.png` | 230x220 | Generic billboard | **"NATIONAL PARKS PASS ACTIVATED"** sign |
| `sprites/billboard04.png` | 268x170 | Generic billboard | **"OPEN ROAD AHEAD"** sign |

**Style notes:**
- Signs should look like real roadside signs (wooden posts, park-style brown/green, highway green/white)
- Text should be readable when the sign is roughly 100-150px on screen
- PNG with transparent background
- Keep the same pixel dimensions as the originals

---

## PRIORITY 3: ROADSIDE PROPS

These are the trees, rocks, and objects lining the road. They create the world.

| File | Current Size | What It Shows Now | What It Should Be |
|------|-------------|-------------------|-------------------|
| `sprites/palm_tree.png` | 215x540 | Palm tree | **Pine tree** (national parks vibe) |
| `sprites/tree1.png` | 360x360 | Leafy tree | **Pine/evergreen tree** variant 1 |
| `sprites/tree2.png` | 282x295 | Different leafy tree | **Pine/evergreen tree** variant 2 |
| `sprites/dead_tree1.png` | 135x332 | Dead tree | **Bare winter tree** or **wooden fence post** |
| `sprites/dead_tree2.png` | 150x260 | Dead tree variant | **Mile marker** or **trail post** |
| `sprites/boulder1.png` | 168x248 | Boulder | Keep as-is (rocks work for parks) or replace with **rock formation** |
| `sprites/boulder2.png` | 298x140 | Wide boulder | Keep as-is or replace with **overlook railing** |
| `sprites/boulder3.png` | 320x220 | Large boulder | Keep as-is or replace with **rock outcrop** |
| `sprites/bush1.png` | 240x155 | Bush | **Wildflower cluster** or keep as bush |
| `sprites/bush2.png` | 232x152 | Bush variant | **Wildflower cluster** variant or keep |
| `sprites/cactus.png` | 235x118 | Cactus | **Wildlife crossing sign** or **campground sign** |
| `sprites/stump.png` | 195x140 | Tree stump | **Wooden park bench** or keep |
| `sprites/column.png` | 200x315 | Stone column/guardrail | **Guardrail** or **wooden post** (highway zone) |

---

## PRIORITY 4: TRAFFIC VEHICLES

These are other cars/trucks on the road that act as hazards.

| File | Current Size | What It Shows Now | What It Should Be |
|------|-------------|-------------------|-------------------|
| `sprites/semi.png` | 122x144 | Semi truck (rear view) | **RV / Camper van** (rear view) — the classic road-trip hazard |
| `sprites/truck.png` | 100x78 | Pickup truck (rear view) | **Slow tourist car** or keep as truck |
| `sprites/car01.png` | 80x56 | Small car | Not currently used in CED (only semis/trucks). Can replace if wanted. |
| `sprites/car02.png` | 80x59 | Small car | Not currently used. |
| `sprites/car03.png` | 88x55 | Small car | Not currently used. |
| `sprites/car04.png` | 80x57 | Small car | Not currently used. |

---

## PRIORITY 5: BACKGROUND LAYERS (Parallax)

Three layers that scroll behind the road to create depth. They tile/scroll horizontally.

| File | Current Size | What It Shows Now | What It Should Be |
|------|-------------|-------------------|-------------------|
| `background/sky.png` | 1280x480 | Blue sky with clouds | **Sky** — could keep as-is for Zone 1. Ideally: seamless loop, brighter/cleaner blue |
| `background/hills.png` | 1280x480 | Green rolling hills silhouette | **Mountain/hill silhouette** — works for parks theme. Could add snow-capped peaks |
| `background/trees.png` | 1280x480 | Tree line silhouette (foreground) | **Forest treeline** — pine trees instead of generic deciduous |

**Important**: These tile horizontally (they scroll left/right as you steer through curves). The image should loop seamlessly at its edges. The current images are 1280px wide and wrap around.

**Compiled spritesheet**: `images/background.png` (1290x1470) is a combined version of all 3 layers. The individual layer files in `images/background/` are the source.

---

## PRIORITY 6: MUSIC

| File | Current Format | What It Is Now | What It Should Be |
|------|---------------|----------------|-------------------|
| `music/racer.mp3` | MP3, 3.5MB | Generic racing arcade music | **Upbeat road-trip instrumental** — warm, Americana, breezy guitar, laid-back groove. 15-30 second loop. Think Buffett/Allman vibes, not cheesy synth. |
| `music/racer.ogg` | OGG, 4.3MB | Same track in OGG format | Same replacement track in OGG format (or we can drop OGG and just use MP3) |

---

## PRIORITY 4B: COLLECTIBLE SPRITES (New Files — Don't Exist Yet)

These are **new image files** to create. They currently render as glowing placeholder circles (gold for stamps, cyan for memory pickups). Once you provide these PNGs, I'll wire them into the spritesheet and render system.

**Place new files in `images/sprites/`.**

| New File | Size | What It Should Be |
|----------|------|-------------------|
| `pickup_stamp.png` | ~80x80 | **Park Pass Stamp** — the primary collectible. Green/gold badge with a park/mountain icon. Should feel important, like a real national park passport stamp. Visible and exciting at small scale. |
| `pickup_camera.png` | ~60x60 | **Camera** — compact camera icon. Dark body, visible lens. Memory pickup. |
| `pickup_coffee.png` | ~50x70 | **Coffee cup** — travel coffee cup, maybe with steam. Warm brown tones. |
| `pickup_map.png` | ~70x50 | **Folded map** — tan/cream paper with a red route line. |
| `pickup_fishing.png` | ~50x60 | **Fishing lure** — colorful lure or bobber. For the fishing theme. |
| `pickup_golf.png` | ~40x40 | **Golf ball** — white dimpled ball, maybe on a tee or with a flag. |
| `pickup_blogo.png` | ~50x50 | **Company B token** — subtle company nod. Red circle with white "B" or similar. |

**Style guidance for collectibles:**
- PNG with **transparent background**
- Should be **bright and inviting** — these are rewards, not hazards
- Must read clearly at ~30-50px on screen (they scale with road perspective)
- High contrast against road/grass — use bold colors
- No fine detail that disappears at small size

**How they'll appear in-game:**
- Floating on the road surface (within the lane area)
- Subtle pulse/glow effect as you approach
- Stamps are gold-toned, memory pickups are blue-toned
- Brief text popup on collection ("worth it", "classic", "good call")
- 5 stamps total per run (primary collectible), many memory pickups scattered throughout

---

## WHAT TO LEAVE ALONE

These files don't need replacing:
- `sprites/mute.png` — mute button icon (not currently used)
- `common.js` — road engine code
- `game.js` — game logic
- `index.html` — page structure

---

## DELIVERY FORMAT

When you return the replacement files:
1. Keep the **exact same filenames**
2. Keep the **exact same pixel dimensions** (or close — I can adjust the spritesheet coordinates if sizes change slightly)
3. Use **PNG with transparent background** for all sprites
4. For music, **MP3 is sufficient** (we can drop OGG support)
5. Put replacements in the same directory paths

After you return the files, I will:
1. Rebuild the spritesheets (or switch to individual image loading)
2. Test in-game
3. Tune sizes/positions if needed

---

## QUICK REFERENCE: Current File Tree

```
images/
  background.png          ← compiled spritesheet (3 layers combined)
  background/
    sky.png               ← 1280x480, parallax sky layer
    hills.png             ← 1280x480, parallax hills layer
    trees.png             ← 1280x480, parallax trees layer
  sprites.png             ← compiled spritesheet (all sprites combined)
  sprites/
    player_straight.png   ← 80x41,  PRIORITY 1 - Ced's car
    player_left.png       ← 80x41,  PRIORITY 1
    player_right.png      ← 80x41,  PRIORITY 1
    player_uphill_*.png   ← 80x45,  PRIORITY 1 (3 files)
    billboard01-09.png    ← various, PRIORITY 2 - signs
    palm_tree.png         ← 215x540, PRIORITY 3 - roadside
    tree1.png             ← 360x360, PRIORITY 3
    tree2.png             ← 282x295, PRIORITY 3
    column.png            ← 200x315, PRIORITY 3
    boulder1-3.png        ← various, PRIORITY 3
    bush1-2.png           ← various, PRIORITY 3
    semi.png              ← 122x144, PRIORITY 4 - RV/camper
    truck.png             ← 100x78,  PRIORITY 4
    dead_tree1-2.png      ← various, PRIORITY 3
    cactus.png            ← 235x118, PRIORITY 3
    stump.png             ← 195x140, PRIORITY 3
    car01-04.png          ← various, not currently used
music/
  racer.mp3               ← PRIORITY 6 - road trip music
  racer.ogg               ← PRIORITY 6 (optional, MP3 sufficient)
```
