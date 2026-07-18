# Phase 4 & 5: Complete Resort Expansion Pack

## 📋 Overview

This implementation adds a comprehensive resort expansion system to Shoreline Sanctuary, including placeable functional items, environmental decorations, sand art installations, and seagull encounter mechanics with full accessibility-first audio design.

## 🎮 Crafting Items Added

### 🏖️ Resort Tab - Placeable Items

#### 1. **Beach Umbrella** ☂️
- **Cost**: 2 Driftwood + 3 Hemp Thread + 1 Teal Sea Glass
- **Function**: Provides shade zones for Snappy the Sea Turtle and beach crabs
- **Audio**: Canvas air displacement sweep (120 Hz → 45 Hz) with rain texture overlay
- **Benefits**: Increases Snappy happiness when placed nearby

#### 2. **Picnic Basket** 🧺
- **Cost**: 4 Hemp Thread + 1 Driftwood + 2 Sea Rose Petals
- **Function**: Primary anchor for Winged Bandit (Seagull Snatch) event loop
- **Audio**: Wicker creaking friction with wooden peg toggle closure
- **Mechanics**: Triggers seagull encounters; can trade Coconut Milk for rare items

#### 3. **Beach Bag** 👜
- **Cost**: 5 Hemp Thread + 2 Barnacled Wood + 1 Green Sea Glass
- **Function**: Permanent mobile inventory extension (+10 slots)
- **Audio**: Heavy canvas duck cloth dragging with item shift thumps
- **Benefits**: Expanded carrying capacity for longer beachcombing sessions

#### 4. **Inflatable Rubber Raft** ⛵
- **Cost**: 4 Beach Balls + 2 Recycled Rubber Strips + 1 Driftwood
- **Function**: Permanently unlocks Shifting Sandbars exploration zone
- **Audio**: Air-pump hand inflation cycles with rope knot friction squeaks
- **Mechanics**: Unlocks new areas and open-water exploration
- **Defense Loop**: Sandbar trampoline event with seagull interactions

### ✨ Meditative Tab - Ambient Decorations

#### 5. **Coastal Salt Lamp** 🔥
- **Cost**: 3 Soothing Sea Salt + 1 Driftwood Base + 1 Luminous Sea-Goo
- **Function**: Decorative piece emitting soothing peach-orange glow
- **Audio**: Hardwood sanding friction + mineral placement chink + living firefly jar pulse
- **Visual**: Jagged pink salt crystal bonded to dark driftwood platform
- **Mechanics**: Multi-layered placement audio with accessibility focus

#### 6. **Woven Sun Hat** 👒
- **Cost**: 6 Seaweed Fronds + 2 Sea Rose Petals + 1 Shiny Soda Tab
- **Function**: Cosmetic accessory; expands evening horizon window by 5 real-world minutes
- **Audio**: Straw weaving + leaf band wrap + metal buckle clink
- **Benefits**: Extended beachcombing time before nightfall

### 🏖️ Sand Art Installations

#### 7. **Sunset Shoreline Sand Art**
- **Cost**: 2 Soothing Sea Salt + 2 Sea Rose Petals + 1 Amber Sea Glass
- **Effect**: Alternating Apricot & Pink Sand blocks
- **Visual**: Casts permanent golden-hour environment color shader overlay
- **Benefit**: Beautifies local blanket areas

#### 8. **Sub-Aquatic Sandbar Sand Art**
- **Cost**: 3 Teal Sea Glass + 1 Soothing Sea Salt + 1 Barnacled Wood
- **Effect**: Teal Sand with ripple wave layer in glass
- **Benefit**: Attracts following sandbar crabs
- **Mechanic**: Generates dynamic crab encounter zones

#### 9. **Legendary Tide-Pool Glimmer** ⭐
- **Cost**: 2 Sea Rose Petals + 2 Teal Sea Glass + 1 Silver Pearl + 1 Blue Sea Glass
- **Effect**: Fine wavy sand lines with sparkling dust
- **Audio**: Musical chime ambient loop unlocks
- **Benefit**: Highest rarity sand art; unlocks special audio ambience

## 🔧 Technical Implementation

### Files Updated/Created

#### Core Game State (`lib/store.tsx`)
- Added resort placement tracking:
  - `placeduUmbrella`, `placedPicnicBasket`, `placedBeachBag`, `placedRaft`, `placedSaltLamp`
- Added interaction metrics:
  - `wearingSunHat`, `seagullFriendship`, `snappyHappiness`, `sandArtCreated[]`
