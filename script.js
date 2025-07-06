const panzoomEl = document.getElementById('panzoom');
const instance = panzoom(panzoomEl, {
  maxZoom: 3,
  minZoom: 0.5,
  initialZoom: 0.7,
});

// 地図を初期表示で中央寄せ
const imgEl = panzoomEl.getElementsByTagName('img')[0];
const image = new Image();
image.onload = function () {
  const dw = panzoomEl.clientWidth / this.naturalWidth;
  const dh = panzoomEl.clientHeight / this.naturalHeight;
  const scale = Math.min(dw, dh);
  instance.zoomAbs(
    panzoomEl.clientWidth / 2,
    panzoomEl.clientHeight / 2,
    scale
  );
};
image.src = imgEl.src;

// マーカー
const markers = document.querySelectorAll('.marker');
const attractionNames = Array.from(markers).map(m => m.dataset.name);

// 待ち時間取得
async function fetchWaitTimes() {
  const query = encodeURIComponent(attractionNames.join(","));
  try {
    const res = await fetch(`https://script.google.com/macros/s/AKfyb.../exec?q=${query}`);
    const data = await res.json();
    return data.results || {};
  } catch (e) {
    console.warn("通信エラー:", e);
    return {};
  }
}

// タップにも対応したイベント登録
function addClickAndTouchListener(el, handler) {
  el.addEventListener("click", handler);
  el.addEventListener("touchstart", handler, { passive: true });
}

window.addEventListener("load", async () => {
  const waits = await fetchWaitTimes();
  let openedPopup = null;

  markers.forEach(marker => {
    const name = marker.dataset.name;
    const wait = waits[name] ? `${waits[name]}分` : "";
    const label = marker.querySelector(".wait-label");
    const popup = marker.querySelector(".popup");
    const logo = popup.querySelector(".popup-logo");

    if (label && wait) label.textContent = wait;

    // マーカーをクリック/タップで開く
    addClickAndTouchListener(marker, (e) => {
      e.stopPropagation();
      if (openedPopup && openedPopup !== popup) {
        openedPopup.style.display = "none";
      }
      popup.style.display = "block";
      openedPopup = popup;
    });

    // ロゴをクリック/タップで閉じる
    if (logo) {
      addClickAndTouchListener(logo, (e) => {
        e.stopPropagation();
        popup.style.display = "none";
        openedPopup = null;
      });
    }

    // 外をクリック/タップしたら閉じる
    addClickAndTouchListener(document, (e) => {
      if (openedPopup && !marker.contains(e.target)) {
        openedPopup.style.display = "none";
        openedPopup = null;
      }
    });
  });
});
