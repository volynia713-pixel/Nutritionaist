(function () {
  const blockedCodes = new Set(['F12']);
  const blockedCtrl = new Set(['u', 's', 'c', 'a', 'p']);
  const blockedCtrlShift = new Set(['i', 'j', 'c']);
  const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);

  function stop(event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }

  document.addEventListener('contextmenu', function (event) {
    stop(event);
  }, true);

  document.addEventListener('dragstart', function (event) {
    stop(event);
  }, true);

  document.addEventListener('copy', function (event) {
    stop(event);
  }, true);

  document.addEventListener('cut', function (event) {
    stop(event);
  }, true);

  document.addEventListener('selectstart', function (event) {
    const target = event.target;
    if (!target.closest('input, textarea')) {
      stop(event);
    }
  }, true);

  document.addEventListener('keydown', function (event) {
    const key = String(event.key || '').toLowerCase();
    const code = String(event.code || '');

    if (blockedCodes.has(code) || blockedCodes.has(String(event.key))) {
      return stop(event);
    }

    if (event.ctrlKey && event.shiftKey && blockedCtrlShift.has(key)) {
      return stop(event);
    }

    if (event.ctrlKey && blockedCtrl.has(key)) {
      return stop(event);
    }

    if (isMac && event.metaKey && blockedCtrl.has(key)) {
      return stop(event);
    }

    if (isMac && event.metaKey && event.shiftKey && blockedCtrlShift.has(key)) {
      return stop(event);
    }
  }, true);

  document.addEventListener('mousedown', function (event) {
    if (event.detail > 1) {
      const target = event.target;
      if (!target.closest('input, textarea')) {
        stop(event);
      }
    }
  }, true);

  const style = document.createElement('style');
  style.textContent = `
    html, body {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
    }

    img {
      pointer-events: auto;
      -webkit-user-drag: none;
      user-drag: none;
    }

    input, textarea {
      -webkit-user-select: text;
      -moz-user-select: text;
      -ms-user-select: text;
      user-select: text;
    }
  `;
  document.head.appendChild(style);
})();