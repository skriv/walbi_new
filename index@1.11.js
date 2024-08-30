gsap.registerPlugin(
  ScrollTrigger,
  ScrambleTextPlugin,
  SplitText,
  EasePack,
  CustomEase
);

const appHeight = () => {
  const doc = document.documentElement;
  doc.style.setProperty("--app-height", `${window.innerHeight}px`);
};
window.addEventListener("resize", appHeight);
appHeight();
window.addEventListener("DOMContentLoaded", (event) => {
  appHeight();
});

// ————— LENIS
let lenis;

if (Webflow.env("editor") === undefined) {
  lenis = new Lenis({
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  $("[data-lenis-start]").on("click", function () {
    lenis.start();
  });
  $("[data-lenis-stop]").on("click", function () {
    lenis.stop();
  });
  $("[data-lenis-toggle]").on("click", function () {
    $(this).toggleClass("stop-scroll");
    if ($(this).hasClass("stop-scroll")) {
      lenis.stop();
    } else {
      lenis.start();
    }
  });
}

let navItems = document.querySelectorAll("[data-nav-item]");
let loadWrap = document.querySelector(".load-w");
let loadLogo = loadWrap.querySelector(".load-logo");
let menuClose;
let menuOpenFlag = false;
let loadBars;
let loadText;
let lineTargets;
let letterTargets;
let ranHomeLoader = false;
let counter = { value: 0 };
if (loadWrap) {
  loadBars = loadWrap.querySelectorAll(".load-bar");
  loadText = loadWrap.querySelector("#loadCount");
}
let isMobile = window.innerWidth < 550;
let isMobileLandscape = window.innerWidth < 768;
let isTablet = window.innerWidth < 992;

function handleOrientationChange() {
  setTimeout(function () {
    window.location.reload();
  }, 250);
}
window.addEventListener("orientationchange", handleOrientationChange);

CustomEase.create("main", "0.5, 0.05, 0.05, 0.99");
CustomEase.create("load", "0.53, 0, 0, 1");

//
//
// GENERAL
function runSplit(next) {
  next = next || document;
  lineTargets = next.querySelectorAll("[data-split-lines]");
  var split = new SplitText(lineTargets, {
    linesClass: "line",
    type: "lines",
    clearProps: "all",
  });

  letterTargets = next.querySelectorAll("[data-split-letters]");
  if (letterTargets) {
    var splitLetters = new SplitText(letterTargets, {
      type: "lines, words, chars",
      reduceWhiteSpace: false,
      charsClass: "char",
    });
  }
  // ————— Update on window resize
  let windowWidth = $(window).innerWidth();
  window.addEventListener("resize", function () {
    if (windowWidth !== $(window).innerWidth()) {
      windowWidth = $(window).innerWidth();
      split.revert();
      splitLetters.revert();
      runSplit();
    }
  });
}
function resetWebflow(data) {
  let parser = new DOMParser();
  let dom = parser.parseFromString(data.next.html, "text/html");
  let webflowPageId = dom.querySelector("html").getAttribute("data-wf-page");
  document.documentElement.setAttribute("data-wf-page", webflowPageId);
  window.Webflow.destroy();
  window.Webflow.ready();
  window.Webflow.require("ix2").init();
}
function initMenu(next) {
  next = next || document;
  let menuButton = document.querySelector(".menu-btn");
  let burgerLines = document.querySelectorAll(".menu-btn__line");
  let line1 = burgerLines[0];
  let line2 = burgerLines[1];
  let line3 = burgerLines[2];
  let menuWrap = next.querySelector(".menu-w");
  let menuLinkTexts = menuWrap.querySelectorAll(".menu-link__text");
  let menuButtons = menuWrap.querySelectorAll(".menu-button");

  let menuLinks = next.querySelectorAll(".menu-link");

  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      gsap.delayedCall(0.5, () => {
        menuButton.click();
      });
    });
  });

  let menuOpen = gsap.timeline({
    paused: true,
    defaults: {
      duration: 0.8,
      ease: "main",
    },
    onStart: () => {
      lenis.stop();
      menuOpenFlag = true;
    },
  });
  menuOpen
    .set(menuWrap, { display: "block" })
    .to(line2, { scaleX: 0, duration: 0.3, opacity: 0 })
    .to(line1, { x: -20, duration: 0.3, opacity: 0 }, "<")
    .to(line3, { x: 20, duration: 0.3, opacity: 0 }, "<")
    .set(line1, { rotate: -135, y: -20, scaleX: 0.9 })
    .set(line3, { rotate: 135, y: -24, scaleX: 0.9 }, "<")
    .to(line1, { opacity: 1, x: 0, y: 8, duration: 0.3 })
    .to(line3, { opacity: 1, x: 0, y: -4, duration: 0.3 }, "<+=0.1")
    .fromTo(menuWrap, { height: "0dvh" }, { height: "100dvh" }, 0)
    .from(
      menuLinkTexts,
      {
        scrambleText: {
          chars: "uppercase",
          text: "{original}",
          speed: 1,
          delimiter: "",
        },
        stagger: 0.1,
      },
      "<"
    )
    .fromTo(
      menuButtons,
      { autoAlpha: 0, y: 100 },
      {
        autoAlpha: 1,
        y: 0,
        stagger: 0.1,
        duration: 0.6,
      },
      "<+=0.2"
    );

  menuButton.addEventListener("click", () => {
    if (menuOpenFlag) {
      menuClose.progress(0).play();
    } else {
      menuOpen.progress(0).play();
      console.log("open menu");
    }
  });

  menuClose = gsap.timeline({
    paused: true,
    defaults: {
      duration: 0.5,
      ease: "main",
    },
    onComplete: () => {
      lenis.start();
      menuOpenFlag = false;
    },
  });
  menuClose
    .to([line1, line2, line3], {
      scaleX: 1,
      rotate: 0,
      x: 0,
      y: 0,
      opacity: 1,
      duration: 0.45,
      overwrite: "auto",
    })
    .to(menuWrap, { height: "0dvh" }, "<");
}
function initHomeLoader() {
  if (!loadWrap) return;
  let main = document.querySelector(".main-w");
  main.classList.add("is--transitioning");
  let heroLogo = document.querySelector("#hero-logo");
  let navInner = document.querySelector(".nav-inner");
  let heroImg = document.querySelector("#hero-img");
  let heroTop = document.querySelector("#hero-top");
  let heroLeft = document.querySelector("#hero-left");
  let heroRight = document.querySelector("#hero-right");
  let heroCta = document.querySelector("#hero-bottom-cta");
  let introSection = document.querySelector(".section.is--intro");

  let rect = heroLogo.getBoundingClientRect();
  let logoHeight = Math.round(rect.height);
  let targetY = isMobile
    ? Math.round(window.innerHeight / 2 - logoHeight - 80)
    : Math.round(window.innerHeight - logoHeight - 112);

  function updateLoaderText() {
    let progress = Math.round(counter.value);
    loadText.textContent = progress;
  }

  let tl = gsap.timeline({
    defaults: {
      ease: "load",
      duration: 1.2,
    },
    onComplete: () => {
      ranHomeLoader = true;
      lenis.start();
      gsap.set(loadWrap, { display: "none" });
      main.classList.remove("is--transitioning");
    },
  });

  tl.to(counter, {
    value: 100,
    onUpdate: updateLoaderText,
    duration: 3,
  })
    .set(heroLogo, { opacity: 1 }, 0)
    .fromTo(heroLogo, { y: "120vh" }, { y: targetY, overwrite: "auto" }, 0.1)
    .to(
      ".load-bar__wrap",
      {
        y: "-8em",
        opacity: 0,
      },
      2.75
    )
    .to(heroLogo, { y: 0, overwrite: "auto" }, "<+=0.15")
    .to(navInner, { y: 0 }, "<")
    .to(".lang-btn__wrap", { y: 0 }, "<")
    .to([heroLeft, heroRight], { x: 0 }, "<")
    .to([heroCta, introSection], { y: 0 }, "<")
    .to(heroImg, { y: 0, duration: 1.4 }, "<+=0.15")
    .to(heroTop, { autoAlpha: 1, duration: 0.8 }, "<+=0.25");

  loadBars.forEach((bar, index) => {
    gsap.to(bar, {
      opacity: 1,
      duration: 0.2,
      delay: index * 0.02,
    });
    gsap.to(bar, {
      opacity: 0.1,
      duration: 0.3,
      delay: 1.2 + index * 0.01,
    });
  });
}
function initNavHover() {
  if (isMobile) return;
  navItems = document.querySelectorAll("[data-nav-item]");

  navItems.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      navItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.setAttribute("data-nav-item", "faded");
        }
      });
    });
    item.addEventListener("mouseleave", () => {
      navItems.forEach((otherItem) => {
        otherItem.setAttribute("data-nav-item", "");
      });
    });
  });
}
function initNavScroll() {
  let nav = document.querySelector(".nav-w");
  let lang = document.querySelector(".lang-w");
  if (!nav) return;
  let lastScrollTop = 0;
  const buffer = 25;

  lenis.on(
    "scroll",
    (e) => {
      let scrollTop = window.scrollY || document.documentElement.scrollTop;

      if (Math.abs(scrollTop - lastScrollTop) > buffer) {
        if (scrollTop > lastScrollTop) {
          gsap.to(nav, {
            autoAlpha: 0,
            y: "-75%",
            ease: "power3",
            overwrite: "auto",
          });
          gsap.to(lang, {
            autoAlpha: 0,
            y: "-75%",
            ease: "power3",
            overwrite: "auto",
          });
        } else {
          gsap.to(nav, {
            autoAlpha: 1,
            y: "0%",
            ease: "power3",
            overwrite: "auto",
          });
          gsap.to(lang, {
            autoAlpha: 1,
            y: "0%",
            ease: "power3",
            overwrite: "auto",
          });
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
      }
    },
    { passive: true }
  );
}
function initScrambles(container) {
  if (!container) container = document;
  let buttons = container.querySelectorAll("[scramble-link]");
  buttons.forEach((button) => {
    let buttonTl = gsap.timeline({
      paused: true,
    });
    buttonTl.to(button.querySelector("[scramble-text]"), {
      scrambleText: {
        chars: "uppercase",
        text: "{original}",
        speed: 1,
        delimiter: "",
      },
      duration: 0.8,
      ease: "ease",
    });
    button.addEventListener("mouseenter", () => {
      buttonTl.timeScale(1).play();
    });
    button.addEventListener("mouseleave", () => {
      buttonTl.timeScale(100).reverse();
    });
  });
}
function initAllStaggerTitles(next) {
  next = next || document;
  let wraps = next.querySelectorAll("[data-stagger-title]");
  wraps.forEach((wrap) => {
    let rects = wrap.querySelectorAll("rect");
    gsap.fromTo(
      rects,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: 0.001,
        stagger: { amount: 1, from: "random" },
        scrollTrigger: {
          trigger: wrap,
          start: "top bottom",
          end: "top center",
          scrub: true,
        },
      }
    );
  });
}
function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {
  if (arguments.length === 2) {
    x = y = 0;
    w = ctx.canvas.width;
    h = ctx.canvas.height;
  }
  offsetX = typeof offsetX === "number" ? offsetX : 0.5;
  offsetY = typeof offsetY === "number" ? offsetY : 0.5;
  if (offsetX < 0) offsetX = 0;
  if (offsetY < 0) offsetY = 0;
  if (offsetX > 1) offsetX = 1;
  if (offsetY > 1) offsetY = 1;
  var iw = img.width,
    ih = img.height,
    r = Math.min(w / iw, h / ih),
    nw = iw * r,
    nh = ih * r,
    cx,
    cy,
    cw,
    ch,
    ar = 1;
  if (nw < w) ar = w / nw;
  if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh; // updated
  nw *= ar;
  nh *= ar;
  cw = iw / (nw / w);
  ch = ih / (nh / h);
  cx = (iw - cw) * offsetX;
  cy = (ih - ch) * offsetY;
  if (cx < 0) cx = 0;
  if (cy < 0) cy = 0;
  if (cw > iw) cw = iw;
  if (ch > ih) ch = ih;
  ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}
