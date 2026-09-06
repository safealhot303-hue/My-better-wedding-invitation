const EVENT_DATE = new Date("2026-09-25T20:00:00+03:00");
const RSVP_EMAIL = "Safe.alhot303@gmail.com";
const INTRO_KEY = "khaled-nada-envelope-intro-seen-v3";

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
  sessionStorage.setItem(INTRO_KEY, "1");
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
  const seen = sessionStorage.getItem(INTRO_KEY) === "1";
  if (seen) {
    intro.classList.add("is-hidden");
    intro.setAttribute("aria-hidden", "true");
    document.body.classList.remove("intro-active");
    siteContent.removeAttribute("aria-hidden");
    introFinished = true;
    return;
  }

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

  heroImage.addEventListener("error", () => {
    // Keep the visual stable if the WebP/JPG asset is temporarily unavailable.
    heroImage.classList.add("image-missing");
  }, { once: true });

  if (heroImage.complete && heroImage.naturalWidth === 0) {
    heroImage.classList.add("image-missing");
  }
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
