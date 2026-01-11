document.addEventListener("DOMContentLoaded", () => {

  const uploadBox = document.getElementById("imageUploadBox")
  const fileInput = document.getElementById("imageInput")
  const fileName = document.getElementById("imageFileName")
  const analyzeBtn = document.querySelector(".btn-magenta")
  const progressBox = document.getElementById("imageProgressBox")
  const resultCard = document.getElementById("resultCardimage")
  const spamBar = document.getElementById("SpamBar")
  const phishBar = document.getElementById("PhishBar")
  const tag = document.getElementById("verdictTag")
  const errorText = document.getElementById("errorText")
  const explanationText = document.getElementById("explanationText")

  let selectedFile = null
  const MAX_OCR_CHARS = 3000

  function setStatus(msg) {
    const el = document.querySelector("#aiStatus span.text-light")
    if (el) el.textContent = msg
  }

  uploadBox.addEventListener("click", () => fileInput.click())

  fileInput.addEventListener("change", e => {
    selectedFile = e.target.files[0]
    if (!selectedFile) return
    fileName.textContent = `Selected: ${selectedFile.name}`
    resetUI()
  })

  analyzeBtn.addEventListener("click", async () => {
    if (!selectedFile) return alert("Select a video first")

    resetUI()
    progressBox.style.display = "block"
    setStatus("Loading video...")

    try {
      let text = await extractVideoText(selectedFile)
      text = text.slice(0, MAX_OCR_CHARS)
      await sendToBackend(text)
    } catch (e) {
      showError(e.message)
    }
  })

  async function extractVideoText(file) {
    const video = document.createElement("video")
    video.src = URL.createObjectURL(file)
    video.muted = true

    await new Promise((res, rej) => {
      video.onloadeddata = res
      video.onerror = rej
    })

    const duration = Math.min(5, Math.floor(video.duration || 3))
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    let text = ""

    for (let i = 0; i < duration; i++) {
      setStatus(`Scanning frame ${i + 1}/${duration}`)
      await new Promise(r => {
        video.onseeked = r
        video.currentTime = i
      })
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 360
      ctx.drawImage(video, 0, 0)
      const res = await Tesseract.recognize(canvas, "eng")
      text += res.data.text + "\n"
    }

    return text
  }

  async function sendToBackend(text) {
    setStatus("Analyzing with AI...")
    const res = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    })
    if (!res.ok) throw new Error("Backend error")
    applyResult(await res.json())
  }

  function applyResult(r) {
    progressBox.style.display = "none"
    resultCard.style.display = "block"
    resultCard.classList.remove("d-none")

    spamBar.style.width = r.spam + "%"
    phishBar.style.width = r.phish + "%"
    tag.textContent = r.verdict
    explanationText.textContent = r.explanation || ""

    tag.className =
      "tag " +
      (r.verdict === "Safe" ? "safe" :
       r.verdict === "Spam" ? "warning" : "danger")
  }

  function resetUI() {
    resultCard.classList.add("d-none")
    spamBar.style.width = "0%"
    phishBar.style.width = "0%"
    explanationText.textContent = ""
  }

  function showError(msg) {
    progressBox.style.display = "none"
    resultCard.classList.remove("d-none")
    errorText.textContent = msg
  }
})
