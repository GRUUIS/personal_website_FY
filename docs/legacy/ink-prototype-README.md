# SplatoonInkPrototype

A Unity prototype exploring Splatoon-style ink shooting, surface painting, swimming, and wall traversal.

This is an early gameplay and rendering prototype. The goal is to validate the core loop first: fire ink projectiles, paint walkable surfaces, sample friendly ink for movement, and iterate toward a thicker, glossy, liquid-like ink presentation.

## Unity Version

- Unity `2022.3.35f1c1`
- Target scene: `Assets/Scenes/SampleScene.unity`

## Current Features

- Procedural prototype arena with configurable inkable floor and wall.

## Controls

- `WASD`: move
- `Mouse`: rotate camera
- `Mouse Wheel`: zoom camera
- `Left Mouse`: fire ink
- `Left Shift`: swim on friendly ink
- `Space`: jump, wall jump, or mantle near the top of an inked wall

Ink firing is disabled while swimming.


## Tuning In Inspector

- `PrototypeSceneBootstrap`
  - Floor size, wall size, wall placement, player spawn, and default scene setup.

- `InkGameplaySurface`
  - Paint-map density, max texture size, ink radius, splat clusters, directional trails, splatter, drips, and height behavior.

- `InkSurfaceVisual`
  - RenderTexture presentation, blur radius, metaball threshold, feathering, smoothness, height strength, and highlight strength.

- `InkWeaponEmitter`
  - Projectile speed, gravity, lifetime, fire cadence, radius, range, and visual feedback.

- `PrototypePlayerController`
  - Ground movement, jump tuning, swim speed, wall stick distance, wall climb speed, wall jump, and mantle behavior.


## Known Limitations

- Ink visual quality still needs polish toward thicker, smoother, more reflective liquid. Graphics...
- Very large surfaces are bounded by max texture size, so future chunked or tiled paint maps will be needed.
- Floor and wall painting are currently per-surface, not a full arbitrary-mesh multi-face system.
- Wall back-face painting and separate per-face ink layers are not nicely implemented.
- The prototype scene is generated and serialized heavily, so Unity scene diffs can be large.

The output is kinda disappointing. I should learn from these 2 repos:
https://github.com/jeb495/Unity-Splatoon-Demo
https://github.com/mixandjam/Splatoon-Ink

