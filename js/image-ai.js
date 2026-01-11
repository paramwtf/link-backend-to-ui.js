document.addEventListener("DOMContentLoaded", () => {

  const imgInput = document.getElementById("imageInput");
  const analyzeBtn = document.getElementById("imageAnalyzeBtn");
  const resultCard = document.getElementById("resultCardimage");
  const progressBox = document.getElementById("imageProgressBox");

  if (!imgInput || !analyzeBtn || !resultCard) return;

  analyzeBtn.addEventListener("click", async () => {

    if (!imgInput.files.length) {
      alert("Please upload an image first.");
      return;
    }

    /* =========================
       UI START
    ========================== */
    resultCard.classList.add("d-none");
    if (progressBox) progressBox.style.display = "block";
    if (window.targetColor) window.targetColor.set(0xdb4eff);

    try {
      const base64Image = await toBase64(imgInput.files[0]);

      const res = await fetch("http://localhost:8000/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image })
      });

      const data = await res.json();

      /* =========================
         FORCE SHOW CARD FIRST
      ========================== */
      resultCard.classList.remove("d-none");
      resultCard.style.display = "block";

      /* =========================
         ELEMENT REFERENCES
      ========================== */
      const spamBar = document.getElementById("SpamBar");
      const phishBar = document.getElementById("PhishBar");
      const confidenceEl = document.getElementById("confidenceScore");
      const explanationEl = document.getElementById("aiExplanation");
      const tag = document.getElementById("resultTag");
      const title = document.getElementById("resultTitle");

      /* =========================
         RESET UI
      ========================== */
      spamBar.style.width = "0%";
      phishBar.style.width = "0%";
      explanationEl.classList.add("d-none");
      explanationEl.innerText = "";

      const hasSpam = data.spam !== null && data.spam !== undefined;
      const hasPhish = data.phishing !== null && data.phishing !== undefined;

      /* =========================
         NUMERIC RESULT (BARS)
      ========================== */
      if (hasSpam || hasPhish) {

        if (hasSpam) spamBar.style.width = data.spam + "%";
        if (hasPhish) phishBar.style.width = data.phishing + "%";

        const confidence = Math.max(
          hasSpam ? data.spam : 0,
          hasPhish ? data.phishing : 0
        );

        confidenceEl.innerText = confidence + "%";

        if (confidence < 30) {
          tag.innerText = "Safe Content";
          tag.className = "tag safe";
          title.className = "m-0 fw-bold text-success";
        } else if (confidence < 60) {
          tag.innerText = "Suspicious";
          tag.className = "tag warning";
          title.className = "m-0 fw-bold text-warning";
        } else {
          tag.innerText = "High Risk";
          tag.className = "tag danger";
          title.className = "m-0 fw-bold text-danger";
        }
      }
      /* =========================
         NO NUMBERS AT ALL
      ========================== */
      else {
        confidenceEl.innerText = "N/A";
        tag.innerText = "Informational";
        tag.className = "tag safe";
        title.className = "m-0 fw-bold text-success";
      }

      /* =========================
         SHOW EXPLANATION (ALWAYS IF PRESENT)
      ========================== */
      if (data.explanation && data.explanation.trim().length > 0) {
        explanationEl.innerText = data.explanation.trim();
        explanationEl.classList.remove("d-none");
      }

      /* =========================
         FINAL ANIMATION
      ========================== */
      requestAnimationFrame(() => {
        resultCard.style.animation = "fadeInUp 0.6s ease-out forwards";
      });

    } catch (err) {
      console.error("Image AI error:", err);
      alert("AI analysis failed.");
      resultCard.classList.add("d-none");
    } finally {
      if (progressBox) progressBox.style.display = "none";
      if (window.targetColor) window.targetColor.set(0x00ffd5);
    }
  });

  /* =========================
     FILE → BASE64
  ========================== */
  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

});
