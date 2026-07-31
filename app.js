const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const toast = document.getElementById('toast');

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

window.addEventListener('pageshow', () => {
  if (window.location.hash) {
    history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  }
  window.scrollTo(0, 0);
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
  openVideoGate({ showPhone: true });
}));

const videoGate = document.getElementById('video-gate');
const introVideo = document.getElementById('leadlock-intro-video');
const videoCloseButton = document.querySelector('[data-video-close]');
const videoPlayButton = document.querySelector('[data-video-play]');
const videoPhoneCta = document.querySelector('[data-phone-cta]');
const videoComplete = document.getElementById('video-complete');
const videoStage = document.querySelector('.video-gate-stage');
const videoCopy = document.querySelector('.video-gate-copy');
const videoLockNote = document.querySelector('[data-video-lock-note]');
const phoneDemoPanel = document.querySelector('[data-phone-demo-panel]');
const closeUnlockSeconds = 2;
const phoneRevealSeconds = 12;
let videoGateAutoTriggered = false;
let videoCloseUnlocked = false;
let lastFocusedElement = null;
let videoCloseTimer = null;

const videoCloseStyle = document.createElement('style');
videoCloseStyle.textContent = `
  .video-gate-close {
    z-index: 5;
    width: 32px;
    height: 32px;
    border: 1px solid rgba(255,255,255,.18);
    color: rgba(255,255,255,.86);
    background: rgba(5,9,17,.62);
    box-shadow: 0 8px 24px rgba(0,0,0,.22);
    transition: opacity .25s ease, color .2s ease, background .2s ease, border-color .2s ease;
  }
  .video-gate-close.is-unlocked {
    opacity: .72;
    pointer-events: auto;
  }
  .video-gate-close.is-unlocked:hover,
  .video-gate-close.is-unlocked:focus-visible {
    opacity: 1;
    color: white;
    background: rgba(255,255,255,.12);
    border-color: rgba(255,255,255,.3);
  }
`;
document.head.appendChild(videoCloseStyle);

const revealPhoneCta = () => {
  if (videoPhoneCta) {
    videoPhoneCta.hidden = false;
  }
};

const resetVideoGate = ({ showPhone = false, callOnly = false } = {}) => {
  videoCloseUnlocked = false;
  window.clearTimeout(videoCloseTimer);
  videoGate.classList.toggle('is-call-only', callOnly);
  if (videoCloseButton) {
    videoCloseButton.disabled = true;
    videoCloseButton.classList.remove('is-unlocked');
  }
  if (videoLockNote) {
    videoLockNote.hidden = callOnly;
    videoLockNote.textContent = 'Close option appears after 2 seconds.';
  }
  if (videoCopy) {
    videoCopy.hidden = callOnly;
  }
  if (videoStage) {
    videoStage.hidden = callOnly;
  }
  if (phoneDemoPanel) {
    phoneDemoPanel.hidden = !callOnly;
  }
  if (videoPhoneCta) {
    videoPhoneCta.hidden = callOnly || !showPhone;
  }
  if (introVideo) {
    introVideo.hidden = false;
    introVideo.pause();
    try {
      introVideo.currentTime = 0;
    } catch (error) {
      // Some browsers delay seeking until metadata is ready.
    }
  }
  if (videoStage) {
    videoStage.classList.remove('is-complete');
  }
  if (videoComplete) {
    videoComplete.hidden = true;
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

const openVideoGate = ({ showPhone = false } = {}) => {
  if (!videoGate || !introVideo) return;
  if (!videoGate.hidden && videoGate.classList.contains('is-visible')) {
    if (showPhone) {
      revealPhoneCta();
    }
    return;
  }
  lastFocusedElement = document.activeElement;
  resetVideoGate({ showPhone });
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

  videoCloseTimer = window.setTimeout(unlockVideoClose, closeUnlockSeconds * 1000);
};

const openCallGate = () => {
  if (!videoGate || !introVideo) return;
  videoGateAutoTriggered = true;
  window.removeEventListener('scroll', triggerVideoGateOnScroll);
  lastFocusedElement = document.activeElement;
  resetVideoGate({ callOnly: true });
  introVideo.pause();
  videoGate.hidden = false;
  videoGate.setAttribute('aria-hidden', 'false');
  document.body.classList.add('video-modal-open');
  unlockVideoClose();
  window.requestAnimationFrame(() => {
    videoGate.classList.add('is-visible');
    const callButton = phoneDemoPanel?.querySelector('.phone-demo-call');
    if (callButton) callButton.focus();
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
  if (videoGateAutoTriggered || window.scrollY < 6) return;
  videoGateAutoTriggered = true;
  openVideoGate();
  window.removeEventListener('scroll', triggerVideoGateOnScroll);
};

window.addEventListener('scroll', triggerVideoGateOnScroll, { passive: true });

document.querySelectorAll('[data-open-video], a[href="#book-demo"]').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    openCallGate();
  });
});

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

