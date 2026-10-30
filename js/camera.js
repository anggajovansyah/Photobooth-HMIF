// ==============================================
// CAMERA.JS - Photobooth Camera Logic
// ==============================================


// ==============================================
// ELEMEN
// ==============================================

const video = document.getElementById("video");
const countEl = document.getElementById("count");
const button = document.querySelector(".capture-btn");
const photoStrip = document.getElementById("photo-strip");
const retakeBtn = document.getElementById("retake-btn");


// ==============================================
// AMBIL FRAME TERPILIH
// ==============================================

let selectedFrame = localStorage.getItem("selectedFrame");
let frameConfig = (typeof FRAME_DATA !== "undefined" && FRAME_DATA[selectedFrame])
    ? FRAME_DATA[selectedFrame]
    : JSON.parse(localStorage.getItem("frameConfig"));


// ==============================================
// VALIDASI
// ==============================================

if (!selectedFrame || !frameConfig) {
    alert("Pilih frame terlebih dahulu!");
    window.location.href = "frames.html";
}


// ==============================================
// JUMLAH FOTO SESUAI FRAME
// ==============================================

const totalShot = frameConfig ? frameConfig.totalPhotos : 3;


// ==============================================
// DATA FOTO
// ==============================================

let capturedPhotos = [];
let currentShot = 0;
let isCapturing = false;


// ==============================================
// UPDATE UI AWAL
// ==============================================

function updateUI() {
    if (countEl) {
        countEl.innerHTML =
            '<div class="shot-info">' +
            '<span class="shot-label">📷 ' + frameConfig.name + '</span>' +
            '<span class="shot-progress">' + capturedPhotos.length + ' / ' + totalShot + ' foto</span>' +
            '</div>';
    }

    // Update photo strip thumbnails
    if (photoStrip) {
        photoStrip.innerHTML = '';
        for (let i = 0; i < totalShot; i++) {
            const thumb = document.createElement('div');
            thumb.className = 'thumb-slot';
            if (capturedPhotos[i]) {
                thumb.innerHTML = '<img src="' + capturedPhotos[i] + '" alt="Foto ' + (i + 1) + '">';
                thumb.classList.add('filled');
            } else {
                thumb.innerHTML = '<span>' + (i + 1) + '</span>';
            }
            photoStrip.appendChild(thumb);
        }
    }

    // Show/hide buttons
    if (button) {
        if (capturedPhotos.length >= totalShot) {
            button.style.display = 'none';
        } else {
            button.style.display = 'block';
            button.disabled = false;
            button.textContent = '📷 Foto ' + (capturedPhotos.length + 1) + ' / ' + totalShot;
        }
    }

    // Show retake & done when all photos taken
    if (retakeBtn) {
        retakeBtn.style.display = capturedPhotos.length > 0 ? 'inline-block' : 'none';
    }

    const doneBtn = document.getElementById('done-btn');
    if (doneBtn) {
        doneBtn.style.display = capturedPhotos.length >= totalShot ? 'inline-block' : 'none';
    }
}


// ==============================================
// AKTIFKAN KAMERA
// ==============================================

navigator.mediaDevices.getUserMedia({
    video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 }
    },
    audio: false
})
    .then(stream => {
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            updateUI();
        };
    })
    .catch(error => {
        console.error(error);
        alert("Kamera tidak bisa dibuka. Izinkan akses kamera.");
    });



// ==============================================
// CAPTURE - Satu foto per klik dengan countdown
// ==============================================

function capture() {

    if (isCapturing) return;
    if (capturedPhotos.length >= totalShot) return;

    isCapturing = true;
    button.disabled = true;

    let countdown = 3;

    // Show countdown
    countEl.className = 'countdown-mode';
    countEl.innerHTML = '<div class="countdown-number">' + countdown + '</div>';

    // Flash effect
    const flash = document.getElementById('flash');

    let timer = setInterval(() => {

        countdown--;

        if (countdown > 0) {
            countEl.innerHTML = '<div class="countdown-number">' + countdown + '</div>';
        } else if (countdown === 0) {
            countEl.innerHTML = '<div class="countdown-number countdown-snap">📸</div>';
        } else {
            clearInterval(timer);

            // Take the actual photo
            takePicture();

            // Flash effect
            if (flash) {
                flash.classList.add('active');
                setTimeout(() => flash.classList.remove('active'), 300);
            }

            // Reset UI
            setTimeout(() => {
                countEl.className = '';
                isCapturing = false;
                updateUI();
            }, 500);
        }

    }, 1000);
}



// ==============================================
// AMBIL FOTO
// ==============================================

function takePicture() {

    let canvas = document.createElement("canvas");

    // Batasi ke resolusi HD (maks 1280px) agar jernih dan hemat memori
    const maxDim = 1280;
    let vw = video.videoWidth || 1280;
    let vh = video.videoHeight || 720;
    let scale = Math.min(1, maxDim / Math.max(vw, vh));

    canvas.width = Math.round(vw * scale);
    canvas.height = Math.round(vh * scale);

    let ctx = canvas.getContext("2d");

    // Mirror horizontally (selfie mode)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Kompresi JPEG 0.88 (kualitas tinggi, ukuran ~150KB vs 3MB PNG, bebas error kuota)
    let photo = canvas.toDataURL("image/jpeg", 0.88);
    capturedPhotos.push(photo);

    currentShot++;
}



// ==============================================
// RETAKE FOTO TERAKHIR
// ==============================================

function retakeLast() {
    if (capturedPhotos.length > 0) {
        capturedPhotos.pop();
        currentShot--;
        updateUI();
    }
}



// ==============================================
// SELESAI - SIMPAN & PINDAH
// ==============================================

async function finishCapture() {

    const doneBtn = document.getElementById("done-btn");
    if (doneBtn) {
        doneBtn.disabled = true;
        doneBtn.textContent = "Menyiapkan hasil...";
    }

    // 1. Simpan foto dengan aman (IndexedDB + localStorage fallback)
    try {
        if (typeof saveSessionPhotos === "function") {
            await saveSessionPhotos(capturedPhotos);
        } else {
            localStorage.setItem("capturedPhotos", JSON.stringify(capturedPhotos));
        }
    } catch (e) {
        console.warn("Storage warning:", e);
    }

    // 2. Simpan frame & config
    try {
        localStorage.setItem("selectedFrame", selectedFrame);
        if (frameConfig) {
            localStorage.setItem("frameConfig", JSON.stringify(frameConfig));
        }
    } catch (e) {
        console.warn("Config save warning:", e);
    }

    // 3. Matikan kamera
    try {
        let stream = video.srcObject;
        if (stream) {
            stream.getTracks().forEach(track => {
                track.stop();
            });
        }
    } catch (e) {
        console.warn("Camera stop warning:", e);
    }

    // 4. Pindah ke halaman hasil foto
    window.location.href = "result.html";
}

// Pasang event listener juga untuk memastikan tombol selalu merespon klik
const doneBtnEl = document.getElementById("done-btn");
if (doneBtnEl) {
    doneBtnEl.addEventListener("click", finishCapture);
}
