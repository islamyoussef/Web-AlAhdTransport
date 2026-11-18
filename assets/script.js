(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // Year
  $('#year').textContent = new Date().getFullYear();

  // Sticky header shadow
  var header = $('#header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var burger = $('#burger');
  var nav = $('#nav');
  function closeMenu() {
    burger.classList.remove('open');
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', closeMenu); });

  // Reveal on scroll
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 90 + 'ms';
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  // Count-up stats
  function countUp(el) {
    var target = parseInt(el.dataset.count, 10);
    var suffix = el.dataset.suffix || '';
    var start = null, dur = 1600;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('en-US') + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = $$('[data-count]');
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { co.observe(c); });
  } else {
    counters.forEach(countUp);
  }

  // FAQ accordion
  $$('.faq__q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      $$('.faq__q').forEach(function (b) {
        b.setAttribute('aria-expanded', 'false');
        b.nextElementSibling.style.maxHeight = null;
      });
      if (!expanded) {
        btn.setAttribute('aria-expanded', 'true');
        btn.nextElementSibling.style.maxHeight = btn.nextElementSibling.scrollHeight + 'px';
      }
    });
  });

  // Testimonials slider
  var slides = $$('.slide');
  var dotsWrap = $('#dots');
  var current = 0, timer;
  slides.forEach(function (_, i) {
    var d = document.createElement('button');
    d.setAttribute('aria-label', 'الرأي ' + (i + 1));
    d.addEventListener('click', function () { go(i); restart(); });
    dotsWrap.appendChild(d);
  });
  var dots = $$('button', dotsWrap);
  function go(i) {
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('active');
    current = (i + slides.length) % slides.length;
    slides[current].classList.add('is-active');
    dots[current].classList.add('active');
  }
  function restart() { clearInterval(timer); timer = setInterval(function () { go(current + 1); }, 5000); }
  go(0);
  restart();

  // Price estimator (illustrative numbers in EGP - adjust to your real pricing)
  var PRICING = {
    base: { '1': 1200, '2': 2000, '3': 3000, '4': 4200, office: 3500 },
    perKm: 15,
    perFloor: 80,
    packing: 0.15,
    assembly: 0.12
  };
  //var fmt = new Intl.NumberFormat('ar-EG');
  var fmt = new Intl.NumberFormat('en-En');
  var distance = $('#distance');
  var distanceOut = $('#distanceOut');

  function estimate() {
    var size = $('#rooms').value;
    var km = +distance.value;
    var floor = Math.max(0, +$('#floor').value || 0);
    var elevator = $('#elevator').checked;

    var total = PRICING.base[size] + km * PRICING.perKm;
    if (!elevator) total += floor * PRICING.perFloor;
    var extras = 0;
    if ($('#packing').checked) extras += PRICING.packing;
    if ($('#assembly').checked) extras += PRICING.assembly;
    total *= 1 + extras;

    var low = Math.round(total * 0.9 / 50) * 50;
    var high = Math.round(total * 1.15 / 50) * 50;
    distanceOut.textContent = km;
    $('#price').textContent = fmt.format(low) + ' – ' + fmt.format(high) + ' $';
  }
  $$('#estimator select, #estimator input').forEach(function (el) {
    el.addEventListener('input', estimate);
    el.addEventListener('change', estimate);
  });
  $('#estimator').addEventListener('submit', function (e) { e.preventDefault(); });
  estimate();
})();
