// js/script.js - COMPLETE COSMIC + FORMSPREE + MENU TOGGLE
// 🌌 COSMIC RENDERERS
let starRenderer, starCamera, starScene;
let planetRenderer, planetCamera, planetScene;

// 🚀 INITIALIZE COSMIC BACKGROUNDS
window.addEventListener('load', initCosmicBackground);

function initCosmicBackground() {
  initStars();
  initPlanets();
}

// 🌟 STAR FIELD
function initStars() {
  const canvas = document.getElementById('cosmic-stars');
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  starScene = new THREE.Scene();
  starCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
  starRenderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  starRenderer.setSize(window.innerWidth, window.innerHeight);

  createStarField();
  starCamera.position.z = 100;
  animateStars();
}

function createStarField() {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  for (let i = 0; i < 20000; i++) {
    const x = (Math.random() - 0.5) * 4000;
    const y = (Math.random() - 0.5) * 4000;
    const z = (Math.random() - 0.5) * 4000;
    vertices.push(x, y, z);
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  const material = new THREE.PointsMaterial({ color: 0x88ddff, size: 3, transparent: true, opacity: 0.9 });
  const stars = new THREE.Points(geometry, material);
  starScene.add(stars);
}

function animateStars() {
  requestAnimationFrame(animateStars);
  starScene.rotation.x += 0.0002;
  starScene.rotation.y += 0.0003;
  starRenderer.render(starScene, starCamera);
}

// 🌍 PLANETS
function initPlanets() {
  const canvas = document.getElementById('cosmic-planets');
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  planetScene = new THREE.Scene();
  planetCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
  planetRenderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  planetRenderer.setSize(window.innerWidth, window.innerHeight);

  createPlanetSystem();
  planetCamera.position.z = 50;
  animatePlanets();
}

function createPlanetSystem() {
  const colors = [0xff6b6b, 0x4ecdc4, 0x00ffe0, 0xffd700];
  for (let i = 0; i < 4; i++) {
    const geometry = new THREE.SphereGeometry(2 + i * 0.5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: colors[i], wireframe: true, transparent: true, opacity: 0.8 });
    const planet = new THREE.Mesh(geometry, material);
    planet.position.x = (i + 1) * 15;
    planet.userData = { orbitSpeed: 0.005 + i * 0.002, rotationSpeed: 0.01 + i * 0.003 };
    planetScene.add(planet);
  }
}

function animatePlanets() {
  requestAnimationFrame(animatePlanets);
  planetScene.children.forEach((planet) => {
    if (planet.userData) {
      planet.userData.angle = (planet.userData.angle || 0) + planet.userData.orbitSpeed;
      planet.position.x = Math.cos(planet.userData.angle) * 25;
      planet.position.z = Math.sin(planet.userData.angle) * 25;
      planet.rotation.y += planet.userData.rotationSpeed;
      planet.rotation.x += 0.005;
    }
  });
  planetScene.rotation.y += 0.0002;
  planetRenderer.render(planetScene, planetCamera);
}

// 📏 RESPONSIVE RESIZE
window.addEventListener('resize', () => {
  if (starCamera && starRenderer) {
    starCamera.aspect = window.innerWidth / window.innerHeight;
    starCamera.updateProjectionMatrix();
    starRenderer.setSize(window.innerWidth, window.innerHeight);
  }
  if (planetCamera && planetRenderer) {
    planetCamera.aspect = window.innerWidth / window.innerHeight;
    planetCamera.updateProjectionMatrix();
    planetRenderer.setSize(window.innerWidth, window.innerHeight);
  }
});

// 🔹 COSMIC MENU TOGGLE
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.menu-btn-wrapper > .toggle-btn');
  const dropdown = document.querySelector('.toggle-dropdown');

  if (menuBtn && dropdown) {
    menuBtn.addEventListener('click', () => {
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });

    // Close dropdown on link click
    dropdown.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        dropdown.style.display = 'none';
      });
    });

    // Smooth scroll
    dropdown.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  // 🔹 LOGIN / LOGOUT BUTTONS
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (loginBtn) loginBtn.onclick = () => window.location.href = "auth.html";
  if (logoutBtn) logoutBtn.onclick = async () => {
    try {
      await signOut(auth);
      window.location.reload();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // 🔹 FORMSPREE CONTACT FORM
  const simpleForm = document.querySelector('.simple-contact-form');
  if (simpleForm) {
    const submitBtn = simpleForm.querySelector('.submit-btn-simple');
    const statusDiv = document.getElementById('form-status');

    simpleForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      statusDiv.className = 'form-status loading';
      statusDiv.textContent = 'Sending your message...';

      const formData = new FormData(simpleForm);
      fetch(simpleForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })
        .then(res => res.ok ? res.json() : Promise.reject('Network error'))
        .then(data => {
          statusDiv.className = 'form-status success';
          statusDiv.innerHTML = '✅ Message sent successfully! We\'ll get back to you within 24 hours.';
          simpleForm.reset();
        })
        .catch(err => {
          statusDiv.className = 'form-status error';
          statusDiv.textContent = '❌ Failed to send message. Please try again.';
          console.error(err);
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Message';
        });
    });
  }

  // 🔹 CUSTOM CURSOR
  const cursor = document.querySelector(".cursor");
  if (cursor) {
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    });
  }
});
