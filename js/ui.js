// ========================================================
// GLOBAL UI HELPERS ONLY (Drishti Dynamics)
// ========================================================

/**
 * bindUpload: Handle clicks on a visual box and triggers the hidden file input.
 * Also updates the display name of the selected file.
 */
function bindUpload(boxId, inputId, nameId) {
  const box = document.getElementById(boxId);
  const input = document.getElementById(inputId);
  const nameDisplay = document.getElementById(nameId);

  // Check if elements exist to avoid console errors
  if (!box || !input) return;

  // 1. Box Click Trigger
  box.onclick = (e) => {
    // Prevent event bubbling if the box is inside another clickable element
    e.stopPropagation(); 
    input.click();
  };

  // 2. File Selection Change
  input.onchange = () => {
    if (nameDisplay && input.files.length > 0) {
      nameDisplay.innerText = "Selected: " + input.files[0].name;
      nameDisplay.style.color = "#00ff88"; // Success color highlight
    }
  };
}

// Initialize Bindings
// Ye IDs aapke image.html aur video.html dono ke liye kaam karengi
document.addEventListener("DOMContentLoaded", () => {
  // For Image/Video Analyzer boxes
  bindUpload("imageUploadBox", "imageInput", "imageFileName");
  bindUpload("videoUploadBox", "videoInput", "videoFileName");
});

// ========================================================
// STRICTLY NO ANALYSIS LOGIC HERE
// ========================================================