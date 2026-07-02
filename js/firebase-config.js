// js/firebase-config.js
// 🚀 Enterprise Firebase Configuration (Safe Auth & Persistent Session)

const firebaseConfig = {
    apiKey: "AIzaSyA2cDFLnQJv-j9-1M8NVA1ajeTqJRmZugk",
    authDomain: "dialysis-cloud-os-72adb.firebaseapp.com",
    databaseURL: "https://dialysis-cloud-os-72adb-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "dialysis-cloud-os-72adb",
    storageBucket: "dialysis-cloud-os-72adb.firebasestorage.app",
    messagingSenderId: "639213311268",
    appId: "1:639213311268:web:05a6b4c59830f767970fb1",
    measurementId: "G-FN9JM8MC4B"
};

// 1. Initialize Firebase Core
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();
const auth = firebase.auth();

window.db = db;
window.auth = auth;

// ==========================================
// 🚨 THE MAGIC FIX: ระบบจัดการสิทธิ์ฐานข้อมูลอัจฉริยะ (Safe Auth Engine)
// ==========================================
// 1. บังคับให้ Firebase จำสิทธิ์ลงในเครื่อง (Local Storage) เพื่อไม่ให้หลุดเวลา Refresh จอ
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
        // 2. ตรวจสอบว่ามีสิทธิ์ค้างอยู่ในเครื่องหรือไม่
        auth.onAuthStateChanged((user) => {
            if (user) {
                console.log("🟢 [Firebase Auth] ดึงสิทธิ์เดิมกลับมาสำเร็จ! (Session Restored)");
            } else {
                // 3. ถ้าไม่มีสิทธิ์ใดๆ เลย ค่อยทำการขอสิทธิ์ Anonymous เพื่อให้ดึงฐานข้อมูลได้
                auth.signInAnonymously()
                    .then(() => {
                        console.log("🟡 [Firebase Auth] สร้างสิทธิ์ Guest สำเร็จ! (Anonymous Mode)");
                    })
                    .catch((error) => {
                        console.error("🔴 [Firebase Error] ไม่สามารถสร้างสิทธิ์ได้:", error.message);
                    });
            }
        });
    })
    .catch((error) => {
        console.error("🔴 [Firebase Persistence Error]:", error.message);
    });