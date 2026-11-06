import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  WORLD_GEOJSON_URL,
  ISLAND_GROUPS,
  getCountryIso3,
  getCountryName,
  getCountryColor,
  getAdmin1Url
} from "./data/mapSources.js";
import "./style.css";

const app = document.querySelector("#app");

const state = {
  map: null,
  worldLayer: null,
  provinceLayer: null,
  selectedCountry: null,
  selectedCountryLayer: null,
  selectedProvince: null,
  gameStarted: false,
  menuOpen: false,
  countryMeta: new Map(),
  countryFeatures: []
};

const moneyFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

app.innerHTML = `
  <header class="topbar">
    <a class="brand" href="#" aria-label="World Leader trang chủ">
      <span class="brand-mark">WL</span>
      <span class="brand-copy"><strong>WORLD LEADER</strong><small>GLOBAL STRATEGY</small></span>
    </a>
    <div class="resource-strip" id="resource-strip" hidden>
      <div class="resource-item"><span class="resource-icon money-icon">$</span><span><small>TIỀN</small><strong id="money-value">— USD</strong></span></div>
      <div class="resource-item"><span class="resource-icon food-icon">✳</span><span><small>LƯƠNG THỰC</small><strong id="food-value">— tấn</strong></span></div>
      <div class="resource-item"><span class="resource-icon oil-icon">◒</span><span><small>DẦU</small><strong id="oil-value">— thùng</strong></span></div>
      <div class="resource-item"><span class="resource-icon uranium-icon">◎</span><span><small>URANIUM</small><strong id="uranium-value">— kg</strong></span></div>
      <div class="resource-item date-resource"><span class="resource-icon date-icon">▦</span><span><small>THỜI GIAN · X2</small><strong id="date-value">DD/MM/YYYY</strong></span></div>
    </div>
    <div class="header-actions">
      <div class="menu-wrap">
        <button class="menu-trigger" id="menu-trigger" aria-expanded="false" aria-controls="main-menu">
          <span class="menu-lines"><i></i><i></i><i></i></span><span>MENU</span><span class="chevron">⌄</span>
        </button>
        <nav class="menu-dropdown" id="main-menu" hidden aria-label="Menu chính">
          <div class="menu-heading">QUẢN LÝ QUỐC GIA</div>
          <button class="menu-option" data-menu="Chính trị"><span>♙</span>Chính trị<small>Giai đoạn sau</small></button>
          <button class="menu-option" data-menu="Kinh tế"><span>▥</span>Kinh tế<small>Giai đoạn sau</small></button>
          <button class="menu-option" data-menu="Quân sự"><span>⬡</span>Quân sự<small>Giai đoạn sau</small></button>
          <button class="menu-option" data-menu="Ngoại giao"><span>⇄</span>Ngoại giao<small>Giai đoạn sau</small></button>
          <button class="menu-option" data-menu="Công nghệ"><span>⌘</span>Công nghệ<small>Giai đoạn sau</small></button>
          <div class="menu-divider"></div>
          <button class="menu-option" data-menu="Cài đặt"><span>⚙</span>Cài đặt<small>Giai đoạn sau</small></button>
        </nav>
      </div>
    </div>
  </header>

  <main class="workspace">
    <section class="map-section">
      <div class="map-heading">
        <div><span class="eyebrow" id="map-eyebrow">BẢN ĐỒ CHÍNH TRỊ</span><h1 id="map-title">Thế giới</h1></div>
        <div class="map-tools">
          <button class="map-tool" id="reset-view" title="Đưa bản đồ về toàn thế giới" aria-label="Đưa bản đồ về toàn thế giới">⌂</button>
          <button class="map-tool" id="zoom-in" title="Phóng to" aria-label="Phóng to">+</button>
          <button class="map-tool" id="zoom-out" title="Thu nhỏ" aria-label="Thu nhỏ">−</button>
        </div>
      </div>
      <div class="map-frame">
        <div id="world-map" role="application" aria-label="Bản đồ thế giới tương tác"></div>
        <div class="map-legend"><span class="legend-dot"></span><span id="map-hint">Chọn một quốc gia để xem thông tin</span></div>
        <div class="map-loading" id="map-loading"><span class="spinner"></span><span>Đang tải dữ liệu bản đồ…</span></div>
      </div>
      <div class="map-footer"><span><i class="status-dot"></i> BẢN ĐỒ TƯƠNG TÁC</span><span>Cuộn để thu phóng · Kéo để di chuyển</span></div>
    </section>

    <aside class="info-panel" id="info-panel" aria-live="polite">
      <div class="empty-state" id="empty-state">
        <div class="empty-globe">◎</div>
        <span class="eyebrow">BẮT ĐẦU HÀNH TRÌNH</span>
        <h2>Chọn quốc gia</h2>
        <p>Nhấn vào một quốc gia trên bản đồ để xem thông tin và lựa chọn quốc gia bạn muốn lãnh đạo.</p>
        <div class="empty-tip"><span>✦</span> Bạn có thể chọn bất kỳ quốc gia nào trên thế giới.</div>
      </div>
      <div class="country-details" id="country-details" hidden></div>
      <div class="province-details" id="province-details" hidden></div>
    </aside>
  </main>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
  <footer class="app-footer"><span>WORLD LEADER <b>·</b> EARLY DEVELOPMENT</span><span>GIAI ĐOẠN 1 · GIAO DIỆN & BẢN ĐỒ</span></footer>
`;

