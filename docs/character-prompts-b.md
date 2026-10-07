# Character generation B: Bolt, Moss, Ember, Cloud

Date: 2026-10-08 (Asia/Seoul)

## Provenance

- Generator: built-in `image_gen.imagegen`, one independent call per character.
- `transparent_background: true` on every call.
- Style source: visually inspected `assets/sprites/commitchi.png`; no image was passed as an edit target or compositing source.
- Selected outputs copied unchanged into `assets/sprites/`. Generated originals remain in place.
- No crop, pixel editing, palette quantization, or resizing was applied. Python/Pillow was used only for read-only metadata inspection.

## Shared prompt

```text
Use case: stylized-concept. Asset type: single transparent PNG mascot sprite for the Commitchi pixel pet game. Create ONE character only. Style: authentic very low resolution 48x48-ish pixel art visibly enlarged, crisp regular chunky square pixel blocks and perfectly horizontal/vertical stair-step edges, thick deep navy pixel outline, flat limited palette of 8 to 12 solid colors maximum. Match a cute retro virtual-pet sprite language. No gradients, no glossy rendering, no soft edges, no antialiasing look, no shadows, no texture. Composition: single centered character, full body entirely visible, character occupies 70 to 80 percent of square canvas in its longest dimension, modest transparent margin. Genuine alpha transparency everywhere outside character. No scenery, floor, background, frame, text, lettering, signature, watermark, sparkles, extra objects, or drop shadow. This is a NEW mascot anatomically distinct from a round yellow bunny chick.
```

## bolt

- Output: `assets/sprites/bolt.png`

The exact submitted prompt is the shared prompt above, followed by:

```text
Subject: A friendly boxy MINT ROBOT. Distinct separate square head and smaller square body, exactly one short central antenna with square tip, short rectangular arms, two broad rectangular feet. Flat mint green and pale aqua metal panels, navy face screen with two large friendly pixel eyes. Absolutely no ears, no beak, no round chick anatomy.
```

## moss

- Output: `assets/sprites/moss.png`

The exact submitted prompt is the shared prompt above, followed by:

```text
Subject: A GREEN SPROUT TURTLE facing LEFT in a side-three-quarter view. Very wide low horizontal body, round segmented green shell, four clearly distinguishable stubby legs, a tiny two-leaf sprout growing from top of shell, big visible friendly face and large eye on protruding turtle head at left. Anatomically a turtle, never bipedal. No ears, no wings, no beak.
```

## ember

- Output: `assets/sprites/ember.png`

The exact submitted prompt is the shared prompt above, followed by:

```text
Subject: An ORANGE AND RED LITTLE FLAME SPIRIT. Jagged asymmetrical flame silhouette with one tall curling flame point and smaller lateral flame points; warm orange exterior, golden small inner flame area. Two tiny charcoal mitten hands and two tiny charcoal feet. Mischievous smirking face and large friendly eyes. Body consists entirely of a flame shape. No ears, beak, wings, or animal anatomy.
```

## cloud

- Output: `assets/sprites/cloud.png`

The exact submitted prompt is the shared prompt above, followed by:

```text
Subject: A WHITE AND SKY BLUE FLUFFY CLOUD SPRITE. Broad horizontal scalloped block-cloud silhouette made of three round-but-stair-stepped cloud lobes. Exactly THREE little blue raindrop-shaped dangling legs beneath the cloud, sleepy closed eyes as navy pixel chevrons and tiny relaxed mouth. White main mass, pale blue flat underside. No ears, no arms, no animal or chick anatomy.
```

## Verification and limits

All four destination files were opened and visually inspected after copying. Each is a 1254 × 1254 RGBA PNG with alpha extrema 0–255. Each depicts one complete, anatomically distinct character with navy stair-step outlines and no lettering or backdrop. Bolt has a square head/body and one antenna; Moss has a segmented shell, sprout, friendly side face and four distinguishable stubby legs; Ember has a jagged flame body and charcoal hands/feet; Cloud has closed eyes and three dangling raindrop legs.

The prompt requested a 48×48-like visual grid, not an actual 48×48 export. Outputs retain generated high resolution and subtle within-block tonal variation: they are not validated as strict 8–12-color indexed sprites. The nonzero-alpha bounding boxes occupy about 90.0% (Bolt), 98.9% (Moss), 95.8% (Ember), and 92.5% (Cloud) of the longest canvas dimension, exceeding the requested 70–80% target. This measurement includes low-opacity edge pixels. No postprocessing was performed to conceal these limitations.

| Asset | SHA-256 |
| --- | --- |
| bolt.png | `ab980e1e0336a4da375c861441c0f604bc191a10444c972cba7005bead6a6de7` |
| moss.png | `38d3a2ad370a29b926d771f4020962b658a9d763dbec88ec7d6583306217c1bb` |
| ember.png | `3099caa415c7b0e87a82508200674dfe2d96e920525113b13312c7d554d695d9` |
| cloud.png | `726b8fd6896f1789e155387aa8c02e1d221ecbe8011346537789cf37d0a6f600` |
