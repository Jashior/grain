const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const imageCanvas = document.getElementById("imageCanvas");
const grainCanvas = document.getElementById("grainCanvas");
const grainAmount = document.getElementById("grainAmount");
const downloadBtn = document.getElementById("downloadBtn");

const imageCtx = imageCanvas.getContext("2d");
const grainCtx = grainCanvas.getContext("2d");

let originalImage = null;
let animationFrameId = null;

// Drag and drop handlers
dropZone.addEventListener("click", () => fileInput.click());

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("drag-over");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("drag-over");
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) {
    handleImage(file);
  }
});

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    handleImage(file);
  }
});

function handleImage(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    originalImage = new Image();
    originalImage.onload = () => {
      // Calculate dimensions while preserving aspect ratio
      const maxDimension = 2500;
      let finalWidth = originalImage.width;
      let finalHeight = originalImage.height;

      if (
        originalImage.width > maxDimension ||
        originalImage.height > maxDimension
      ) {
        if (originalImage.width > originalImage.height) {
          finalWidth = maxDimension;
          finalHeight =
            (originalImage.height / originalImage.width) * maxDimension;
        } else {
          finalHeight = maxDimension;
          finalWidth =
            (originalImage.width / originalImage.height) * maxDimension;
        }
        console.warn(
          `Image was resized from ${originalImage.width}x${originalImage.height} to ${finalWidth}x${finalHeight} for better performance`
        );
      }

      // Set canvas dimensions to match image
      imageCanvas.width = finalWidth;
      imageCanvas.height = finalHeight;
      grainCanvas.width = finalWidth;
      grainCanvas.height = finalHeight;

      // Use high-quality image rendering
      imageCtx.imageSmoothingEnabled = true;
      imageCtx.imageSmoothingQuality = "high";

      // Draw original image
      imageCtx.drawImage(originalImage, 0, 0, finalWidth, finalHeight);

      // Show canvas container
      document.querySelector(".canvas-container").style.display = "flex";
      document.querySelector(".canvas-container").style.justifyContent =
        "center";

      // Enable download button
      downloadBtn.disabled = false;

      // Start grain animation
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animateGrain();
    };
    originalImage.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function animateGrain() {
  grainCtx.clearRect(0, 0, grainCanvas.width, grainCanvas.height);

  const intensity = grainAmount.value / 100;
  const imageData = grainCtx.createImageData(
    grainCanvas.width,
    grainCanvas.height
  );
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.random() * 255 * intensity * 1.5;
    data[i] = noise;
    data[i + 1] = noise;
    data[i + 2] = noise;
    data[i + 3] = 35;
  }

  grainCtx.putImageData(imageData, 0, 0);
  animationFrameId = requestAnimationFrame(animateGrain);
}

// Download functionality
downloadBtn.addEventListener("click", () => {
  if (document.getElementById("downloadType").value === "image") {
    downloadImage();
  } else {
    downloadVideo();
  }
});

// SOLUTION 2: Fix the image download function to match preview exactly
function downloadImage() {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = imageCanvas.width;
  tempCanvas.height = imageCanvas.height;
  const tempCtx = tempCanvas.getContext("2d");

  // Draw base image
  tempCtx.drawImage(imageCanvas, 0, 0);

  // Apply the grain with same opacity as preview
  tempCtx.globalAlpha = 0.3;
  tempCtx.drawImage(grainCanvas, 0, 0);
  tempCtx.globalAlpha = 1.0;

  const link = document.createElement("a");
  link.download = "grain-effect.png";
  link.href = tempCanvas.toDataURL("image/png", 1.0);
  link.click();
}

// SOLUTION 1: Fix the video rendering function to match preview exactly
function drawVideoFrame(ctx, intensity) {
  // Clear the context
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Draw the base image
  ctx.drawImage(imageCanvas, 0, 0);

  // Create grain overlay with same parameters as preview
  const imageData = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);
  const data = imageData.data;

  // Increased intensity multiplier and alpha for video
  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.random() * 255 * intensity * 2; // Increased from 1.5 to 2
    data[i] = noise;
    data[i + 1] = noise;
    data[i + 2] = noise;
    data[i + 3] = 60; // Increased from 35 to 60
  }

  // Apply grain with same opacity as preview
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = ctx.canvas.width;
  tempCanvas.height = ctx.canvas.height;
  const tempCtx = tempCanvas.getContext("2d");

  tempCtx.putImageData(imageData, 0, 0);

  ctx.globalAlpha = 0.4; // Increased from 0.3 to 0.4
  ctx.drawImage(tempCanvas, 0, 0);
  ctx.globalAlpha = 1.0;
}

function downloadVideo() {
  const canvas = document.createElement("canvas");
  canvas.width = imageCanvas.width;
  canvas.height = imageCanvas.height;
  const ctx = canvas.getContext("2d");

  if (!window.MediaRecorder) {
    alert(
      "Sorry, video recording is not supported in your browser. Try using Chrome or Firefox."
    );
    return;
  }

  // Get current grain intensity
  const currentIntensity = grainAmount.value / 100;

  // Show loading state
  downloadBtn.classList.add("loading");
  downloadBtn.querySelector(".button-text").textContent = "Recording...";

  const mimeTypes = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ];

  const supportedType = mimeTypes.find((type) =>
    MediaRecorder.isTypeSupported(type)
  );

  if (!supportedType) {
    alert(
      "Sorry, no supported video format found in your browser. Try using Chrome or Firefox."
    );
    downloadBtn.classList.remove("loading");
    downloadBtn.querySelector(".button-text").textContent = "Download";
    return;
  }

  try {
    // Increase FPS and quality
    const stream = canvas.captureStream(60);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: supportedType,
      videoBitsPerSecond: 20000000, // Increased to 20Mbps for better quality
    });

    const chunks = [];
    let isRecording = true;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      downloadBtn.querySelector(".button-text").textContent = "Processing...";

      setTimeout(() => {
        const blob = new Blob(chunks, { type: supportedType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `grain-effect.${
          supportedType.includes("mp4") ? "mp4" : "webm"
        }`;
        link.click();
        URL.revokeObjectURL(url);

        downloadBtn.classList.remove("loading");
        downloadBtn.querySelector(".button-text").textContent = "Download";
      }, 100);
    };

    // Request data more frequently
    mediaRecorder.start(50);

    let frame = 0;
    const fps = 60;
    const durationInSeconds = 2;
    const totalFrames = fps * durationInSeconds; // 2 seconds at 60fps

    function drawFrame() {
      if (!isRecording) return;

      // Use high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Draw frame with current intensity
      drawVideoFrame(ctx, currentIntensity);

      frame++;
      if (frame < totalFrames) {
        requestAnimationFrame(drawFrame);
      } else {
        isRecording = false;
        try {
          mediaRecorder.stop();
        } catch (err) {
          console.error("Error stopping recording:", err);
          alert("There was an error creating the video. Please try again.");
          downloadBtn.classList.remove("loading");
          downloadBtn.querySelector(".button-text").textContent = "Download";
        }
      }
    }

    drawFrame();
  } catch (err) {
    console.error("Error during video recording:", err);
    alert(
      "There was an error creating the video. Please try again or use a different browser."
    );
    downloadBtn.classList.remove("loading");
    downloadBtn.querySelector(".button-text").textContent = "Download";
  }
}

// Update grain when slider changes
grainAmount.addEventListener("input", () => {
  if (originalImage) {
    animateGrain();
  }
});
