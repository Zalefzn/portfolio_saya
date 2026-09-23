'use strict';

console.log("Script loaded successfully!");

// Wait for DOM to be fully loaded before running code
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM is ready!");

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

  // project detail modal variables
  const projectLinks = document.querySelectorAll("[data-project-link]");
  const projectModal = document.querySelector("[data-project-modal]");

  if (projectLinks.length > 0 && projectModal) {
    const modalImgBox = projectModal.querySelector("[data-project-modal-img-box]");
    const modalImg = projectModal.querySelector("[data-project-modal-img]");
    const modalTitle = projectModal.querySelector("[data-project-modal-title]");
    const modalUrl = projectModal.querySelector("[data-project-modal-url]");
    const modalLink = projectModal.querySelector("[data-project-modal-link]");
    const modalCloseEls = projectModal.querySelectorAll("[data-project-modal-close]");

    const openProjectModal = function (data) {
      modalTitle.textContent = data.title;
      modalUrl.textContent = data.url;
      modalLink.setAttribute("href", data.url);

      if (data.status === "offline") {
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
      navigationLinks[j].classList.remove("active");
    }
    for (let j = 0; j < pages.length; j++) {
      pages[j].classList.remove("active");
    }

    for (let j = 0; j < navigationLinks.length; j++) {
      if (pageName === navigationLinks[j].dataset.page) {
        navigationLinks[j].classList.add("active");
      }
    }
    for (let j = 0; j < pages.length; j++) {
      if (pageName === pages[j].dataset.page) {
        pages[j].classList.add("active");
      }
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
          try {
            localStorage.setItem(activePageStorageKey, pageName);
          } catch (e) {}
        }
      });
    }

    // restore the last visited page on reload
    try {
      const savedPage = localStorage.getItem(activePageStorageKey);
      if (savedPage) switchToPage(savedPage);
    } catch (e) {}
  }

  // scroll to top button
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");
  console.log("Scroll-to-top button found:", scrollToTopBtn);

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
      console.log("Scroll to top clicked!");
      
      // Try multiple scroll methods
      window.scroll({
        top: 0,
        left: 0,
        behavior: "smooth"
      });
      
      // Fallback for older browsers
      setTimeout(function() {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      }, 100);
    });
  }

  // dynamic age beside birthday text
  const birthDate = document.getElementById("birthDate");
  const ageText = document.getElementById("ageText");

  if (birthDate && ageText) {
    const birthday = new Date(birthDate.getAttribute("datetime"));
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();
    const dayDiff = today.getDate() - birthday.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    ageText.textContent = ` (${age} Tahun)`;
  }
});