function initGridRevealParallax(next) {
  next = next || document;
  let triggers = next.querySelectorAll("[data-grid-reveal]");
  if (!triggers.length) {
    return;
  }
  triggers.forEach((trigger) => {
    let bg = trigger.previousElementSibling;
    let rows = bg.querySelectorAll(".grid-row");
    let lastRows = Array.from(rows).slice(-2);
    let gridItems = [];
    lastRows.forEach((row) => {
      gridItems.push(...row.querySelectorAll(".grid-item"));
    });

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: trigger,
        start: "top bottom",
        end: "top top",
        scrub: true,
      },
      defaults: {
        ease: "none",
      },
    });

    tl.to(
      gridItems,
      { opacity: 0, duration: 0.001, stagger: { amount: 1, from: "random" } },
      0
    );
  });
}
function initAssetFloats(next) {
  if (!isMobileLandscape) return;
  next = next || document;
  let wrap = next.querySelector("[data-asset-float]");
  let panel1 = wrap.querySelector('[data-asset-float="1"]');
  let panel2 = wrap.querySelector('[data-asset-float="2"]');
  let panel3 = wrap.querySelector('[data-asset-float="3"]');

  let tl = gsap.timeline({
    scrollTrigger: {
      trigger: wrap,
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
    },
    defaults: {
      ease: "none",
    },
  });
  tl.fromTo(panel1, { yPercent: -50 }, { yPercent: -150 }, 0)
    .fromTo(panel2, { yPercent: 0 }, { yPercent: 50 }, 0)
    .fromTo(panel3, { yPercent: 0 }, { yPercent: -150 }, 0);
}
function initAutoVideo(next) {
  next = next || document;
  let bgVids = next.querySelectorAll(".bg-vid");
  if (bgVids) {
    bgVids.forEach((video) => {
      if (!video.playing) {
        video.load();
      }
    });
  }
  let tradeVids = next.querySelectorAll(".trading-vid video");
  if (tradeVids) {
    tradeVids.forEach((video) => {
      if (!video.playing) {
        video.load();
      }
    });
  }
}
function initAnimationTrackers(next) {
  next = next || document;
  let wrappers = next.querySelectorAll("[data-visible]");
  wrappers.forEach((wrapper) => {
    ScrollTrigger.create({
      trigger: wrapper,
      start: "top bottom",
      end: "bottom top",
      onEnter: () => {
        wrapper.setAttribute("data-visible", "true");
      },
      onLeaveBack: () => {
        wrapper.setAttribute("data-visible", "false");
      },
      onEnterBack: () => {
        wrapper.setAttribute("data-visible", "true");
      },
      onLeave: () => {
        wrapper.setAttribute("data-visible", "false");
      },
    });
  });
}
function initAutoplaySection() {
  $("[data-autoplay-section]").each(function () {
    const canvas = $(this).find("canvas")[0];
    const embed = $(this).find(".embed")[0];
    const context = canvas.getContext("2d");

    function setCanvasSize() {
      canvas.width = embed.offsetWidth;
      canvas.height = embed.offsetHeight;
    }
    setCanvasSize();

    const frameCount = parseInt($(this).attr("total-frames"), 10);
    const urlStart = $(this).attr("url-start");
    const urlEnd = $(this).attr("url-end");
    const floatingZeros = parseInt($(this).attr("floating-zeros"), 10);
    const fps = parseInt($(this).attr("fps"), 10) || 30;
    const loop = $(this).attr("loop") !== "false";

    const currentFrame = (index) =>
      `${urlStart}${(index + 1)
        .toString()
        .padStart(floatingZeros, "0")}${urlEnd}`;

    const images = [];
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      images.push(img);
    }

    let currentFrameIndex = 0;
    let animationFrameId;

    function render() {
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawImageProp(
        context,
        images[currentFrameIndex],
        0,
        0,
        canvas.width,
        canvas.height,
        0.5,
        0.5
      );
    }

    function startAnimation() {
      animationFrameId = setInterval(() => {
        currentFrameIndex = (currentFrameIndex + 1) % frameCount;
        render();
      }, 1000 / fps);
    }

    function stopAnimation() {
      clearInterval(animationFrameId);
    }

    ScrollTrigger.create({
      trigger: this,
      start: "top bottom",
      end: "bottom top",
      onEnter: startAnimation,
      onLeave: stopAnimation,
      onEnterBack: startAnimation,
      onLeaveBack: stopAnimation,
    });

    $(window).on("resize", function () {
      setCanvasSize();
      render();
    });

    images[0].onload = render;
  });
}
function initLanguages() {
  gsap.delayedCall(1.1, () => {
    let toggle = document.querySelector("#linguana-lang-switcher-toggle");
    let container = document.querySelector(
      "#linguana-lang-switcher-options-container"
    );

    if (toggle) {
      toggle.remove();
    }
    if (container) {
      container.remove();
    }
    showLinguanaLanguageSwitcher();
  });
}
//
//
// HOME
function initHomeParallax(next) {
  next = next || document;
  let wrap = next.querySelector(".home-hero");
  if (!wrap) return;
  let img = wrap.querySelector(".home-hero__img");
  let title = wrap.querySelector(".home-hero__top");

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: wrap,
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
    defaults: { ease: "linear", duration: 1 },
  });

  tl.fromTo(img, { yPercent: 15 }, { yPercent: 0 }).to(
    title,
    { yPercent: 75 },
    0
  );
}
function initAla(next) {
  next = next || document;
  let wrap = next.querySelector(".ala-logo");
  if (!wrap) return;
  let rects = wrap.querySelectorAll("rect");
  let plusLeft = next.querySelector('[data-ala-plus="top-left"]');
  let plusRight = next.querySelector('[data-ala-plus="top-right"]');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: wrap,
      start: "top bottom",
      end: "top center",
      scrub: true,
    },
    defaults: { ease: "linear", duration: 1 },
  });

  tl.fromTo(
    rects,
    {
      opacity: 0,
    },
    {
      opacity: 1,
      duration: 0.001,
      stagger: { amount: 1, from: "random" },
    }
  )
    .from(
      plusLeft,
      {
        rotate: 215,
        xPercent: 300,
        duration: 1,
      },
      0
    )
    .from(
      plusRight,
      {
        rotate: -215,
        xPercent: -300,
        duration: 1,
      },
      0
    );
}
function initSocialSlider(next) {
  next = next || document;
  let nextButton = next.querySelector("[data-coverflow-next]");
  let prevButton = next.querySelector("[data-coverflow-prev]");
  var swiper = new Swiper(".swiper.coverflow", {
    effect: "coverflow",
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: "auto",
    initialSlide: 1,
    spaceBetween: 16,
    speed: 600,
    slideToClickedSlide: true,
    coverflowEffect: {
      rotate: 35,
      stretch: 0,
      depth: 100,
      modifier: 1,
      slideShadows: true,
    },
    navigation: {
      nextEl: nextButton,
      prevEl: prevButton,
    },
    breakpoints: {
      480: {
        spaceBetween: 50,
      },
    },
  });
}
function initProcessSection(next) {
  next = next || document;
  const progressBarElems = next.querySelectorAll(".progress-bar");
  const totalProgressBars = progressBarElems.length;
  const section = next.querySelector(".process-section");

  ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate: (self) => {
      const progress = self.progress;
      const targetIndex = Math.min(
        Math.floor(progress * totalProgressBars),
        totalProgressBars - 1
      );

      progressBarElems.forEach((elem, index) => {
        if (index < targetIndex) {
          elem.classList.add("is--full");
          elem.classList.remove("is--tall");
        } else if (index === targetIndex) {
          elem.classList.add("is--tall");
          if (index > 0) {
            progressBarElems[index - 1].classList.add("is--full");
            progressBarElems[index - 1].classList.remove("is--tall");
          }
        } else {
          elem.classList.remove("is--full", "is--tall");
        }
      });

      if (progress === 1) {
        progressBarElems[totalProgressBars - 1].classList.add("is--full");
        progressBarElems[totalProgressBars - 1].classList.remove("is--tall");
      }
    },
  });
}
function initProcessSectionText(next) {
  next = next || document;
  const triggers = next.querySelectorAll(".process-trigger");
  const texts = next.querySelectorAll(".process-text");
  const progressNumber = next.querySelector("[data-progress-nr]");

  triggers.forEach((trigger, index) => {
    let nextText = texts[index + 1];
    let currentText = texts[index];

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: trigger,
        start: "top 80% bottom",
        end: "top 40%",
        scrub: true,
        onEnter: () => {
          gsap.set(nextText, { opacity: 1 });
          progressNumber.textContent = `0${index + 2}`;
        },
        onLeaveBack: () => {
          progressNumber.textContent = `0${index + 1}`;
        },
      },
    });

    timeline
      .to(
        currentText.querySelectorAll(".line"),
        {
          y: "-1em",
          autoAlpha: 0,
          stagger: 0.03,
          duration: 0.5,
        },
        0
      )
      .to(
        currentText.querySelector(".line .is--alt"),
        {
          scrambleText: {
            text: currentText.querySelector(".line .is--alt").textContent,
            chars: "$€£¢¥%→↑↓←↙↖↗↘",
            speed: 1,
            revealDelay: 0.5,
            tweenLength: false,
            delimiter: "",
          },
          duration: 0.5,
        },
        0
      )
      .from(
        nextText.querySelectorAll(".line"),
        {
          y: "1em",
          autoAlpha: 0,
          stagger: 0.03,
          duration: 0.5,
        },
        0.5
      )
      .from(
        nextText.querySelector(".line .is--alt"),
        {
          scrambleText: {
            text: nextText.querySelector(".line .is--alt").textContent,
            chars: "$€£¢¥%→↑↓←↙↖↗↘",
            speed: 1,
            revealDelay: 0.5,
            tweenLength: false,
            delimiter: "",
          },
          duration: 0.5,
        },
        0.5
      );
  });
}
function initLightHouseTop(next) {
  next = next || document;
  let section = next.querySelector('[data-lighthouse-top="section"]');
  if (!section) return;
  let vid = section.querySelector(".lh-intro__vid");
  let scrollWrap = section.querySelector(".lh-top__wrap");
  let phoneWrap = scrollWrap.querySelector(".lh-phone__wrap");
  let phone = phoneWrap.querySelector(".lh-phone");
  let gridItems = phone.querySelectorAll(".grid-child");
  const pageWidth = window.innerWidth;
  const elementWidth = phone.offsetWidth;
  const targetScale = Math.ceil((pageWidth / elementWidth) * 11) / 10;
  let textLines = phoneWrap.querySelectorAll(".line");
  let circles = phoneWrap.querySelectorAll(".large-circle");

  if (window.innerWidth < 768 && window.innerHeight < 500) {
    gsap.set(phoneWrap, { y: "140vh" });
  } else {
    gsap.set(phoneWrap, { y: "90vh" });
  }

  let lhScrollTl = gsap.timeline({
    defaults: {
      ease: "linear",
    },
  });

  lhScrollTl
    .to(phoneWrap, { y: "0vh", duration: 0.4 })
    .to(vid, { opacity: 0, duration: 0.05 }, 0)
    .to(
      gridItems,
      {
        opacity: 1,
        stagger: { amount: 0.6, from: "random" },
        duration: 0.01,
      },
      0.2
    )
    .to(
      phone,
      {
        scale: targetScale,
        rotate: 0.001,
        duration: 0.6,
        ease: "expoScale(1, 5)",
      },
      0.35
    )
    .from(
      textLines,
      {
        autoAlpha: 0,
        yPercent: 50,
        stagger: { amount: 0.4 },
        duration: 0.2,
      },
      0.6
    )
    .from(
      circles,
      {
        autoAlpha: 0,
        duration: 0.2,
      },
      "<+=0.2"
    );

  ScrollTrigger.create({
    animation: lhScrollTl,
    trigger: scrollWrap,
    start: "top 40%",
    end: "bottom bottom",
    scrub: true,
  });

  let processReveal = gsap.timeline({ defaults: { ease: "linear" } });
  let processSection = next.querySelector(".process-section");
  let processInner = processSection.querySelector(".process-w");
  const processText = next.querySelector(".process-text");

  processReveal
    .from(processInner, { opacity: 0, duration: 1 })
    .from(
      processText.querySelectorAll(".line"),
      {
        y: "1em",
        autoAlpha: 0,
        stagger: 0.03,
        duration: 0.5,
        clearProps: "all",
      },
      0.6
    )
    .from(
      processText.querySelector(".line .is--alt"),
      {
        scrambleText: {
          text: "{original}",
          chars: "$€£¢¥%→↑↓←↙↖↗↘",
          speed: 1,
          revealDelay: 0.5,
          tweenLength: false,
        },
        duration: 0.5,
      },
      0.6
    );

  ScrollTrigger.create({
    trigger: processSection,
    start: "top top",
    endTrigger: section,
    end: "bottom top",
    onEnter: () => {
      gsap.set(processSection, { autoAlpha: 1 });
    },
    onLeaveBack: () => {
      gsap.set(processSection, { autoAlpha: 0 });
    },
    animation: processReveal,
    scrub: true,
  });
}
function initLightHouseBottom(next) {
  next = next || document;
  let section = next.querySelector(".lh-bottom");
  let img = section.querySelector(".lh-bottom__img");

  gsap.fromTo(
    img,
    {
      xPercent: -5,
      yPercent: 10,
      rotate: 0.001,
      z: -100,
    },
    {
      xPercent: 5,
      yPercent: -5,
      rotate: -6,
      z: 0,
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    }
  );
}
function initScrubSection() {
  $("[data-scrub-section]").each(function (index) {
    const canvas = $(this).find("canvas")[0];
    const embed = $(this).find(".embed")[0];
    const context = canvas.getContext("2d");
    function setCanvasSize() {
      canvas.width = embed.offsetWidth;
      canvas.height = embed.offsetHeight;
    }
    setCanvasSize();
    const frameCount = $(this).attr("total-frames");
    const urlStart = $(this).attr("url-start");
    const urlEnd = $(this).attr("url-end");
    const floatingZeros = $(this).attr("floating-zeros");
    const currentFrame = (index) =>
      `${urlStart}${(index + 1)
        .toString()
        .padStart(floatingZeros, "0")}${urlEnd}`;
    const images = [];
    const imageFrames = {
      frame: 0,
    };
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      images.push(img);
    }
    gsap.to(imageFrames, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        trigger: $(this),
        start: $(this).attr("scroll-start"),
        end: $(this).attr("scroll-end"),
        scrub: 0,
      },
      onUpdate: render,
    });
    images[0].onload = render;
    function render() {
      context.clearRect(0, 0, embed.offsetWidth, embed.offsetHeight);
      drawImageProp(
        context,
        images[imageFrames.frame],
        0,
        0,
        embed.offsetWidth,
        embed.offsetHeight,
        0.5,
        0.5
      );
    }

    // Update canvas size & animation state
    let iOS = !!navigator.platform.match(/iPhone|iPod|iPad/);
    let resizeTimer;
    $(window).on("resize", function (e) {
      if (iOS) {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          setCanvasSize();
          render();
        }, 250);
      } else {
        setCanvasSize();
        render();
      }
    });
  });
}
function initFeatureScroll(next) {
  next = next || document;
  let featureSection = next.querySelector(".feature-scroll");
  let phone = featureSection.querySelector(".feature-phone");
  let cVisual = featureSection.querySelector(".feature-copilot");
  let cOverlay = cVisual.querySelector(".app-overlay");
  let cSlide = cVisual.querySelector(".app-slideup");
  let xVisual = featureSection.querySelector(".feature-xray");
  let xSlide = xVisual.querySelector(".app-slideup");
  let texts = featureSection.querySelectorAll(".feature-text");

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: featureSection,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
    defaults: {
      ease: "linear",
    },
  });

  timeline
    .to(
      cOverlay,
      {
        opacity: 0.6,
        duration: 0.25,
      },
      0.2
    )
    .from(
      cSlide,
      {
        yPercent: 101,
        duration: 0.25,
        ease: "power3.inOut",
      },
      0.2
    )
    .fromTo(
      phone,
      {
        yPercent: -8,
        rotate: 0,
      },
      {
        yPercent: 8,
        rotate: 3,
        duration: 1,
      }
    )
    .to(
      texts[0].querySelectorAll(".line"),
      {
        y: "-1em",
        autoAlpha: 0,
        stagger: 0.025,
        duration: 0.15,
      },
      0.55
    )
    .to(
      texts[0].querySelector(".line .is--alt"),
      {
        scrambleText: {
          text: "{original}",
          chars: "$€£¢¥%→↑↓←↙↖↗↘",
          speed: 1,
          revealDelay: 0.5,
          tweenLength: false,
          delimiter: "",
        },
        duration: 0.15,
      },
      "<"
    )
    .from(
      texts[1].querySelectorAll(".line"),
      {
        y: "1em",
        autoAlpha: 0,
        stagger: 0.025,
        duration: 0.15,
      },
      0.65
    )
    .to(
      texts[1].querySelectorAll("[data-feature-item]"),
      {
        opacity: 1,
        duration: 0.15,
      },
      "<"
    )
    .from(
      texts[1].querySelector(".line .is--alt"),
      {
        scrambleText: {
          text: "{original}",
          chars: "$€£¢¥%→↑↓←↙↖↗↘",
          speed: 1,
          revealDelay: 0.5,
          tweenLength: false,
          delimiter: "",
        },
        duration: 0.15,
      },
      "<"
    )
    .to(
      cVisual,
      {
        xPercent: -101,
        duration: 0.1,
      },
      "<"
    )
    .from(xVisual, { xPercent: 101, duration: 0.1 }, "<")
    .from(
      xSlide,
      {
        yPercent: 101,
        duration: 0.15,
        ease: "power3.inOut",
      },
      ">"
    );
}
function initAssetsModalParallax(next) {
  if (isMobileLandscape) return;
  next = next || document;
  let trigger = next.querySelector("[data-assets-modal]");
  let target = trigger.querySelector(".asset-modal");

  gsap.from(target, {
    yPercent: 100,
    ease: "expo.out",
    scrollTrigger: {
      trigger: trigger,
      start: "center 75%",
      end: "bottom 20%",
      scrub: true,
    },
  });
}
function initBlogToggle(next) {
  next = next || document;
  const toggles = next.querySelectorAll(".blog-toggle__link");
  const bg = next.querySelector(".blog-toggle__bg");
  let newsCards = next.querySelectorAll('[data-blog-card="news"]');
  let academyCards = next.querySelectorAll('[data-blog-card="academy"]');
  let isNews = true;

  toggles.forEach(function (link) {
    link.addEventListener("click", function () {
      toggles.forEach(function (link) {
        link.classList.toggle("active");
      });
      if (isNews) {
        gsap.to(newsCards, {
          xPercent: -50,
          autoAlpha: 0,
          ease: "main",
          stagger: 0.05,
        });
        gsap.to(academyCards, {
          xPercent: -50,
          autoAlpha: 1,
          ease: "main",
          stagger: 0.05,
          delay: 0.1,
        });
        isNews = false;
      } else {
        gsap.to(newsCards, {
          xPercent: 0,
          autoAlpha: 1,
          ease: "main",
          stagger: { each: 0.05, from: "end" },
          delay: 0.1,
        });
        gsap.to(academyCards, {
          xPercent: 50,
          autoAlpha: 0,
          ease: "main",
          stagger: { each: 0.05, from: "end" },
        });
        isNews = true;
      }
    });
  });
}
function initPressSection(next) {
  next = next || document;
  let sliderTrigger = next.querySelector(".swiper.press");
  let nextButton = next.querySelector("[data-press-next]");
  let prevButton = next.querySelector("[data-press-prev]");

  var swiper = new Swiper(sliderTrigger, {
    grabCursor: true,
    speed: 800,
    centeredSlides: true,
    slidesPerView: "auto",
    spaceBetween: 16,
    navigation: {
      nextEl: nextButton,
      prevEl: prevButton,
    },
    breakpoints: {
      480: {
        spaceBetween: 64,
      },
    },
  });

  ScrollTrigger.create({
    trigger: sliderTrigger,
    start: "center 75%",
    once: true,
    onEnter: () => {
      swiper.slideTo(1, 800, true);
    },
  });
}
function initReviewSection(next) {
  next = next || document;
  let sliderTrigger = next.querySelector(".swiper.reviews");

  var swiper = new Swiper(sliderTrigger, {
    grabCursor: true,
    speed: 800,
    loop: true,
    slideToClickedSlide: true,
    centeredSlides: true,
    slidesPerView: 1.2,
    spaceBetween: 16,
    mousewheel: {
      enabled: true,
      forceToAxis: true,
    },
    breakpoints: {
      480: {
        spaceBetween: 24,
        slidesPerView: 2.5,
      },
      767: {
        spaceBetween: 48,
        slidesPerView: "auto",
      },
    },
  });

  ScrollTrigger.create({
    trigger: sliderTrigger,
    start: "center 75%",
    once: true,
    onEnter: () => {
      swiper.slideTo(2, 800, true);
    },
  });
}
function initBgCells(next) {
  next = next || document;
  let bgContainers = next.querySelectorAll(".bg");
  bgContainers.forEach((bg) => {
    let cellColumns = bg.querySelectorAll(".cell-col");
    let step = 0.25;

    cellColumns.forEach((cellCol, colIndex) => {
      let cells = Array.from(cellCol.querySelectorAll(".cell")).reverse();
      let tl = gsap.timeline({
        scrollTrigger: {
          trigger: bg.parentElement,
          start: "top-=500 bottom",
          end: "bottom top-=150%",
          toggleActions: "play pause resume pause",
        },
        delay: colIndex * (step * 5),
      });

      cells.forEach((cell, cellIndex) => {
        tl.to(
          cell,
          {
            opacity: 1,
            repeat: -1,
            repeatDelay: step * 8,
            keyframes: [
              { opacity: 0, duration: 0 },
              { opacity: 0.1, duration: step },
              { opacity: 0.2, duration: step },
              { opacity: 0.5, duration: step },
              { opacity: 1, duration: step },
              { opacity: 0.5, duration: step },
              { opacity: 0.2, duration: step },
              { opacity: 0.1, duration: step },
              { opacity: 0, duration: step },
            ],
            ease: "none",
          },
          cellIndex * step
        );
      });
    });
  });
}
//
//
// OTHERS
function initTradeHero(next) {
  next = next || document;
  let target = next.querySelector(".trade-hero__img");
  let trigger = next.querySelector(".trade-hero");
  gsap.fromTo(
    target,
    {
      yPercent: 0,
    },
    {
      yPercent: -20,
      scrollTrigger: {
        trigger: trigger,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    }
  );
}
function initFloatingAssets(next) {
  next = next || document;
  let section = next.querySelector(".asset-section");
  if (!section) {
    return;
  }

  let card1 = section.querySelector(".asset-float.is--1");
  let card2 = section.querySelector(".asset-float.is--2");
  let card3 = section.querySelector(".asset-float.is--3");

  let tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
    defaults: {
      ease: "none",
    },
  });

  tl.to(card1, { yPercent: -225 })
    .to(card2, { yPercent: 150 }, "<")
    .to(card3, { yPercent: -150 }, "<");
}
function initTradeScroll(next) {
  next = next || document;
  let section = next.querySelector(".trading-track");
  if (!section) {
    return;
  }
  let letters = section.querySelectorAll(".char");
  let titles = section.querySelectorAll(".trading-title__w h3");
  let paragraphs = section.querySelectorAll(".trading-p__w p");
  let vids = section.querySelectorAll(".trading-vid");

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top bottom",
      end: "bottom bottom",
      scrub: true,
    },
    defaults: {
      ease: "linear",
      duration: 0.1,
    },
  });

  timeline
    .to(letters, {
      opacity: 1,
      duration: 0.05,
      stagger: { amount: 1 },
    }) // first title moving out
    .to(
      titles[0].querySelectorAll(".line"),
      {
        y: "-1em",
        autoAlpha: 0,
        stagger: 0.025,
      },
      0.35
    )
    .to(
      paragraphs[0].querySelectorAll(".line"),
      { y: "-1em", autoAlpha: 0, stagger: 0.015 },
      "<"
    )
    .to(vids[0], { autoAlpha: 0, duration: 0.15 }, "<")
    .to(
      titles[0].querySelector(".line .is--alt"),
      {
        scrambleText: {
          text: "{original}",
          chars: "$€£¢¥%→↑↓←↙↖↗↘",
          speed: 1,
          revealDelay: 0.5,
          tweenLength: false,
          delimiter: "",
        },
      },
      "<"
    ) // second title coming in
    .fromTo(
      titles[1],
      { y: "1em", autoAlpha: 0 },
      { y: "0em", autoAlpha: 1 },
      0.4
    )
    .fromTo(
      paragraphs[1].querySelectorAll(".line"),
      { y: "1em", autoAlpha: 0 },
      { y: "0em", autoAlpha: 1, stagger: 0.015 },
      "<"
    )
    .from(vids[1], { autoAlpha: 0, duration: 0.15 }, "<")
    .to(paragraphs[1], { autoAlpha: 1 }, "<")
    .from(
      titles[1].querySelector(".line .is--alt"),
      {
        scrambleText: {
          text: "{original}",
          chars: "$€£¢¥%→↑↓←↙↖↗↘",
          speed: 1,
          revealDelay: 0.5,
          tweenLength: false,
          delimiter: "",
        },
      },
      "<"
    ) // second title moving out
    .to(
      titles[1].querySelectorAll(".line"),
      {
        y: "-1em",
        autoAlpha: 0,
        stagger: 0.025,
      },
      0.65
    )
    .to(
      paragraphs[1].querySelectorAll(".line"),
      { y: "-1em", autoAlpha: 0, stagger: 0.015 },
      "<"
    )
    .to(vids[1], { autoAlpha: 0, duration: 0.15 }, "<")
    .to(
      titles[1].querySelector(".line .is--alt"),
      {
        scrambleText: {
          text: "{original}",
          chars: "$€£¢¥%→↑↓←↙↖↗↘",
          speed: 1,
          revealDelay: 0.5,
          tweenLength: false,
          delimiter: "",
        },
      },
      "<"
    ) // third title coming in
    .fromTo(
      titles[2],
      { y: "1em", autoAlpha: 0 },
      { y: "0em", autoAlpha: 1 },
      0.7
    )
    .fromTo(
      paragraphs[2].querySelectorAll(".line"),
      { y: "1em", autoAlpha: 0 },
      { y: "0em", autoAlpha: 1, stagger: 0.015 },
      "<"
    )
    .from(vids[2], { autoAlpha: 0, duration: 0.15 }, "<")
    .to(paragraphs[2], { autoAlpha: 1 }, "<")
    .from(
      titles[2].querySelector(".line .is--alt"),
      {
        scrambleText: {
          text: "{original}",
          chars: "$€£¢¥%→↑↓←↙↖↗↘",
          speed: 1,
          revealDelay: 0.5,
          tweenLength: false,
          delimiter: "",
        },
      },
      "<"
    );
}
function initLanguage(next) {
  next = next || document.querySelector(".main-w");
  const langButton = document.querySelector("#lang-wrap");
  const langWrap = document.querySelector(".lang-btn__wrap");
  if (langButton) {
    langWrap.appendChild(langButton);
  }

  if (window.innerWidth > 767) {
    let navInner = document.querySelector(".nav-inner");
    if (langButton) {
      let buttonWidth = langButton.offsetWidth + 32;
      gsap.set(navInner, { paddingRight: buttonWidth });
    }
  }

  const checkLanguages = ["ko", "zh", "hi", "ar", "ru"];
  const altLangs = ["ar", "ru"];
  document.body.className = "";

  function checkLanguage() {
    const path = window.location.pathname;
    const segments = path.split("/");
    const langCode = segments[1];

    if (checkLanguages.includes(langCode)) {
      if (langCode === "ko") {
        document.body.classList.add("korean");
      } else if (langCode === "zh") {
        document.body.classList.add("chinese");
      } else if (langCode === "hi") {
        document.body.classList.add("hindi");
      } else if (altLangs.includes(langCode)) {
        document.body.classList.add("alt-lang");
      }
    } else {
      document.body.classList.add("english");
    }
  }

  checkLanguage();
}
function initThemeCheck(next) {
  document.body.setAttribute("data-theme", "default");
  let pageName = next.getAttribute("data-barba-namespace");
  const lightPages = ["blog", "academy", "article"];

  if (lightPages.includes(pageName)) {
    document.body.setAttribute("data-theme", "light");
  }
}

