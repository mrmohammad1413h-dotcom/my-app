// الخريطة التفاعلية: تصفية بالسنة والفئة، وتشغيل زمني
(function () {
  var EVENTS = window.EVENTS, CATS = window.CATEGORIES, SOURCES = window.SOURCES;
  var arDigits = function (n) { return String(n).replace(/\d/g, function (d) { return "٠١٢٣٤٥٦٧٨٩"[d]; }); };

  var map = L.map("map", { zoomControl: true, attributionControl: true }).setView([25.2, 45.5], 6);

  var osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18, attribution: "&copy; مساهمو OpenStreetMap"
  });
  var sat = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 18, attribution: "صور: Esri"
  });
  osm.addTo(map);
  L.control.layers({ "خريطة": osm, "صور فضائية": sat }, null, { position: "topleft" }).addTo(map);

  function srcHtml(src) {
    if (!src) return "";
    var s = SOURCES[src.key];
    var url = s.link.replace("{p}", src.page);
    return '<div class="pop-src">المصدر: <a href="' + url + '" target="_blank" rel="noopener">' + s.title + "، " + s.short + arDigits(src.page) + "</a>" +
      (src.note ? "<br>" + src.note : "") + "</div>";
  }

  function popupHtml(ev) {
    var cat = CATS[ev.cat];
    var h = '<h4>' + ev.title + "</h4>";
    h += '<div><span class="pop-year">' + arDigits(ev.year) + "هـ" + (ev.approxYear ? " تقريباً" : "") + "</span> · " + ev.place + "</div>";
    h += '<div><span class="pop-tag">' + cat.label + "</span>" + (ev.precise ? "" : '<span class="pop-tag">الموضع تقريبي</span>') + "</div>";
    if (ev.leader) h += "<div><b>القائد:</b> " + ev.leader + "</div>";
    if (ev.result) h += "<div><b>النتيجة:</b> " + ev.result + "</div>";
    h += "<p style='margin:.4em 0'>" + ev.text + "</p>";
    if (ev.video) h += '<div><a href="' + ev.video + '" target="_blank" rel="noopener">▶ شاهد الفيديو</a></div>';
    h += srcHtml(ev.src);
    return h;
  }

  function pinIcon(ev) {
    return L.divIcon({
      className: "",
      html: '<div class="pin' + (ev.precise ? "" : " approx") + '" style="background:' + CATS[ev.cat].color + '"></div>',
      iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -14]
    });
  }

  // العلامات
  var markers = {};
  EVENTS.forEach(function (ev) {
    markers[ev.id] = L.marker([ev.lat, ev.lng], { icon: pinIcon(ev), title: ev.title })
      .bindPopup(popupHtml(ev), { maxWidth: 320 });
  });

  // مسار الرحلة
  var byId = {};
  EVENTS.forEach(function (e) { byId[e.id] = e; });
  var path = L.polyline(window.JOURNEY_PATH.map(function (id) { return [byId[id].lat, byId[id].lng]; }), {
    color: CATS.journey.color, weight: 3, dashArray: "6 8", opacity: .8
  });

  // الحالة
  var state = { year: 1206, cats: { journey: true, battle: true, join: true, state: true } };
  var yearInput = document.getElementById("year");
  var yearOut = document.getElementById("year-out");
  var list = document.getElementById("event-list");

  // القائمة الجانبية
  EVENTS.slice().sort(function (a, b) { return a.year - b.year; }).forEach(function (ev) {
    var li = document.createElement("li");
    li.dataset.id = ev.id;
    var b = document.createElement("button");
    b.type = "button";
    b.style.setProperty("--c", CATS[ev.cat].color);
    b.innerHTML = '<span class="y">' + arDigits(ev.year) + "هـ</span>" + ev.title;
    b.addEventListener("click", function () {
      if (state.year < ev.year) setYear(ev.year);
      map.flyTo([ev.lat, ev.lng], Math.max(map.getZoom(), 8), { duration: .8 });
      markers[ev.id].openPopup();
      document.querySelectorAll(".event-list button.active").forEach(function (x) { x.classList.remove("active"); });
      b.classList.add("active");
      if (window.innerWidth < 860) document.getElementById("map").scrollIntoView({ behavior: "smooth" });
    });
    li.appendChild(b);
    list.appendChild(li);
  });

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
    yearOut.textContent = arDigits(state.year) + "هـ";
  }

  function setYear(y) {
    state.year = y;
    yearInput.value = y;
    render();
  }

  yearInput.addEventListener("input", function () { stop(); setYear(+yearInput.value); });

  document.querySelectorAll(".chip[data-cat]").forEach(function (chip) {
    var c = chip.dataset.cat;
    chip.querySelector(".dot").style.background = CATS[c].color;
    chip.addEventListener("click", function () {
      state.cats[c] = !state.cats[c];
      chip.setAttribute("aria-pressed", state.cats[c] ? "true" : "false");
      render();
    });
  });

  // التشغيل الزمني
  var timer = null;
  var playBtn = document.getElementById("play");
  function stop() { if (timer) { clearInterval(timer); timer = null; playBtn.textContent = "▶"; playBtn.setAttribute("aria-label", "تشغيل"); } }
  playBtn.addEventListener("click", function () {
    if (timer) return stop();
    if (state.year >= 1206) setYear(1115);
    playBtn.textContent = "❚❚";
    playBtn.setAttribute("aria-label", "إيقاف");
    timer = setInterval(function () {
      if (state.year >= 1206) return stop();
      setYear(state.year + 1);
      var current = EVENTS.filter(function (e) { return e.year === state.year && state.cats[e.cat]; });
      if (current.length) {
        var last = current[current.length - 1];
        map.panTo([last.lat, last.lng]);
        markers[last.id].openPopup();
      }
    }, 450);
  });

  // مفتاح الخريطة
  var legend = L.control({ position: "bottomleft" });
  legend.onAdd = function () {
    var d = L.DomUtil.create("div", "map-legend");
    d.innerHTML = Object.keys(CATS).map(function (k) {
      return '<div><span style="display:inline-block;width:12px;height:12px;transform:rotate(45deg);background:' + CATS[k].color + ';margin-left:6px"></span>' + CATS[k].label + "</div>";
    }).join("") + '<div style="opacity:.8">الإطار المتقطع: موضع تقريبي</div>';
    return d;
  };
  legend.addTo(map);

  // فتح واقعة من الرابط: map.html#diriyah
  var hash = decodeURIComponent(location.hash.slice(1));
  render();
  if (hash && markers[hash]) {
    var ev = byId[hash];
    map.setView([ev.lat, ev.lng], 8);
    markers[hash].openPopup();
  }
})();
