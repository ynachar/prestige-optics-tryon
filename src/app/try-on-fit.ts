/**
 * Glasses try-on fit using MediaPipe Face Landmarker (iris centers).
 * Falls back to a simple luminance eye finder if MediaPipe cannot run.
 */

export function waitForImage(img: HTMLImageElement): Promise<HTMLImageElement> {
  if (img.complete) {
    return img.naturalWidth
      ? Promise.resolve(img)
      : Promise.reject(new Error('image load failed'));
  }
  return new Promise(function (resolve, reject) {
    var onLoad = function () {
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
      resolve(img);
    };
    var onError = function () {
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
      reject(new Error('image load failed'));
    };
    img.addEventListener('load', onLoad);
    img.addEventListener('error', onError);
  });
}

function waitForLayout(img: HTMLImageElement): Promise<void> {
  function sized() {
    return img.clientWidth >= 40 && img.clientHeight >= 40;
  }
  if (sized()) {
    return Promise.resolve();
  }
  return new Promise(function (resolve) {
    var tries = 0;
    function tick() {
      if (sized() || tries++ > 20) {
        resolve(undefined);
        return;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

var lastFitPhoto: HTMLImageElement = null;
var lastFitOverlay: HTMLElement = null;
var fitGen = 0;
var landmarkerPromise: Promise<any> = null;

if (typeof window !== 'undefined' && !(window as any).__tryOnFitResizeBound) {
  (window as any).__tryOnFitResizeBound = true;
  window.addEventListener('resize', function () {
    if (
      lastFitPhoto &&
      lastFitOverlay &&
      !isPlaceholderSrc(lastFitPhoto.currentSrc || lastFitPhoto.src)
    ) {
      fitGlassesOverlay(lastFitPhoto, lastFitOverlay);
    }
  });
}

export function isPlaceholderSrc(src: string): boolean {
  if (!src) {
    return false;
  }
  var s = src.toLowerCase();
  return (
    s.indexOf('unknown_person') !== -1 || s.indexOf('unknown-person') !== -1
  );
}

export function hideGlassesOverlay(overlay: HTMLElement) {
  fitGen++;
  lastFitPhoto = null;
  lastFitOverlay = null;
  if (!overlay) {
    return;
  }
  overlay.style.visibility = 'hidden';
}

function loadMediaPipeVision(): Promise<any> {
  var w = window as any;
  if (
    w.__mpVision &&
    w.__mpVision.FaceLandmarker &&
    w.__mpVision.FilesetResolver
  ) {
    return Promise.resolve(w.__mpVision);
  }
  if (w.__mpVisionLoading) {
    return w.__mpVisionLoading;
  }
  w.__mpVisionLoading = new Promise(function (resolve, reject) {
    var done = function () {
      if (w.__mpVision && w.__mpVision.FaceLandmarker) {
        resolve(w.__mpVision);
        return true;
      }
      return false;
    };
    if (done()) {
      return;
    }
    window.addEventListener('mpVisionReady', function onReady() {
      window.removeEventListener('mpVisionReady', onReady);
      if (!done()) {
        reject(new Error('MediaPipe vision failed to load'));
      }
    });
    var script = document.createElement('script');
    script.type = 'module';
    script.textContent =
      'import { FaceLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm";' +
      'window.__mpVision = { FaceLandmarker: FaceLandmarker, FilesetResolver: FilesetResolver };' +
      'window.dispatchEvent(new Event("mpVisionReady"));';
    script.onerror = function () {
      reject(new Error('MediaPipe script failed'));
    };
    document.head.appendChild(script);
    setTimeout(function () {
      if (!w.__mpVision) {
        reject(new Error('MediaPipe load timeout'));
      }
    }, 20000);
  });
  return w.__mpVisionLoading;
}

function createLandmarker(
  vision: any,
  wasm: any,
  delegate: string
): Promise<any> {
  return vision.FaceLandmarker.createFromOptions(wasm, {
    baseOptions: {
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
      delegate: delegate,
    },
    runningMode: 'IMAGE',
    numFaces: 1,
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: false,
  });
}

function getFaceLandmarker(): Promise<any> {
  if (landmarkerPromise) {
    return landmarkerPromise;
  }
  landmarkerPromise = loadMediaPipeVision()
    .then(function (vision) {
      return vision.FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
      ).then(function (wasm) {
        return createLandmarker(vision, wasm, 'GPU').catch(function () {
          return createLandmarker(vision, wasm, 'CPU');
        });
      });
    })
    .catch(function (err) {
      landmarkerPromise = null;
      throw err;
    });
  return landmarkerPromise;
}

/** Map normalized landmark (0-1 on natural image) into the displayed object-fit box. */
function landmarkToDisplay(
  lm: { x: number; y: number },
  photo: HTMLImageElement
): { x: number; y: number } {
  var natW = photo.naturalWidth || photo.clientWidth;
  var natH = photo.naturalHeight || photo.clientHeight;
  var p = coverDrawParams(photo);
  return {
    x: lm.x * natW * (p.drawW / natW) + p.dx,
    y: lm.y * natH * (p.drawH / natH) + p.dy,
  };
}

function coverDrawParams(img: HTMLImageElement) {
  var elW = Math.max(1, img.clientWidth);
  var elH = Math.max(1, img.clientHeight);
  var natW = img.naturalWidth || elW;
  var natH = img.naturalHeight || elH;
  var fit = 'cover';
  var posX = 0.5;
  var posY = 0;
  if (typeof window !== 'undefined' && window.getComputedStyle) {
    var cs = window.getComputedStyle(img);
    if (cs.objectFit === 'contain') {
      fit = 'contain';
    }
    var parts = (cs.objectPosition || 'center top').trim().split(/\s+/);
    posX = objectPositionAxis(parts[0], 0.5);
    posY = objectPositionAxis(parts.length > 1 ? parts[1] : parts[0], 0);
  }
  var scale =
    fit === 'contain'
      ? Math.min(elW / natW, elH / natH)
      : Math.max(elW / natW, elH / natH);
  var drawW = natW * scale;
  var drawH = natH * scale;
  return {
    elW: elW,
    elH: elH,
    dx: (elW - drawW) * posX,
    dy: (elH - drawH) * posY,
    drawW: drawW,
    drawH: drawH,
  };
}

function objectPositionAxis(token: string, fallback: number): number {
  if (!token) {
    return fallback;
  }
  if (token === 'left' || token === 'top') {
    return 0;
  }
  if (token === 'right' || token === 'bottom') {
    return 1;
  }
  if (token === 'center') {
    return 0.5;
  }
  if (token.indexOf('%') >= 0) {
    var pct = parseFloat(token);
    return isNaN(pct) ? fallback : pct / 100;
  }
  return fallback;
}

function fetchAsImage(src: string): Promise<HTMLImageElement> {
  return fetch(src, { mode: 'cors' })
    .then(function (res) {
      if (!res.ok) {
        throw new Error('fetch failed');
      }
      return res.blob();
    })
    .then(function (blob) {
      return new Promise(function (resolve, reject) {
        var url = URL.createObjectURL(blob);
        var im = new Image();
        im.onload = function () {
          URL.revokeObjectURL(url);
          resolve(im);
        };
        im.onerror = function () {
          URL.revokeObjectURL(url);
          reject(new Error('blob image failed'));
        };
        im.src = url;
      });
    });
}

function detectionImage(photo: HTMLImageElement): Promise<HTMLImageElement> {
  var src = photo.currentSrc || photo.src || '';
  if (!src || src.indexOf('data:') === 0 || src.indexOf('blob:') === 0) {
    return Promise.resolve(photo);
  }
  if (src.indexOf('http') === 0) {
    return fetchAsImage(src).catch(function () {
      return photo;
    });
  }
  return Promise.resolve(photo);
}

/**
 * MediaPipe iris centers: 468 = left iris (subject), 473 = right iris (subject).
 * On screen, sort by x so left = smaller x.
 * Fallback eye corners: 33 / 133 (right eye), 362 / 263 (left eye).
 */
function eyesFromLandmarks(
  landmarks: Array<{ x: number; y: number }>,
  photo: HTMLImageElement
): { x: number; y: number; width: number; height: number }[] | null {
  if (!landmarks || landmarks.length < 468) {
    return null;
  }
  var a;
  var b;
  if (landmarks.length >= 478 && landmarks[468] && landmarks[473]) {
    a = landmarkToDisplay(landmarks[468], photo);
    b = landmarkToDisplay(landmarks[473], photo);
  } else {
    var r = landmarkToDisplay(
      {
        x: (landmarks[33].x + landmarks[133].x) / 2,
        y: (landmarks[33].y + landmarks[133].y) / 2,
      },
      photo
    );
    var l = landmarkToDisplay(
      {
        x: (landmarks[362].x + landmarks[263].x) / 2,
        y: (landmarks[362].y + landmarks[263].y) / 2,
      },
      photo
    );
    a = r;
    b = l;
  }
  var left = a.x <= b.x ? a : b;
  var right = a.x <= b.x ? b : a;
  var ipd = Math.max(right.x - left.x, 1);
  var eyeW = Math.max(8, ipd * 0.35);
  var eyeH = Math.max(6, ipd * 0.28);
  return [
    { x: left.x - eyeW / 2, y: left.y - eyeH / 2, width: eyeW, height: eyeH },
    { x: right.x - eyeW / 2, y: right.y - eyeH / 2, width: eyeW, height: eyeH },
  ];
}

function detectEyesMediaPipe(
  photo: HTMLImageElement
): Promise<{ x: number; y: number; width: number; height: number }[] | null> {
  return getFaceLandmarker()
    .then(function (landmarker) {
      return detectionImage(photo).then(function (detImg) {
        var result = landmarker.detect(detImg);
        if (!result || !result.faceLandmarks || !result.faceLandmarks.length) {
          return null;
        }
        return eyesFromLandmarks(result.faceLandmarks[0], photo);
      });
    })
    .catch(function () {
      return null;
    });
}

export function fitGlassesOverlay(
  photo: HTMLImageElement,
  overlay: HTMLElement
): Promise<boolean> {
  if (!photo || !overlay) {
    return Promise.resolve(false);
  }
  var src = photo.currentSrc || photo.src || '';
  if (isPlaceholderSrc(src)) {
    hideGlassesOverlay(overlay);
    return Promise.resolve(false);
  }
  var gen = ++fitGen;
  lastFitPhoto = photo;
  lastFitOverlay = overlay;
  overlay.style.visibility = 'hidden';

  return waitForImage(photo)
    .then(function () {
      return waitForLayout(photo);
    })
    .then(function () {
      if (gen !== fitGen) {
        return null;
      }
      return detectEyesMediaPipe(photo);
    })
    .then(function (eyes) {
      if (gen !== fitGen) {
        return false;
      }
      if (eyes) {
        applyGlassesFromEyes(eyes, photo, overlay);
        overlay.style.visibility = 'visible';
        return true;
      }
      // Soft fallback if MediaPipe misses (rare).
      applyFallbackGlasses(photo, overlay);
      overlay.style.visibility = 'visible';
      return false;
    })
    .catch(function () {
      if (gen === fitGen) {
        applyFallbackGlasses(photo, overlay);
        overlay.style.visibility = 'visible';
      }
      return false;
    });
}

function applyFallbackGlasses(photo: HTMLImageElement, overlay: HTMLElement) {
  var w = Math.max(1, photo.clientWidth);
  var h = Math.max(1, photo.clientHeight);
  var overlayWidth = w * 0.28;
  var overlayHeight = overlayWidth * (185 / 370);
  overlay.style.left = w * 0.5 - overlayWidth / 2 + 'px';
  overlay.style.top = h * 0.22 + 'px';
  overlay.style.width = overlayWidth + 'px';
  overlay.style.height = overlayHeight + 'px';
  overlay.style.transform = 'none';
  overlay.style.margin = '0';
}

function applyGlassesFromEyes(
  eyes: { x: number; y: number; width: number; height: number }[],
  photo: HTMLImageElement,
  overlay: HTMLElement
) {
  eyes = eyes.slice().sort(function (a, b) {
    return a.x - b.x;
  });
  var left = eyes[0];
  var right = eyes[eyes.length - 1];
  var leftC = left.x + left.width / 2;
  var rightC = right.x + right.width / 2;
  var midX = (leftC + rightC) / 2;
  var midY = (left.y + left.height / 2 + right.y + right.height / 2) / 2;
  var ipd = Math.max(rightC - leftC, 1);
  var overlayWidth = ipd * 2.0;
  var overlayHeight = overlayWidth * (185 / 370);
  // Position relative to the overlay's containing block (tryOnStage), not
  // offsetParent quirks when the stage grows in fullscreen.
  var originX = 0;
  var originY = 0;
  var stage = overlay.parentElement;
  if (stage) {
    var photoRect = photo.getBoundingClientRect();
    var stageRect = stage.getBoundingClientRect();
    originX = photoRect.left - stageRect.left;
    originY = photoRect.top - stageRect.top;
  } else {
    originX = photo.offsetLeft || 0;
    originY = photo.offsetTop || 0;
  }
  // PNG optical center is slightly above the image midpoint.
  var nudgeY = overlayHeight * 0.06;
  overlay.style.left = originX + midX - overlayWidth / 2 + 'px';
  overlay.style.top = originY + midY - overlayHeight / 2 + nudgeY + 'px';
  overlay.style.width = overlayWidth + 'px';
  overlay.style.height = overlayHeight + 'px';
  overlay.style.transform = 'none';
  overlay.style.margin = '0';
}