//
//
//
//

function initCoins(next) {
  next = next || document;
  const apiUrl = "https://gw.walbi.com/api/instrument/list/enabled/v1";

  // Elements for loading and displaying content
  const assetsList = next.querySelector(".asset-list");
  const loadingWrap = next.querySelector(".assets-loading");

  // Start by showing the loading indicator
  assetsList.style.display = "none";
  loadingWrap.style.display = "block";

  // Define a map to hold references to new items by their symbols
  const newItemsMap = {}; // Initialization of newItemsMap

  const requestOptions = {
    method: "POST",
    body: JSON.stringify({}),
    credentials: "omit",
    headers: {
      "accept-language": "en-US",
      "content-type": "application/json",
      "x-cid-app": "web@walbi@2024.2.1@1",
      "x-cid-device": "@@desktop",
      "x-cid-os": "mac_os@10.15.7",
      "x-cid-ver": "1",
    },
    mode: "cors",
  };

  fetch(apiUrl, requestOptions)
    .then((res) => res.json())
    .then((data) => {
      //console.log("Data fetched from Walbi API:", data);
      const dummyItem = next.querySelector("[data-asset-item]");
      const parentContainer = dummyItem.parentElement;

      data.list.forEach((item) => {
        const newItem = dummyItem.cloneNode(true);
        const assetIcon = newItem.querySelector("[data-asset-icon]");
        const img = document.createElement("img");
        img.classList.add("cover-img");
        img.src = item.icon_url;
        assetIcon.appendChild(img);
        const assetName = newItem.querySelector("[data-asset-name]");
        assetName.textContent = item.symbol;
        parentContainer.appendChild(newItem);
        // Store each newItem in the map with the symbol as the key
        newItemsMap[item.symbol] = newItem;
      });
      dummyItem.remove();
      return processCoins(data.list, newItemsMap);
    })
    .catch((err) => {
      console.error("Fetch error from Walbi API:", err);
    });
}
function processCoins(coins, newItemsMap) {
  const cryptoApiUrl = "https://32c2rt-3000.csb.app/api/crypto";
  const assetDetails = [];
  const noDataItems = [];

  fetch(cryptoApiUrl)
    .then((res) => res.json())
    .then((cmcData) => {
      coins.forEach((coin) => {
        const cryptoDetail = cmcData.data.find((c) => c.symbol === coin.symbol);
        const newItem = newItemsMap[coin.symbol];

        if (cryptoDetail && newItem) {
          updateCoinData(newItem, cryptoDetail);
          assetDetails.push({
            element: newItem,
            marketCap: cryptoDetail.quote.USD.market_cap,
          });
        } else {
          //console.log(`No data found for ${coin.symbol}`);
          if (newItem) {
            noDataItems.push({ element: newItem });
          }
        }
      });

      assetDetails.sort((a, b) => b.marketCap - a.marketCap);
      updateAssetListDisplay(assetDetails, noDataItems.length);
    })
    .catch((err) => console.error("Fetch error from Crypto API:", err));
}
function updateAssetListDisplay(sortedItems, noDataCount) {
  const parentContainer = document.querySelector(".asset-list");
  parentContainer.innerHTML = "";

  let header = document.querySelector(".asset-header");
  if (header) {
    header.style.display = "flex";
    parentContainer.appendChild(header);
  }

  let remainingText = document.querySelector("[data-assets-remaining]");
  if (remainingText) {
    remainingText.innerHTML = noDataCount;
  }

  sortedItems.forEach((item) => {
    if (item && item.element) {
      parentContainer.appendChild(item.element);
    } else {
      console.log("Invalid item found: ", item);
    }
  });

  document.querySelector(".assets-loading").style.display = "none";
  gsap.set(".asset-item", { autoAlpha: 0 });
  document.querySelector(".asset-list").style.display = "flex";
  document.querySelector(".assets-remaining").style.display = "flex";
  gsap.fromTo(
    ".asset-item",
    { autoAlpha: 0, yPercent: 25 },
    { autoAlpha: 1, yPercent: 25, stagger: 0.05, ease: "main" }
  );
  lenis.resize();
  ScrollTrigger.refresh();
}
function updateCoinData(newItem, cryptoDetail) {
  const formatChange = (change) => {
    return parseFloat(change).toFixed(2);
  };

  const priceElement = newItem.querySelector('[data-asset="price"]');
  if (priceElement) {
    priceElement.textContent = `$${formatChange(cryptoDetail.quote.USD.price)}`;
  }

  const changeHandlers = [
    { key: "1-hour", value: "percent_change_1h" },
    { key: "24-hour", value: "percent_change_24h" },
    { key: "7-day", value: "percent_change_7d" },
  ];

  changeHandlers.forEach(({ key, value }) => {
    const element = newItem.querySelector(`[data-asset="${key}"]`);
    if (element) {
      const change = formatChange(cryptoDetail.quote.USD[value]);
      element.textContent = `${change}%`;
      const parent = element.parentElement.parentElement;
      parent.classList.add(change.startsWith("-") ? "down" : "up");
    }
  });

  // Market Cap and Volume
  const marketCapElement = newItem.querySelector('[data-asset="market-cap"]');
  if (marketCapElement) {
    marketCapElement.textContent =
      cryptoDetail.quote.USD.market_cap.toLocaleString();
  }

  const volumeElement = newItem.querySelector('[data-asset="volume"]');
  if (volumeElement) {
    volumeElement.textContent =
      cryptoDetail.quote.USD.volume_24h.toLocaleString();
  }
}

