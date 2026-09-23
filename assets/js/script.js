'use strict';

// Indonesian strings; English is whatever is already written in index.html
const translationsId = {
  about: "Tentang",
  resume: "Resume",
  portfolio: "Portofolio",
  certificates: "Sertifikat",
  contact: "Kontak",
  aboutMe: "Tentang saya",
  aboutP1: "Saya Rizal Fauzan, seorang Fullstack Developer yang telah merancang dan membangun berbagai solusi, mulai dari aplikasi mobile dan website hingga sistem enterprise multi-modul, termasuk Prada BC System, DWP Assurance, Caraka Broker, HRIS, dan Finance System di PT Ardana Perkasa Group, serta proyek di sektor asuransi, SDM, logistik, pendidikan, dan pemerintahan.",
  aboutP2: "Dengan pengalaman profesional 3 tahun 7 bulan, saya bekerja end-to-end di seluruh stack: Flutter, React.js, Vue.js, Laravel, Nest JS, dan Spring Boot, dengan rekam jejak konsisten dalam menghadirkan sistem yang skalabel dan stabil.",
  aboutP3: "Saya terbiasa menangani integrasi sistem yang kompleks, mengoptimalkan performa aplikasi, dan berkolaborasi lintas tim agar solusi teknologi benar-benar selaras dengan kebutuhan bisnis. Saya cepat beradaptasi dengan teknologi dan lingkungan kerja baru, serta berkomitmen penuh untuk menghadirkan produk berkualitas tepat waktu.",
  whatIdo: "Yang saya kerjakan",
  webDesign: "Desain web",
  webDesignText: "Desain modern berkualitas tinggi yang dibuat secara profesional.",
  webDevelopment: "Pengembangan web",
  webDevelopmentText: "Pengembangan website berkualitas tinggi dengan standar profesional.",
  mobileApps: "Aplikasi mobile",
  mobileAppsText: "Pengembangan aplikasi profesional untuk iOS dan Android.",
  uiuxDesign: "Desain UI/UX",
  uiuxDesignText: "Membuat antarmuka dan pengalaman pengguna yang indah dan intuitif untuk aplikasi web dan mobile.",
  analysis: "Analisis",
  analysisText: "Menganalisis kebutuhan bisnis, requirement, dan data untuk menghasilkan solusi yang efektif.",
  management: "Manajemen",
  managementText: "Mengelola proyek dan mengoordinasikan tim lintas fungsi untuk mencapai tujuan organisasi.",
  funFacts: "Fakta Menarik",
  seeMore: "Lihat Semua",
  githubActivity: "Aktivitas GitHub",
  viewProfile: "Lihat Profil",
  publicRepos: "Repo publik",
  followers: "Pengikut",
  stars: "Bintang",
  topLanguages: "Bahasa paling sering dipakai",
  testimonials: "Testimoni",
  showContacts: "Tampilkan Kontak",
  phone: "Telepon",
  birthday: "Tanggal Lahir",
  location: "Lokasi",
  downloadCv: "Unduh CV",
  hireMe: "Hubungi Saya",
  downloadPortfolio: "Unduh Portofolio",
  education: "Pendidikan",
  workExperience: "Pengalaman Kerja (3 tahun 7 bulan)",
  freelanceProjects: "Proyek Freelance",
  technicalSkills: "Keahlian Teknis",
  searchProjects: "Cari proyek…",
  noProjects: "Tidak ada proyek yang cocok dengan pencarian.",
  visitWebsite: "Kunjungi Website",
  sourceCode: "Kode Sumber",
  getApp: "Unduh Aplikasi",
  siteUnavailable: "Situs sedang tidak tersedia",
  archived: "Arsip",
  caseStudies: "Studi kasus",
  readCaseStudy: "Baca studi kasus",
  csTagFreelance: "Freelance · Full-stack",
  csTagFulltime: "Full-time · Full-stack",
  csTagGov: "Pemerintahan · Frontend",
  csFukumaru: "Pemesanan paket wisata dengan DP dan cicilan",
  csApg: "Enam sistem enterprise: HRIS, keuangan, inventaris, dan lainnya",
  csDigivise: "Penggajian otomatis berdasarkan absensi",
  csSikepang: "Dashboard ketahanan pangan untuk pemerintah kabupaten",
  archivedNote: "Situs ini sudah tidak online. Screenshot menunjukkan tampilannya saat masih aktif.",
  contactMe: "Hubungi saya",
  contactIntro: "Punya proyek, lowongan kerja, atau sekadar ingin menyapa? Chat langsung dengan saya di bawah, atau hubungi lewat WhatsApp atau email.",
  liveChat: "Live chat",
  chatUnavailable: "Live chat sedang tidak tersedia. Silakan hubungi saya lewat WhatsApp atau email di atas.",
  chatStartNote: "Mulai percakapan dan saya akan membalas langsung di sini. Halaman ini boleh ditutup dan dibuka lagi nanti — chat Anda tersimpan di perangkat ini.",
  yourName: "Nama lengkap",
  emailLabel: "Email",
  phoneLabel: "Nomor WhatsApp / telepon",
  topicLabel: "Apa yang Anda butuhkan?",
  topicPlaceholder: "Pilih salah satu…",
  topicWebsite: "Website / aplikasi web",
  topicMobile: "Aplikasi mobile",
  topicSystem: "Sistem bisnis (HRIS, ERP, keuangan…)",
  topicOther: "Lainnya",
  messageLabel: "Pesan",
  yourMessage: "Ceritakan sedikit tentang proyek Anda…",
  requiredHint: "Semua kolom wajib diisi agar saya bisa menghubungi Anda kembali.",
  startChat: "Mulai Chat",
  chatReplyTime: "Biasanya membalas dalam beberapa jam",
  chatOnline: "Sedang online",
  writeMessage: "Tulis pesan…"
};

