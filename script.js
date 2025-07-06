const panzoomEl = document.getElementById('panzoom');
const instance = panzoom(panzoomEl, {
  bounds: true,
  //boundsPadding: 1,
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

window.addEventListener("load", async () => {
  const waits = await fetchWaitTimes();

  markers.forEach(marker => {
    const name = marker.dataset.name;
    const wait = waits[name] ? `${waits[name]}分` : "";
    const label = marker.querySelector(".wait-label");
    const popup = marker.querySelector(".popup");

    if (label && wait) label.textContent = wait;

    marker.addEventListener("click", (e) => {
      // 他のポップアップを閉じる
      document.querySelectorAll('.popup').forEach(p => {
        if (p !== popup) p.style.display = "none";
      });

      // ポップアップ表示切り替え
      popup.style.display = (popup.style.display === "block") ? "none" : "block";

      // クリックのバブリング停止
      e.stopPropagation();
    });
  });

  // マップのどこかクリックで全ポップアップを閉じる
  document.addEventListener("click", () => {
    document.querySelectorAll('.popup').forEach(p => p.style.display = "none");
  });
});
