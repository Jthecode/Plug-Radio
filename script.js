/* =========================================
   PLUG RADIO STATION — ELITE WEBSITE SCRIPT
   File: script.js
   Role: Navigation, smooth scroll, reveal motion,
         active nav state, sticky header polish,
         multi-page support, audio state, premium
         hover motion, elite micro-interactions
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
    const docEl = document.documentElement;
    const header = document.querySelector(".site-header");
    const navToggle = document.querySelector(".nav-toggle");
    const siteNav = document.querySelector("#site-nav");

    const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
    const anchorLinks = Array.from(document.querySelectorAll('a[href^="#"]'));
    const revealItems = Array.from(document.querySelectorAll(".reveal"));
    const sectionNodes = Array.from(document.querySelectorAll("main section[id]"));
    const yearEl = document.getElementById("year");

    const mediaPlayers = Array.from(document.querySelectorAll(".radio-player"));
    const listenSection = document.querySelector("#listen");
    const externalLinks = Array.from(document.querySelectorAll('a[target="_blank"]'));

    const heroVisual = document.querySelector(".hero-visual");
    const heroPanel = document.querySelector(".hero-main-panel");
    const buttons = Array.from(document.querySelectorAll(".btn"));

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;

    let lastScrollY = window.scrollY;
    let ticking = false;
    let currentPath = "";

    /* =========================================
       Helpers
    ========================================== */

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

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

    const getCurrentPath = () => normalizePath(window.location.pathname);

    const isSamePageHashLink = (href) => {
      if (!href || !href.startsWith("#")) return false;
      return href.length > 1;
    };

    const getHeaderOffset = () => {
      if (!header) return 0;
      return header.offsetHeight + 10;
    };

    const scrollToTarget = (target, behavior = "smooth") => {
      if (!target) return;

      const offset = getHeaderOffset();
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({
        top: Math.max(top, 0),
        behavior,
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

      const scrollPosition = window.scrollY + getHeaderOffset() + 70;
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

    const updateHeaderState = () => {
      if (!header) return;

      header.classList.toggle("is-scrolled", window.scrollY > 18);

      const scrollingDown = window.scrollY > lastScrollY;
      const farEnough = window.scrollY > 120;

      if (scrollingDown && farEnough && !body.classList.contains("nav-open")) {
        header.style.transform = "translateY(-100%)";
      } else {
        header.style.transform = "translateY(0)";
      }

      lastScrollY = window.scrollY;
    };

    const updateNavState = () => {
      clearNavState();

      currentPath = getCurrentPath();

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

    const updateScrollProgress = () => {
      const scrollable = Math.max(document.body.scrollHeight - window.innerHeight, 1);
      const progress = clamp(window.scrollY / scrollable, 0, 1);
      docEl.style.setProperty("--scroll-progress", progress.toFixed(4));
    };

    const requestScrollUpdate = () => {
      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(() => {
        updateHeaderState();
        updateNavState();
        updateScrollProgress();
        ticking = false;
      });
    };

    /* =========================================
       Boot state
    ========================================== */

    body.classList.add("js-ready");
    currentPath = getCurrentPath();

    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }

    updateHeaderState();
    updateNavState();
    updateScrollProgress();

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

    window.addEventListener("resize", () => {
      if (window.innerWidth > 980) {
        closeMobileNav();
      }
      updateNavState();
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
        closeMobileNav();
        scrollToTarget(target, prefersReducedMotion ? "auto" : "smooth");

        if (window.history && typeof window.history.pushState === "function") {
          window.history.pushState(null, "", href);
        }

        window.setTimeout(updateNavState, 120);
      });
    });

    const scrollToHashOnLoad = () => {
      const { hash } = window.location;
      if (!hash || hash === "#") return;

      const target = document.querySelector(hash);
      if (!target) return;

      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          scrollToTarget(target, prefersReducedMotion ? "auto" : "smooth");
        }, 50);
      });
    };

    scrollToHashOnLoad();

    /* =========================================
       Reveal system
    ========================================== */

    if (revealItems.length) {
      revealItems.forEach((item, index) => {
        const customDelay = Number(item.getAttribute("data-reveal-delay"));
        const delay = Number.isFinite(customDelay) ? customDelay : Math.min(index % 8, 7) * 55;
        item.style.transitionDelay = `${delay}ms`;
      });
    }

    if ("IntersectionObserver" in window && revealItems.length && !prefersReducedMotion) {
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
          rootMargin: "0px 0px -44px 0px",
        }
      );

      revealItems.forEach((item) => revealObserver.observe(item));
    } else {
      revealItems.forEach((item) => item.classList.add("revealed"));
    }

    /* =========================================
       Elite hero parallax
    ========================================== */

    if (heroVisual && heroPanel && hasFinePointer && !prefersReducedMotion) {
      const maxTilt = 7;
      const maxShift = 14;

      heroVisual.addEventListener("pointermove", (event) => {
        const rect = heroVisual.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;

        const rotateY = (px - 0.5) * maxTilt;
        const rotateX = (0.5 - py) * maxTilt;
        const moveX = (px - 0.5) * maxShift;
        const moveY = (py - 0.5) * maxShift;

        heroPanel.style.transform = `
          perspective(1200px)
          rotateX(${rotateX.toFixed(2)}deg)
          rotateY(${rotateY.toFixed(2)}deg)
          translate3d(${moveX.toFixed(1)}px, ${moveY.toFixed(1)}px, 0)
        `;
      });

      heroVisual.addEventListener("pointerleave", () => {
        heroPanel.style.transform =
          "perspective(1200px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)";
      });
    }

    /* =========================================
       Premium button micro-interactions
    ========================================== */

    if (buttons.length && hasFinePointer && !prefersReducedMotion) {
      buttons.forEach((button) => {
        button.addEventListener("pointermove", (event) => {
          const rect = button.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;

          const moveX = ((x / rect.width) - 0.5) * 8;
          const moveY = ((y / rect.height) - 0.5) * 6;

          button.style.transform = `translate3d(${moveX.toFixed(1)}px, ${moveY.toFixed(1)}px, 0)`;
        });

        button.addEventListener("pointerleave", () => {
          button.style.transform = "";
        });
      });
    }

    /* =========================================
       Audio player quality-of-life
    ========================================== */

    if (mediaPlayers.length) {
      mediaPlayers.forEach((player) => {
        player.addEventListener("play", () => setPlayerState(true));
        player.addEventListener("pause", () => setPlayerState(false));
        player.addEventListener("ended", () => setPlayerState(false));
        player.addEventListener("emptied", () => setPlayerState(false));
        player.addEventListener("error", () => setPlayerState(false));
      });
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

    /* =========================================
       Global listeners
    ========================================== */

    window.addEventListener("scroll", requestScrollUpdate, { passive: true });

    window.addEventListener("hashchange", () => {
      updateNavState();
      scrollToHashOnLoad();
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        closeMobileNav();
      });
    });
  });
})();