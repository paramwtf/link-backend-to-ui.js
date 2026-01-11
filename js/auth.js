// ================================
//  Firebase Imports & Initialization
// ================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { 
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ================================
//  CONFIG
// ================================
const firebaseConfig = {
    apiKey: "AIzaSyBOUOC-Kg4S-W5m-N9AsrOraoxZSGnagRI",
    authDomain: "spam-analyzer-6439d.firebaseapp.com",
    databaseURL: "https://spam-analyzer-6439d-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "spam-analyzer-6439d",
    storageBucket: "spam-analyzer-6439d.firebasestorage.app",
    messagingSenderId: "914665649686",
    appId: "1:914665649686:web:5e1312e8f9c661997f6737",
    measurementId: "G-TLQ53VYBLN"
};

// ================================
//  INIT
// ================================
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// ================================
//  DOM Elements (Auth Page Only)
// ================================
const loginView = document.getElementById("loginView");
const signupView = document.getElementById("signupView");
const resetView = document.getElementById("resetView");

const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");

const resetEmail = document.getElementById("resetEmail");

// ================================
//  View Switching Logic
// ================================
window.showLogin = () => {
    if (loginView) loginView.style.display = "block";
    if (signupView) signupView.style.display = "none";
    if (resetView) resetView.style.display = "none";
};

window.showSignup = () => {
    if (loginView) loginView.style.display = "none";
    if (signupView) signupView.style.display = "block";
    if (resetView) resetView.style.display = "none";
};

window.showReset = () => {
    if (loginView) loginView.style.display = "none";
    if (signupView) signupView.style.display = "none";
    if (resetView) resetView.style.display = "block";
};

// ================================
//  LOGIN
// ================================
if (loginForm) {
    loginForm.onsubmit = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value);
            window.location.href = "index.html";
        } catch (err) {
            alert("Login Failed: " + err.message);
        }
    };
}

// ================================
//  SIGNUP (inside login page)
// ================================
window.signupUser = async () => {
    try {
        await createUserWithEmailAndPassword(auth, signupEmail.value, signupPassword.value);
        alert("Account created! Login now.");
        showLogin();
    } catch (err) {
        alert("Signup Failed: " + err.message);
    }
};

// ================================
//  PASSWORD RESET
// ================================
window.resetPassword = async () => {
    try {
        await sendPasswordResetEmail(auth, resetEmail.value);
        alert("Password reset link sent!");
        showLogin();
    } catch (err) {
        alert("Reset Failed: " + err.message);
    }
};

// ================================
//  LOGOUT (Home Page Button)
// ================================
window.logoutUser = async () => {
    await signOut(auth);
    window.location.reload();
};

// ================================
//  AUTH STATE HANDLING (Index UI)
// ================================
onAuthStateChanged(auth, (user) => {
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    // If buttons are not on this page, stop
    if (!loginBtn || !logoutBtn) return;

    if (user) {
        loginBtn.style.display = "none";
        logoutBtn.style.display = "block";
    } else {
        loginBtn.style.display = "block";
        logoutBtn.style.display = "none";
    }
});

// ================================
//  AUTO REDIRECT IF ALREADY LOGGED IN
// ================================
if (window.location.pathname.includes("auth.html")) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            window.location.href = "index.html";
        }
    });
}

// Default to login on load (auth page only)
if (loginView) showLogin();