const lossCalculator = document.querySelector('[data-loss-calculator]');
const lossPeriodConfig = {
  daily: { label: 'Day', multiplier: 1 },
  weekly: { label: 'Week', multiplier: 7 },
  monthly: { label: 'Month', multiplier: 30 },
  annually: { label: 'Year', multiplier: 365 },
};

if (lossCalculator) {
  const lossInputs = {
    calls: lossCalculator.querySelector('[data-loss-input="calls"]'),
    conversion: lossCalculator.querySelector('[data-loss-input="conversion"]'),
    value: lossCalculator.querySelector('[data-loss-input="value"]'),
  };
  const lossOutputs = {
    calls: document.getElementById('loss-missed-calls-output'),
    conversion: document.getElementById('loss-conversion-output'),
    value: document.getElementById('loss-value-output'),
  };
  const lossPeriodButtons = Array.from(lossCalculator.querySelectorAll('[data-loss-period]'));
  const lossResultLabel = lossCalculator.querySelector('[data-loss-result-label]');
  const lossResultAmount = lossCalculator.querySelector('[data-loss-result]');
  const lossPercentText = lossCalculator.querySelector('[data-loss-percent]');
  let selectedLossPeriod = 'monthly';
  let lossAnimationFrame = null;
  let lossPulseTimer = null;

  const getLossInputs = () => ({
    calls: Number(lossInputs.calls.value),
    conversion: Number(lossInputs.conversion.value),
    value: Number(lossInputs.value.value),
  });

  const calculateLoss = ({ calls, conversion, value }) => {
    const period = lossPeriodConfig[selectedLossPeriod];
    const periodMultiplier = period.multiplier;
    const conversionRate = conversion / 100;
    const dailyLostRevenue = calls * conversionRate * value;
    const lostRevenue = dailyLostRevenue * periodMultiplier;
    const totalPotentialRevenue = calls * value * periodMultiplier;
    const potentialPercentage = totalPotentialRevenue > 0
      ? (lostRevenue / totalPotentialRevenue) * 100
      : null;

    return { lostRevenue, potentialPercentage, periodLabel: period.label };
  };

  const animateLossAmount = (targetValue, shouldAnimate = true) => {
    if (!lossResultAmount) return;
    window.cancelAnimationFrame(lossAnimationFrame);
    const currentValue = Number(lossResultAmount.dataset.currentValue || targetValue);

    if (!shouldAnimate || Math.abs(targetValue - currentValue) < 1) {
      lossResultAmount.textContent = currency.format(targetValue);
      lossResultAmount.dataset.currentValue = String(targetValue);
      return;
    }

    const startedAt = performance.now();
    const duration = 420;
    lossResultAmount.classList.add('is-updating');
    window.clearTimeout(lossPulseTimer);
    lossPulseTimer = window.setTimeout(() => lossResultAmount.classList.remove('is-updating'), 240);

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = currentValue + ((targetValue - currentValue) * eased);
      lossResultAmount.textContent = currency.format(nextValue);
      lossResultAmount.dataset.currentValue = String(nextValue);

      if (progress < 1) {
        lossAnimationFrame = window.requestAnimationFrame(tick);
      } else {
        lossResultAmount.textContent = currency.format(targetValue);
        lossResultAmount.dataset.currentValue = String(targetValue);
      }
    };

    lossAnimationFrame = window.requestAnimationFrame(tick);
  };

  const updateLossCalculator = ({ animate = true } = {}) => {
    const values = getLossInputs();
    const result = calculateLoss(values);

    lossOutputs.calls.textContent = values.calls;
    lossOutputs.conversion.textContent = `${values.conversion}%`;
    lossOutputs.value.textContent = currency.format(values.value);
    Object.values(lossInputs).forEach(updateRangeFill);

    lossPeriodButtons.forEach((button) => {
      const isSelected = button.dataset.lossPeriod === selectedLossPeriod;
      button.classList.toggle('is-selected', isSelected);
      button.setAttribute('aria-pressed', String(isSelected));
    });

    lossResultLabel.textContent = `Estimated Revenue Lost Per ${result.periodLabel}`;
    animateLossAmount(result.lostRevenue, animate);

    if (Number.isFinite(result.potentialPercentage)) {
      lossPercentText.textContent = `That’s approximately ${Math.round(result.potentialPercentage)}% of your potential revenue.`;
    } else {
      lossPercentText.textContent = 'Revenue your business may be losing from unanswered calls.';
    }
  };

  Object.values(lossInputs).forEach((input) => {
    input.addEventListener('input', () => updateLossCalculator());
  });

  lossPeriodButtons.forEach((button) => {
    button.addEventListener('click', () => {
      selectedLossPeriod = button.dataset.lossPeriod;
      updateLossCalculator();
    });
  });

  updateLossCalculator({ animate: false });
}

