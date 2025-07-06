const panzoomEl = document.getElementById('panzoom');
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
