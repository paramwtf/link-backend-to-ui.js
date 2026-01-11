(() => {
  console.log("✅ text.js loaded");

  // ==============================
  // DOM ELEMENTS
  // ==============================
  const textInput   = document.getElementById("textInput");
  const charCount   = document.getElementById("charCount");
  const analyzeBtn  = document.getElementById("textAnalyzeBtn");
  const resultCard  = document.getElementById("resultCardText");
  const scanOverlay = document.getElementById("scanOverlay");
  const btnText     = document.getElementById("btnText");
  const btnLoader   = document.getElementById("btnLoader");

  // Safety check (page might not be text.html)
  if (!textInput || !analyzeBtn || !resultCard) {
    console.warn("⚠️ text.js: Required elements not found");
    return;
  }

  // ==============================
  // CHARACTER COUNTER
  // ==============================
  if (charCount) {
    textInput.addEventListener("input", () => {
      charCount.innerText = `${textInput.value.length} characters`;
    });
  }

  // ==============================
  // ANALYZE BUTTON CLICK
  // ==============================
  analyzeBtn.addEventListener("click", async () => {
    const text = textInput.value.trim();

    if (text.length < 10) {
      alert("Enter at least 10 characters");
      return;
    }

    // ---------- UI START ----------
    analyzeBtn.disabled = true;
    if (btnText) btnText.innerText = "Analyzing...";
    if (btnLoader) btnLoader.classList.remove("d-none");
    if (scanOverlay) scanOverlay.classList.remove("d-none");
    resultCard.classList.add("d-none");

    try {
      const res = await fetch("http://localhost:8000/api/text/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      if (!res.ok) {
        throw new Error("API request failed");
      }

      const data = await res.json();
      renderTextResult(data);

    } catch (err) {
      console.error("❌ Text analysis error:", err);
      alert("Text analysis failed");
    } finally {
      // ---------- UI RESET ----------
      analyzeBtn.disabled = false;
      if (btnText) btnText.innerText = "Analyze Text";
      if (btnLoader) btnLoader.classList.add("d-none");
      if (scanOverlay) scanOverlay.classList.add("d-none");
    }
  });

  // ==============================
  // RENDER RESULT
  // ==============================
  function renderTextResult(data) {
    if (!data || !data.verdict) {
      alert("Invalid AI response");
      return;
    }

    const spam  = Number(data.spam)  || 0;
    const phish = Number(data.phish) || 0;
    const risk  = Math.max(spam, phish);

    let title, tag, color;

    if (risk > 70) {
      title = "High Risk Content";
      tag = "Malicious";
      color = "#ff4e4e";
    } else if (risk > 40) {
      title = "Suspicious Content";
      tag = "Suspicious";
      color = "#ffcc00";
    } else {
      title = "Content is Safe";
      tag = "Legitimate";
      color = "#00ff88";
    }

    resultCard.innerHTML = `
      <div class="result-header d-flex justify-content-between mb-3">
        <h3 style="color:${color}">${title}</h3>
        <span class="tag">${tag}</span>
      </div>

      <p>
        Verdict:
        <b style="color:${color}">${data.verdict}</b><br>
        Overall Risk:
        <b style="color:${color}">${data.risk}%</b>
      </p>

      <p class="text-white-50 small mb-3">
        ${data.explanation || "Analysis completed successfully."}
      </p>

      <div class="bar mb-3">
        <label>Spam Probability</label>
        <div class="bar-bg">
          <div class="${
            spam > 70 ? "red-progress" :
            spam > 40 ? "orange-progress" :
            "green-progress"
          }" style="width:${spam}%"></div>
        </div>
      </div>

      <div class="bar">
        <label>Phishing Probability</label>
        <div class="bar-bg">
          <div class="${
            phish > 70 ? "red-progress" :
            phish > 40 ? "orange-progress" :
            "green-progress"
          }" style="width:${phish}%"></div>
        </div>
      </div>
    `;

    resultCard.classList.remove("d-none");
  }

})();
