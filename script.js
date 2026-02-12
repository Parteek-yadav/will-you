document.addEventListener("DOMContentLoaded", () => {
  const yesBtn = document.getElementById("yes-btn");
  const noBtn = document.getElementById("no-btn");
  const content = document.getElementById("content");

  let noClickStage = 0; // 0–3 for the four messages
  let escapeCount = 0; // number of times the No button has escaped
  let yesScale = 1;
  let noIsFloating = false;

  const noMessages = [
    "Are you sure?",
    "Are you fully sure?",
    "I will be very sad 😢",
    "Nope",
  ];

  function growYesButton() {
    yesScale += 0.06; // small, smooth growth
    yesBtn.style.transform = `scale(${yesScale})`;
  }

  function makeNoFloatingIfNeeded() {
    if (noIsFloating) return;

    const rect = noBtn.getBoundingClientRect();

    // Lock current visual position, then switch to fixed so we can move it
    noBtn.style.position = "fixed";
    noBtn.style.left = `${rect.left}px`;
    noBtn.style.top = `${rect.top}px`;
    noBtn.style.margin = "0";
    noBtn.style.zIndex = "10";

    noIsFloating = true;
  }

  function escapeFromPointer() {
    makeNoFloatingIfNeeded();

    escapeCount += 1;

    // Each escape gets faster (shorter duration)
    const baseDuration = 0.7;
    const duration = Math.max(0.15, baseDuration - escapeCount * 0.08);
    noBtn.style.transition = `left ${duration}s ease, top ${duration}s ease, transform ${duration}s ease`;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const btnWidth = noBtn.offsetWidth;
    const btnHeight = noBtn.offsetHeight;

    const maxX = vw - btnWidth;
    const maxY = vh - btnHeight;

    // Current position
    const currentRect = noBtn.getBoundingClientRect();
    const currentX = currentRect.left;
    const currentY = currentRect.top;

    let targetX;
    let targetY;
    let attempts = 0;

    // Pick a new, somewhat distant random position inside the viewport
    do {
      targetX = Math.random() * maxX;
      targetY = Math.random() * maxY;
      attempts += 1;
    } while (
      Math.hypot(targetX - currentX, targetY - currentY) < 80 &&
      attempts < 10
    );

    // Clamp to viewport to keep button fully visible
    targetX = Math.min(Math.max(0, targetX), maxX);
    targetY = Math.min(Math.max(0, targetY), maxY);

    noBtn.style.left = `${targetX}px`;
    noBtn.style.top = `${targetY}px`;

    // Slight random rotation for more "unpredictable" feel
    const randomAngle = (Math.random() - 0.5) * 24;
    noBtn.style.transform = `rotate(${randomAngle}deg)`;

    // Each escape makes Yes a bit more tempting
    growYesButton();
  }

  // No button click behavior with strict message order
  noBtn.addEventListener("click", (event) => {
    event.preventDefault();

    if (noClickStage < 4) {
      // Sequence of four messages
      noBtn.textContent = noMessages[noClickStage];
      noClickStage += 1;

      // After fourth click ("Nope"), enable hover/tap escapes
      if (noClickStage === 4) {
        noBtn.addEventListener("mouseenter", escapeFromPointer);
        noBtn.addEventListener("touchstart", escapeFromPointer, {
          passive: true,
        });
      }
    } else {
      // After the sequence, clicking also triggers an escape
      escapeFromPointer();
    }
  });

  // Yes button: accept and show final message
  yesBtn.addEventListener("click", () => {
    // Replace all initial content (question, buttons, GIF) with final message
    content.innerHTML =
      '<h1 class="final-message">You made me very happy 💖</h1>';
  });
});
