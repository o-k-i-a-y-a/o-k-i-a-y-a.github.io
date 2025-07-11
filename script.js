const panzoomEl = document.getElementById('panzoom');
const instance = panzoom(panzoomEl, {
  bounds: true,
  boundsPadding: 0.5,
  maxZoom: 3,
  minZoom: 0.4,
  initialZoom: 0.4,
});

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

// ✅ 共通のタッチ＆クリックイベント
function addClickAndTouch(el, handler) {
  el.addEventListener("click", handler);
  el.addEventListener("touchend", handler, { passive: false });
}

window.addEventListener("load", async () => {
  const waits = await fetchWaitTimes();
  const popupFixed = document.getElementById('popup-fixed');
  let selectedMarker = null;

  markers.forEach(marker => {
    const name = marker.dataset.name;
    const wait = waits[name] ? `${waits[name]}分` : "";
    const label = marker.querySelector(".wait-label");
    const popup = marker.querySelector(".popup");
    const logo = popup.querySelector(".popup-logo");

    if (label && wait) label.textContent = wait;

    // ✅ マーカークリック時の処理
    addClickAndTouch(marker, (e) => {
      e.stopPropagation();

      // 既存選択マーカー解除
      if (selectedMarker && selectedMarker !== marker) {
        selectedMarker.classList.remove("selected-marker");
      }

      // 選択マーカー設定
      selectedMarker = marker;
      marker.classList.add("selected-marker");

      // ✅ popupのHTMLをコピーしてpopup-fixedに表示
      if (popup && popupFixed) {
        popupFixed.innerHTML = popup.innerHTML;
        popupFixed.style.display = "block";
      }
    });
  });

  // ✅ 画面の外をタップしたときにポップアップを閉じる
  const closePopupIfOutside = (e) => {
    if (!e.target.closest('.marker')) {
      popupFixed.style.display = "none";
      if (selectedMarker) {
        selectedMarker.classList.remove("selected-marker");
        selectedMarker = null;
      }
    }
  };
  document.body.addEventListener("click", closePopupIfOutside);
  document.body.addEventListener("touchend", closePopupIfOutside, { passive: false });
});