const coverageComparison = document.querySelector('[data-coverage-comparison]');

if (coverageComparison) {
  const coverageInput = coverageComparison.querySelector('[data-coverage-input]');
  const coverageOutput = document.getElementById('coverage-call-volume-output');
  const coverageOutputs = {
    humanIncoming: coverageComparison.querySelector('[data-coverage-human-incoming]'),
    humanAnswered: coverageComparison.querySelector('[data-coverage-human-answered]'),
    humanBooked: coverageComparison.querySelector('[data-coverage-human-booked]'),
    aiIncoming: coverageComparison.querySelector('[data-coverage-ai-incoming]'),
    aiAnswered: coverageComparison.querySelector('[data-coverage-ai-answered]'),
    aiBooked: coverageComparison.querySelector('[data-coverage-ai-booked]'),
    extra: coverageComparison.querySelector('[data-coverage-extra]'),
    summary: coverageComparison.querySelector('[data-coverage-summary]'),
  };
  const coverageNumber = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });

  const updateCoverageComparison = () => {
    const calls = Number(coverageInput.value);
    const humanAnswered = calls * .55;
    const humanBooked = humanAnswered * .35;
    const aiAnswered = calls;
    const aiBookedLow = aiAnswered * .35;
    const aiBookedHigh = aiAnswered * .4;
    const extraAppointmentsLow = aiBookedLow - humanBooked;
    const extraAppointmentsHigh = aiBookedHigh - humanBooked;

    coverageOutput.textContent = `${coverageNumber.format(calls)} calls`;
    coverageOutputs.humanIncoming.textContent = coverageNumber.format(calls);
    coverageOutputs.humanAnswered.textContent = coverageNumber.format(humanAnswered);
    coverageOutputs.humanBooked.textContent = coverageNumber.format(humanBooked);
    coverageOutputs.aiIncoming.textContent = coverageNumber.format(calls);
    coverageOutputs.aiAnswered.textContent = coverageNumber.format(aiAnswered);
    coverageOutputs.aiBooked.textContent = `${coverageNumber.format(aiBookedLow)}–${coverageNumber.format(aiBookedHigh)}`;
    coverageOutputs.extra.textContent = `${coverageNumber.format(extraAppointmentsLow)}–${coverageNumber.format(extraAppointmentsHigh)}`;
    coverageOutputs.summary.textContent = `From the same ${coverageNumber.format(calls)} incoming calls—even with a lower per-call booking rate.`;
    updateRangeFill(coverageInput);
  };

  coverageInput.addEventListener('input', updateCoverageComparison);
  updateCoverageComparison();
}

const impactSimulator = document.querySelector('[data-impact-simulator]');

