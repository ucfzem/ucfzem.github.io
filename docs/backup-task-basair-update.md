# Backup Task — Update works item 27 to "بصائر"

Date: 2026-11-03
Repo: ucfzem/ucfzem.github.io
Branch: main
File touched: works/index.html (single line only)

## Objective
Update the unlocked link-tree entry at index 27 to:
- Name/Title: بصائر
- URL: https://ucfzem.github.io/basair02/
- Icon: ./assets/basair02.svg (existing)

## Exact change
Before:
    { emoji: "📖", name: "موسوعة بصائر", tag: "Apologetics", icon: "./assets/basair02.svg", url: "https://ucfzem.github.io/basair02/", newTab: true },

After:
    { emoji: "📖", name: "بصائر", tag: "Apologetics", icon: "./assets/basair02.svg", url: "https://ucfzem.github.io/basair02/", newTab: true },

## Safety verification
- `diff` before/after shows exactly ONE changed line (698).
- Items 1–26 remain byte-identical.
- Items 28 and 29 remain byte-identical.
- Total entries in the `maktaba` (unlocked) array: 29 (unchanged).
- No other file was modified.

## Note (no action taken)
Item 29 still exists as "بصائر ٠٢" pointing to the same URL
(https://ucfzem.github.io/basair02/). Per the instruction not to touch other
items, it was left intact. Ask if you want it removed or repurposed.

## Links
- Link tree: https://ucfzem.github.io/works/
- Item:      https://ucfzem.github.io/basair02/
- Backup:    https://github.com/ucfzem/ucfzem.github.io/blob/main/docs/backup-task-basair-update.md
