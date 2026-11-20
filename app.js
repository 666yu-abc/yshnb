/* 第一页：选一个日子 */
(function () {
  var yearSel = document.getElementById('year');
  var monthSel = document.getElementById('month');
  var daySel = document.getElementById('day');
  var form = document.getElementById('birth-form');
  var hint = document.getElementById('hint');
  var thisYear = new Date().getFullYear();

  function makeOption(value, label, placeholder) {
    var o = document.createElement('option');
    o.value = value;
    o.textContent = label;
    if (placeholder) { o.disabled = true; o.selected = true; }
    return o;
  }

  yearSel.appendChild(makeOption('', '年', true));
  for (var y = thisYear; y >= 1900; y--) {
    yearSel.appendChild(makeOption(String(y), y + ' 年'));
  }
  monthSel.appendChild(makeOption('', '月', true));
  for (var m = 1; m <= 12; m++) {
    monthSel.appendChild(makeOption(String(m), m + ' 月'));
  }

  function daysInMonth(y, m) {
    return new Date(y, m, 0).getDate();
  }

  function rebuildDays() {
    var y = parseInt(yearSel.value, 10) || 2000;
    var m = parseInt(monthSel.value, 10) || 1;
    var max = daysInMonth(y, m);
    var previous = daySel.value;
    daySel.innerHTML = '';
    daySel.appendChild(makeOption('', '日', true));
    for (var d = 1; d <= max; d++) {
      daySel.appendChild(makeOption(String(d), d + ' 日'));
    }
    if (previous && parseInt(previous, 10) <= max) daySel.value = previous;
  }

  function clearHint() { hint.textContent = ''; }
  function showHint(msg) { hint.textContent = msg; }

  yearSel.addEventListener('change', function () { rebuildDays(); clearHint(); });
  monthSel.addEventListener('change', function () { rebuildDays(); clearHint(); });
  daySel.addEventListener('change', clearHint);
  rebuildDays();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var y = parseInt(yearSel.value, 10);
    var m = parseInt(monthSel.value, 10);
    var d = parseInt(daySel.value, 10);

    if (!y || !m || !d) { showHint('还差一点点，把年月日都选上吧。'); return; }

    var birth = new Date(y, m - 1, d);
    if (birth.getFullYear() !== y || birth.getMonth() !== m - 1 || birth.getDate() !== d) {
      showHint('这个日子好像不存在，再看看？'); return;
    }

    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (birth > today) { showHint('这个日子还没到呢，换一个吧。'); return; }

    /* 保留访问码等原有参数，让分享出去的结果链接任何人都打得开 */
    var query = new URLSearchParams(window.location.search);
    query.set('y', String(y));
    query.set('m', String(m));
    query.set('d', String(d));
    window.location.href = 'result.html?' + query.toString();
  });
})();