//
//
//
//

function initGeneral(next) {
  runSplit(next);
  initNavHover();
  initMenu(next);
  initNavScroll();
  initLanguages();
  initScrambles(next);
  initAllStaggerTitles(next);
  initGridRevealParallax(next);
  initAnimationTrackers(next);
  initThemeCheck(next);
  gsap.delayedCall(1, () => {
    ranHomeLoader = true;
    ScrollTrigger.refresh();
    lenis.resize();
    initLanguage(next);
    const badge = document.querySelector(".linguana-badge");
    const badge2 = document.querySelector(".w-webflow-badge");
    if (badge) {
      badge.remove();
      badge2.remove();
    }
  });
}

function initHome(next) {
  initHomeParallax(next);
  initBgCells(next);
  initAutoVideo(next);
  initAla(next);
  initLightHouseTop(next);
  initLightHouseBottom(next);
  initProcessSection(next);
  initProcessSectionText(next);
  initFeatureScroll(next);
  initAssetsModalParallax(next);
  initAssetFloats(next);
  initSocialSlider(next);
  initBlogToggle(next);
  initPressSection(next);
  initReviewSection(next);
  gsap.delayedCall(1, () => {
    initScrubSection();
    initAutoplaySection();
  });
}

function initTrade(next) {
  initTradeHero(next);
  initTradeScroll(next);
  initFloatingAssets(next);
  initAutoVideo(next);
  //initAssetFloats(next);
}

