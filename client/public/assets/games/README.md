# Game assets (optional)

This folder is reserved for **sprites, textures, and audio** you add locally (e.g. from [Kenney.nl](https://kenney.nl/), OpenGameArt, itch.io).

Suggested layout:

```
public/assets/games/
  characters/
  cars/
  candies/
  bubbles/
  dice/
  backgrounds/
  sounds/
```

The current build uses **canvas gradients, SVG (Dice), and CSS** so the portal works without downloading packs. Drop PNG/WebP/OGG files here and load them with `new Image()` or `<audio>` when you add custom art.
