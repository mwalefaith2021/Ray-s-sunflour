(function () {
  "use strict";

  const WHATSAPP_NUMBER = "26772961923";

  /* ---------------- Header scroll state ---------------- */
  const header = document.getElementById("siteHeader");
  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 30);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------------- Mobile nav ---------------- */
  const navToggle = document.getElementById("navToggle");
  const navMobile = document.getElementById("navMobile");
  const toggleNav = (open) => {
    navMobile.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  navToggle.addEventListener("click", () => {
    toggleNav(!navMobile.classList.contains("is-open"));
  });
  navMobile.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => toggleNav(false))
  );

  /* ---------------- Reveal on scroll ---------------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------------- Menu filter tabs ---------------- */
  const tabs = document.querySelectorAll(".menu-tab");
  const cards = document.querySelectorAll("#menuGrid .menu-card");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      const filter = tab.dataset.filter;
      cards.forEach((card) => {
        const show = filter === "all" || card.dataset.cat === filter;
        card.style.display = show ? "" : "none";
      });
    });
  });

  /* ---------------- Toast helper ---------------- */
  const toastEl = document.getElementById("toast");
  let toastTimer = null;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2400);
  }

  /* ---------------- Payment copy buttons ---------------- */
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const value = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(value);
      } catch (e) {
        const ta = document.createElement("textarea");
        ta.value = value;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      const original = btn.innerHTML;
      btn.classList.add("is-copied");
      btn.textContent = "Copied!";
      showToast("Number copied to clipboard");
      setTimeout(() => {
        btn.classList.remove("is-copied");
        btn.innerHTML = original;
      }, 1800);
    });
  });

  /* ---------------- Booking form -> WhatsApp ---------------- */
  const bookingForm = document.getElementById("bookingForm");
  const productSelect = document.getElementById("product");

  // Pre-fill product when a "Book this" link is clicked from the menu
  document.querySelectorAll("[data-book]").forEach((link) => {
    link.addEventListener("click", () => {
      const value = link.dataset.book;
      setTimeout(() => {
        const options = Array.from(productSelect.options);
        const match = options.find((o) => o.value === value);
        if (match) productSelect.value = value;
      }, 300);
    });
  });

  function setFieldError(fieldId, hasError) {
    const field = document.getElementById(fieldId);
    if (field) field.classList.toggle("error", hasError);
  }

  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const product = document.getElementById("product").value;
    const size = document.getElementById("size").value.trim();
    const flavor = document.getElementById("flavor").value.trim();
    const date = document.getElementById("date").value;
    const message = document.getElementById("message").value.trim();

    let valid = true;
    setFieldError("field-name", !fullName); if (!fullName) valid = false;
    setFieldError("field-phone", phone.length < 6); if (phone.length < 6) valid = false;
    setFieldError("field-product", !product); if (!product) valid = false;
    setFieldError("field-size", !size); if (!size) valid = false;
    setFieldError("field-date", !date); if (!date) valid = false;

    if (!valid) {
      document.querySelector(".field.error input, .field.error select")?.focus();
      return;
    }

    const lines = [
      "Hi Ray's Sunflour Treats! I'd like to place an order:",
      `• Name: ${fullName}`,
      `• Phone: ${phone}`,
      `• Treat: ${product}`,
      `• Size/Qty: ${size}`,
      flavor ? `• Flavour: ${flavor}` : null,
      `• Preferred date: ${date}`,
      message ? `• Notes: ${message}` : null,
    ].filter(Boolean);

    const text = encodeURIComponent(lines.join("\n"));
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;

    document.getElementById("formSuccess").classList.add("is-visible");
    window.open(waUrl, "_blank", "noopener");
  });

  /* ---------------- Reviews ---------------- */
  const STORAGE_KEY = "rays-sunflour-reviews";

  const seedReviews = [
    { name: "Amantle K.", rating: 5, msg: "The Oreo brownies were unreal, so fudgy, and the box arrived perfectly packed. Already planning my next order!", date: "2025-06-02" },
    { name: "Boitumelo M.", rating: 5, msg: "Ordered the cupcake and cakesicle combo for a baby shower. Everyone asked where I got them from. Highly recommend Ray's!", date: "2025-05-21" },
  ];

  function loadReviews() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedReviews));
    return seedReviews;
  }

  function saveReviews(reviews) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    } catch (e) { /* storage unavailable, ignore */ }
  }

  function starString(n) {
    return "★★★★★☆☆☆☆☆".slice(5 - n, 10 - n);
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    } catch (e) {
      return iso;
    }
  }

  const reviewList = document.getElementById("reviewList");
  const avgScoreEl = document.getElementById("avgScore");
  const avgStarsEl = document.getElementById("avgStars");
  const reviewCountEl = document.getElementById("reviewCount");

  function renderReviews() {
    const reviews = loadReviews().slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    reviewList.innerHTML = reviews
      .map(
        (r) => `
        <div class="review-card">
          <div class="row1">
            <span class="name">${escapeHtml(r.name)}</span>
            <span class="stars">${starString(r.rating)}</span>
          </div>
          <p class="msg">${escapeHtml(r.msg)}</p>
          <span class="date">${formatDate(r.date)}</span>
        </div>`
      )
      .join("");

    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 5;
    avgScoreEl.textContent = avg.toFixed(1);
    avgStarsEl.textContent = starString(Math.round(avg));
    reviewCountEl.textContent = `${reviews.length} review${reviews.length === 1 ? "" : "s"}`;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  renderReviews();

  /* Star picker */
  const starPicker = document.getElementById("starPicker");
  let selectedRating = 5;
  function paintStars() {
    starPicker.querySelectorAll("button").forEach((btn) => {
      btn.classList.toggle("is-active", Number(btn.dataset.star) <= selectedRating);
    });
  }
  paintStars();
  starPicker.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedRating = Number(btn.dataset.star);
      paintStars();
    });
  });

  /* Review submit */
  const reviewForm = document.getElementById("reviewForm");
  reviewForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("reviewName").value.trim();
    const msg = document.getElementById("reviewMsg").value.trim();
    if (!name || !msg) {
      showToast("Please add your name and a short review");
      return;
    }
    const reviews = loadReviews();
    reviews.push({
      name,
      rating: selectedRating,
      msg,
      date: new Date().toISOString().slice(0, 10),
    });
    saveReviews(reviews);
    renderReviews();
    reviewForm.reset();
    selectedRating = 5;
    paintStars();
    showToast("Thank you for your review! 💜");
  });

  /* ---------------- Booking date minimum (a few days out) ---------------- */
  const dateInput = document.getElementById("date");
  if (dateInput) {
    const min = new Date();
    min.setDate(min.getDate() + 2);
    dateInput.min = min.toISOString().slice(0, 10);
  }

  /* ---------------- Footer year ---------------- */

  document.getElementById("year").textContent = new Date().getFullYear();
})();
