/* ============================================================
   landing.js — D-Fit Scheduler Chatbot Landing Page Logic
   ============================================================ */

'use strict';

// ─── Theme ───────────────────────────────────────────────────
const html        = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeLabel  = document.getElementById('themeLabel');

function applyTheme(dark) {
  html.setAttribute('data-theme', dark ? 'dark' : 'light');
  themeLabel.textContent = dark ? 'Dark' : 'Light';
  localStorage.setItem('dfitTheme', dark ? 'dark' : 'light');
}

const savedTheme = localStorage.getItem('dfitTheme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(savedTheme === 'dark' || (!savedTheme && prefersDark));

themeToggle.addEventListener('click', () => {
  applyTheme(html.getAttribute('data-theme') !== 'dark');
});

// ─── BMI Utility ─────────────────────────────────────────────
function calcBMI(heightCm, weightKg) {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return null;
  const h = heightCm / 100;
  return +(weightKg / (h * h)).toFixed(1);
}

function bmiCategory(bmi) {
  if (bmi < 16)   return { label: 'Severe Underweight', color: '#FF3B30', pct: 5  };
  if (bmi < 18.5) return { label: 'Underweight',        color: '#FF9500', pct: 20 };
  if (bmi < 25)   return { label: 'Normal Weight',      color: '#34C759', pct: 50 };
  if (bmi < 30)   return { label: 'Overweight',         color: '#FF9500', pct: 72 };
  if (bmi < 35)   return { label: 'Obese Class I',      color: '#FF3B30', pct: 82 };
  if (bmi < 40)   return { label: 'Obese Class II',     color: '#FF3B30', pct: 92 };
  return             { label: 'Obese Class III',         color: '#FF3B30', pct: 99 };
}

function updateBmiPreview(valueEl, labelEl, barEl, previewEl, heightCm, weightKg) {
  const bmi = calcBMI(heightCm, weightKg);
  if (!bmi) { previewEl.style.display = 'none'; return; }
  const cat = bmiCategory(bmi);
  previewEl.style.display = 'block';
  valueEl.textContent = bmi;
  valueEl.style.color = cat.color;
  labelEl.textContent = cat.label;
  barEl.style.width   = cat.pct + '%';
  barEl.style.background = cat.color;
}

// ─── Modal helpers ────────────────────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}

// Close on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

// Close buttons
document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.modal));
});

// ─── Guest Flow ──────────────────────────────────────────────
document.getElementById('guestLoginBtn').addEventListener('click', e => {
  e.stopPropagation();
  openModal('guestModal');
});
document.getElementById('guestCard').addEventListener('click', () => openModal('guestModal'));
document.getElementById('guestCard').addEventListener('keypress', e => { if(e.key==='Enter') openModal('guestModal'); });

// Live BMI for guest form
const gHeight = document.getElementById('g-height');
const gWeight = document.getElementById('g-weight');
const gBmiPreview = document.getElementById('gBmiPreview');
const gBmiValue   = document.getElementById('gBmiValue');
const gBmiLabel   = document.getElementById('gBmiLabel');
const gBmiBar     = document.getElementById('gBmiBar');

function updateGuestBmi() {
  updateBmiPreview(gBmiValue, gBmiLabel, gBmiBar, gBmiPreview,
    parseFloat(gHeight.value), parseFloat(gWeight.value));
}
gHeight.addEventListener('input', updateGuestBmi);
gWeight.addEventListener('input', updateGuestBmi);

document.getElementById('guestProceedBtn').addEventListener('click', () => {
  const profile = {
    mode:    'guest',
    name:    'Guest',
    height:  parseFloat(gHeight.value)  || null,
    weight:  parseFloat(gWeight.value)  || null,
    age:     parseFloat(document.getElementById('g-age').value) || null,
    gender:  document.getElementById('g-gender').value || null,
    goal:    null,
    activity:null,
    bmi:     calcBMI(parseFloat(gHeight.value), parseFloat(gWeight.value))
  };
  sessionStorage.setItem('dfitProfile', JSON.stringify(profile));
  window.location.href = 'app.html';
});

// ─── User Profile Flow ────────────────────────────────────────
document.getElementById('userLoginBtn').addEventListener('click', e => {
  e.stopPropagation();
  openModal('userModal');
});
document.getElementById('userCard').addEventListener('click', () => openModal('userModal'));
document.getElementById('userCard').addEventListener('keypress', e => { if(e.key==='Enter') openModal('userModal'); });

const uHeight = document.getElementById('u-height');
const uWeight = document.getElementById('u-weight');
const uBmiPreview = document.getElementById('uBmiPreview');
const uBmiValue   = document.getElementById('uBmiValue');
const uBmiLabel   = document.getElementById('uBmiLabel');
const uBmiBar     = document.getElementById('uBmiBar');

function updateUserBmi() {
  updateBmiPreview(uBmiValue, uBmiLabel, uBmiBar, uBmiPreview,
    parseFloat(uHeight.value), parseFloat(uWeight.value));
}
uHeight.addEventListener('input', updateUserBmi);
uWeight.addEventListener('input', updateUserBmi);

document.getElementById('userProceedBtn').addEventListener('click', () => {
  const name   = document.getElementById('u-name').value.trim() || 'User';
  const height = parseFloat(uHeight.value) || null;
  const weight = parseFloat(uWeight.value) || null;
  const age    = parseFloat(document.getElementById('u-age').value) || null;
  const gender = document.getElementById('u-gender').value || null;
  const goal   = document.getElementById('u-goal').value || null;
  const activity = document.getElementById('u-activity').value || null;

  if (!height || !weight) {
    uHeight.focus();
    uHeight.style.borderColor = 'var(--red)';
    uWeight.style.borderColor = 'var(--red)';
    setTimeout(() => {
      uHeight.style.borderColor = '';
      uWeight.style.borderColor = '';
    }, 1500);
    return;
  }

  const profile = {
    mode: 'user', name, height, weight, age, gender, goal, activity,
    bmi: calcBMI(height, weight)
  };
  sessionStorage.setItem('dfitProfile', JSON.stringify(profile));
  window.location.href = 'app.html';
});