if (impactSimulator) {
  impactSimulator.dataset.ready = 'true';
  const scenarios = {
    'new-lead': {
      callerLabel: 'New customer calling now',
      quote: '“Hi, I found you online. Do you have any openings this week?”',
      without: [
        ['Phone keeps ringing', 'Your team is already helping another customer.'],
        ['Caller reaches voicemail', 'They wanted an answer now—not a callback later.'],
        ['They call the next business', 'The lead disappears before your team is free.'],
      ],
      withoutOutcome: 'New customer lost',
      withAI: [
        ['Answered instantly', 'The caller is greeted while their interest is highest.'],
        ['Questions answered', 'LeadLock confirms the service and collects their details.'],
        ['Appointment booked', 'The caller chooses an available time before hanging up.'],
      ],
      withOutcome: 'New appointment secured',
    },
    urgent: {
      callerLabel: 'Urgent service request',
      quote: '“I need help as soon as possible. Can someone come out today?”',
      without: [
        ['No one can pick up', 'Your team is busy coordinating active jobs.'],
        ['Caller waits on voicemail', 'An urgent customer is unlikely to wait for a callback.'],
        ['A competitor answers first', 'The job goes to the first business that responds.'],
      ],
      withoutOutcome: 'Urgent job lost',
      withAI: [
        ['Answered on the first ring', 'LeadLock immediately acknowledges the urgent request.'],
        ['Request qualified', 'The issue, location, and preferred timing are captured.'],
        ['Next step scheduled', 'The caller is routed or booked using your availability.'],
      ],
      withOutcome: 'Urgent opportunity captured',
    },
    'after-hours': {
      callerLabel: 'After-hours caller',
      quote: '“I know you’re probably closed, but I’d like to schedule for tomorrow.”',
      without: [
        ['Business is closed', 'There is no team member available to answer.'],
        ['Caller hears voicemail', 'They have no confirmation that anyone will respond soon.'],
        ['They keep searching', 'Another business books them before morning.'],
      ],
      withoutOutcome: 'After-hours lead lost',
      withAI: [
        ['Answered 24/7', 'LeadLock responds with the same professional greeting.'],
        ['Need understood', 'The caller gets answers and provides the details you need.'],
        ['Tomorrow is booked', 'A confirmed appointment appears on your calendar overnight.'],
      ],
      withOutcome: 'Calendar filled while closed',
    },
  };
  const scenarioButtons = Array.from(impactSimulator.querySelectorAll('[data-impact-scenario]'));
  const scenarioFields = {
    callerLabel: impactSimulator.querySelector('[data-impact-caller-label]'),
    quote: impactSimulator.querySelector('[data-impact-caller-quote]'),
    withoutTitles: [
      impactSimulator.querySelector('[data-impact-without-step-one]'),
      impactSimulator.querySelector('[data-impact-without-step-two]'),
      impactSimulator.querySelector('[data-impact-without-step-three]'),
    ],
    withoutDetails: [
      impactSimulator.querySelector('[data-impact-without-detail-one]'),
      impactSimulator.querySelector('[data-impact-without-detail-two]'),
      impactSimulator.querySelector('[data-impact-without-detail-three]'),
    ],
    withoutOutcome: impactSimulator.querySelector('[data-impact-without-outcome]'),
    withTitles: [
      impactSimulator.querySelector('[data-impact-with-step-one]'),
      impactSimulator.querySelector('[data-impact-with-step-two]'),
      impactSimulator.querySelector('[data-impact-with-step-three]'),
    ],
    withDetails: [
      impactSimulator.querySelector('[data-impact-with-detail-one]'),
      impactSimulator.querySelector('[data-impact-with-detail-two]'),
      impactSimulator.querySelector('[data-impact-with-detail-three]'),
    ],
    withOutcome: impactSimulator.querySelector('[data-impact-with-outcome]'),
  };

  scenarioButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const scenario = scenarios[button.dataset.impactScenario];
      scenarioFields.callerLabel.textContent = scenario.callerLabel;
      scenarioFields.quote.textContent = scenario.quote;
      scenario.without.forEach(([title, detail], index) => {
        scenarioFields.withoutTitles[index].textContent = title;
        scenarioFields.withoutDetails[index].textContent = detail;
      });
      scenario.withAI.forEach(([title, detail], index) => {
        scenarioFields.withTitles[index].textContent = title;
        scenarioFields.withDetails[index].textContent = detail;
      });
      scenarioFields.withoutOutcome.textContent = scenario.withoutOutcome;
      scenarioFields.withOutcome.textContent = scenario.withOutcome;
      scenarioButtons.forEach((option) => {
        const isSelected = option === button;
        option.classList.toggle('is-selected', isSelected);
        option.setAttribute('aria-pressed', String(isSelected));
      });
      impactSimulator.classList.remove('is-changing');
      void impactSimulator.offsetWidth;
      impactSimulator.classList.add('is-changing');
    });
  });
}

