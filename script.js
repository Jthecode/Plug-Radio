/* =========================================
   PLUG RADIO STATION — ELITE WEBSITE SCRIPT
   File: script.js
   Role: Navigation, smooth scroll, reveal motion,
         active nav state, sticky header polish,
         multi-page support, audio state
========================================= */

(() => {
  const onReady = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  };

  onReady(() => {
    const body = document.body;
    const header = document.querySelector(".site-header");
    const navToggle = document.querySelector(".nav-toggle");
    const siteNav = document.querySelector("#site-nav");
    const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
    const anchorLinks = Array.from(document.querySelectorAll('a[href^="#"]'));
    const revealItems = Array.from(document.querySelectorAll(".reveal"));
    const sectionNodes = Array.from(document.querySelectorAll("main section[id]"));
    const yearEl = document.getElementById("year");
    const player = document.querySelector(".radio-player");
    const listenSection = document.querySelector("#listen");
    const externalLinks = Array.from(document.querySelectorAll('a[target="_blank"]'));

    /* =========================================
       Constants / helpers
    ========================================== */

    const normalizePath = (value) => {
      if (!value) return "/";

      try {
        const url = new URL(value, window.location.href);
        let path = url.pathname || "/";

        path = path.replace(/\/index\.html$/i, "/");
        path = path.replace(/\/{2,}/g, "/");

        if (path.length > 1 && path.endsWith("/")) {
          path = path.slice(0, -1);
        }

        return path || "/";
      } catch {
        return "/";
      }
    };

    const currentPath = normalizePath(window.location.pathname);

    const isSamePageHashLink = (href) => {
      if (!href || !href.startsWith("#")) return false;
      return href.length > 1;
    };

    const getHeaderOffset = () => {
      if (!header) return 0;
      return header.offsetHeight + 10;
    };

    const scrollToTarget = (target) => {
      if (!target) return;

      const offset = getHeaderOffset();
      const targetTop =
        target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({
        top: Math.max(targetTop, 0),
        behavior: "smooth",
      });
    };

    const closeMobileNav = () => {
      if (!siteNav || !navToggle) return;

      siteNav.classList.remove("is-open");
      navToggle.classList.remove("is-active");
      navToggle.setAttribute("aria-expanded", "false");
      body.classList.remove("nav-open");
    };

    const openMobileNav = () => {
      if (!siteNav || !navToggle) return;

      siteNav.classList.add("is-open");
      navToggle.classList.add("is-active");
      navToggle.setAttribute("aria-expanded", "true");
      body.classList.add("nav-open");
    };

    const toggleMobileNav = () => {
      if (!siteNav || !navToggle) return;

      const isOpen = siteNav.classList.contains("is-open");
      if (isOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    };

    const setPlayerState = (isPlaying) => {
      if (!listenSection) return;
      listenSection.classList.toggle("is-playing", isPlaying);
    };

    /* =========================================
       Footer year
    ========================================== */

    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }

    /* =========================================
       Sticky header polish
    ========================================== */

    const updateHeaderState = () => {
      if (!header) return;
      header.classList.toggle("is-scrolled", window.scrollY > 18);
    };

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });

    /* =========================================
       Mobile nav
    ========================================== */

    if (navToggle) {
      navToggle.addEventListener("click", toggleMobileNav);

      navToggle.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleMobileNav();
        }
      });
    }

    document.addEventListener("click", (event) => {
      if (!siteNav || !navToggle) return;
      if (!siteNav.classList.contains("is-open")) return;

      const target = event.target;
      if (!(target instanceof Node)) return;

      const clickedInsideNav = siteNav.contains(target);
      const clickedToggle = navToggle.contains(target);

      if (!clickedInsideNav && !clickedToggle) {
        closeMobileNav();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMobileNav();
      }
    });

    /* =========================================
       Smooth scrolling for same-page anchors
    ========================================== */

    anchorLinks.forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        const href = anchor.getAttribute("href");

        if (!isSamePageHashLink(href)) return;

        const target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();
        scrollToTarget(target);
        closeMobileNav();

        if (window.history && typeof window.history.pushState === "function") {
          window.history.pushState(null, "", href);
        }
      });
    });

    /* =========================================
       Scroll to hash target on initial load
    ========================================== */

    const scrollToHashOnLoad = () => {
      const { hash } = window.location;
      if (!hash || hash === "#") return;

      const target = document.querySelector(hash);
      if (!target) return;

      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          scrollToTarget(target);
        }, 40);
      });
    };

    scrollToHashOnLoad();

    /* =========================================
       Reveal on scroll
    ========================================== */

    if ("IntersectionObserver" in window && revealItems.length) {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          });
        },
        {
          threshold: 0.14,
          rootMargin: "0px 0px -40px 0px",
        }
      );

      revealItems.forEach((item) => revealObserver.observe(item));
    } else {
      revealItems.forEach((item) => item.classList.add("revealed"));
    }

    /* =========================================
       Nav active state
    ========================================== */

    const clearNavState = () => {
      navLinks.forEach((link) => {
        link.classList.remove("is-active");
        link.removeAttribute("aria-current");
      });
    };

    const setActiveNavByPath = () => {
      if (!navLinks.length) return false;

      let matched = false;

      navLinks.forEach((link) => {
        const href = link.getAttribute("href") || "";

        if (!href || href.startsWith("#")) return;

        const linkPath = normalizePath(href);

        if (linkPath === currentPath) {
          link.classList.add("is-active");
          link.setAttribute("aria-current", "page");
          matched = true;
        }
      });

      return matched;
    };

    const setActiveNavBySection = () => {
      if (!navLinks.length || !sectionNodes.length) return false;

      const scrollPosition = window.scrollY + getHeaderOffset() + 60;
      let currentId = "";

      sectionNodes.forEach((section) => {
        const top = section.offsetTop;
        const height = section.offsetHeight;

        if (scrollPosition >= top && scrollPosition < top + height) {
          currentId = section.id;
        }
      });

      if (!currentId && sectionNodes.length) {
        const firstSection = sectionNodes[0];
        if (window.scrollY < firstSection.offsetTop) {
          currentId = firstSection.id;
        }
      }

      if (!currentId) return false;

      navLinks.forEach((link) => {
        const href = link.getAttribute("href") || "";
        if (href === `#${currentId}`) {
          link.classList.add("is-active");
          link.setAttribute("aria-current", "page");
        }
      });

      return true;
    };

    const updateNavState = () => {
      clearNavState();

      const isHomeLikePath =
        currentPath === "/" ||
        currentPath === "/index.html" ||
        currentPath.endsWith("/index") ||
        currentPath.endsWith("/plug-radio-station");

      if (isHomeLikePath && sectionNodes.length) {
        const matchedSection = setActiveNavBySection();
        if (matchedSection) return;
      }

      setActiveNavByPath();
    };

    updateNavState();
    window.addEventListener("scroll", updateNavState, { passive: true });
    window.addEventListener("resize", updateNavState);
    window.addEventListener("hashchange", () => {
      updateNavState();
      scrollToHashOnLoad();
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        closeMobileNav();
      });
    });

    /* =========================================
       Audio player quality-of-life
    ========================================== */

    if (player) {
      player.addEventListener("play", () => setPlayerState(true));
      player.addEventListener("pause", () => setPlayerState(false));
      player.addEventListener("ended", () => setPlayerState(false));
      player.addEventListener("emptied", () => setPlayerState(false));
      player.addEventListener("error", () => setPlayerState(false));
    }

    /* =========================================
       External link hardening
    ========================================== */

    externalLinks.forEach((link) => {
      const rel = (link.getAttribute("rel") || "").trim();
      const relParts = rel ? rel.split(/\s+/) : [];

      if (!relParts.includes("noopener")) relParts.push("noopener");
      if (!relParts.includes("noreferrer")) relParts.push("noreferrer");

      link.setAttribute("rel", relParts.join(" ").trim());
    });
  });
})();