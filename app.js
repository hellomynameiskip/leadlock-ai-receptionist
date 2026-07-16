const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const toast = document.getElementById('toast');

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

document.querySelector('[data-scroll-demo]').addEventListener('click', () => {
  document.getElementById('opt-in-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

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
