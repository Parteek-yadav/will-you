const yesBtn = document.getElementById("yes-btn");
const noBtn = document.getElementById("no-btn");
const app = document.getElementById("app");

let escapeAttempts = 0;
let yesScale = 1;

// Helper to clamp values
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function moveNoButtonAway(event) {
  escapeAttempts++;

  // Make "No" button free to move around the viewport
  if (escapeAttempts === 1) {
    const rect = noBtn.getBoundingClientRect();
    noBtn.style.position = "fixed";
    noBtn.style.left = `${rect.left}px`;
    noBtn.style.top = `${rect.top}px`;
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const btnRect = noBtn.getBoundingClientRect();

  const paddingBase = 40; // minimum distance from edges
  const intensity = clamp(0.2 + escapeAttempts * 0.12, 0.2, 1); // higher = closer to edges

  const padX = paddingBase * (1 - intensity);
  const padY = paddingBase * (1 - intensity);

  const maxLeft = vw - btnRect.width - padX;
  const maxTop = vh - btnRect.height - padY;

  const newLeft = clamp(
    padX + Math.random() * (maxLeft - padX),
    padX,
    maxLeft
  );
  const newTop = clamp(
    padY + Math.random() * (maxTop - padY),
    padY,
    maxTop
  );

  // Speed: faster with each attempt (shorter duration)
  const baseDuration = 0.35;
  const minDuration = 0.08;
  const duration = clamp(baseDuration - escapeAttempts * 0.03, minDuration, baseDuration);

  noBtn.style.transition = `top ${duration}s ease-out, left ${duration}s ease-out, transform 0.15s ease-out`;
  noBtn.style.left = `${newLeft}px`;
  noBtn.style.top = `${newTop}px`;

  // Tiny jitter to feel more "slippery"
  const jitter = Math.min(escapeAttempts * 2, 12);
  const jitterX = (Math.random() - 0.5) * jitter;
  const jitterY = (Math.random() - 0.5) * jitter;
  noBtn.style.transform = `translate(${jitterX}px, ${jitterY}px)`;

  // Grow the "Yes" button slightly each time
  yesScale += 0.05;
  yesBtn.style.transform = `scale(${yesScale})`;
}

// Events that should trigger the escape
["mouseenter", "mousedown", "touchstart"].forEach((evt) => {
  noBtn.addEventListener(evt, moveNoButtonAway);
});

// Handle "Yes" click
yesBtn.addEventListener("click", () => {
  app.innerHTML = `
    <h1 class="final-message">Yay! 💖 Happy Valentine’s Day!</h1>
    <p class="final-subtext">You just made parteek very happy ,I am sure he is grining.</p>
  `;
});
