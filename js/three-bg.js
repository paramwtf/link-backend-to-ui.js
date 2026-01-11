// ==================================================
// THREE.JS BACKGROUND (TEXT PAGE VISUALS)
// ==================================================

const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const r = new THREE.WebGLRenderer({ canvas: bg, alpha: true });
r.setSize(innerWidth, innerHeight);
cam.position.z = 8;

const g = new THREE.BufferGeometry();
const count = 800;
const p = new Float32Array(count * 3);
for (let i = 0; i < p.length; i++) {
  p[i] = (Math.random() - 0.5) * 20;
}
g.setAttribute("position", new THREE.BufferAttribute(p, 3));

const m = new THREE.PointsMaterial({
  color: 0x00ffd5,
  size: 0.05
});

const pts = new THREE.Points(g, m);
scene.add(pts);

// Control Variables
let currentSpeed = 0.0006;
let targetColor = new THREE.Color(0x00ffd5);

function animate() {
  requestAnimationFrame(animate);
  pts.rotation.y += currentSpeed;
  pts.rotation.x += currentSpeed / 2;
  m.color.lerp(targetColor, 0.05);
  r.render(scene, cam);
}
animate();

window.addEventListener("resize", () => {
  cam.aspect = innerWidth / innerHeight;
  cam.updateProjectionMatrix();
  r.setSize(innerWidth, innerHeight);
});


// ==================================================
// TEXT ANALYSIS VISUAL CONTROLS (NO LOGIC)
// ==================================================

const textInput  = document.getElementById("textInput");
const overlay    = document.getElementById("scanOverlay");
const btnText    = document.getElementById("btnText");

window.TextVisuals = {

  startScan() {
    if (overlay) overlay.classList.remove("d-none");
    if (textInput) textInput.classList.add("scanning-active");

    if (btnText) btnText.innerText = "Analyzing...";
    targetColor.set(0xdb4eff); // Magenta
  },

  stopScan() {
    if (overlay) overlay.classList.add("d-none");
    if (textInput) textInput.classList.remove("scanning-active");

    if (btnText) btnText.innerText = "Analyze Text";
    targetColor.set(0x00ffd5); // Cyan
  }

};

console.log("✅ Text visuals loaded (backend-safe)");