const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("visible"), 2600);
}

function getIso2(properties = {}) {
  return properties["ISO3166-1-Alpha-2"] || properties.ISO_A2 || properties.ISO3166_1_Alpha_2 || properties.iso_a2 || "";
}

function getCountryStyle(feature) {
  const iso = getCountryIso3(feature.properties);
  const name = getCountryName(feature.properties);
  const selected = state.selectedCountry?.iso3 === iso;
  return {
    color: selected ? "#263b58" : "#ffffff",
    weight: selected ? 2.4 : 0.85,
    opacity: 1,
    fillColor: getCountryColor(iso, name),
    fillOpacity: selected ? 0.96 : 0.83
  };
}

function showCountryPanel(country) {
  $("#empty-state").hidden = true;
  $("#province-details").hidden = true;
  const panel = $("#country-details");
  panel.hidden = false;
  const meta = state.countryMeta.get(country.iso3) || {};
  const capital = meta.capital?.[0] || "Chưa có dữ liệu";
  const region = meta.region || country.properties.CONTINENT || "—";
  const flag = meta.flags?.svg
    ? `<img class="country-flag" src="${escapeHtml(meta.flags.svg)}" alt="Quốc kỳ ${escapeHtml(country.name)}" />`
    : `<div class="flag-placeholder">${escapeHtml(country.iso3.slice(0, 3))}</div>`;

  panel.innerHTML = `
    <div class="panel-topline"><span class="eyebrow">THÔNG TIN QUỐC GIA</span><span class="selection-tag">ĐÃ CHỌN</span></div>
    <div class="country-identity">${flag}<div><h2>${escapeHtml(country.name)}</h2><span class="country-code">MÃ QUỐC GIA · ${escapeHtml(country.iso3 || "N/A")}</span></div></div>
    <div class="detail-grid">
      <div class="detail-card"><small>THỦ ĐÔ</small><strong>${escapeHtml(capital)}</strong></div>
      <div class="detail-card"><small>KHU VỰC</small><strong>${escapeHtml(region)}</strong></div>
      <div class="detail-card"><small>TRẠNG THÁI</small><strong>Chưa bắt đầu</strong></div>
      <div class="detail-card"><small>BẢN ĐỒ</small><strong>Tỉnh / bang</strong></div>
    </div>
    <div class="panel-note"><span>ⓘ</span><p>Bản đồ sẽ giữ nguyên vị trí. Sau khi bắt đầu, bạn có thể phóng to quốc gia và chọn từng tỉnh/bang.</p></div>
    <button class="primary-button" id="start-game">Chọn quốc gia này <span>→</span></button>
    <button class="text-button" id="clear-selection">Bỏ chọn quốc gia</button>
  `;

  $("#start-game").addEventListener("click", startGame);
  $("#clear-selection").addEventListener("click", clearCountrySelection);
}

function selectCountry(feature, layer) {
  if (state.gameStarted) return;
  const iso3 = getCountryIso3(feature.properties);
  const name = getCountryName(feature.properties);
  if (!iso3) {
    showToast("Khu vực này chưa có mã quốc gia hợp lệ.");
    return;
  }
  state.selectedCountry = { iso3, name, properties: feature.properties };
  state.selectedCountryLayer = layer;
  state.worldLayer?.setStyle(getCountryStyle);
  showCountryPanel({ iso3, name, properties: feature.properties });

  const iso2 = getIso2(feature.properties);
  if (iso2) {
    fetch(`https://restcountries.com/v3.1/alpha/${encodeURIComponent(iso2)}?fields=capital,region,flags`)
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (data && state.selectedCountry?.iso3 === iso3) {
          state.countryMeta.set(iso3, Array.isArray(data) ? data[0] : data);
          showCountryPanel(state.selectedCountry);
        }
      })
      .catch(() => {});
  }
}

function clearCountrySelection() {
  state.selectedCountry = null;
  state.selectedCountryLayer = null;
  state.worldLayer?.setStyle(getCountryStyle);
  $("#country-details").hidden = true;
  $("#province-details").hidden = true;
  $("#empty-state").hidden = false;
}