function initAI(next) {
  initProcessSection(next);
  initProcessSectionText(next);
  initAutoVideo(next);
  //initAssetFloats(next);
  gsap.delayedCall(1, () => {
    initScrubSection();
  });
}

//
//
//
//

barba.hooks.leave(() => {
  lenis.destroy();
});

barba.hooks.enter((data) => {
  let next = data.next.container;
  next.classList.add("fixed");
});

barba.hooks.afterEnter((data) => {
  let next = data.next.container;
  let triggers = ScrollTrigger.getAll();
  triggers.forEach((trigger) => {
    trigger.kill();
  });

  $(".is--transitioning").removeClass("is--transitioning");
  next.classList.remove("fixed");

  resetWebflow(data);

  lenis = new Lenis({
    duration: 1.1,
    wrapper: document.body,
    easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -13 * t)),
  });
  lenis.scrollTo(".page-w", {
    duration: 0.5,
    force: true,
    lock: true,
  });
});

barba.init({
  //debug: true,
  preventRunning: true,
  prevent: function ({ el }) {
    if (el.hasAttribute("data-barba-prevent")) {
      return true;
    }
  },
  transitions: [
    {
      name: "default",
      sync: false,
      once() {
        lenis.start();
      },
      leave(data) {
        loadBars.forEach((bar, index) => {
          gsap.to(bar, {
            opacity: 1,
            duration: 0.1,
            delay: index * 0.01,
          });
          gsap.to(bar, {
            opacity: 0.1,
            duration: 0.15,
            delay: 0.6 + index * 0.005,
          });
        });

        if (menuOpenFlag) {
          let menuButton = document.querySelector(".menu-btn");
          gsap.delayedCall(0.5, () => {
            menuButton.click();
          });
        }

        function updateLoaderText() {
          let progress = Math.round(counter.value);
          loadText.textContent = progress;
        }

        const tl = gsap.timeline({
          onComplete: () => data.current.container.remove(),
          defaults: {
            ease: "load",
            duration: 0.8,
          },
        });
        tl.set(loadWrap, { display: "block" })
          .fromTo(
            ".nav-inner",
            { y: "0rem", autoAlpha: 1 },
            { y: "-8rem", autoAlpha: 0, duration: 0.6 }
          )
          .fromTo(
            ".lang-btn__wrap",
            { y: "0rem", autoAlpha: 1 },
            { y: "-8rem", autoAlpha: 0, duration: 0.6 },
            "<"
          )
          .fromTo(
            ".load-bar__wrap",
            { y: "-8rem", autoAlpha: 0 },
            { y: "0rem", autoAlpha: 1, duration: 0.6 },
            0.1
          )
          .to(
            counter,
            {
              value: 100,
              onUpdate: updateLoaderText,
              duration: 1.5,
            },
            "<"
          )
          .to(
            data.current.container,
            {
              opacity: 0,
              duration: 0.5,
            },
            "<"
          )
          .fromTo(loadLogo, { y: "110%" }, { y: 0, duration: 1.2 }, "<");
        return tl;
      },
      enter(data) {
        let next = data.next.container;
        gsap.to(loadWrap, { y: "-101vh", duration: 1.2, ease: "load" });
        gsap.set(".nav-inner", { autoAlpha: 1, y: 0 });
        gsap.set(".lang-btn__wrap", { autoAlpha: 1, y: 0 });
        gsap.fromTo(
          data.next.container,
          { y: "100vh", opacity: 0, clearProps: "y" },
          {
            y: "0vh",
            opacity: 1,
            duration: 1.2,
            ease: "load",
            onComplete: function () {
              lenis.start();
              gsap.set(loadWrap, { display: "none", y: "0" });
              gsap.set(data.next.container, { clearProps: "all" });
            },
          }
        );
      },
    },
  ],
  views: [
    {
      namespace: "home",
      afterEnter(data) {
        let next = data.next.container;
        if (ranHomeLoader !== true) {
          initHomeLoader();
        } else {
          resetHome(next);
        }
        initGeneral(next);
        initHome(next);
      },
    },
    {
      namespace: "trade",
      afterEnter(data) {
        let next = data.next.container;
        initGeneral(next);
        initTrade(next);
      },
    },
    {
      namespace: "ai",
      afterEnter(data) {
        let next = data.next.container;
        initGeneral(next);
        initAI(next);
      },
    },
    {
      namespace: "blog",
      afterEnter(data) {
        let next = data.next.container;
        initGeneral(next);
      },
    },
    {
      namespace: "academy",
      afterEnter(data) {
        let next = data.next.container;
        initGeneral(next);
      },
    },
    {
      namespace: "coins",
      afterEnter(data) {
        let next = data.next.container;
        initGeneral(next);
        initCoins(next);
      },
    },
    {
      namespace: "util",
      afterEnter(data) {
        let next = data.next.container;
        initGeneral(next);
        initBgCells(next);
      },
    },
    {
      namespace: "default",
      afterEnter(data) {
        let next = data.next.container;
        initGeneral(next);
      },
    },
    {
      namespace: "article",
      afterEnter(data) {
        let next = data.next.container;
        initGeneral(next);
      },
    },
  ],
});

function resetHome(next) {
  let a = next.querySelector("#hero-top");
  let b = next.querySelector("#hero-bottom-cta");
  let c = next.querySelector("#hero-logo");
  let d = next.querySelector("#hero-img");
  let e = next.querySelector("#hero-left");
  let f = next.querySelector("#hero-right");
  let g = next.querySelector(".nav-inner");
  let s = next.querySelector(".section.is--intro");
  gsap.set([a, b, c, d, e, f, g], {
    autoAlpha: 1,
    y: 0,
    x: 0,
    overwrite: true,
  });
  gsap.set(".load-w", { display: "none" });
}
