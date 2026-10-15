// تبديل الوضع الليلي، وقائمة الجوال، والحواشي الجانبية، وموضع الإمام في السلسلة
(function () {
  var root = document.documentElement;
  try {
    var saved = localStorage.getItem("theme");
    if (saved) root.setAttribute("data-theme", saved);
  } catch (e) {}

  function isDark() {
    var t = root.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  // الحواشي الجانبية: تُنسخ كل إحالة إلى عمود بجانب الفقرة التي توثّقها،
  // وتبقى قائمة المصادر في آخر الصفحة كما هي (وهي التي تظهر على الشاشات الصغيرة).
  function sideNotes() {
    var art = document.querySelector(".article");
    if (!art) return;
    art.querySelectorAll("section").forEach(function (sec) {
      if (sec.querySelector("ol.refs")) return;
      Array.prototype.slice.call(sec.children).forEach(function (block) {
        if (/^H[1-6]$/.test(block.tagName)) return;
        var links = block.querySelectorAll('sup.ref a[href^="#r"]');
        if (!links.length) return;
        var ids = [], labels = {};
        links.forEach(function (a) {
          var id = a.getAttribute("href").slice(1);
          if (ids.indexOf(id) < 0) { ids.push(id); labels[id] = a.textContent; }
        });
        var aside = document.createElement("aside");
        aside.className = "sn";
        aside.setAttribute("aria-label", "حواشي هذه الفقرة");
        ids.forEach(function (id) {
          var li = document.getElementById(id);
          if (!li) return;
          var p = document.createElement("p");
          p.innerHTML = '<span class="n">' + labels[id] + "</span>" + li.innerHTML;
          aside.appendChild(p);
        });
        var row = document.createElement("div");
        row.className = "sn-row";
        block.parentNode.insertBefore(row, block);
        row.appendChild(block);
        row.appendChild(aside);
      });
    });
  }

  // موضع الإمام في سلسلة الأئمة، في رأس صفحته
  function lineage() {
    if (!window.IMAMS) return;
    var hero = document.querySelector(".page-hero .facts");
    if (!hero) return;
    var file = location.pathname.split("/").pop();
    var m = window.IMAMS.filter(function (x) { return x.file === file; })[0];
    if (!m) return;
    var C = window.CHAIN, A = window.arDigits;
    var pct = function (y) { return ((y - C.min) / (C.max - C.min)) * 100; };
    var d = document.createElement("div");
    d.className = "lineage";
    d.innerHTML =
      '<span class="cap">موضعه في سلسلة الأئمة</span>' +
      '<div class="track" aria-hidden="true"><span class="base"></span>' +
      '<span class="life" style="right:' + pct(m.born) + "%;width:" + (pct(m.died) - pct(m.born)) + "%;background:" + window.GENERATIONS[m.gen].color + '"></span>' +
      '<span class="fall" style="right:' + pct(C.fall) + '%"></span></div>' +
      '<div class="scale"><span>' + A(C.min) + "هـ</span><b>" + A(C.fall) + "هـ سقوط الدرعية</b><span>" + A(C.max) + "هـ</span></div>";
    hero.parentNode.insertBefore(d, hero.nextSibling);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var themeBtn = document.querySelector(".theme-toggle");
    if (themeBtn) {
      var sync = function () { themeBtn.textContent = isDark() ? "☀" : "☾"; };
      sync();
      themeBtn.addEventListener("click", function () {
        var next = isDark() ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try { localStorage.setItem("theme", next); } catch (e) {}
        sync();
      });
    }

    var menuBtn = document.querySelector(".menu-btn");
    var nav = document.querySelector(".nav");
    if (menuBtn && nav) {
      menuBtn.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    lineage();
    sideNotes();
  });
})();
