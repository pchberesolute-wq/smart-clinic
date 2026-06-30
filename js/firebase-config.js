// js/firebase-config.js
// 🚀 Enterprise Firebase Configuration (with Auto-Bypass Security)

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

// 1. Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();
const auth = firebase.auth();

window.db = db;
window.auth = auth;

// 🚨 THE MAGIC FIX: ระบบปลดล็อก Dashboard อัตโนมัติ (Anonymous Auth) 🚨
auth.signInAnonymously()
  .then(() => {
    console.log("🟢 [Security] ปลดล็อกสิทธิ์สำเร็จ! ส่งสัญญาณให้ Dashboard ทำงานต่อได้");
  })
  .catch((error) => {
    console.error("🔴 [Security Error]:", error.message);
  });