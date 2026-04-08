import { VariableStore } from '../../domain/entities/Variable';
import { WATCH_SVG } from './watchSvg';

// ── Explorer folder structure ─────────────────────────────────────────────

export interface ExplorerFolder {
  name:  string;
  files: string[];
}

export const EXPLORER_FOLDERS: ExplorerFolder[] = [
  { name: 'Sections', files: ['dynamic-hero.liquid', 'product-grid.liquid'] },
  { name: 'Snippets', files: ['button.liquid', 'card.liquid'] },
  { name: 'Assets',   files: ['theme.css', 'theme.js'] },
];

// ── Default file contents ─────────────────────────────────────────────────

export const DEFAULT_FILES: Record<string, string> = {
  'dynamic-hero.liquid': `<section class="lc-section" id="{{ section.id }}">
  <div class="lc-card">

    {% if section.settings.show_badge %}
      <span class="lc-badge">{{ section.settings.badge_label }}</span>
    {% endif %}

    <div class="lc-media">
      {% if section.settings.product_image != blank %}
        <img src="{{ section.settings.product_image | image_url: width: 800 }}" alt="{{ section.settings.product_title }}" />
      {% else %}
        ${WATCH_SVG}
      {% endif %}
    </div>

    <div class="lc-body">
      <p class="lc-vendor">{{ section.settings.product_vendor }}</p>
      <h2 class="lc-title">{{ section.settings.product_title }}</h2>

      <div class="lc-pricing">
        {% if section.settings.compare_price != blank %}
          <span class="lc-compare">{{ section.settings.compare_price }}</span>
        {% endif %}
        <span class="lc-price">{{ section.settings.product_price }}</span>
      </div>

      <p class="lc-description">{{ section.settings.product_description }}</p>

      {% if section.settings.product_available %}
        <button class="lc-btn-atc" id="atc-btn">{{ section.settings.atc_label }}</button>
      {% else %}
        <button class="lc-btn-atc lc-sold-out" disabled>Sold out</button>
      {% endif %}
    </div>

  </div>
</section>

{% schema %}
{
  "name": "Product Card",
  "tag": "section",
  "class": "lc-section",
  "settings": [
    { "type": "image_picker", "id": "product_image", "label": "Product Image" },
    { "type": "text",         "id": "product_vendor",      "label": "Vendor",           "default": "Tissot" },
    { "type": "text",         "id": "product_title",       "label": "Product Title",    "default": "Tissot Gentleman Powermatic 80" },
    { "type": "text",         "id": "product_price",       "label": "Price",            "default": "$595.00" },
    { "type": "text",         "id": "compare_price",       "label": "Compare Price",    "default": "$695.00" },
    { "type": "richtext",     "id": "product_description", "label": "Description",      "default": "<p>Automatic Powermatic 80 with silicon balance spring. 40mm stainless steel case, sapphire crystal, 80h power reserve.</p>" },
    { "type": "text",         "id": "atc_label",           "label": "Button Label",     "default": "Add to cart" },
    { "type": "checkbox",     "id": "product_available",   "label": "In Stock",         "default": true },
    { "type": "checkbox",     "id": "show_badge",          "label": "Show Badge",       "default": true },
    { "type": "text",         "id": "badge_label",         "label": "Badge Text",       "default": "New" }
  ],
  "presets": [{ "name": "Product Card" }]
}
{% endschema %}`,

  'product-grid.liquid': `{% comment %}
  Shopify Section — Product Grid
{% endcomment %}

<section class="lc-grid-section">
  <div class="lc-grid">
    {% for product in collections.all.products limit: 4 %}
      <div class="lc-grid-item">
        <p>{{ product.title }}</p>
      </div>
    {% endfor %}
  </div>
</section>`,

  'card.liquid': `<div class="lc-card-snippet">
  {% if card_image != blank %}
    <img src="{{ card_image }}" alt="{{ card_title }}" />
  {% endif %}
  <div class="lc-card-body">
    <h3>{{ card_title }}</h3>
    <p>{{ card_description }}</p>
  </div>
</div>`,

  'theme.css': `*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7f7f9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.lc-section { padding: 2rem; width: 100%; max-width: 380px; }

.lc-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  position: relative;
}

.lc-badge {
  position: absolute; top: 14px; left: 14px; z-index: 2;
  background: #e53935; color: #fff;
  font-size: 10px; font-weight: 700; letter-spacing: 0.6px;
  text-transform: uppercase; padding: 3px 10px; border-radius: 20px;
}

.lc-media img { width: 100%; height: 260px; object-fit: cover; display: block; }
.lc-body { padding: 1.25rem 1.25rem 1.5rem; }
.lc-vendor { font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px; color: #999; margin-bottom: 4px; }
.lc-title { font-size: 1.15rem; font-weight: 700; color: #1a202c; margin-bottom: 0.75rem; }
.lc-pricing { display: flex; align-items: center; gap: 10px; margin-bottom: 0.75rem; }
.lc-compare { font-size: 13px; color: #aaa; text-decoration: line-through; }
.lc-price { font-size: 1.25rem; font-weight: 700; color: #e53935; }
.lc-description { font-size: 13px; color: #718096; line-height: 1.6; margin-bottom: 1.25rem; }

.lc-btn-atc {
  width: 100%; padding: 0.75rem; background: #1a202c; color: #fff;
  border: none; border-radius: 10px; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: background 0.2s;
}
.lc-btn-atc:hover:not([disabled]) { background: #2d3748; }
.lc-sold-out { background: #e2e8f0; color: #a0aec0; cursor: not-allowed; }`,

  'theme.js': `document.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('atc-btn');
  if (!btn) return;

  btn.addEventListener('click', function () {
    var orig = this.textContent;
    this.textContent = 'Added!';
    this.style.background = '#38a169';

    setTimeout(function () {
      btn.textContent = orig;
      btn.style.background = '';
    }, 1500);
  });
});`,
};

export const DEFAULT_ACTIVE_FILE = 'dynamic-hero.liquid';

export const DEFAULT_VARIABLES: VariableStore = {
  values: {
    'section.settings.product_title':       'Tissot Gentleman Powermatic 80',
    'section.settings.product_vendor':      'Tissot',
    'section.settings.product_price':       '$595.00',
    'section.settings.compare_price':       '$695.00',
    'section.settings.product_image':       '',
    'section.settings.badge_label':         'New',
    'section.settings.show_badge':          'true',
    'section.settings.product_available':   'true',
    'section.settings.atc_label':           'Add to cart',
    'section.settings.product_description': 'Automatic Powermatic 80 with silicon balance spring. 40mm 316L stainless steel case, sapphire crystal, blue sunray dial and 80h power reserve.',
  },
  meta: {
    'section.settings.product_image': 'media',
  },
};
