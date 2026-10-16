// الرئيسية: سلسلة الأئمة (من imams.js) وشريط الوقائع (من events.js)
(function () {
  var A = window.arDigits, C = window.CHAIN, G = window.GENERATIONS;

  // ———— سلسلة الأئمة ————
  var box = document.getElementById("chain");
  if (box && window.IMAMS) {
    var pct = function (y) { return ((y - C.min) / (C.max - C.min)) * 100; };
    var years = [1100, 1150, 1200, 1250, 1300, 1350, 1400, 1440];
    var grid = years.map(function (y) { return '<span class="chain-grid" style="right:' + pct(y) + '%"></span>'; }).join("");
    var h = '<div class="chain-row head"><span></span><div class="chain-ticks">' +
      years.map(function (y) { return '<span style="right:' + pct(y) + '%">' + A(y) + "هـ</span>"; }).join("") + "</div></div>";
    h += '<div class="chain-list">';
    window.IMAMS.forEach(function (m) {
      var c = G[m.gen].color;
      var label = (m.approx ? "نحو " : "") + A(m.born) + "–" + A(m.died) + "هـ" + (m.approxDeath ? " تقريباً" : "");
      h += '<a class="chain-row chain-item" href="imams/' + m.file + '">' +
        '<span class="chain-born">' + (m.approx ? "~" : "") + A(m.born) + "</span>" +
        '<span class="chain-dot"><i class="' + (m.approx ? "approx" : "") + '" style="background:' + c + ";color:" + c + '"></i></span>' +
        '<span class="chain-who"><span class="chain-name">' + (m.short || m.name) + '</span><span class="chain-meta">' + (G[m.gen].short || G[m.gen].label) + " · " + label + "</span></span>" +
        '<span class="chain-track">' + grid +
        '<span class="chain-bar' + (m.approx ? " approx" : "") + '" style="right:' + pct(m.born) + "%;width:" + (pct(m.died) - pct(m.born)) + "%;background:" + c + ";color:" + c + '"></span></span></a>';
    });
    h += '<div class="chain-fall chain-row"><span></span><span style="position:relative;display:block"><span style="right:' + pct(C.fall) + '%"></span></span></div>';
    h += "</div>";
    h += '<div class="chain-row chain-fall-label"><span></span><span style="position:relative;display:block"><span style="right:' + pct(C.fall) + '%">سقوط الدرعية ' + A(C.fall) + "هـ</span></span></div>";
    h += '<div class="chain-legend">' + Object.keys(G).map(function (k) {
      return '<span><i style="background:' + G[k].color + '"></i>' + G[k].label + "</span>";
    }).join("") + '<span><i style="border:2px dashed ' + G[1].color + '"></i>سنة تقريبية</span></div>';
    box.innerHTML = h;
  }

  // ———— شريط الوقائع ————
  var strip = document.getElementById("raids");
  if (strip && window.EVENTS) {
    var MIN = 1112, MAX = 1237;
    var ep = function (y) { return ((y - MIN) / (MAX - MIN)) * 100; };
    var seen = {}, s = '<span class="axis-line"></span>';
    window.EVENTS.slice().sort(function (a, b) { return a.year - b.year; }).forEach(function (e) {
      var raid = e.cat === "battle";
      var k = e.year + (raid ? "b" : "o");
      var i = seen[k] = (seen[k] === undefined ? 0 : seen[k] + 1);
      var top = raid ? 44 - i * 24 : 88 + i * 16;
      s += '<span class="ev" style="top:' + top + "px;right:" + ep(e.year) + '%">' +
        (raid ? '<svg class="sword"><use href="#sword"/></svg>' : "<i></i>") + "</span>";
    });
    [1115, 1150, 1179, 1206, 1234].forEach(function (y) {
      s += '<span class="tick" style="right:' + ep(y) + '%">' + A(y) + "هـ</span>";
    });
    strip.innerHTML = s;
  }
})();
