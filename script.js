const EVENT_DATE = new Date("2026-09-25T20:00:00+03:00");
const RSVP_EMAIL = "Safe.alhot303@gmail.com";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const intro = $("#envelopeIntro");
const siteContent = $("#siteContent");
const openInvitation = $("#openInvitation");
const skipIntro = $("#skipIntro");
const audio = $("#bgMusic");
const musicBtn = $("#musicBtn");
const form = $("#rsvpForm");
const formMessage = $("#formMessage");

let musicPlaying = false;
let introFinished = false;

function updateCountdown() {
  const distance = EVENT_DATE.getTime() - Date.now();
  const values = distance <= 0
    ? [0, 0, 0, 0]
    : [
        Math.floor(distance / 86400000),
        Math.floor(distance / 3600000) % 24,
        Math.floor(distance / 60000) % 60,
        Math.floor(distance / 1000) % 60
      ];

  ["days", "hours", "minutes", "seconds"].forEach((id, index) => {
    const element = document.getElementById(id);
    if (element) element.textContent = String(values[index]).padStart(2, "0");
  });
}

function setMusicButton(playing) {
  musicPlaying = playing;
  musicBtn.classList.toggle("playing", playing);
  musicBtn.innerHTML = playing ? "♫ <span>كتم الموسيقى</span>" : "♫ <span>تشغيل الموسيقى</span>";
  musicBtn.setAttribute("aria-label", playing ? "كتم الموسيقى" : "تشغيل الموسيقى");
}

async function playMusic() {
  if (!audio) return;
  try {
    if (audio.readyState === HTMLMediaElement.HAVE_NOTHING) audio.load();
    await audio.play();
    setMusicButton(true);
  } catch {
    setMusicButton(false);
  }
}

function stopMusic() {
  if (!audio) return;
  audio.pause();
  setMusicButton(false);
}

function configureCalendar() {
  const calendarBtn = $("#calendarBtn");
  if (!calendarBtn) return;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "حفل خطوبة خالد وندى",
    dates: "20260925T170000Z/20260925T190000Z",
    location: "نادي اليخت ببورفؤاد - بورسعيد"
  });
  calendarBtn.href = `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function configureForm() {
  if (!form || !RSVP_EMAIL) return;
  form.action = `https://formsubmit.co/${encodeURIComponent(RSVP_EMAIL)}`;
}

function revealMainSite() {
  if (introFinished) return;
  introFinished = true;
  document.body.classList.remove("intro-active");
  siteContent.removeAttribute("aria-hidden");
  siteContent.classList.add("is-entering");

  window.setTimeout(() => {
    intro.classList.add("is-hidden");
    intro.setAttribute("aria-hidden", "true");
    siteContent.classList.remove("is-entering");
  }, 900);
}

function skipEnvelope() {
  if (introFinished) return;
  intro.classList.add("is-opening");
  revealMainSite();
}

function openEnvelope() {
  if (introFinished) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealMainSite();
    return;
  }
  intro.classList.add("is-opening");
  openInvitation.disabled = true;
  skipIntro.disabled = true;

  // Lift the invitation card only after the flap has visibly started opening.
  window.setTimeout(() => {
    const paper = $(".envelope-paper", intro);
    if (paper) paper.classList.add("paper-raised");
  }, 620);

  // The opening gesture is a valid user interaction for audio playback.
  playMusic();

  window.setTimeout(revealMainSite, 3150);
}

function setupIntro() {
  // The envelope intro is intentionally shown on every fresh page load.
  // The visitor always decides whether to open the invitation or skip it.
  document.body.classList.add("intro-active");
  intro.classList.remove("is-hidden", "is-opening");
  intro.setAttribute("aria-hidden", "false");
  siteContent.setAttribute("aria-hidden", "true");

  openInvitation.addEventListener("click", openEnvelope);
  skipIntro.addEventListener("click", () => {
    stopMusic();
    skipEnvelope();
  });
}

function setupMusic() {
  musicBtn.addEventListener("click", () => {
    if (musicPlaying) {
          stopMusic();
      return;
    }
      playMusic();
  });
}

