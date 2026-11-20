/* 第二页：数一数这些日子 */
(function () {
  var params = new URLSearchParams(window.location.search);
  var y = parseInt(params.get('y'), 10);
  var m = parseInt(params.get('m'), 10);
  var d = parseInt(params.get('d'), 10);

  /* 保留访问码等原有参数，保证返回首页和分享出去的链接都打得开 */
  var backQuery = new URLSearchParams(window.location.search);
  backQuery.delete('y'); backQuery.delete('m'); backQuery.delete('d');
  var backQueryStr = backQuery.toString();
  var backHref = 'index.html' + (backQueryStr ? '?' + backQueryStr : '');
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;'); }

  var card = document.querySelector('.result-card');
  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  function showInvalid() {
    card.innerHTML =
      '<div class="card-mark" aria-hidden="true">' +
        '<span class="rule"></span>' +
        '<svg class="sun" viewBox="0 0 32 32" fill="none">' +
          '<circle cx="16" cy="16" r="5.2" stroke="currentColor" stroke-width="1.2"/>' +
          '<g stroke="currentColor" stroke-width="1.2" stroke-linecap="round">' +
            '<path d="M16 3.5v3.2M16 25.3v3.2M3.5 16h3.2M25.3 16h3.2M7.2 7.2l2.3 2.3M22.5 22.5l2.3 2.3M24.8 7.2l-2.3 2.3M9.5 22.5l-2.3 2.3"/>' +
          '</g>' +
        '</svg>' +
        '<span class="rule"></span>' +
      '</div>' +
      '<p class="eyebrow">Not Written Yet</p>' +
      '<h1>这份日子还没写好</h1>' +
      '<p class="lede">也许是链接不完整，或者那个日子还没到。<br>我们重新选一个吧。</p>' +
      '<a class="primary-btn" href="' + esc(backHref) + '" style="margin-top:28px">回到第一页 &rarr;</a>';
  }

  if (!y || !m || !d || y < 1900 || y > now.getFullYear() || m < 1 || m > 12 || d < 1 || d > 31) {
    showInvalid(); return;
  }
  var birth = new Date(y, m - 1, d);
  if (birth.getFullYear() !== y || birth.getMonth() !== m - 1 || birth.getDate() !== d || birth > today) {
    showInvalid(); return;
  }

  var MS = 86400000;
  var birthUTC = Date.UTC(y, m - 1, d);
  var todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  var days = Math.round((todayUTC - birthUTC) / MS) + 1; /* 出生那天与今天都算进去 */

  var age = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age--;

  var next = new Date(now.getFullYear(), m - 1, d);
  if (next < today) next = new Date(now.getFullYear() + 1, m - 1, d);
  var toNext = Math.round((Date.UTC(next.getFullYear(), next.getMonth(), next.getDate()) - todayUTC) / MS);

  var birthText = y + ' 年 ' + m + ' 月 ' + d + ' 日';
  var todayText = now.getFullYear() + ' 年 ' + (now.getMonth() + 1) + ' 月 ' + now.getDate() + ' 日';
  var birthEl = document.getElementById('birth-date');
  var todayEl = document.getElementById('today-date');
  birthEl.textContent = birthText;
  birthEl.setAttribute('datetime', y + '-' + ('0' + m).slice(-2) + '-' + ('0' + d).slice(-2));
  todayEl.textContent = todayText;
  todayEl.setAttribute('datetime', now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2));

  var backLink = document.querySelector('.text-link');
  if (backLink) backLink.href = backHref;

  document.getElementById('age').textContent = age;
  if (toNext === 0) {
    document.getElementById('next-bday').textContent = '今日';
    document.getElementById('next-label').textContent = '正好是你的生日';
  } else {
    document.getElementById('next-bday').textContent = toNext;
  }

  var quotes = [
    '每一个平凡的日子，都因为你来过而有了名字。',
    '你走过的路上，风也记得，光也记得。',
    '不必着急，好日子是一天一天慢慢长出来的。',
    '谢谢你，把这些日子过成了自己的故事。',
    '世界很大，你已经认真地陪了它这么久。',
    '你不必发光，安安静静地在这里，就已经很好。',
    '这颗星球上，有且只有一个你，走过了这些天。',
    '往后的日子，也请慢慢来，慢慢喜欢。',
    '所有看似寻常的清晨，都是你和多一次的世界相遇。'
  ];
  var seed = 0;
  var key = String(y) + '-' + String(m) + '-' + String(d);
  for (var i = 0; i < key.length; i++) {
    seed = (seed * 31 + key.charCodeAt(i)) >>> 0;
  }
  document.getElementById('quote').textContent = quotes[seed % quotes.length];

  /* 让数字慢慢数上来 */
  var numberEl = document.getElementById('days');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function fmt(n) { return n.toLocaleString('zh-CN'); }
  if (reduce) {
    numberEl.textContent = fmt(days);
  } else {
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      numberEl.textContent = fmt(Math.floor(days * eased));
      if (p < 1) requestAnimationFrame(step);
      else numberEl.textContent = fmt(days);
    }
    requestAnimationFrame(step);
  }

  /* 复制这份日子 */
  var toast = document.getElementById('toast');
  var timer;
  document.getElementById('copy-btn').addEventListener('click', function () {
    var url = window.location.href;
    function done() {
      toast.classList.add('show');
      clearTimeout(timer);
      timer = setTimeout(function () { toast.classList.remove('show'); }, 2600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done, fallback);
    } else {
      fallback();
    }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) { /* 忽略 */ }
      document.body.removeChild(ta);
      done();
    }
  });
})();