const reliefCalculator = document.querySelector('[data-relief-calculator]');

if (reliefCalculator) {
  const reliefInputs = {
    calls: reliefCalculator.querySelector('[data-relief-input="calls"]'),
    staff: reliefCalculator.querySelector('[data-relief-input="staff"]'),
    coverage: reliefCalculator.querySelector('[data-relief-input="coverage"]'),
  };
  const reliefOutputs = {
    calls: document.getElementById('relief-calls-output'),
    staff: document.getElementById('relief-staff-output'),
    coverage: document.getElementById('relief-coverage-output'),
    callsRemoved: reliefCalculator.querySelector('[data-relief-calls-removed]'),
    hoursSaved: reliefCalculator.querySelector('[data-relief-hours-saved]'),
    pressureReduced: reliefCalculator.querySelector('[data-relief-pressure-reduced]'),
    state: reliefCalculator.querySelector('[data-relief-state]'),
    pressureLabel: reliefCalculator.querySelector('[data-relief-pressure-label]'),
  };
  const reliefScene = reliefCalculator.querySelector('[data-relief-scene]');
  const reliefCharacterCard = reliefCalculator.querySelector('.relief-character-card');
  const reliefPressureMeter = reliefCalculator.querySelector('[data-relief-pressure-meter]');

  const updateReliefCalculator = () => {
    const callsPerHour = Number(reliefInputs.calls.value);
    const staffCount = Number(reliefInputs.staff.value);
    const coverage = Number(reliefInputs.coverage.value);
    const totalDailyCalls = callsPerHour * 8;
    const callsRemoved = Math.round(totalDailyCalls * (coverage / 100));
    const manualCalls = totalDailyCalls - callsRemoved;
    const hoursSaved = (callsRemoved * 4) / 60;
    const manualCallsPerPersonPerHour = manualCalls / 8 / staffCount;
    const pressurePercentage = Math.min(100, Math.round((manualCallsPerPersonPerHour / 6) * 100));
    const pressureReduced = Math.max(0, 100 - pressurePercentage);
    const state = pressurePercentage > 65 ? 'stressed' : pressurePercentage > 30 ? 'balanced' : 'relaxed';
    const stateCopy = {
      stressed: { status: 'Still under pressure', pressure: 'High', aria: 'A stressed front desk team member surrounded by phone interruptions' },
      balanced: { status: 'Pressure is easing', pressure: 'Moderate', aria: 'A front desk team member with a manageable number of phone interruptions' },
      relaxed: { status: 'Feeling relieved', pressure: 'Low', aria: 'A relaxed and happy front desk team member with fewer phone interruptions' },
    };

    reliefOutputs.calls.textContent = `${callsPerHour} ${callsPerHour === 1 ? 'call' : 'calls'}`;
    reliefOutputs.staff.textContent = `${staffCount} ${staffCount === 1 ? 'person' : 'people'}`;
    reliefOutputs.coverage.textContent = `${coverage}%`;
    reliefOutputs.callsRemoved.textContent = callsRemoved;
    reliefOutputs.hoursSaved.textContent = `${hoursSaved.toFixed(1)} hrs`;
    reliefOutputs.pressureReduced.textContent = `${pressureReduced}%`;
    reliefOutputs.state.textContent = stateCopy[state].status;
    reliefOutputs.pressureLabel.textContent = stateCopy[state].pressure;

    reliefScene.dataset.state = state;
    reliefScene.setAttribute('aria-label', stateCopy[state].aria);
    reliefCharacterCard.dataset.state = state;
    reliefPressureMeter.style.width = `${pressurePercentage}%`;
    reliefPressureMeter.style.backgroundPosition = `${pressurePercentage}% 0`;
    Object.values(reliefInputs).forEach(updateRangeFill);
  };

  Object.values(reliefInputs).forEach((input) => {
    input.addEventListener('input', updateReliefCalculator);
  });

  updateReliefCalculator();
}

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
