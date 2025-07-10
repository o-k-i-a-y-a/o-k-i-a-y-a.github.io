const panzoomEl = document.getElementById('panzoom');
const instance = panzoom(panzoomEl, {
  bounds: true,
  boundsPadding: 0.5,
  maxZoom: 3,
  minZoom: 0.4,
  initialZoom: 0.4,
});


// マーカー
const markers = document.querySelectorAll('.marker');
const attractionNames = Array.from(markers).map(m => m.dataset.name);

// Popup固定領域を作成（追加）
const fixedPopup = document.createElement('div');
fixedPopup.id = "popup-fixed";
fixedPopup.className = "popup";
fixedPopup.style.position = "absolute";
fixedPopup.style.top = "0";  // outerの上部に固定
fixedPopup.style.left = "50%";
fixedPopup.style.transform = "translateX(-50%)";
fixedPopup.style.zIndex = "10000";
fixedPopup.style.display = "none";

// outer内に追加（位置固定のため outer に）
document.querySelector('.outer').appendChild(fixedPopup);

// 選択中マーカー管理用
let selectedMarker = null;

// 共通のタッチ＆クリックイベント追加
function addClickAndTouch(el, handler) {
  el.addEventListener("click", handler);
  el.addEventListener("touchend", handler, { passive: false });
}

window.addEventListener("load", async () => {
  const waits = await fetchWaitTimes();

  markers.forEach(marker => {
    const name = marker.dataset.name;
    const wait = waits[name] ? `${waits[name]}分` : "";
    const label = marker.querySelector(".wait-label");
    const popup = marker.querySelector(".popup");
    const logo = popup.querySelector(".popup-logo");

    if (label && wait) label.textContent = wait;

    // ==== 修正開始: マーカーをクリック・タップで popup-fixed 表示 ====
    addClickAndTouch(marker, (e) => {
      e.stopPropagation();

      // 選択中マーカーの強調表示を解除
      if (selectedMarker) {
        selectedMarker.classList.remove("selected-marker");
      }

      // 新しく選択されたマーカーを強調
      marker.classList.add("selected-marker");
      selectedMarker = marker;

      // fixedPopup に内容をコピー
      fixedPopup.innerHTML = popup.innerHTML;
      fixedPopup.style.display = "block";
    });
    // ==== 修正終了 ====

    // 元のポップアップは使わないので非表示のまま
    popup.style.display = "none";

    // ロゴをクリック・タップで fixedPopup を閉じる
    if (logo) {
      addClickAndTouch(logo, (e) => {
        e.stopPropagation();
        fixedPopup.style.display = "none";
        if (selectedMarker) selectedMarker.classList.remove("selected-marker");
        selectedMarker = null;
      });
    }
  });

  // 外側クリック・タップでポップアップを閉じる
  const closePopupIfOutside = (e) => {
    if (!e.target.closest('.marker') && !e.target.closest('#popup-fixed')) {
      fixedPopup.style.display = "none";
      if (selectedMarker) selectedMarker.classList.remove("selected-marker");
      selectedMarker = null;
    }
  };
  document.body.addEventListener("click", closePopupIfOutside);
  document.body.addEventListener("touchend", closePopupIfOutside, { passive: false });
});
