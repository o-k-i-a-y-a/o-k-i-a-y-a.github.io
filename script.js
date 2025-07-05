const panzoomInstance = panzoom(document.getElementById("panzoom-area"), {
  smoothScroll: false,
  zoomDoubleClickSpeed: 1,
  maxZoom: 5,
  minZoom: 0.5,
  initialZoom: 0.5,
});

const panzoomEl = document.getElementById('panzoom');
const instance = panzoom(panzoomEl, {
//  smoothScroll: true,
  bounds: true,
  boundsPadding: 0.3,
  maxZoom: 2,
  minZoom: 0.5
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
    const logo = popup.querySelector(".popup-logo");

    if (label && wait) label.textContent = wait;

    marker.addEventListener("click", () => {
      popup.style.display = "block";
    });

    logo.addEventListener("click", () => {
      popup.style.display = "none";
    });

    document.addEventListener("click", e => {
      if (!marker.contains(e.target)) {
        popup.style.display = "none";
      }
    });
  });
});
