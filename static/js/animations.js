/**
 * Animations.js - File untuk mengelola animasi dan efek visual
 * untuk Health Monitor
 */

document.addEventListener("DOMContentLoaded", function () {
  // Inisialisasi semua animasi
  initAnimations();

  // Attach event listeners untuk animasi tambahan
  attachAnimationEvents();
});

/**
 * Inisialisasi animasi dasar saat halaman dimuat
 */
function initAnimations() {
  // Fade-in elements
  const fadeElements = document.querySelectorAll(".fade-in");
  fadeElements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add("visible");
    }, 100 * index);
  });

  // Slide-in elements
  const slideElements = document.querySelectorAll(".slide-in");
  slideElements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add("visible");
    }, 150 * index);
  });

  // Scale-in elements
  const scaleElements = document.querySelectorAll(".scale-in");
  scaleElements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add("visible");
    }, 100 * index);
  });

  // Typing effect untuk elemen dengan class .typing-effect
  const typingElements = document.querySelectorAll(".typing-effect");
  typingElements.forEach((el) => {
    const text = el.textContent;
    el.textContent = "";
    typeText(el, text);
  });

  // Animate numbers
  animateNumbers();
}

/**
 * Attach event listeners untuk animasi tambahan
 */
function attachAnimationEvents() {
  // Animate on scroll
  window.addEventListener("scroll", function () {
    handleScrollAnimations();
  });

  // Pulse effect untuk button hover
  const buttons = document.querySelectorAll(".btn");
  buttons.forEach((btn) => {
    btn.addEventListener("mouseenter", function () {
      this.classList.add("pulse");
    });

    btn.addEventListener("mouseleave", function () {
      this.classList.remove("pulse");
    });
  });

  // Card hover effects
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.classList.add("card-hover");
    });

    card.addEventListener("mouseleave", function () {
      this.classList.remove("card-hover");
    });
  });
}

/**
 * Handle scroll-based animations
 */
function handleScrollAnimations() {
  const animateOnScrollElements =
    document.querySelectorAll(".animate-on-scroll");

  animateOnScrollElements.forEach((el) => {
    const elementTop = el.getBoundingClientRect().top;
    const elementVisible = 150;

    if (elementTop < window.innerHeight - elementVisible) {
      el.classList.add("visible");
    }
  });
}

/**
 * Animasi typing effect
 * @param {HTMLElement} element - Element target
 * @param {string} text - Text untuk ditampilkan
 */
function typeText(element, text) {
  let i = 0;
  const speed = 50; // kecepatan typing (ms)

  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }

  type();
}

/**
 * Animasi counter untuk angka
 */
function animateNumbers() {
  const numberElements = document.querySelectorAll(".animate-number");

  numberElements.forEach((el) => {
    const targetNumber = parseFloat(el.getAttribute("data-target"));
    const duration = parseInt(el.getAttribute("data-duration")) || 2000;
    const decimals = el.getAttribute("data-decimals")
      ? parseInt(el.getAttribute("data-decimals"))
      : 0;
    const prefix = el.getAttribute("data-prefix") || "";
    const suffix = el.getAttribute("data-suffix") || "";

    let startTime;
    let currentNumber = 0;

    function updateNumber(timestamp) {
      if (!startTime) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);
      currentNumber = progress * targetNumber;

      el.textContent = prefix + currentNumber.toFixed(decimals) + suffix;

      if (progress < 1) {
        window.requestAnimationFrame(updateNumber);
      } else {
        el.textContent = prefix + targetNumber.toFixed(decimals) + suffix;
      }
    }

    window.requestAnimationFrame(updateNumber);
  });
}

/**
 * Efek parallax untuk background
 */
function createParallaxEffect() {
  const parallaxElements = document.querySelectorAll(".parallax");

  window.addEventListener("scroll", function () {
    parallaxElements.forEach((el) => {
      const scrollPosition = window.pageYOffset;
      const speed = el.getAttribute("data-speed") || 0.5;

      el.style.transform = `translateY(${scrollPosition * speed}px)`;
    });
  });
}

/**
 * Membuat efek confetti untuk halaman sukses
 */
function celebrateSuccess() {
  // Hanya jalankan jika ada elemen dengan class celebrate
  if (!document.querySelector(".celebrate")) return;

  const colors = [
    "#f94144",
    "#f3722c",
    "#f8961e",
    "#f9c74f",
    "#90be6d",
    "#43aa8b",
    "#577590",
  ];

  // Simpel confetti effect
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.animationDelay = Math.random() * 5 + "s";
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];

    document.body.appendChild(confetti);

    // Auto-cleanup after animation
    setTimeout(() => {
      confetti.remove();
    }, 10000);
  }
}

/**
 * Animasi loading spinner
 */
function showLoading(loadingElementId = "loading") {
  const loadingEl = document.getElementById(loadingElementId);
  if (loadingEl) {
    loadingEl.style.display = "flex";
  }
}

/**
 * Sembunyikan loading spinner
 */
function hideLoading(loadingElementId = "loading") {
  const loadingEl = document.getElementById(loadingElementId);
  if (loadingEl) {
    loadingEl.style.display = "none";
  }
}

/**
 * Validasi form dengan shake effect saat error
 */
function validateFormWithAnimation(formId) {
  const form = document.getElementById(formId);
  if (!form) return false;

  let isValid = true;

  // Check semua required fields
  const requiredInputs = form.querySelectorAll("[required]");
  requiredInputs.forEach((input) => {
    if (!input.value.trim()) {
      // Shake effect for empty fields
      input.classList.add("shake");
      isValid = false;

      // Remove shake class after animation
      setTimeout(() => {
        input.classList.remove("shake");
      }, 600);
    }
  });

  return isValid;
}
