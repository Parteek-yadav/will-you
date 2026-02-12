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

  let currentGrowthScale = 1;

  function growYesButton() {
    // Grow Yes button based on total No clicks
    noClickCount += 1;
    currentGrowthScale = 1 + (noClickCount * 0.08); // grows with each No click
    yesBtn.style.transform = `scale(${currentGrowthScale})`;
    yesBtn.style.transition = "transform 0.3s ease";
  }

  // Handle Yes button hover to combine growth scale with hover effect
  yesBtn.addEventListener("mouseenter", () => {
    yesBtn.style.transform = `translateY(-2px) scale(${currentGrowthScale * 1.04})`;
  });

  yesBtn.addEventListener("mouseleave", () => {
    yesBtn.style.transform = `scale(${currentGrowthScale})`;
  });

  function makeNoFloatingIfNeeded() {
    if (noIsFloating) return;

    const rect = noBtn.getBoundingClientRect();

    // Lock current visual position, then switch to fixed so we can move it
    noBtn.style.position = "fixed";
    noBtn.style.left = `${rect.left}px`;
    noBtn.style.top = `${rect.top}px`;
    noBtn.style.margin = "0";
    noBtn.style.zIndex = "10";
    noBtn.classList.add("floating");

    noIsFloating = true;
  }

  // Function to ensure No button stays fully visible on screen
  function ensureButtonOnScreen() {
    if (!noIsFloating) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rect = noBtn.getBoundingClientRect();
    
    // Get actual rendered dimensions (accounts for rotation)
    const btnWidth = rect.width;
    const btnHeight = rect.height;
    
    // Calculate maximum possible size when rotated (diagonal)
    const maxDimension = Math.sqrt(btnWidth * btnWidth + btnHeight * btnHeight);
    const safetyMargin = Math.max(15, (maxDimension - Math.max(btnWidth, btnHeight)) * 0.6);

    // Safe boundaries - ensure button stays fully visible
    const minX = safetyMargin;
    const maxX = Math.max(minX, vw - btnWidth - safetyMargin);
    const minY = safetyMargin;
    const maxY = Math.max(minY, vh - btnHeight - safetyMargin);

    let currentX = rect.left;
    let currentY = rect.top;
    let needsAdjustment = false;

    // Check and clamp X position
    if (currentX < minX) {
      currentX = minX;
      needsAdjustment = true;
    } else if (currentX + btnWidth > vw - safetyMargin) {
      currentX = Math.max(minX, vw - btnWidth - safetyMargin);
      needsAdjustment = true;
    }

    // Check and clamp Y position
    if (currentY < minY) {
      currentY = minY;
      needsAdjustment = true;
    } else if (currentY + btnHeight > vh - safetyMargin) {
      currentY = Math.max(minY, vh - btnHeight - safetyMargin);
      needsAdjustment = true;
    }

    // Apply correction if needed
    if (needsAdjustment) {
      noBtn.style.left = `${currentX}px`;
      noBtn.style.top = `${currentY}px`;
    }
  }

  // Continuous monitoring to keep button on screen
  let positionMonitorInterval = null;

  function startPositionMonitoring() {
    if (positionMonitorInterval) return;
    positionMonitorInterval = setInterval(() => {
      if (noIsFloating) {
        ensureButtonOnScreen();
      } else {
        stopPositionMonitoring();
      }
    }, 100); // Check every 100ms
  }

  function stopPositionMonitoring() {
    if (positionMonitorInterval) {
      clearInterval(positionMonitorInterval);
      positionMonitorInterval = null;
    }
  }

  function escapeFromPointer() {
    makeNoFloatingIfNeeded();
    startPositionMonitoring();

    escapeCount += 1;

    // Each escape gets faster (shorter duration)
    const baseDuration = 0.7;
    const duration = Math.max(0.15, baseDuration - escapeCount * 0.08);
    noBtn.style.transition = `left ${duration}s ease, top ${duration}s ease, transform ${duration}s ease`;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Get button dimensions - recalculate after potential text changes
    const rect = noBtn.getBoundingClientRect();
    const btnWidth = rect.width || noBtn.offsetWidth;
    const btnHeight = rect.height || noBtn.offsetHeight;
    
    // Calculate maximum possible size when rotated (diagonal)
    const maxDimension = Math.sqrt(btnWidth * btnWidth + btnHeight * btnHeight);
    const safetyMargin = Math.max(15, (maxDimension - Math.max(btnWidth, btnHeight)) * 0.6);

    // Calculate safe boundaries with safety margin to keep button fully visible
    const minX = safetyMargin;
    const maxX = Math.max(minX, vw - btnWidth - safetyMargin);
    const minY = safetyMargin;
    const maxY = Math.max(minY, vh - btnHeight - safetyMargin);

    // Current position
    let currentX = rect.left;
    let currentY = rect.top;

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

    // Apply position first
    noBtn.style.left = `${targetX}px`;
    noBtn.style.top = `${targetY}px`;

    // Slight random rotation for more "unpredictable" feel (limited to prevent overflow)
    const randomAngle = (Math.random() - 0.5) * 12; // Reduced to 12 degrees for extra safety
    noBtn.style.transform = `rotate(${randomAngle}deg)`;

    // Verify position after transform - if off screen, adjust immediately and after animation
    setTimeout(() => {
      ensureButtonOnScreen();
    }, 50);

    // Also verify after transition completes
    setTimeout(() => {
      ensureButtonOnScreen();
    }, duration * 1000 + 100);

    // Grow Yes button on each escape attempt
    growYesButton();
  }

  // Handle window resize to keep No button on screen
  window.addEventListener("resize", () => {
    if (noIsFloating) {
      ensureButtonOnScreen();
    }
  });

  // Also handle scroll (in case page scrolls)
  window.addEventListener("scroll", () => {
    if (noIsFloating) {
      ensureButtonOnScreen();
    }
  }, { passive: true });

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

      // After text change, if floating, ensure button stays on screen
      if (noIsFloating) {
        setTimeout(() => ensureButtonOnScreen(), 10);
      }

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
    content.innerHTML = `
      <img src="./yes.gif" alt="Happy Valentine celebration" class="final-gif" />
      <h1 class="final-message">You made me very happy 💖</h1>
    `;
  });
});