function addIslandOverlays() {
  ISLAND_GROUPS.forEach((island) => {
    const polygon = L.polygon(island.coordinates.map(([lng, lat]) => [lat, lng]), {
      color: "#b77b32",
      weight: 1.6,
      fillColor: "#e6b75e",
      fillOpacity: 0.65,
      dashArray: "4 3"
    }).addTo(state.map);
    polygon.bindTooltip(island.shortName, { permanent: true, direction: "center", className: "island-label" });
    polygon.on("click", () => showIslandPanel(island));
  });
}

function showIslandPanel(island) {
  $("#empty-state").hidden = true;
  $("#country-details").hidden = true;
  const panel = $("#province-details");
  panel.hidden = false;
  panel.innerHTML = `
    <div class="panel-topline"><span class="eyebrow">THÔNG TIN ĐỊA LÝ</span><span class="selection-tag">ĐÃ CHỌN</span></div>
    <div class="province-symbol">⌖</div>
    <h2>${escapeHtml(island.name)}</h2>
    <p class="province-description">Khu vực quần đảo được biểu diễn bằng một đa giác chung trên bản đồ chiến lược.</p>
    <div class="panel-note"><span>ⓘ</span><p>Đường bao hiện tại là hình minh họa để định vị và tương tác, không phải ranh giới pháp lý hoặc bản đồ đo đạc chi tiết.</p></div>
    <button class="text-button" id="close-island-info">Đóng thông tin</button>
  `;
  $("#close-island-info").addEventListener("click", () => {
    panel.hidden = true;
    $("#empty-state").hidden = false;
  });
}

async function fetchAdmin1(iso3) {
  const response = await fetch(getAdmin1Url(iso3));
  if (!response.ok) throw new Error("Không tìm thấy dữ liệu tỉnh/bang.");
  const payload = await response.json();
  const metadata = Array.isArray(payload) ? payload[0] : payload;
  if (!metadata?.gjDownloadURL) throw new Error("Nguồn dữ liệu không cung cấp bản đồ tỉnh/bang.");
  const geoResponse = await fetch(metadata.gjDownloadURL);
  if (!geoResponse.ok) throw new Error("Không thể tải dữ liệu hình học tỉnh/bang.");
  return geoResponse.json();
}

function provinceName(properties = {}) {
  return properties.shapeName || properties.NAME_1 || properties.name || properties.NAME || properties.ADM1_EN || "Tỉnh / bang";
}

function showProvincePanel(feature) {
  const name = provinceName(feature.properties);
  state.selectedProvince = name;
  $("#country-details").hidden = true;
  $("#empty-state").hidden = true;
  const panel = $("#province-details");
  panel.hidden = false;
  const parent = state.selectedCountry?.name || "—";
  const code = feature.properties.shapeISO || feature.properties.HASC_1 || "—";
  panel.innerHTML = `
    <div class="panel-topline"><span class="eyebrow">THÔNG TIN TỈNH / BANG</span><span class="selection-tag">ĐÃ CHỌN</span></div>
    <div class="province-symbol">⌖</div>
    <h2>${escapeHtml(name)}</h2>
    <p class="province-country">${escapeHtml(parent)}</p>
    <div class="detail-grid">
      <div class="detail-card"><small>MÃ KHU VỰC</small><strong>${escapeHtml(code)}</strong></div>
      <div class="detail-card"><small>CẤP HÀNH CHÍNH</small><strong>ADM1</strong></div>
    </div>
    <div class="panel-note"><span>ⓘ</span><p>Đây là thông tin địa lý nền. Dữ liệu dân số, kinh tế và các chỉ số quản lý sẽ được bổ sung ở những giai đoạn phù hợp.</p></div>
    <button class="text-button" id="close-province-info">Đóng thông tin</button>
  `;
  $("#close-province-info").addEventListener("click", () => {
    panel.hidden = true;
    $("#empty-state").hidden = false;
  });
}

