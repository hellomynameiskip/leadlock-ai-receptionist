const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const toast = document.getElementById('toast');

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

if (window.location.hash === '#book-demo') {
  history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
}

window.addEventListener('pageshow', () => {
  if (!window.location.hash) {
    window.scrollTo(0, 0);
  }
});

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove('show'), 1800);
};

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 12);
});

menuToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  menuToggle.classList.toggle('active', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  document.body.classList.toggle('menu-open', isOpen);
});

mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuToggle.classList.remove('active');
  menuToggle.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
}));

document.querySelectorAll('a[href="#book-demo"]').forEach((link) => link.addEventListener('click', (event) => {
  event.preventDefault();
  document.getElementById('book-demo').scrollIntoView({ behavior: 'smooth', block: 'start' });
}));

const videoGate = document.getElementById('video-gate');
const introVideo = document.getElementById('leadlock-intro-video');
const videoCloseButton = document.querySelector('[data-video-close]');
const videoPlayButton = document.querySelector('[data-video-play]');
const videoPhoneCta = document.querySelector('[data-phone-cta]');
const videoComplete = document.getElementById('video-complete');
const videoStage = document.querySelector('.video-gate-stage');
const videoLockNote = document.querySelector('[data-video-lock-note]');
const closeUnlockSeconds = 5;
const phoneRevealSeconds = 12;
let videoGateOpened = false;
let videoCloseUnlocked = false;
let lastFocusedElement = null;

const revealPhoneCta = () => {
  if (videoPhoneCta) {
    videoPhoneCta.hidden = false;
  }
};

const unlockVideoClose = () => {
  if (!videoCloseButton || videoCloseUnlocked) return;
  videoCloseUnlocked = true;
  videoCloseButton.disabled = false;
  videoCloseButton.classList.add('is-unlocked');
  if (videoLockNote) {
    videoLockNote.textContent = 'You can close this now, or keep watching for the live-call instructions.';
  }
};

const openVideoGate = () => {
  if (!videoGate || !introVideo || videoGateOpened) return;
  videoGateOpened = true;
  lastFocusedElement = document.activeElement;
  videoGate.hidden = false;
  videoGate.setAttribute('aria-hidden', 'false');
  document.body.classList.add('video-modal-open');

  window.requestAnimationFrame(() => {
    videoGate.classList.add('is-visible');
    introVideo.play().then(() => {
      if (videoPlayButton) videoPlayButton.hidden = true;
    }).catch(() => {
      if (videoPlayButton) videoPlayButton.hidden = false;
    });
  });
};

const closeVideoGate = () => {
  if (!videoGate || !introVideo || !videoCloseUnlocked) return;
  videoGate.classList.remove('is-visible');
  videoGate.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('video-modal-open');
  introVideo.pause();
  window.setTimeout(() => {
    videoGate.hidden = true;
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }, 280);
};

const triggerVideoGateOnScroll = () => {
  if (videoGateOpened || window.scrollY < 6) return;
  openVideoGate();
  window.removeEventListener('scroll', triggerVideoGateOnScroll);
};

window.addEventListener('scroll', triggerVideoGateOnScroll, { passive: true });

document.querySelectorAll('[data-open-video]').forEach((button) => button.addEventListener('click', openVideoGate));

if (introVideo) {
  introVideo.addEventListener('timeupdate', () => {
    if (introVideo.currentTime >= closeUnlockSeconds) {
      unlockVideoClose();
    }
    if (introVideo.currentTime >= phoneRevealSeconds) {
      revealPhoneCta();
    }
  });

  introVideo.addEventListener('ended', () => {
    unlockVideoClose();
    revealPhoneCta();
    introVideo.hidden = true;
    if (videoStage) {
      videoStage.classList.add('is-complete');
    }
    if (videoComplete) {
      videoComplete.hidden = false;
    }
  });
}

if (videoCloseButton) {
  videoCloseButton.addEventListener('click', closeVideoGate);
}

if (videoPlayButton && introVideo) {
  videoPlayButton.addEventListener('click', () => {
    introVideo.play().then(() => {
      videoPlayButton.hidden = true;
    });
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && videoCloseUnlocked && videoGate && !videoGate.hidden) {
    closeVideoGate();
  }
});

const liveCallTimer = document.getElementById('live-call-timer');
let liveCallSeconds = 102;
const updateLiveCallTimer = () => {
  const minutes = Math.floor(liveCallSeconds / 60);
  const seconds = liveCallSeconds % 60;
  liveCallTimer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};
updateLiveCallTimer();
window.setInterval(() => {
  liveCallSeconds += 1;
  updateLiveCallTimer();
}, 1000);

const callsInput = document.getElementById('missed-calls');
const valueInput = document.getElementById('customer-value');
const callsOutput = document.getElementById('calls-output');
const valueOutput = document.getElementById('value-output');
const roiTotal = document.getElementById('roi-total');
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const updateRangeFill = (input) => {
  const progress = ((input.value - input.min) / (input.max - input.min)) * 100;
  input.style.setProperty('--range', `${progress}%`);
};

const updateRoi = () => {
  const calls = Number(callsInput.value);
  const value = Number(valueInput.value);
  const monthly = calls * value * .3 * 4.33;
  callsOutput.textContent = calls;
  valueOutput.textContent = currency.format(value);
  roiTotal.textContent = currency.format(monthly);
  updateRangeFill(callsInput);
  updateRangeFill(valueInput);
};

[callsInput, valueInput].forEach((input) => input.addEventListener('input', updateRoi));
updateRoi();

document.querySelectorAll('.faq-item button').forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach((faq) => {
      faq.classList.remove('open');
      faq.querySelector('button').setAttribute('aria-expanded', 'false');
      faq.querySelector('button i').textContent = '+';
    });
    if (!wasOpen) {
      item.classList.add('open');
      button.setAttribute('aria-expanded', 'true');
      button.querySelector('i').textContent = '−';
    }
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .1 });
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

document.getElementById('year').textContent = new Date().getFullYear();