// strings that only exist in JS
const uiStrings = {
  en: {
    age: "years old",
    switchTo: "Ganti ke Bahasa Indonesia",
    darkOn: "Switch to light mode",
    darkOff: "Switch to dark mode"
  },
  id: {
    age: "Tahun",
    switchTo: "Switch to English",
    darkOn: "Ganti ke mode terang",
    darkOff: "Ganti ke mode gelap"
  }
};

const storage = {
  get: function (key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  },
  set: function (key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }
};

// Wait for DOM to be fully loaded before running code
document.addEventListener("DOMContentLoaded", function() {

  // element toggle function
  const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

  // current language, used by everything below that renders text
  let currentLang = "en";
  const t = function (key) { return uiStrings[currentLang][key]; }

  // sidebar variables
  const sidebar = document.querySelector("[data-sidebar]");
  const sidebarBtn = document.querySelector("[data-sidebar-btn]");

  // sidebar toggle functionality for mobile
  if (sidebarBtn && sidebar) {
    sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });
  }

  // testimonials: the section stays hidden until it has at least one item
  const testimonialsSection = document.querySelector("[data-testimonials]");
  const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");

  if (testimonialsSection && testimonialsItem.length > 0) {
    testimonialsSection.hidden = false;
  }

  const modalContainer = document.querySelector("[data-modal-container]");
  const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
  const overlay = document.querySelector("[data-overlay]");

  // modal variable
  const modalImg = document.querySelector("[data-modal-img]");
  const modalTitle = document.querySelector("[data-modal-title]");
  const modalText = document.querySelector("[data-modal-text]");

  // modal toggle function
  const testimonialsModalFunc = function () {
    if (modalContainer && overlay) {
      modalContainer.classList.toggle("active");
      overlay.classList.toggle("active");
    }
  }

  // add click event to all modal items (only if they exist)
  if (testimonialsItem.length > 0 && modalImg && modalTitle && modalText) {
    for (let i = 0; i < testimonialsItem.length; i++) {
      testimonialsItem[i].addEventListener("click", function () {
        const avatar = this.querySelector("[data-testimonials-avatar]");
        const title = this.querySelector("[data-testimonials-title]");
        const text = this.querySelector("[data-testimonials-text]");

        if (avatar) modalImg.src = avatar.src;
        if (avatar) modalImg.alt = avatar.alt;
        if (title) modalTitle.innerHTML = title.innerHTML;
        if (text) modalText.innerHTML = text.innerHTML;

        testimonialsModalFunc();
      });
    }
  }

  // add click event to modal close button (only if they exist)
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", testimonialsModalFunc);
  }
  if (overlay) {
    overlay.addEventListener("click", testimonialsModalFunc);
  }

  // portfolio search (the hidden data-tech list is searchable too, e.g. "laravel")
  const filterItems = document.querySelectorAll("[data-filter-item]");
  const projectSearch = document.querySelector("[data-project-search]");
  const projectEmpty = document.querySelector("[data-project-empty]");

  const filterProjects = function () {
    const query = projectSearch ? projectSearch.value.trim().toLowerCase() : "";
    let visibleCount = 0;

    for (let i = 0; i < filterItems.length; i++) {
      const item = filterItems[i];
      const link = item.querySelector("[data-project-link]");
      const haystack = [
        link ? link.dataset.popupTitle : "",
        link ? link.dataset.popupUrl : "",
        link ? link.dataset.popupDesc : "",
        link ? link.dataset.popupDescId : "",
        item.dataset.tech || ""
      ].join(" ").toLowerCase();

      const visible = !query || haystack.indexOf(query) !== -1;

      item.classList.toggle("active", visible);
      if (visible) visibleCount++;
    }

    if (projectEmpty) projectEmpty.hidden = visibleCount > 0;
  }

  if (projectSearch) projectSearch.addEventListener("input", filterProjects);

  // project detail modal variables
  const projectLinks = document.querySelectorAll("[data-project-link]");
  const projectModal = document.querySelector("[data-project-modal]");

  if (projectLinks.length > 0 && projectModal) {
    const modalImgBox = projectModal.querySelector("[data-project-modal-img-box]");
    const modalImg = projectModal.querySelector("[data-project-modal-img]");
    const modalTitle = projectModal.querySelector("[data-project-modal-title]");
    const modalUrl = projectModal.querySelector("[data-project-modal-url]");
    const modalDesc = projectModal.querySelector("[data-project-modal-desc]");
    const modalLink = projectModal.querySelector("[data-project-modal-link]");
    const modalRepo = projectModal.querySelector("[data-project-modal-repo]");
    const modalStore = projectModal.querySelector("[data-project-modal-store]");
    const modalArchived = projectModal.querySelector("[data-project-modal-archived]");
    const modalCase = projectModal.querySelector("[data-project-modal-case]");
    const modalCloseEls = projectModal.querySelectorAll("[data-project-modal-close]");

    const setOptionalLink = function (el, href) {
      if (!el) return;
      el.hidden = !href;
      if (href) el.setAttribute("href", href);
    }

    const openProjectModal = function (data) {
      modalTitle.textContent = data.title;
      modalUrl.textContent = data.url;
      modalLink.setAttribute("href", data.url);
      modalDesc.textContent = data.desc || "";

      setOptionalLink(modalCase, data.caseStudy ? "./case-studies/" + data.caseStudy + "/" : "");
      setOptionalLink(modalRepo, data.repo);
      setOptionalLink(modalStore, data.store);

      // archived sites are gone: keep the screenshot, drop the dead link
      const archived = data.status === "archived";
      modalLink.hidden = archived;
      modalArchived.hidden = !archived;
      modalUrl.hidden = archived;

      if (data.status === "offline" || (archived && !data.img)) {
        modalImgBox.classList.add("is-offline");
        modalImg.removeAttribute("src");
      } else {
        modalImgBox.classList.remove("is-offline");
        modalImg.setAttribute("src", data.img);
        modalImg.setAttribute("alt", data.title);
      }

      projectModal.classList.add("active");
      document.body.style.overflow = "hidden";
    }

    const closeProjectModal = function () {
      projectModal.classList.remove("active");
      document.body.style.overflow = "";
    }

    for (let i = 0; i < projectLinks.length; i++) {
      projectLinks[i].addEventListener("click", function (e) {
        e.preventDefault();
        openProjectModal({
          title: this.dataset.popupTitle,
          url: this.dataset.popupUrl,
          img: this.dataset.popupImg,
          desc: (currentLang === "id" && this.dataset.popupDescId) || this.dataset.popupDesc,
          repo: this.dataset.popupRepo,
          store: this.dataset.popupStore,
          caseStudy: this.dataset.caseStudy,
          status: this.dataset.popupStatus
        });
      });
    }

    for (let i = 0; i < modalCloseEls.length; i++) {
      modalCloseEls[i].addEventListener("click", closeProjectModal);
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeProjectModal();
    });
  }

  // page navigation variables
  const navigationLinks = document.querySelectorAll("[data-nav-link]");
  const pages = document.querySelectorAll("article[data-page]");
  const activePageStorageKey = "activePage";

  // switch to a given page (used by nav clicks and on page load restore)
  const switchToPage = function (pageName) {
    let matched = false;

    for (let j = 0; j < pages.length; j++) {
      if (pageName === pages[j].dataset.page) {
        matched = true;
        break;
      }
    }

    if (!matched) return false;

    for (let j = 0; j < navigationLinks.length; j++) {
      navigationLinks[j].classList.toggle("active", pageName === navigationLinks[j].dataset.page);
    }
    for (let j = 0; j < pages.length; j++) {
      pages[j].classList.toggle("active", pageName === pages[j].dataset.page);
    }

    return true;
  }

  // add event to all nav link (only if they exist)
  if (navigationLinks.length > 0 && pages.length > 0) {
    for (let i = 0; i < navigationLinks.length; i++) {
      navigationLinks[i].addEventListener("click", function () {
        const pageName = (this.dataset.page || this.textContent).trim().toLowerCase();

        if (switchToPage(pageName)) {
          window.scrollTo(0, 0);
          storage.set(activePageStorageKey, pageName);
          // collapse the mobile sidebar when jumping from its buttons
          if (sidebar && sidebar.contains(this)) sidebar.classList.remove("active");
        }
      });
    }

    // a #page in the URL wins over the last visited page
    const hashPage = decodeURIComponent(location.hash.slice(1)).toLowerCase();
    const savedPage = storage.get(activePageStorageKey);
    if (hashPage && switchToPage(hashPage)) storage.set(activePageStorageKey, hashPage);
    else if (savedPage) switchToPage(savedPage);

    window.addEventListener("hashchange", function () {
      const page = decodeURIComponent(location.hash.slice(1)).toLowerCase();
      if (switchToPage(page)) window.scrollTo(0, 0);
    });
  }

  // scroll to top button
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");

  if (scrollToTopBtn) {
    // Show/hide button on scroll
    window.addEventListener("scroll", function () {
      if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add("active");
      } else {
        scrollToTopBtn.classList.remove("active");
      }
    });

    // Scroll to top on click
    scrollToTopBtn.addEventListener("click", function (e) {
      e.preventDefault();

      window.scroll({
        top: 0,
        left: 0,
        behavior: "smooth"
      });
    });
  }

  // dynamic age beside birthday text
  const birthDate = document.getElementById("birthDate");
  const ageText = document.getElementById("ageText");

  const renderAge = function () {
    if (!birthDate || !ageText) return;

    const birthday = new Date(birthDate.getAttribute("datetime"));
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();
    const dayDiff = today.getDate() - birthday.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    ageText.textContent = ` (${age} ${t("age")})`;
  }

  // ongoing jobs: keep "Present (N months)" current, counting both end months
  const ongoing = document.querySelectorAll("[data-since]");
  const durationText = function (months, lang) {
    const y = Math.floor(months / 12);
    const m = months % 12;
    const parts = [];
    if (lang === "id") {
      if (y) parts.push(y + " tahun");
      if (m) parts.push(m + " bulan");
    } else {
      if (y) parts.push(y + (y === 1 ? " year" : " years"));
      if (m) parts.push(m + (m === 1 ? " month" : " months"));
    }
    return parts.join(" ");
  };

  for (let i = 0; i < ongoing.length; i++) {
    const el = ongoing[i];
    const since = el.dataset.since.split("-").map(Number);
    const today = new Date();
    const months = (today.getFullYear() - since[0]) * 12 + (today.getMonth() + 1 - since[1]) + 1;
    el.textContent = el.textContent.replace(/\(.*\)/, "(" + durationText(months, "en") + ")");
    if (el.dataset.i18nId) {
      el.dataset.i18nId = el.dataset.i18nId.replace(/\(.*\)/, "(" + durationText(months, "id") + ")");
    }
  }

  // language switcher (EN is the HTML itself, ID comes from translationsId)
  const translatable = document.querySelectorAll("[data-translate]");
  const placeholders = document.querySelectorAll("[data-translate-placeholder]");
  // long-form content carries its Indonesian text inline, next to the English
  const inlineTranslated = document.querySelectorAll("[data-i18n-id]");
  const langToggle = document.querySelector("[data-lang-toggle]");
  const langLabel = document.querySelector("[data-lang-label]");

  for (let i = 0; i < translatable.length; i++) {
    translatable[i].dataset.textEn = translatable[i].textContent.trim().replace(/\s+/g, " ");
  }
  for (let i = 0; i < placeholders.length; i++) {
    placeholders[i].dataset.placeholderEn = placeholders[i].getAttribute("placeholder");
  }
  for (let i = 0; i < inlineTranslated.length; i++) {
    inlineTranslated[i].dataset.textEn = inlineTranslated[i].textContent.trim().replace(/\s+/g, " ");
  }

  const applyLanguage = function (lang) {
    currentLang = lang === "id" ? "id" : "en";
    document.documentElement.lang = currentLang;

    for (let i = 0; i < translatable.length; i++) {
      const el = translatable[i];
      const idText = translationsId[el.dataset.translate];
      el.textContent = currentLang === "id" && idText ? idText : el.dataset.textEn;
    }
    for (let i = 0; i < placeholders.length; i++) {
      const el = placeholders[i];
      const idText = translationsId[el.dataset.translatePlaceholder];
      el.setAttribute("placeholder", currentLang === "id" && idText ? idText : el.dataset.placeholderEn);
    }

    for (let i = 0; i < inlineTranslated.length; i++) {
      const el = inlineTranslated[i];
      el.textContent = currentLang === "id" ? el.dataset.i18nId : el.dataset.textEn;
    }

    if (langLabel) langLabel.textContent = currentLang.toUpperCase();
    if (langToggle) {
      langToggle.setAttribute("title", t("switchTo"));
      langToggle.setAttribute("aria-label", t("switchTo"));
    }

    renderAge();
    updateThemeToggle();
  }

  if (langToggle) {
    langToggle.addEventListener("click", function () {
      const next = currentLang === "id" ? "en" : "id";
      storage.set("lang", next);
      applyLanguage(next);
    });
  }

  // dark / light theme (the saved choice is applied early in <head>)
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const themeIcon = document.querySelector("[data-theme-icon]");
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');

  function updateThemeToggle() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    if (themeIcon) themeIcon.setAttribute("name", isDark ? "sunny-outline" : "moon-outline");
    if (themeToggle) {
      themeToggle.setAttribute("title", t(isDark ? "darkOn" : "darkOff"));
      themeToggle.setAttribute("aria-label", t(isDark ? "darkOn" : "darkOff"));
    }
    if (themeColorMeta) themeColorMeta.setAttribute("content", isDark ? "#121212" : "#ffffff");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      if (isDark) {
        document.documentElement.removeAttribute("data-theme");
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
      }
      storage.set("theme", isDark ? "light" : "dark");
      updateThemeToggle();
    });
  }

  const savedLang = storage.get("lang");
  const browserLang = (navigator.language || "").toLowerCase();
  applyLanguage(savedLang || (browserLang.indexOf("id") === 0 ? "id" : "en"));
  filterProjects();

  // GitHub stats (public API, cached for an hour to stay under the rate limit)
  const githubStats = document.querySelector("[data-github-stats]");

  if (githubStats && window.fetch) {
    const user = githubStats.dataset.githubUser;
    const cacheKey = "githubStats:" + user;
    const langColors = {
      JavaScript: "#f1e05a", TypeScript: "#3178c6", Dart: "#00B4AB", PHP: "#4F5D95",
      Java: "#b07219", Vue: "#41b883", HTML: "#e34c26", CSS: "#563d7c",
      Python: "#3572A5", Kotlin: "#A97BFF", Swift: "#F05138", Blade: "#f7523f"
    };
    const fallbackColors = ["#8b949e", "#6e7681", "#484f58"];

    const renderGithub = function (stats) {
      githubStats.querySelector("[data-github-repos]").textContent = stats.repos;
      githubStats.querySelector("[data-github-followers]").textContent = stats.followers;
      githubStats.querySelector("[data-github-stars]").textContent = stats.stars;

      const langs = stats.languages;
      const total = langs.reduce(function (sum, l) { return sum + l[1]; }, 0);
      if (!total) return;

      const bar = githubStats.querySelector("[data-github-langs-bar]");
      const legend = githubStats.querySelector("[data-github-langs-legend]");
      bar.innerHTML = "";
      legend.innerHTML = "";

      langs.forEach(function (entry, i) {
        const color = langColors[entry[0]] || fallbackColors[i % fallbackColors.length];
        const pct = Math.round((entry[1] / total) * 100);

        const seg = document.createElement("span");
        seg.style.width = (entry[1] / total) * 100 + "%";
        seg.style.background = color;
        seg.title = entry[0] + " " + pct + "%";
        bar.appendChild(seg);

        const li = document.createElement("li");
        const dot = document.createElement("i");
        dot.style.background = color;
        li.appendChild(dot);
        li.appendChild(document.createTextNode(entry[0] + " " + pct + "%"));
        legend.appendChild(li);
      });

      githubStats.querySelector("[data-github-langs]").hidden = false;
    }

    let cached = null;
    try { cached = JSON.parse(sessionStorage.getItem(cacheKey)); } catch (e) {}

    if (cached && Date.now() - cached.time < 3600000) {
      renderGithub(cached.stats);
    } else {
      const api = "https://api.github.com/users/" + encodeURIComponent(user);
      const getJson = function (url) {
        return fetch(url).then(function (res) {
          if (!res.ok) throw new Error(res.status);
          return res.json();
        });
      }

      Promise.all([getJson(api), getJson(api + "/repos?per_page=100&type=owner")])
        .then(function (results) {
          const profile = results[0];
          const repos = results[1].filter(function (r) { return !r.fork; });
          const langCount = {};
          let stars = 0;

          repos.forEach(function (r) {
            stars += r.stargazers_count;
            if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1;
          });

          const languages = Object.keys(langCount)
            .map(function (k) { return [k, langCount[k]]; })
            .sort(function (a, b) { return b[1] - a[1]; })
            .slice(0, 6);

          const stats = {
            repos: profile.public_repos,
            followers: profile.followers,
            stars: stars,
            languages: languages
          };

          try { sessionStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), stats: stats })); } catch (e) {}
          renderGithub(stats);
        })
        .catch(function () {
          // leave the placeholders; the profile link still works
        });
    }
  }
});