function setupReveal() {
  const revealItems = $$(".reveal");
  if (!revealItems.length) return;

  revealItems.forEach((element, index) => {
    if (element.classList.contains("count-card")) {
      element.style.setProperty("--delay", `${(index % 4) * 90}ms`);
    } else if (element.classList.contains("detail-card")) {
      const detailIndex = $$(".detail-card").indexOf(element);
      element.style.setProperty("--delay", `${detailIndex * 130}ms`);
    }
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    revealItems.forEach(element => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -45px 0px" });

  revealItems.forEach(element => observer.observe(element));
}


function setupHeroImage() {
  const heroImage = $(".hero-image");
  if (!heroImage) return;

  const localJpgFallback = "./assets/hero.jpg";
  const inlineFallback = heroImage.dataset.inlineFallback || "";
  heroImage.addEventListener("error", () => {
    const stage = heroImage.dataset.fallbackStage || "0";
    if (stage === "0") {
      heroImage.dataset.fallbackStage = "1";
      heroImage.src = inlineFallback || localJpgFallback;
      return;
    }
    if (stage === "1" && inlineFallback) {
      heroImage.dataset.fallbackStage = "2";
      heroImage.src = localJpgFallback;
      return;
    }
    heroImage.classList.add("image-missing");
  });

  const trigger = $(".hero-image-trigger");
  const viewer = $("#imageViewer");
  const viewerImage = $("#viewerImage");
  const stage = $("#viewerStage");
  const close = $("#viewerClose");
  const zoomIn = $("#zoomIn");
  const zoomOut = $("#zoomOut");
  const zoomReset = $("#zoomReset");
  if (!trigger || !viewer || !viewerImage || !stage) return;

  let scale = 1;
  let x = 0;
  let y = 0;
  let drag = false;
  let startX = 0;
  let startY = 0;
  let startTX = 0;
  let startTY = 0;

  const render = () => {
    viewerImage.style.transform = `translate3d(${x}px,${y}px,0) scale(${scale})`;
    if (zoomReset) zoomReset.textContent = `${Math.round(scale * 100)}%`;
  };
  const setScale = (next) => {
    scale = Math.min(3, Math.max(1, next));
    if (scale === 1) { x = 0; y = 0; }
    render();
  };
  const open = () => {
    viewer.hidden = false;
    viewer.setAttribute("aria-hidden", "false");
    document.body.classList.add("viewer-open");
    viewerImage.src = heroImage.currentSrc || heroImage.src;
    setScale(1);
    close?.focus();
  };
  const hide = () => {
    viewer.hidden = true;
    viewer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("viewer-open");
    trigger.focus();
  };

  trigger.addEventListener("click", open);
  close?.addEventListener("click", hide);
  $("[data-close-viewer]")?.addEventListener("click", hide);
  zoomIn?.addEventListener("click", () => setScale(scale + .25));
  zoomOut?.addEventListener("click", () => setScale(scale - .25));
  zoomReset?.addEventListener("click", () => setScale(1));

  stage.addEventListener("wheel", (event) => {
    event.preventDefault();
    setScale(scale + (event.deltaY < 0 ? .15 : -.15));
  }, { passive: false });
  stage.addEventListener("pointerdown", (event) => {
    if (scale <= 1) return;
    drag = true; stage.classList.add("is-dragging");
    startX = event.clientX; startY = event.clientY; startTX = x; startTY = y;
    stage.setPointerCapture?.(event.pointerId);
  });
  stage.addEventListener("pointermove", (event) => {
    if (!drag) return;
    x = startTX + event.clientX - startX;
    y = startTY + event.clientY - startY;
    render();
  });
  const endDrag = () => { drag = false; stage.classList.remove("is-dragging"); };
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);
  document.addEventListener("keydown", (event) => {
    if (viewer.hidden) return;
    if (event.key === "Escape") hide();
    if (event.key === "+" || event.key === "=") setScale(scale + .25);
    if (event.key === "-") setScale(scale - .25);
  });
}

function setupForm() {
  if (!form) return;

  form.addEventListener("submit", event => {
    if (!RSVP_EMAIL) {
      event.preventDefault();
      formMessage.textContent = "تعذر تجهيز نموذج التأكيد الآن.";
      return;
    }

    formMessage.textContent = "جاري إرسال التأكيد...";
  });
}

updateCountdown();
window.setInterval(updateCountdown, 1000);
configureCalendar();
configureForm();
setupIntro();
setupMusic();
setupReveal();
setupHeroImage();
setupForm();
