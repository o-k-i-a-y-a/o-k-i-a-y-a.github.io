const panzoomInstance = panzoom(document.getElementById("panzoom-area"), {
  smoothScroll: false,
  zoomDoubleClickSpeed: 1,
  maxZoom: 5,
  minZoom: 0.5,
});

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