async function startGame() {
  if (!state.selectedCountry || state.gameStarted) return;
  state.gameStarted = true;
  $("#resource-strip").hidden = false;
  $("#map-eyebrow").textContent = "LÃNH THỔ QUỐC GIA";
  $("#map-title").textContent = state.selectedCountry.name;
  $("#map-hint").textContent = "Chọn một tỉnh / bang để xem thông tin";
  $("#start-game").disabled = true;
  $("#start-game").textContent = "Đang tải bản đồ tỉnh / bang…";
  try {
    const admin1 = await fetchAdmin1(state.selectedCountry.iso3);
    state.provinceLayer?.remove();
    state.provinceLayer = L.geoJSON(admin1, {
      style: {
        color: "#ffffff",
        weight: 1.25,
        opacity: 1,
        fillColor: "#6e9cba",
        fillOpacity: 0.78
      },
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(provinceName(feature.properties), { sticky: true, className: "province-tooltip" });
        layer.on("click", () => showProvincePanel(feature));
      }
    }).addTo(state.map);

    const bounds = state.provinceLayer.getBounds();
    if (bounds.isValid()) state.map.fitBounds(bounds, { padding: [34, 34], maxZoom: 6, animate: true });
    $("#country-details").hidden = true;
    $("#empty-state").hidden = false;
    $("#empty-state").innerHTML = `
      <div class="empty-globe">⌖</div>
      <span class="eyebrow">ĐÃ CHỌN QUỐC GIA</span>
      <h2>${escapeHtml(state.selectedCountry.name)}</h2>
      <p>Bản đồ tỉnh/bang đã sẵn sàng. Chọn một khu vực trên bản đồ để xem thông tin.</p>
      <div class="empty-tip"><span>✦</span> Dùng con lăn chuột hoặc nút +/- để phóng to, thu nhỏ.</div>
    `;
    showToast("Đã tải bản đồ tỉnh/bang.");
  } catch (error) {
    state.gameStarted = false;
    $("#resource-strip").hidden = true;
    $("#start-game").disabled = false;
    $("#start-game").innerHTML = 'Thử tải lại bản đồ <span>→</span>';
    showToast(error.message || "Không thể tải bản đồ tỉnh/bang. Vui lòng thử lại.");
  }
}

function setupMenu() {
  const trigger = $("#menu-trigger");
  const menu = $("#main-menu");
  trigger.addEventListener("click", () => {
    state.menuOpen = !state.menuOpen;
    menu.hidden = !state.menuOpen;
    trigger.setAttribute("aria-expanded", String(state.menuOpen));
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".menu-wrap")) {
      state.menuOpen = false;
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    }
  });
  menu.querySelectorAll("[data-menu]").forEach((button) => {
    button.addEventListener("click", () => {
      showToast(`${button.dataset.menu}: chức năng sẽ được phát triển ở giai đoạn tương ứng.`);
      menu.hidden = true;
      state.menuOpen = false;
      trigger.setAttribute("aria-expanded", "false");
    });
  });
}

async function loadWorld() {
  $("#map-loading").classList.remove("hidden");
  try {
    const response = await fetch(WORLD_GEOJSON_URL);
    if (!response.ok) throw new Error("Không thể kết nối nguồn dữ liệu bản đồ thế giới.");
    const geojson = await response.json();
    state.countryFeatures = geojson.features || [];
    state.worldLayer = L.geoJSON(geojson, {
      style: getCountryStyle,
      onEachFeature: (feature, layer) => {
        layer.on("mouseover", () => {
          if (!state.gameStarted && state.selectedCountry?.iso3 !== getCountryIso3(feature.properties)) {
            layer.setStyle({ weight: 1.6, color: "#536b82", fillOpacity: 0.96 });
          }
        });
        layer.on("mouseout", () => state.worldLayer?.resetStyle(layer));
        layer.on("click", () => selectCountry(feature, layer));
        layer.bindTooltip(getCountryName(feature.properties), { sticky: true, className: "country-tooltip" });
      }
    }).addTo(state.map);
    addIslandOverlays();
    $("#map-loading").classList.add("hidden");
  } catch (error) {
    $("#map-loading").innerHTML = `<span class="error-mark">!</span><span>${escapeHtml(error.message)}<br/>Hãy tải lại trang hoặc kiểm tra kết nối mạng.</span>`;
    showToast("Không tải được bản đồ thế giới.");
  }
}

function initMap() {
  state.map = L.map("world-map", {
    zoomControl: false,
    attributionControl: true,
    worldCopyJump: true,
    minZoom: 2,
    maxZoom: 9,
    zoomSnap: 0.25
  }).setView([22, 8], 2.15);

  // A light, neutral canvas keeps country colors readable.
  state.map.getContainer().style.background = "#eaf0f4";
  L.control.attribution({ position: "bottomleft", prefix: false })
    .addAttribution('Bản đồ quốc gia: <a href="https://github.com/datasets/geo-countries" target="_blank" rel="noreferrer">geo-countries</a> · Tỉnh/bang: <a href="https://www.geoboundaries.org/" target="_blank" rel="noreferrer">geoBoundaries</a>')
    .addTo(state.map);

  $("#zoom-in").addEventListener("click", () => state.map.zoomIn());
  $("#zoom-out").addEventListener("click", () => state.map.zoomOut());
  $("#reset-view").addEventListener("click", () => state.map.setView([22, 8], 2.15));
  loadWorld();
}

setupMenu();
initMap();