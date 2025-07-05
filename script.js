// panzoom初期化
window.addEventListener("DOMContentLoaded", () => {
  const panzoomEl = document.getElementById('panzoom');
  const instance = panzoom(panzoomEl, {
    bounds: true,
    boundsPadding: 1,
    maxZoom: 3,
    minZoom: 0.5,
    initialZoom: 0.7,
  });

  // 中央寄せ（画像読み込み後にスケール調整）
  const imgEl = panzoomEl.querySelector('img');
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
});

// ポップアップ機能（地図とは別にload後実行）
window.addEventListener("load", async () => {
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

  const waits = await fetchWaitTimes();

  markers.forEach(marker => {
    const name = marker.dataset.name;
    const wait = waits[name] ? `${waits[name]}分` : "";
    const label = marker.querySelector(".wait-label");
    const popup = marker.querySelector(".popup");
    const logo = popup.querySelector(".popup-logo");

    if (label && wait) label.textContent = wait;

    // ポップアップ開く
    marker.addEventListener("click", (e) => {
      e.stopPropagation(); // Panzoomへの伝播を防ぐ
      popup.style.display = "block";
    });

    // ポップアップ閉じる（ロゴ押し）
    logo?.addEventListener("click", (e) => {
      e.stopPropagation();
      popup.style.display = "none";
    });

    // 外クリックで閉じる
    document.addEventListener("click", (e) => {
      if (!marker.contains(e.target)) {
        popup.style.display = "none";
      }
    });
  });
});
