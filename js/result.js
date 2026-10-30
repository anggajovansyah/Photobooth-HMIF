// ==============================================
// RESULT.JS - Composite foto ke dalam frame
// ==============================================

const canvas = document.getElementById("resultCanvas");
const ctx = canvas.getContext("2d");

let selectedFrame = localStorage.getItem("selectedFrame");
let frameConfig = (typeof FRAME_DATA !== "undefined" && FRAME_DATA[selectedFrame])
    ? FRAME_DATA[selectedFrame]
    : JSON.parse(localStorage.getItem("frameConfig"));

async function initResult() {
    // 1. Ambil foto dari session storage / IndexedDB
    let photos = null;
    if (typeof loadSessionPhotos === "function") {
        photos = await loadSessionPhotos();
    }
    if (!photos || photos.length === 0) {
        try {
            photos = JSON.parse(localStorage.getItem("capturedPhotos"));
        } catch (e) {
            photos = null;
        }
    }

    // 2. Validasi data
    if (!photos || !selectedFrame || !frameConfig) {
        alert("Data foto belum lengkap!");
        window.location.href = "frames.html";
        return;
    }

    // 3. SET CANVAS = UKURAN FRAME ASLI
    canvas.width = frameConfig.width;
    canvas.height = frameConfig.height;

    // 4. LOAD SEMUA GAMBAR (FOTO + FRAME)
    let photoImages = [];
    let loadedCount = 0;
    let totalToLoad = photos.length + 1; // +1 untuk frame image

    // Load foto-foto
    photos.forEach((photoData, index) => {
        let img = new Image();
        img.onload = function () {
            loadedCount++;
            if (loadedCount === totalToLoad) {
                drawResult(photoImages, frameImage);
            }
        };
        img.onerror = function () {
            console.error("Gagal load foto #" + (index + 1));
            loadedCount++;
            if (loadedCount === totalToLoad) {
                drawResult(photoImages, frameImage);
            }
        };
        img.src = photoData;
        photoImages.push(img);
    });

    // Load frame image
    let frameImage = new Image();
    frameImage.onload = function () {
        loadedCount++;
        if (loadedCount === totalToLoad) {
            drawResult(photoImages, frameImage);
        }
    };
    frameImage.onerror = function () {
        console.error("Gagal load frame!");
        alert("Frame gagal dimuat!");
    };
    frameImage.src = "assets/frames/" + selectedFrame;
}

// ==============================================
// GAMBAR HASIL - FOTO DULU, FRAME DI ATAS
// ==============================================

function drawResult(photoImages, frameImage) {

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background putih
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bleed 3px agar foto menutupi cutout frame secara presisi tanpa celah/space kosong
    const bleed = 3;

    // STEP 1: Gambar foto di setiap posisi slot
    frameConfig.positions.forEach((pos, index) => {
        if (photoImages[index] && photoImages[index].complete && photoImages[index].naturalWidth > 0) {
            const x = Math.max(0, pos.x - bleed);
            const y = Math.max(0, pos.y - bleed);
            const w = Math.min(canvas.width - x, pos.width + bleed * 2);
            const h = Math.min(canvas.height - y, pos.height + bleed * 2);

            // Cover-fit foto ke dalam slot
            drawImageCover(ctx, photoImages[index], x, y, w, h);
        }
    });

    // STEP 2: Gambar frame di atas (overlay)
    ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);

    // Show the canvas
    canvas.style.display = "block";
}


// ==============================================
// COVER FIT - Seperti CSS object-fit: cover
// ==============================================

function drawImageCover(ctx, img, x, y, w, h) {
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const slotRatio = w / h;

    let sx, sy, sw, sh;

    if (imgRatio > slotRatio) {
        // Foto lebih lebar dari slot → crop kiri-kanan
        sh = img.naturalHeight;
        sw = sh * slotRatio;
        sx = (img.naturalWidth - sw) / 2;
        sy = 0;
    } else {
        // Foto lebih tinggi dari slot → crop atas-bawah
        sw = img.naturalWidth;
        sh = sw / slotRatio;
        sx = 0;
        sy = (img.naturalHeight - sh) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}


// ==============================================
// DOWNLOAD
// ==============================================

function download() {
    let link = document.createElement("a");
    link.download = "HMIF-PhotoBooth-" + Date.now() + ".png";
    link.href = canvas.toDataURL("image/png");
    link.click();
}


// ==============================================
// RETAKE - KEMBALI KE KAMERA
// ==============================================

async function retake() {
    if (typeof clearSessionPhotos === "function") {
        await clearSessionPhotos();
    } else {
        localStorage.removeItem("capturedPhotos");
    }
    window.location.href = "camera.html";
}


// ==============================================
// PILIH FRAME LAIN
// ==============================================

async function chooseNewFrame() {
    if (typeof clearSessionPhotos === "function") {
        await clearSessionPhotos();
    } else {
        localStorage.removeItem("capturedPhotos");
    }
    localStorage.removeItem("frameConfig");
    localStorage.removeItem("selectedFrame");
    window.location.href = "frames.html";
}

// Mulai inisialisasi
if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initResult);
} else {
    initResult();
}
