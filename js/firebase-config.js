// js/firebase-config.js
// 🚀 เชื่อมต่อฐานข้อมูล Firebase ตัวใหม่ล่าสุด (dialysis-cloud-os-72adb)

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

// สั่งเริ่มต้นการทำงานของ Firebase (รองรับ Web HTML)
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

console.log("🔥 Firebase Cloud OS (New Database 72adb) Connected Successfully!");