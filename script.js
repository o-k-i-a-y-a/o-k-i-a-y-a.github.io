const panzoomEl = document.getElementById('map-img');
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
    const res = await fetch(`https://script.google.com/macros/s/AKfycbzB2VNj3Q0oeOeS3lGkrJ3oDvVy2lBAVi6XMXrdBMlq3gYUsMkJF3Zmw299DUW_lFIZgw/exec?q=${query}`);
    const data = await res.json();
    return data.results || {};
  } catch (e) {
    console.warn("通信エラー:", e);
    return {};
  }
}


// 共通のタッチ＆クリックイベント追加
function addClickAndTouch(el, handler) {
  el.addEventListener("click", handler);
  el.addEventListener("touchend", handler, { passive: false });
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

    // マーカーをクリック・タップでポップアップ表示
    addClickAndTouch(marker, (e) => {
      e.stopPropagation();
      if (openedPopup && openedPopup !== popup) {
        openedPopup.style.display = "none";
      }
      popup.style.display = "block";
      openedPopup = popup;
    });

    // ロゴをクリック・タップで非表示
    if (logo) {
      addClickAndTouch(logo, (e) => {
        e.stopPropagation();
        popup.style.display = "none";
        openedPopup = null;
      });
    }
  });

  // 外側クリック・タップでポップアップを閉じる
  const closePopupIfOutside = (e) => {
    if (!e.target.closest('.marker')) {
      if (openedPopup) {
        openedPopup.style.display = "none";
        openedPopup = null;
      }
    }
  };
  document.body.addEventListener("click", closePopupIfOutside);
  document.body.addEventListener("touchend", closePopupIfOutside, { passive: false });
});
