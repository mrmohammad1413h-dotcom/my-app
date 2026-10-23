// الخريطة التفاعلية: تصفية بالسنة والفئة، وتشغيل زمني، ولوحة للواقعة المختارة
(function () {
  var EVENTS = window.EVENTS, CATS = window.CATEGORIES, SOURCES = window.SOURCES;
  var A = function (n) { return String(n).replace(/\d/g, function (d) { return "٠١٢٣٤٥٦٧٨٩"[d]; }); };
  var SWORD = '<svg class="sword" aria-hidden="true"><use href="#sword"/></svg>';

  var map = L.map("map", { zoomControl: true, attributionControl: true }).setView([25.2, 45.5], 6);
  var osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "&copy; مساهمو OpenStreetMap" });
  var sat = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 18, attribution: "صور: Esri" });
  osm.addTo(map);
  L.control.layers({ "خريطة": osm, "صور فضائية": sat }, null, { position: "topleft" }).addTo(map);

  function srcLink(src) {
    var s = SOURCES[src.key];
    return '<a href="' + s.link.replace("{p}", src.page) + '" target="_blank" rel="noopener">' + s.title + "، " + s.short + A(src.page) + " ↗</a>";
  }
  function yearLabel(ev) { return A(ev.year) + "هـ" + (ev.approxYear ? " تقريباً" : ""); }

  function icon(ev) {
    var raid = ev.cat === "battle";
    return L.divIcon({
      className: "",
      html: raid
        ? '<div class="pin-raid' + (ev.precise ? "" : " approx") + '">' + SWORD + "</div>"
        : '<div class="pin' + (ev.precise ? "" : " approx") + '" style="background:' + CATS[ev.cat].color + '"></div>',
      iconSize: raid ? [34, 34] : [22, 22], iconAnchor: raid ? [17, 17] : [11, 11], popupAnchor: [0, -14]
    });
  }

  // لوحة الواقعة المختارة
  var panel = document.getElementById("ev-panel");
  function showPanel(ev) {
    var cat = CATS[ev.cat], raid = ev.cat === "battle";
    var h = '<div class="hd">' +
      (raid ? '<span class="ico">' + SWORD + "</span>" : '<span class="ico plain" style="--c:' + cat.color + '"><i></i></span>') +
      '<div><span class="sub">' + cat.label + " · " + yearLabel(ev) + " · " + ev.place + (ev.precise ? "" : ' <span class="apx">الموضع تقريبي</span>') + "</span>" +
      "<h2>" + ev.title + "</h2></div></div>";
    if (ev.leader) h += '<p class="ldr"><b>القائد: </b>' + ev.leader + "</p>";
    if (ev.result) h += '<p class="ldr"><b>النتيجة: </b>' + ev.result + "</p>";
    h += '<p class="txt">' + ev.text + "</p>";
    h += '<div class="ft"><span>' + srcLink(ev.src) + (ev.src.note ? " — " + ev.src.note : "") + "</span>" +
      (ev.video ? '<a href="' + ev.video + '" target="_blank" rel="noopener">▶ شاهد الفيديو</a>' : '<span class="vid">مكان الفيديو حين يُصنع</span>') + "</div>";
    panel.innerHTML = h;
  }

  var markers = {}, byId = {};
  EVENTS.forEach(function (ev) {
    byId[ev.id] = ev;
    markers[ev.id] = L.marker([ev.lat, ev.lng], { icon: icon(ev), title: ev.title, keyboard: true })
      .bindPopup("<h4>" + ev.title + "</h4>" + yearLabel(ev) + " · " + ev.place + (ev.precise ? "" : '<br><span class="apx">الموضع تقريبي</span>'), { maxWidth: 260 })
      .on("click", function () { select(ev.id, false); });
  });

  var path = L.polyline(window.JOURNEY_PATH.map(function (id) { return [byId[id].lat, byId[id].lng]; }), {
    color: CATS.journey.color, weight: 3, dashArray: "6 8", opacity: .8
  });

  var MAX = 1234, MIN = 1115;
  var state = { year: MAX, cats: {} };
  Object.keys(CATS).forEach(function (k) { state.cats[k] = true; });
  var yearInput = document.getElementById("year");
  var yearOut = document.getElementById("year-out");
  var list = document.getElementById("event-list");

  document.getElementById("map-count").textContent = A(EVENTS.length) + " واقعة · من ١١١٥ إلى ١٢٣٤هـ";

  // أزرار التصفية مع العدد
  var filters = document.getElementById("filters");
  Object.keys(CATS).forEach(function (k) {
    var n = EVENTS.filter(function (e) { return e.cat === k; }).length;
    var b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.dataset.cat = k; b.setAttribute("aria-pressed", "true");
    b.innerHTML = (k === "battle" ? SWORD : '<span class="dot" style="background:' + CATS[k].color + '"></span>') +
      CATS[k].label + ' <span class="cnt">(' + A(n) + ")</span>";
    b.addEventListener("click", function () {
      state.cats[k] = !state.cats[k];
      b.setAttribute("aria-pressed", state.cats[k] ? "true" : "false");
      render();
    });
    filters.appendChild(b);
  });

  // القائمة الجانبية
  var buttons = {};
  EVENTS.slice().sort(function (a, b) { return a.year - b.year; }).forEach(function (ev) {
    var li = document.createElement("li");
    li.dataset.id = ev.id;
    var b = document.createElement("button");
    b.type = "button";
    var raid = ev.cat === "battle";
    b.innerHTML = '<span class="y">' + A(ev.year) + 'هـ</span><span class="mk">' +
      (raid ? SWORD : '<i style="background:' + CATS[ev.cat].color + '"></i>') + "</span>" +
      '<span class="tx"><span class="tt">' + ev.title + '</span><span class="pl">' + ev.place +
      (ev.leader ? " · القائد: " + ev.leader : "") + (ev.precise ? "" : '<br><span class="apx">الموضع تقريبي</span>') + "</span></span>";
    b.addEventListener("click", function () { select(ev.id, true); });
    buttons[ev.id] = b;
    li.appendChild(b);
    list.appendChild(li);
  });

  function select(id, fly) {
    var ev = byId[id];
    if (state.year < ev.year) setYear(ev.year);
    if (!state.cats[ev.cat]) { state.cats[ev.cat] = true; filters.querySelector('[data-cat="' + ev.cat + '"]').setAttribute("aria-pressed", "true"); render(); }
    if (fly) map.flyTo([ev.lat, ev.lng], Math.max(map.getZoom(), 8), { duration: .8 });
    markers[id].openPopup();
    showPanel(ev);
    Object.keys(buttons).forEach(function (k) { buttons[k].classList.toggle("active", k === id); });
    var aside = list.parentNode, li = buttons[id].parentNode;
    if (aside.scrollHeight > aside.clientHeight) aside.scrollTop = li.offsetTop - aside.clientHeight / 3;
    if (fly && window.innerWidth < 860) document.getElementById("map").scrollIntoView({ behavior: "smooth" });
  }

  function render() {
    EVENTS.forEach(function (ev) {
      var show = ev.year <= state.year && state.cats[ev.cat];
      var m = markers[ev.id];
      if (show && !map.hasLayer(m)) m.addTo(map);
      if (!show && map.hasLayer(m)) map.removeLayer(m);
      var li = list.querySelector('[data-id="' + ev.id + '"]');
      if (li) li.classList.toggle("hidden", !show);
    });
    if (state.cats.journey && !map.hasLayer(path)) path.addTo(map);
    if (!state.cats.journey && map.hasLayer(path)) map.removeLayer(path);
    yearOut.textContent = A(state.year) + "هـ";
  }

  function setYear(y) { state.year = y; yearInput.value = y; render(); }
  yearInput.addEventListener("input", function () { stop(); setYear(+yearInput.value); });

  var timer = null;
  var playBtn = document.getElementById("play");
  function stop() { if (timer) { clearInterval(timer); timer = null; playBtn.textContent = "▶"; playBtn.setAttribute("aria-label", "تشغيل"); } }
  playBtn.addEventListener("click", function () {
    if (timer) return stop();
    if (state.year >= MAX) setYear(MIN);
    playBtn.textContent = "❚❚";
    playBtn.setAttribute("aria-label", "إيقاف");
    timer = setInterval(function () {
      if (state.year >= MAX) return stop();
      setYear(state.year + 1);
      var current = EVENTS.filter(function (e) { return e.year === state.year && state.cats[e.cat]; });
      if (current.length) {
        var last = current[current.length - 1];
        map.panTo([last.lat, last.lng]);
        markers[last.id].openPopup();
        showPanel(last);
      }
    }, 450);
  });

  var legend = L.control({ position: "bottomleft" });
  legend.onAdd = function () {
    var d = L.DomUtil.create("div", "map-legend");
    d.innerHTML = Object.keys(CATS).map(function (k) {
      return '<div><span style="display:inline-block;width:10px;height:10px;transform:rotate(45deg);background:' + CATS[k].color + ';margin-left:8px"></span>' + CATS[k].label + "</div>";
    }).join("") + '<div style="opacity:.8">الإطار المتقطع: موضع تقريبي</div>';
    return d;
  };
  legend.addTo(map);

  render();
  var hash = decodeURIComponent(location.hash.slice(1));
  if (hash && byId[hash]) {
    map.setView([byId[hash].lat, byId[hash].lng], 8);
    select(hash, false);
  } else {
    showPanel(byId.diriyah);
  }
})();
