// ==============================================
// FRAME CONFIGURATION
// ==============================================
// Setiap frame punya posisi slot foto yang berbeda
// Koordinat dalam pixel relatif terhadap canvas
// Canvas = ukuran asli frame image
// ==============================================

const FRAME_DATA = {

    "frame1.png": {
        // HMIF Special Edition
        // 1086 x 1448
        name: "HMIF Special Edition",
        width: 1086,
        height: 1448,
        totalPhotos: 4,
        positions: [
            // Slot besar tengah
            { x: 82, y: 551, width: 693, height: 471 },
            // 3 slot bawah (MOMENTS THAT BUILD TOMORROW)
            { x: 256, y: 1102, width: 169, height: 160 },
            { x: 439, y: 1102, width: 167, height: 160 },
            { x: 620, y: 1102, width: 168, height: 160 }
        ]
    },

    "frame2.png": {
        // Star HMIF
        // 1086 x 1448
        name: "Star HMIF",
        width: 1086,
        height: 1448,
        totalPhotos: 3,
        positions: [
            // Slot besar utama (MAIN FEATURE)
            { x: 102, y: 443, width: 877, height: 542 },
            // 2 slot bawah (MOMENTS + COMMUNITY)
            { x: 247, y: 1029, width: 285, height: 210 },
            { x: 558, y: 1029, width: 280, height: 210 }
        ]
    },

    "frame3.png": {
        // Informatika
        // 1122 x 1402
        name: "Informatika",
        width: 1122,
        height: 1402,
        totalPhotos: 4,
        positions: [
            // Slot besar tengah
            { x: 212, y: 385, width: 669, height: 600 },
            // 3 slot bawah
            { x: 220, y: 1084, width: 203, height: 151 },
            { x: 440, y: 1083, width: 205, height: 152 },
            { x: 663, y: 1084, width: 205, height: 151 }
        ]
    },

    "frame4.png": {
        // Warta HMIF
        // 1122 x 1402
        name: "Warta HMIF",
        width: 1122,
        height: 1402,
        totalPhotos: 4,
        positions: [
            // Slot besar tengah atas
            { x: 296, y: 290, width: 505, height: 485 },
            // Slot bawah kiri
            { x: 279, y: 926, width: 339, height: 212 },
            // 2 slot kanan bertumpuk
            { x: 649, y: 923, width: 163, height: 103 },
            { x: 648, y: 1048, width: 164, height: 106 }
        ]
    },

    "frame5.png": {
        // Star Informatika
        // 1122 x 1402
        name: "Star Informatika",
        width: 1122,
        height: 1402,
        totalPhotos: 3,
        positions: [
            // Slot besar utama
            { x: 149, y: 401, width: 821, height: 505 },
            // 2 slot bawah
            { x: 362, y: 1001, width: 414, height: 159 },
            { x: 823, y: 1017, width: 251, height: 132 }
        ]
    },

    "frame6.png": {
        // Koran HMIF
        // 1087 x 1447
        name: "Koran HMIF",
        width: 1087,
        height: 1447,
        totalPhotos: 4,
        positions: [
            // Slot besar utama
            { x: 204, y: 364, width: 678, height: 497 },
            // 3 slot bawah
            { x: 31, y: 935, width: 333, height: 168 },
            { x: 378, y: 935, width: 329, height: 168 },
            { x: 722, y: 935, width: 334, height: 168 }
        ]
    },

    "frame7.png": {
        // HMIF Gazette
        // 1122 x 1402
        name: "HMIF Gazette",
        width: 1122,
        height: 1402,
        totalPhotos: 3,
        positions: [
            // Slot besar atas (PHOTO_001)
            { x: 101, y: 378, width: 861, height: 443 },
            // Slot medium bawah kiri (PHOTO_002)
            { x: 330, y: 917, width: 403, height: 181 },
            // Slot kecil bawah kanan (PHOTO_003)
            { x: 776, y: 1073, width: 247, height: 108 }
        ]
    },

    "frame8.png": {
        // Logic Press
        // 1086 x 1448
        name: "Logic Press",
        width: 1086,
        height: 1448,
        totalPhotos: 4,
        positions: [
            // Slot besar kiri-tengah
            { x: 31, y: 383, width: 684, height: 598 },
            // 3 slot kecil bawah (CAPTURED MOMENTS)
            { x: 33, y: 1034, width: 133, height: 185 },
            { x: 174, y: 1035, width: 136, height: 184 },
            { x: 318, y: 1035, width: 137, height: 184 }
        ]
    }
};



// ==============================================
// STATE
// ==============================================

let selected = "";



// ==============================================
// PILIH FRAME
// ==============================================

function chooseFrame(frame, element) {

    selected = frame;

    // Simpan frame pilihan
    localStorage.setItem("selectedFrame", frame);

    // Simpan konfigurasi frame
    const config = FRAME_DATA[frame];
    if (config) {
        localStorage.setItem("frameConfig", JSON.stringify(config));
    }

    // Tampilkan preview
    document.getElementById("preview").src =
        "assets/frames/" + frame;

    // Update info slot
    updateSlotInfo(frame);

    // Hapus tanda selected sebelumnya
    let cards = document.querySelectorAll(".frame-card");
    cards.forEach(function (card) {
        card.classList.remove("active");
    });

    // Tambah tanda selected
    if (element) {
        element.classList.add("active");
    }
}



// ==============================================
// UPDATE INFO SLOT
// ==============================================

function updateSlotInfo(frame) {
    const config = FRAME_DATA[frame];
    const infoEl = document.getElementById("slot-info");
    if (config && infoEl) {
        infoEl.innerHTML =
            '<span class="slot-count">' + config.totalPhotos + '</span> foto akan diambil';
    }
}



// ==============================================
// PERGI KE KAMERA
// ==============================================

function goCamera() {

    if (selected === "") {
        alert("Pilih frame terlebih dahulu!");
        return;
    }

    // Pastikan config tersimpan
    const config = FRAME_DATA[selected];
    if (config) {
        localStorage.setItem("frameConfig", JSON.stringify(config));
        localStorage.setItem("selectedFrame", selected);
    }

    location.href = "camera.html";
}



// ==============================================
// INIT - Auto select frame1
// ==============================================

window.addEventListener("DOMContentLoaded", function () {
    const firstCard = document.querySelector(".frame-card");
    if (firstCard) {
        chooseFrame("frame1.png", firstCard);
    }
});
