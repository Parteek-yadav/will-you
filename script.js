document.addEventListener("DOMContentLoaded", () => {
  const yesBtn = document.getElementById("yes-btn");
  const noBtn = document.getElementById("no-btn");
  const content = document.getElementById("content");

  let noClickStage = 0; // 0–3 for the four messages
  let noClickCount = 0; // total number of No clicks (for Yes button growth)
  let escapeCount = 0; // number of times the No button has escaped
  let noIsFloating = false;

  const noMessages = [
    "Are you sure?",
    "Are you fully sure?",
    "I will be very sad 😢",
    "Nope",
  ];

  function growYesButton() {
    // Grow Yes button based on total No clicks
    noClickCount += 1;
    const growthFactor = 1 + (noClickCount * 0.08); // grows with each No click
    yesBtn.style.transform = `scale(${growthFactor})`;
    yesBtn.style.transition = "transform 0.3s ease";
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

    // Calculate safe boundaries to keep button fully visible
    const minX = 0;
    const maxX = vw - btnWidth;
    const minY = 0;
    const maxY = vh - btnHeight;

    // Current position
    const currentRect = noBtn.getBoundingClientRect();
    let currentX = currentRect.left;
    let currentY = currentRect.top;

    // Ensure current position is within bounds (safety check)
    currentX = Math.max(minX, Math.min(maxX, currentX));
    currentY = Math.max(minY, Math.min(maxY, currentY));

    let targetX;
    let targetY;
    let attempts = 0;
    const minDistance = 100; // minimum distance to move

    // Pick a new random position that's far enough away and fully on screen
    do {
      // Generate random position within safe bounds
      targetX = Math.random() * (maxX - minX) + minX;
      targetY = Math.random() * (maxY - minY) + minY;
      attempts += 1;
    } while (
      Math.hypot(targetX - currentX, targetY - currentY) < minDistance &&
      attempts < 20
    );

    // Final clamp to ensure button stays fully visible
    targetX = Math.max(minX, Math.min(maxX, targetX));
    targetY = Math.max(minY, Math.min(maxY, targetY));

    noBtn.style.left = `${targetX}px`;
    noBtn.style.top = `${targetY}px`;

    // Slight random rotation for more "unpredictable" feel
    const randomAngle = (Math.random() - 0.5) * 24;
    noBtn.style.transform = `rotate(${randomAngle}deg)`;

    // Grow Yes button on each escape attempt
    growYesButton();
  }

  // Handle window resize to keep No button on screen
  window.addEventListener("resize", () => {
    if (noIsFloating) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const btnWidth = noBtn.offsetWidth;
      const btnHeight = noBtn.offsetHeight;

      const currentRect = noBtn.getBoundingClientRect();
      let currentX = currentRect.left;
      let currentY = currentRect.top;

      // Clamp to new viewport bounds
      currentX = Math.max(0, Math.min(vw - btnWidth, currentX));
      currentY = Math.max(0, Math.min(vh - btnHeight, currentY));

      noBtn.style.left = `${currentX}px`;
      noBtn.style.top = `${currentY}px`;
    }
  });

  // No button click behavior with strict message order
  noBtn.addEventListener("click", (event) => {
    event.preventDefault();

    if (noClickStage < 4) {
      // Sequence of four messages
      noBtn.textContent = noMessages[noClickStage];
      noClickStage += 1;
      noClickCount += 1;

      // Grow Yes button on every No click
      growYesButton();

      // After fourth click ("Nope"), enable hover/tap escapes
      if (noClickStage === 4) {
        noBtn.addEventListener("mouseenter", escapeFromPointer);
        noBtn.addEventListener("touchstart", escapeFromPointer, {
          passive: true,
        });
      }
    } else {
      // After the sequence, clicking also triggers an escape
      noClickCount += 1;
      growYesButton();
      escapeFromPointer();
    }
  });

  // Yes button: accept and show final message
  yesBtn.addEventListener("click", () => {
    // Replace all initial content (question, buttons, GIF) with final message
    content.innerHTML =
      '<h1 class="final-message">This just became my favorite moment 💕  - Parteek Y. </h1>';
  });
});

