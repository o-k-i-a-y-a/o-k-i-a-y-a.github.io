//const panzoomEl = document.getElementById('map-img');
const panzoomEl = document.getElementById('panzoom');
const instance = panzoom(panzoomEl, {
  bounds: true,
  boundsPadding: 2.0,
  maxZoom: 3,
  minZoom: 0.2,
  initialZoom: 0.2,
});

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
