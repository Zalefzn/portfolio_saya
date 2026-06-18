'use strict';




// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }




// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
if (sidebarBtn && sidebar) {
  sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });
}




// testimonials variables (only if they exist)
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
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




// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

if (select) {
  select.addEventListener("click", function () { elementToggleFunc(this); });
}

// add event in all select items (only if they exist)
if (selectItems.length > 0 && selectValue) {
  for (let i = 0; i < selectItems.length; i++) {
    selectItems[i].addEventListener("click", function () {
      let selectedValue = this.innerText.toLowerCase();
      selectValue.innerText = this.innerText;
      elementToggleFunc(select);
      filterFunc(selectedValue);
    });
  }
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {
  for (let i = 0; i < filterItems.length; i++) {
    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }
  }
}

// add event in all filter button items for large screen (only if they exist)
if (filterBtn.length > 0 && selectValue) {
  let lastClickedBtn = filterBtn[0];

  for (let i = 0; i < filterBtn.length; i++) {
    filterBtn[i].addEventListener("click", function () {
      let selectedValue = this.innerText.toLowerCase();
      selectValue.innerText = this.innerText;
      filterFunc(selectedValue);

      lastClickedBtn.classList.remove("active");
      this.classList.add("active");
      lastClickedBtn = this;
    });
  }
}




// contact form variables (only if they exist)
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

if (form && formInputs.length > 0 && formBtn) {
  // add event to all form input field
  for (let i = 0; i < formInputs.length; i++) {
    formInputs[i].addEventListener("input", function () {
      // check form validation
      if (form.checkValidity()) {
        formBtn.removeAttribute("disabled");
      } else {
        formBtn.setAttribute("disabled", "");
      }
    });
  }
}



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link (only if they exist)
if (navigationLinks.length > 0 && pages.length > 0) {
  for (let i = 0; i < navigationLinks.length; i++) {
    navigationLinks[i].addEventListener("click", function () {
      const pageName = this.innerHTML.trim().toLowerCase();
      
      // First, remove active from all links and pages
      for (let j = 0; j < navigationLinks.length; j++) {
        navigationLinks[j].classList.remove("active");
      }
      for (let j = 0; j < pages.length; j++) {
        pages[j].classList.remove("active");
      }
      
      // Then add active to the clicked link and corresponding page
      this.classList.add("active");
      
      for (let j = 0; j < pages.length; j++) {
        if (pageName === pages[j].dataset.page) {
          pages[j].classList.add("active");
          window.scrollTo(0, 0);
        }
      }
    });
  }
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
  scrollToTopBtn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}


// language switcher
const languageBtns = document.querySelectorAll(".language-btn");
const translations = {
  en: {
    about: "About",
    resume: "Resume",
    portfolio: "Portfolio",
    certificates: "Certificates",
    aboutMe: "About me",
    whatIdo: "What i'm doing",
    webDesign: "Web design",
    webDevelopment: "Web development",
    mobileApps: "Mobile apps",
    uiuxDesign: "UI/UX Design",
    analysis: "Analysis",
    management: "Management",
    overview: "Overview",
    education: "Education",
    experience: "Experience",
    myPortfolio: "My Portfolio",
    downloadPortfolio: "Download Portfolio",
    myCertificates: "My Certificates",
    downloadResume: "Download Resume",
    funFacts: "Fun Facts",
    // Add more translations here
  },
  id: {
    about: "Tentang",
    resume: "Resume",
    portfolio: "Portofolio",
    certificates: "Sertifikat",
    aboutMe: "Tentang saya",
    whatIdo: "Apa yang saya lakukan",
    webDesign: "Desain web",
    webDevelopment: "Pengembangan web",
    mobileApps: "Aplikasi mobile",
    uiuxDesign: "Desain UI/UX",
    analysis: "Analisis",
    management: "Manajemen",
    overview: "Ringkasan",
    education: "Pendidikan",
    experience: "Pengalaman",
    myPortfolio: "Portofolio Saya",
    downloadPortfolio: "Unduh Portofolio",
    myCertificates: "Sertifikat Saya",
    downloadResume: "Unduh Resume",
    funFacts: "Fakta Menarik",
    // Add more translations here
  }
};

let currentLang = "en";

// Function to update all translated elements
function updateLanguage(lang) {
  const elements = document.querySelectorAll("[data-translate]");
  elements.forEach(element => {
    const key = element.getAttribute("data-translate");
    if (translations[lang] && translations[lang][key]) {
      element.textContent = translations[lang][key];
    }
  });
}

if (languageBtns.length > 0) {
  languageBtns.forEach(btn => {
    btn.addEventListener("click", function () {
      const lang = this.dataset.lang;
      
      // Update active button
      languageBtns.forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      
      // Update language
      currentLang = lang;
      
      // Update content
      updateLanguage(lang);
      
      console.log("Language changed to:", lang);
    });
  });
}

// Initialize with English
updateLanguage("en");