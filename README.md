# Appliance Status Card

A custom Home Assistant Lovelace card for monitoring appliance status. Displays a large appliance icon alongside a progress bar and configurable status rows — designed to sit alongside the [Dynamic Room Card Minimalist](https://github.com/peterlgray/dynamic-room-card-minimalist) at the same card height.

## Features

- Large appliance icon with accent colour glow
- Optional sub-label beneath the icon (e.g. current cycle name)
- Horizontal progress bar with percentage readout
- Up to N status rows with label/value pairs
- `state_map` support to convert raw entity states into human-readable text
- Configurable accent colour — use a preset name or any CSS colour value
- Configurable card height to match other cards on the same row
- Configurable icon size
- All state values automatically capitalised

---

## Installation

### Manual

1. Copy `appliance-status-card.js` into your `config/www/` folder.
2. In Home Assistant go to **Settings → Dashboards → Resources**.
3. Click **Add Resource** and enter:
   - URL: `/local/appliance-status-card.js?v=1`
   - Resource type: **JavaScript Module**
4. Click **Create**.
5. Hard-refresh your browser (`Cmd+Shift+R` / `Ctrl+Shift+R`).

### Updating the card

After replacing the JS file with a newer version:

1. Go to **Settings → Dashboards → Resources**.
2. Edit the appliance-status-card entry and increment the version number (e.g. `?v=1` → `?v=2`).
3. Hard-refresh your browser.

No Home Assistant restart is required.

---

## Configuration

### Top-level options

| Key               | Type    | Required | Default | Description |
|-------------------|---------|----------|---------|-------------|
| `type`            | string  | Yes      | —       | Must be `custom:appliance-status-card` |
| `name`            | string  | Yes      | —       | Card title displayed top-left |
| `icon`            | string  | Yes      | —       | MDI icon for the appliance (e.g. `mdi:washing-machine`) |
| `card_template`   | string  | No       | `blue`  | Accent colour — preset name or any CSS colour value |
| `icon_size`       | number  | No       | `64`    | Icon size in pixels |
| `card_height`     | number  | No       | `204`   | Minimum card height in pixels |
| `progress_entity` | string  | No       | —       | Entity ID whose state is a number 0–100 (shown as progress bar) |
| `time_entity`     | string  | No       | —       | Entity ID displayed top-right in accent colour (e.g. time remaining) |
| `center_entity`   | string  | No       | —       | Entity ID displayed as a small label beneath the icon |
| `info`            | list    | No       | —       | List of status rows shown in the right panel (see below) |

### `info` item options

| Key         | Type   | Required | Description |
|-------------|--------|----------|-------------|
| `label`     | string | No       | Row label displayed in small caps |
| `entity`    | string | No       | Entity ID to read the value from |
| `value`     | string | No       | Static value to display (used if `entity` is omitted) |
| `state_map` | map    | No       | Maps raw entity state strings to display strings (see below) |

### `state_map`

Use `state_map` to convert raw HA state values into friendlier text. Keys are the raw state strings (case-sensitive), values are what will be displayed.

```yaml
state_map:
  'off': OK
  'on': Fill
```

### Colour presets

The following named presets are available for `card_template`:

| Name         | Colour       |
|--------------|--------------|
| `blue`       | Indigo blue  |
| `lightblue`  | Sky blue     |
| `teal`       | Teal         |
| `green`      | Green        |
| `lightgreen` | Light green  |
| `yellow`     | Amber        |
| `orange`     | Orange       |
| `red`        | Red          |
| `pink`       | Pink         |
| `purple`     | Purple       |
| `grey`       | Grey         |

Any CSS colour value can also be used directly:

```yaml
card_template: '#e91e63'
card_template: 'rgb(0, 200, 150)'
card_template: 'hsl(270, 60%, 50%)'
```

---

## Examples

### Washing machine with progress and state rows

```yaml
type: custom:appliance-status-card
name: Washer/Dryer
icon: mdi:washing-machine
icon_size: 80
card_template: blue
card_height: 235
progress_entity: sensor.washer_percent_remaining
time_entity: sensor.washer_time_remaining
center_entity: sensor.washer_job_state
info:
  - label: State
    entity: sensor.washer_machine_state
  - label: Job
    entity: sensor.washer_job_state
  - label: Lock
    entity: binary_sensor.washer_child_lock
```

### Dishwasher with state_map for consumables

```yaml
type: custom:appliance-status-card
name: Dishwasher
icon: mdi:dishwasher
icon_size: 80
card_template: teal
card_height: 235
progress_entity: sensor.dishwasher_percent_remaining
time_entity: sensor.dishwasher_minutes_remaining
center_entity: sensor.dishwasher_door
info:
  - label: State
    entity: sensor.dishwasher_operation_state
  - label: Door
    entity: sensor.dishwasher_door
  - label: Rinse Aid
    entity: sensor.dishwasher_rinse_aid_nearly_empty
    state_map:
      'off': OK
      'on': Fill
  - label: Salt
    entity: sensor.dishwasher_salt_nearly_empty
    state_map:
      'off': OK
      'on': Fill
```

### Side-by-side cards using horizontal-stack

```yaml
type: horizontal-stack
cards:
  - type: custom:appliance-status-card
    name: Washer/Dryer
    icon: mdi:washing-machine
    icon_size: 80
    card_template: blue
    card_height: 235
    progress_entity: sensor.washer_percent_remaining
    time_entity: sensor.washer_time_remaining
    center_entity: sensor.washer_job_state
    info:
      - label: State
        entity: sensor.washer_machine_state
      - label: Job
        entity: sensor.washer_job_state
      - label: Lock
        entity: binary_sensor.washer_child_lock
  - type: custom:appliance-status-card
    name: Dishwasher
    icon: mdi:dishwasher
    icon_size: 80
    card_template: teal
    card_height: 235
    progress_entity: sensor.dishwasher_percent_remaining
    time_entity: sensor.dishwasher_minutes_remaining
    center_entity: sensor.dishwasher_door
    info:
      - label: State
        entity: sensor.dishwasher_operation_state
      - label: Door
        entity: sensor.dishwasher_door
      - label: Rinse Aid
        entity: sensor.dishwasher_rinse_aid_nearly_empty
        state_map:
          'off': OK
          'on': Fill
      - label: Salt
        entity: sensor.dishwasher_salt_nearly_empty
        state_map:
          'off': OK
          'on': Fill
```

### Minimal card (icon and name only)

```yaml
type: custom:appliance-status-card
name: Dryer
icon: mdi:tumble-dryer
card_template: orange
```

### Custom accent colour

```yaml
type: custom:appliance-status-card
name: Coffee Machine
icon: mdi:coffee-maker
card_template: '#6d4c41'
info:
  - label: Status
    entity: sensor.coffee_machine_state
```

---

## Card layout

```
┌─────────────────────────────────────────┐
│ Name                          Time Left │  ← header
├──────────┬──────────────────────────────┤
│          │ PROGRESS              75%    │
│  [Icon]  │ ████████████░░░░░░░░░░░░░░  │
│          │ ─────────────────────────── │
│  label   │ STATE    Running            │
│          │ PROGRAM  Cotton 60°         │
│          │ DOOR     Closed             │
└──────────┴──────────────────────────────┘
```

- **Left column**: appliance icon with accent glow + optional sub-label
- **Right panel**: progress bar at top, divider, then status rows
- All entity state values are automatically capitalised
- `state_map` values override the raw state before capitalisation

---

## Notes

- `progress_entity` expects a numeric state between `0` and `100`. Values outside this range are clamped automatically.
- `time_entity` is displayed as-is (no formatting is applied) — use a template sensor if you need a specific format such as `1:23`.
- The card responds to live entity updates from Home Assistant — no polling or manual refresh required.
- The card registers itself in `window.customCards` so it appears in the Lovelace card picker.
