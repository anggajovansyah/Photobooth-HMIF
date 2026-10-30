// ==============================================
// STORAGE.JS - Reliable photo storage using IndexedDB & localStorage
// ==============================================

function openPhotoDB() {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            reject(new Error("IndexedDB not supported"));
            return;
        }
        const req = indexedDB.open("HMIFPhotoboothDB", 1);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains("session")) {
                db.createObjectStore("session");
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function saveSessionPhotos(photos) {
    // 1. Simpan ke IndexedDB (kapasitas besar tanpa batasan kuota 5MB)
    try {
        const db = await openPhotoDB();
        await new Promise((resolve, reject) => {
            const tx = db.transaction("session", "readwrite");
            const store = tx.objectStore("session");
            store.put(photos, "capturedPhotos");
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error);
        });
    } catch (e) {
        console.warn("IndexedDB save failed, using localStorage fallback:", e);
    }

    // 2. Backup ke localStorage (dibungkus try-catch agar aman dari QuotaExceededError)
    try {
        localStorage.removeItem("photos"); // bersihkan key lama
        localStorage.setItem("capturedPhotos", JSON.stringify(photos));
    } catch (e) {
        console.warn("localStorage quota exceeded (IndexedDB digunakan):", e);
    }
}

async function loadSessionPhotos() {
    // 1. Coba baca dari IndexedDB
    try {
        const db = await openPhotoDB();
        const photos = await new Promise((resolve) => {
            const tx = db.transaction("session", "readonly");
            const store = tx.objectStore("session");
            const req = store.get("capturedPhotos");
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => resolve(null);
        });
        if (photos && Array.isArray(photos) && photos.length > 0) {
            return photos;
        }
    } catch (e) {
        console.warn("IndexedDB load error, fallback to localStorage:", e);
    }

    // 2. Fallback baca dari localStorage
    try {
        const raw = localStorage.getItem("capturedPhotos");
        if (raw) {
            const photos = JSON.parse(raw);
            if (photos && Array.isArray(photos) && photos.length > 0) {
                return photos;
            }
        }
    } catch (e) {
        console.warn("localStorage load error:", e);
    }

    return null;
}

async function clearSessionPhotos() {
    try {
        const db = await openPhotoDB();
        await new Promise((resolve) => {
            const tx = db.transaction("session", "readwrite");
            const store = tx.objectStore("session");
            store.delete("capturedPhotos");
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => resolve(false);
        });
    } catch (e) {}

    try {
        localStorage.removeItem("capturedPhotos");
        localStorage.removeItem("photos");
    } catch (e) {}
}

