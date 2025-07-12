const panzoomEl = document.getElementById('panzoom');
const instance = panzoom(panzoomEl, {
  autocenter: true,
  maxZoom: 3,
  minZoom: 0.1,
});

const markers = document.querySelectorAll('.marker');
const attractionNames = Array.from(markers).map(m => m.dataset.name);

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

    addClickAndTouch(marker, (e) => {
      e.stopPropagation();

      // 既存のポップアップを閉じる
      if (openedPopup && openedPopup !== popup) {
        openedPopup.style.display = "none";
        if (openedPopup.parentElement === document.body) {
          document.body.removeChild(openedPopup);
        }
      }

      const rect = marker.getBoundingClientRect();
      popup.style.position = 'fixed';
      popup.style.top = `${rect.top}px`;
      popup.style.left = `${rect.left}px`;
      popup.style.display = 'block';

      document.body.appendChild(popup);
      openedPopup = popup;
    });

    if (logo) {
      addClickAndTouch(logo, (e) => {
        e.stopPropagation();
        popup.style.display = "none";
        if (popup.parentElement === document.body) {
          document.body.removeChild(popup);
        }
        openedPopup = null;
      });
    }
  });

  const closePopupIfOutside = (e) => {
    if (!e.target.closest('.marker') && !e.target.closest('.popup')) {
      if (openedPopup) {
        openedPopup.style.display = "none";
        if (openedPopup.parentElement === document.body) {
          document.body.removeChild(openedPopup);
        }
        openedPopup = null;
      }
    }
  };

  document.body.addEventListener("click", closePopupIfOutside);
  document.body.addEventListener("touchend", closePopupIfOutside, { passive: false });
});
