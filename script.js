window.addEventListener("DOMContentLoaded", () => {
  const panzoomEl = document.getElementById('image'); // ← ここをimageに
  const instance = panzoom(panzoomEl, {
    maxZoom: 3,
    minZoom: 0.5,
    initialZoom: 0.5,
  });

  //地図の初期位置を中央に
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