- New actions:
  - `placeUmbrella()`, `placePicnicBasket()`, `placeBeachBag()`, `placeRaft()`, `placeSaltLamp()`
  - `equipSunHat()`, `createSandArt()`, `tradeWithSeagull()`, `increaseSnappyHappiness()`

#### Items Definition (`lib/items.ts`)
- Added 6 resort items (category: `"resort"`)
- Added 3 sand art output items
- Added 3 seagull trade reward items
- Category type expanded: `"shell" | "glass" | "pearl" | "raw" | "trash" | "special" | "food" | "resort"`

#### Recipes (`lib/recipes.ts`)
- `RESORT_RECIPES`: 3 placeable items (umbrella, basket, bag)
- `INFLATABLE_RECIPES`: 1 raft with unlocking mechanics
- `MEDITATIVE_RECIPES`: 2 items (lamp, hat)
- `SAND_ART_RECIPES`: 3 sand art installations with varying rarity

#### Workshop Component (`components/Workshop.tsx`)
- New tabs: 🏖️ **Resort** and ✨ **Meditative**
- New `PlaceableRecipeCard` component for placement-based items
- Horizontal scrolling tab bar for mobile support
- Color-coded tabs: cyan for resort, rose for meditative

#### Media Library (`lib/media.ts`)
- Added 10 resort audio SFX references (hosted URLs ready for CDN)
- Audio files include accessibility-focused sound design
- Placeholder paths for deployment integration

#### Audio Synthesis (`scripts/generate_resort_audio.py`)
- Python script for generating all resort item audio
- Native libraries only: `wave`, `math`, `struct`, `random`
- 44.1 kHz, 16-bit mono WAV output
- Includes functions for:
  - `make_umbrella()` - Canvas sweep + rain
  - `make_picnic()` - Wicker + latch
  - `make_beach_bag()` - Canvas drag + thuds
  - `make_raft_inflate()` - Air pump + rope + chime
  - `make_lamp_*()` - Sanding, crystal, firefly hum
  - `make_hat_*()` - Straw weave, band wrap, buckle clink

### State Management Pattern

All resort actions follow the established pattern:
```typescript
const placeUmbrella = () => {
  const cost = [{ itemId: "resort-umbrella", count: 1 }];
  if (!hasEnough(cost)) return false;
  setState((s) => {
    const inv = deductCost({ ...s.inventory }, cost);
    return { ...s, inventory: inv, placeduUmbrella: true };
  });
  play("umbrellaWhoof");
  toast("Beach Umbrella placed! Snappy loves the shade ☂️");
  return true;
};
```

## 🎵 Audio Design Philosophy

All sound effects follow accessibility-first principles:

1. **Tactile Feedback**: Each interaction produces distinct audio cues
2. **Frequency Separation**: Sounds occupy different frequency bands for clarity
3. **Narrative Audio**: Sound design tells a story (e.g., umbrella opening progression)
4. **Screen Reader Friendly**: Audio supplements visual feedback, not replaces it
5. **Customizable**: Master audio settings apply to all resort sounds

### Audio Specifications
- **Sample Rate**: 44.1 kHz
- **Bit Depth**: 16-bit mono
- **Formats**: WAV (native synthesis), MP3 (CDN hosted)
- **Duration**: 0.3s - 2.0s per sound
- **Accessibility**: High-contrast frequency profiles for clarity

## 🐚 Quest Integration Points

### Message in a Bottle Letters (Phase 5)

#### Letter 1: Oliver's Picnic Basket Panic
- **Objective**: Place Picnic Basket + trade Coconut Milk to seagull
- **Rewards**: Rare Blueprint: Vintage Beach Blanket + 5x Polished Teal Sea Glass

#### Letter 2: Marina's Snappy Sunscreen Alternative
- **Objective**: Craft Beach Umbrella + place next to Snappy
- **Rewards**: Snappy's Blessing (increases local crab happiness) + 1x Sparkling Golden Pearl

#### Letter 3: Captain Vance's Lost Luggage Mystery
- **Objective**: Locate buried Beach Bag in Lighthouse Lookout dunes
- **Rewards**: Permanent Mobile Inventory Extension (+10 Slots) + 12x Shiny Soda Tabs

## 🦅 Seagull Event Loops

### Encounter 1: The Picnic Basket Swoop
**Trigger**: Unlatched picnic basket with food items
- **Dialogue**: Cheeky Seagull negotiation
- **Option A - Trade**: Give Coconut Milk → Receive [Lost Key / Shiny Soda Tab / Rare Sea Glass]
- **Option B - Shoo**: Wave hand → Seagull departs peacefully
- **Audio**: Seagull squawks translated to comical thoughts (screen reader compatible)

