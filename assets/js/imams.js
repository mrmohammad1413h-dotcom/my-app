// بيانات الأئمة المشتركة: سلسلة الأئمة في الرئيسية، وموضع الإمام في رأس صفحته.
// السنوات من صفحات التراجم نفسها (وهي موثقة هناك). approx=true: سنة المولد تقريبية.
// died: null — لم نجد تاريخ الوفاة في المصادر (alive=false) أو الشيخ حيّ (alive=true)، فيمتد الشريط إلى آخر المقياس متلاشياً.
window.GENERATIONS = {
  1: { label: "الجيل الأول", color: "#5a2e12" },
  2: { label: "الجيل الثاني", color: "#94541f" },
  3: { label: "الجيل الثالث", color: "#c27d3e" },
  4: { label: "الجيل الرابع", color: "#6b7a3a" },
  5: { label: "الجيل الخامس: تلاميذ الشيخ محمد بن إبراهيم", short: "الجيل الخامس", color: "#2f5d6b" }
};

window.IMAMS = [
  { file: "muhammad-ibn-abdulwahhab.html", name: "شيخ الإسلام محمد بن عبد الوهاب", short: "محمد بن عبد الوهاب", born: 1115, died: 1206, gen: 1 },
  { file: "hamad-ibn-nasir-ibn-muammar.html", name: "حمد بن ناصر بن معمر", born: 1160, died: 1225, gen: 1, approx: true },
  { file: "abdullah-ibn-muhammad.html", name: "عبد الله بن محمد بن عبد الوهاب", short: "عبد الله بن محمد", born: 1165, died: 1244, gen: 1, approxDeath: true },
  { file: "abdulrahman-ibn-hasan.html", name: "عبد الرحمن بن حسن", born: 1193, died: 1285, gen: 2 },
  { file: "abdullah-aba-butayn.html", name: "عبد الله أبا بطين", born: 1194, died: 1282, gen: 2 },
  { file: "sulayman-ibn-abdullah.html", name: "سليمان بن عبد الله", born: 1200, died: 1233, gen: 2 },
  { file: "abdullatif-ibn-abdulrahman.html", name: "عبد اللطيف بن عبد الرحمن", born: 1225, died: 1293, gen: 3 },
  { file: "hamad-ibn-atiq.html", name: "حمد بن عتيق", born: 1227, died: 1301, gen: 3 },
  { file: "abdullah-ibn-abdullatif.html", name: "عبد الله بن عبد اللطيف", born: 1265, died: 1339, gen: 4 },
  { file: "saad-ibn-atiq.html", name: "سعد بن حمد بن عتيق", short: "سعد بن عتيق", born: 1268, died: 1349, gen: 4, approx: true },
  { file: "sulayman-ibn-sahman.html", name: "سليمان بن سحمان", born: 1266, died: 1349, gen: 4, approx: true },
  { file: "ishaq-ibn-abdulrahman.html", name: "إسحاق بن عبد الرحمن", born: 1276, died: 1319, gen: 3 },
  { file: "muhammad-ibn-ibrahim.html", name: "محمد بن إبراهيم آل الشيخ", born: 1311, died: 1389, gen: 4 },
  { file: "ibn-qasim.html", name: "عبد الرحمن بن محمد بن قاسم", short: "عبد الرحمن بن قاسم", born: 1312, died: 1392, gen: 5, approx: true },
  { file: "ibn-humaid.html", name: "عبد الله بن محمد بن حميد", short: "عبد الله بن حميد", born: 1329, died: 1402, gen: 5 },
  { file: "ibn-baz.html", name: "عبد العزيز بن عبد الله بن باز", short: "عبد العزيز بن باز", born: 1330, died: 1420, gen: 5 },
  { file: "al-luhaidan.html", name: "صالح بن محمد اللحيدان", short: "صالح اللحيدان", born: 1350, died: null, alive: false, gen: 5 },
  { file: "ibn-jibrin.html", name: "عبد الله بن عبد الرحمن بن جبرين", short: "عبد الله بن جبرين", born: 1349, died: 1430, gen: 5 },
  { file: "al-fawzan.html", name: "صالح بن فوزان الفوزان", short: "صالح الفوزان", born: 1354, died: null, alive: true, gen: 5 }
];

// المقياس المشترك للسلسلة
window.CHAIN = { min: 1100, max: 1440, fall: 1233 };
// نهاية الشريط: سنة الوفاة، أو آخر المقياس لمن لم تُعرف وفاته
window.lifeEnd = function (m) { return m.died || window.CHAIN.max; };
window.arDigits = function (n) { return String(n).replace(/\d/g, function (d) { return "٠١٢٣٤٥٦٧٨٩"[d]; }); };
