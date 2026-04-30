(() => {
  'use strict';

  const COLOR_PRESETS = {
    blue:       { accent: 'rgba(61,  90,  254, 1)', glow: 'rgba(61,  90,  254, 0.3)' },
    lightblue:  { accent: 'rgba(3,   169, 244, 1)', glow: 'rgba(3,   169, 244, 0.3)' },
    teal:       { accent: 'rgba(0,   150, 136, 1)', glow: 'rgba(0,   150, 136, 0.3)' },
    green:      { accent: 'rgba(76,  175, 80,  1)', glow: 'rgba(76,  175, 80,  0.3)' },
    lightgreen: { accent: 'rgba(139, 195, 74,  1)', glow: 'rgba(139, 195, 74,  0.3)' },
    yellow:     { accent: 'rgba(255, 193, 7,   1)', glow: 'rgba(255, 193, 7,   0.3)' },
    orange:     { accent: 'rgba(255, 152, 0,   1)', glow: 'rgba(255, 152, 0,   0.3)' },
    red:        { accent: 'rgba(244, 67,  54,  1)', glow: 'rgba(244, 67,  54,  0.3)' },
    pink:       { accent: 'rgba(233, 30,  99,  1)', glow: 'rgba(233, 30,  99,  0.3)' },
    purple:     { accent: 'rgba(156, 39,  176, 1)', glow: 'rgba(156, 39,  176, 0.3)' },
    grey:       { accent: 'rgba(158, 158, 158, 1)', glow: 'rgba(158, 158, 158, 0.3)' },
  };

  class ApplianceStatusCard extends HTMLElement {
    constructor() {
      super();
      this._config = null;
      this._hass   = null;
      this.attachShadow({ mode: 'open' });
    }

    setConfig(config) {
      if (!config.name) throw new Error('appliance-status-card: "name" is required');
      if (!config.icon) throw new Error('appliance-status-card: "icon" is required');
      this._config = config;
      this._render();
    }

    set hass(hass) {
      this._hass = hass;
      this._render();
    }

    _state(entityId) {
      if (!entityId || !this._hass) return null;
      return this._hass.states[entityId]?.state ?? null;
    }

    _display(entityId, fallback = '—') {
      const val = this._state(entityId) ?? fallback;
      return val.charAt(0).toUpperCase() + val.slice(1);
    }

    _colors() {
      const tpl = this._config.card_template;
      if (COLOR_PRESETS[tpl]) return COLOR_PRESETS[tpl];
      // Treat as a raw CSS color value — derive glow by wrapping in color-mix or just use opacity
      const color = tpl || 'rgba(61,90,254,1)';
      return { accent: color, glow: `color-mix(in srgb, ${color} 30%, transparent)` };
    }

    _render() {
      if (!this._config) return;

      const cfg    = this._config;
      const colors = this._colors();

      const rawProgress = parseFloat(this._state(cfg.progress_entity)) || 0;
      const progress    = Math.min(100, Math.max(0, rawProgress));

      const timeVal   = cfg.time_entity   ? this._display(cfg.time_entity,   '') : '';
      const centerVal = cfg.center_entity ? this._display(cfg.center_entity, '') : '';
      const infoItems = Array.isArray(cfg.info) ? cfg.info : [];

      const infoRowsHtml = infoItems.map(item => {
        const raw = item.entity ? (this._state(item.entity) ?? '—') : (item.value ?? '—');
        const mapped = item.state_map?.[raw] ?? raw;
        const val = mapped.charAt(0).toUpperCase() + mapped.slice(1);
        return `
          <div class="info-row">
            <span class="info-label">${item.label ?? ''}</span>
            <span class="info-value">${val}</span>
          </div>`;
      }).join('');

      this.shadowRoot.innerHTML = `
        <style>
          *, *::before, *::after { box-sizing: border-box; }

          :host {
            display: block;
            --clr-accent: ${colors.accent};
            --clr-glow:   ${colors.glow};
          }

          ha-card {
            --ha-card-padding: 0;
            background:    var(--card-background-color);
            border-radius: var(--ha-card-border-radius, 12px);
            border:        var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color, rgba(255,255,255,0.08)));
            box-shadow:    var(--ha-card-box-shadow, var(--material-shadow-elevation-2));
            overflow:      hidden;
          }

          .inner {
            padding:        16px 16px 16px 0;
            display:        flex;
            flex-direction: column;
            min-height:     ${cfg.card_height ?? 204}px;
            box-sizing:     border-box;
          }

          /* ── Header ── */
          .header {
            display:         flex;
            justify-content: space-between;
            align-items:     baseline;
            margin-bottom:   12px;
            padding-left:    16px;
            flex-shrink:     0;
          }
          .name {
            font-size:   18px;
            font-weight: 600;
            color:       var(--primary-text-color);
            line-height: 1.2;
          }
          .time {
            flex-shrink:          0;
            padding-left:         8px;
            font-size:            16px;
            font-weight:          700;
            color:                var(--clr-accent);
            font-variant-numeric: tabular-nums;
            letter-spacing:       0.02em;
          }

          /* ── Body ── */
          .body {
            display:     flex;
            flex:        1 1 0;
            align-items: stretch;
            min-height:  0;
          }

          /* ── Left column: icon ── */
          .left-col {
            flex:            0 0 auto;
            display:         flex;
            flex-direction:  column;
            align-items:     center;
            justify-content: center;
            gap:             6px;
            padding-left:    0;
            padding-right:   5px;
          }
          ha-icon.appliance-icon {
            --mdc-icon-size: ${cfg.icon_size ?? 64}px;
            color:  var(--clr-accent);
            filter: drop-shadow(0 0 10px var(--clr-glow));
          }
          .center-label {
            font-size:     12px;
            font-weight:   500;
            color:         var(--secondary-text-color);
            text-align:    center;
            white-space:   nowrap;
            overflow:      hidden;
            text-overflow: ellipsis;
            max-width:     100%;
          }

          /* ── Right column: info panel ── */
          .right-col {
            flex:            1 1 0;
            display:         flex;
            flex-direction:  column;
            justify-content: space-between;
            min-width:       0;
            background:      rgba(255,255,255,0.04);
            border-radius:   8px;
            padding:         10px 12px;
            gap:             8px;
          }

          /* ── Progress bar ── */
          .progress-section {
            display:        flex;
            flex-direction: column;
            gap:            5px;
            flex-shrink:    0;
          }
          .progress-header {
            display:         flex;
            justify-content: space-between;
            align-items:     baseline;
          }
          .progress-title {
            font-size:      10px;
            font-weight:    500;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color:          var(--secondary-text-color);
          }
          .progress-pct {
            font-size:            11px;
            font-weight:          700;
            color:                var(--clr-accent);
            font-variant-numeric: tabular-nums;
          }
          .progress-track {
            width:         100%;
            height:        6px;
            background:    rgba(255,255,255,0.10);
            border-radius: 3px;
            overflow:      hidden;
          }
          .progress-fill {
            height:        100%;
            width:         ${progress}%;
            background:    var(--clr-accent);
            border-radius: 3px;
            box-shadow:    0 0 6px var(--clr-glow);
            transition:    width 0.7s ease;
          }

          /* ── Divider ── */
          .divider {
            height:      1px;
            background:  rgba(255,255,255,0.07);
            flex-shrink: 0;
            margin:      4px 0;
          }

          /* ── Info rows ── */
          .info-rows {
            display:         flex;
            flex-direction:  column;
            gap:             6px;
            flex:            1 1 0;
            justify-content: center;
            min-height:      0;
          }
          .info-row {
            display:     flex;
            align-items: baseline;
            gap:         16px;
            min-width:   0;
          }
          .info-label {
            font-size:      10px;
            font-weight:    500;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color:          var(--secondary-text-color);
            flex-shrink:    0;
            min-width:      52px;
          }
          .info-value {
            font-size:     13px;
            font-weight:   600;
            color:         var(--primary-text-color);
            white-space:   nowrap;
            overflow:      hidden;
            text-overflow: ellipsis;
            min-width:     0;
          }
        </style>

        <ha-card>
          <div class="inner">
          <div class="header">
            <span class="name">${cfg.name}</span>
            ${timeVal ? `<span class="time">${timeVal}</span>` : ''}
          </div>

          <div class="body">
            <div class="left-col">
              <ha-icon class="appliance-icon" icon="${cfg.icon}"></ha-icon>
              ${centerVal ? `<span class="center-label">${centerVal}</span>` : ''}
            </div>

            <div class="right-col">
              ${cfg.progress_entity ? `
                <div class="progress-section">
                  <div class="progress-header">
                    <span class="progress-title">Progress</span>
                    <span class="progress-pct">${progress}%</span>
                  </div>
                  <div class="progress-track">
                    <div class="progress-fill"></div>
                  </div>
                </div>
                ${infoRowsHtml ? '<div class="divider"></div>' : ''}
              ` : ''}

              ${infoRowsHtml ? `<div class="info-rows">${infoRowsHtml}</div>` : ''}
            </div>
          </div>
          </div>
        </ha-card>
      `;
    }

    static getConfigElement() {
      return document.createElement('appliance-status-card-editor');
    }

    static getStubConfig() {
      return {
        type:            'custom:appliance-status-card',
        name:            'Washing Machine',
        icon:            'mdi:washing-machine',
        card_template:   'blue',
        progress_entity: '',
        time_entity:     '',
        center_entity:   '',
        info: [
          { label: 'State', entity: '' },
          { label: 'Job',   entity: '' },
        ],
      };
    }
  }

  customElements.define('appliance-status-card', ApplianceStatusCard);

  window.customCards = window.customCards || [];
  window.customCards.push({
    type:        'appliance-status-card',
    name:        'Appliance Status Card',
    description: 'Appliance monitor with progress bar, icon, and status rows.',
    preview:     true,
  });
})();