### Encounter 2: Snappy's Defensive Response
**Trigger**: Picnic Basket placed next to Snappy
- **Context**: Seagull attempts heist while Snappy awakens
- **Outcome A - Success**: Seagull startled, trips, drops item; Snappy happiness +15
- **Outcome B - Delay**: Seagull succeeds; Snappy misses intervention
- **Audio**: Slow-motion turtle defense sounds mixed with seagull panic

### Defense Loop: Floating Trampoline
**Trigger**: Unanchored raft left near sandbars
- **Mechanic**: Seagulls bounce on inflatable
- **Option A - Feed**: Toss Kelp Chip snack → Birds depart peacefully
- **Option B - Splash**: Gentle water spray startles seagulls
- **Option C - Ignore**: Bird pulls air valve → Raft deflates comically
- **Recovery**: Raft auto-returns to workshop; 2-second re-inflate (no materials)

## 🌊 Sandbox & Open Water Mechanics

### Raft Unlock
- Placing inflatable raft opens **Shifting Sandbars** zone
- New collection pools for rare items
- Seagull encounter frequency increases
- Sand art installations attract creatures

### Sandbars Features
- Dynamic sand formations
- Crab following behavior (with Sand Art)
- Tide pool reflections (Tide-Pool Glimmer)
- Hidden treasure spawn points

## 📦 Data Persistence

All resort state saves to localStorage:
- Placement status (boolean flags)
- Happiness/friendship counters (numbers)
- Sand art completions (string array)
- Inventory items (record of item counts)

Example save structure:
```json
{
  "placeduUmbrella": true,
  "placedPicnicBasket": true,
  "placedBeachBag": true,
  "placedRaft": false,
  "placedSaltLamp": true,
  "wearingSunHat": false,
  "seagullFriendship": 25,
  "snappyHappiness": 50,
  "sandArtCreated": ["sand-art-sunset", "sand-art-sandbar"]
}
```

## 🎨 Visual Design Notes

### Reference Images
Your uploaded images (IMG_0167-IMG_0175.png) should inform:
- **Umbrella**: Storybook canvas panels (teal + cream alternating bands on driftwood center)
- **Picnic Basket**: Double-lidded golden sea oat weave with red-white checkered cloth
- **Beach Bag**: Mint-green canvas tote with cream vertical stripes, visible vials
- **Raft**: Bright inflatable material with rope handles and visible inflation valve
- **Salt Lamp**: Jagged pink crystal on dark circular driftwood base, warm glow
- **Sun Hat**: Wide-brimmed golden straw with sea rose petal band and metal buckle

## 🚀 Deployment Checklist

- [ ] Run `python scripts/generate_resort_audio.py` to generate WAV files
- [ ] Upload generated audio files to CDN (update URLs in `lib/media.ts`)
- [ ] Test placement mechanics on all device sizes
- [ ] Verify audio plays correctly in Safari/iOS
- [ ] Update seagull encounter dialogue with sound effects
- [ ] Create Message in a Bottle quest entries
- [ ] Add sand art visual effects (shader overlays)
- [ ] Implement seagull NPC animations
- [ ] Test localStorage persistence across sessions
- [ ] Accessibility audit: screen reader compatibility

## 📝 Next Steps

1. **Phase 5 Full Implementation**:
   - Message in a Bottle quest system integration
   - Seagull NPC character and dialogue system
   - Sand art visual shader effects
   - Floating sandbars open-water zone

2. **Visual Polish**:
   - Placeable item 3D/SVG assets
   - Seagull character animations
   - Sand art visual overlays
   - Raft animation states

3. **Audio Enhancement**:
   - Deploy generated audio files to CDN
   - Add ambient loops for salt lamp
   - Create seagull vocalizations
   - Implement sound fade transitions

4. **Mobile Optimization**:
   - Touch gesture support for item placement
   - Haptic feedback integration
   - Landscape/portrait layout adjustments

## 📚 References

- **Design Document**: Shoreline Addons.pdf
- **Audio Guide**: Seagull Asset Design Guide.pdf
- **Reference Images**: IMG_0167-IMG_0175.png
- **Original Audio Synthesis**: Unified Audio Synthesis Library (Python) in design doc

---

**Status**: ✅ Core Phase 4 features implemented
**Branch**: `feat/phase4-resort-expansion`
**Ready for**: Message in a Bottle integration, seagull encounters, visual effects
