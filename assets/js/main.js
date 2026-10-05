/* ==========================================================================
   SiddhiVinayak Exporters - site behaviour
   --------------------------------------------------------------------------
   Progressive enhancement only. With JavaScript disabled the site remains
   fully readable and navigable: every product, policy and contact detail is
   present in the HTML, the mobile menu degrades to a visible link list.

   Modules
     config   - reads assets/js/site-config.js and fills the page
     nav      - small-screen navigation toggle
     filters  - product range filter on products.html
   ========================================================================== */
(function () {
  'use strict';

  var FALLBACK_CONFIG = {
    brandName: 'Siddhi Vinayak Exporters',
    brandTagline: 'Quality that speaks for itself',
    contact: { email: '', phone: '', whatsapp: '', addressLines: [], country: '' },
    registrations: [],
    dpo: { name: '', role: '', email: '' },
    lastReviewed: ''
  };

  var CONFIG = Object.assign({}, FALLBACK_CONFIG, window.SV_CONFIG || {});
  CONFIG.contact = Object.assign({}, FALLBACK_CONFIG.contact, CONFIG.contact || {});

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function has(value) {
    return typeof value === 'string' && value.trim() !== '';
  }

  function brandLabel() {
    return has(CONFIG.legalName) ? CONFIG.legalName : CONFIG.brandName;
  }

  /* Reveals a configured value and its wrapper. Values that are not configured
     stay hidden, so the page never shows an empty or invented detail. */
  function reveal(node) {
    node.hidden = false;
    var wrap = node.closest('[data-config-wrap]');
    if (wrap) wrap.hidden = false;
  }

  /* ------------------------------------------------------------------------
     config - push values from site-config.js into the markup.
     Anything not configured is left out rather than filled with a guess.
     ---------------------------------------------------------------------- */
  var config = {
    init: function () {
      $$('[data-brand-name]').forEach(function (node) {
        node.textContent = CONFIG.brandName;
      });

      $$('[data-legal-name]').forEach(function (node) {
        node.textContent = brandLabel();
      });

      $$('[data-brand-tagline]').forEach(function (node) {
        node.textContent = CONFIG.brandTagline;
      });

      $$('[data-last-reviewed]').forEach(function (node) {
        if (has(CONFIG.lastReviewed)) node.textContent = CONFIG.lastReviewed;
      });

      $$('[data-config="email"]').forEach(function (node) {
        if (!has(CONFIG.contact.email)) return;
        var link = document.createElement('a');
        link.textContent = CONFIG.contact.email;
        link.href = 'mailto:' + CONFIG.contact.email;
        node.textContent = '';
        node.appendChild(link);
        reveal(node);
      });

      $$('[data-config="phone"]').forEach(function (node) {
        if (!has(CONFIG.contact.phone)) return;
        var digits = CONFIG.contact.phone.replace(/[^+\d]/g, '');
        var link = document.createElement('a');
        link.textContent = CONFIG.contact.phone;
        link.href = 'tel:' + digits;
        node.textContent = '';
        node.appendChild(link);
        reveal(node);
      });

      var addressNode = $('[data-config="address"]');
      if (addressNode) {
        var lines = (CONFIG.contact.addressLines || []).filter(has);
        if (lines.length) {
          addressNode.textContent =
            lines.join(', ') + (has(CONFIG.contact.country) ? ', ' + CONFIG.contact.country : '');
          reveal(addressNode);
        }
      }

      var regList = $('[data-registration-list]');
      if (regList) {
        var filled = (CONFIG.registrations || []).filter(function (item) {
          return item && has(item.value);
        });
        var holder = regList.closest('[data-registration-block]');
        if (!filled.length) {
          regList.hidden = true;
          if (holder) holder.hidden = true;
        } else {
          regList.textContent = '';
          filled.forEach(function (item) {
            var li = document.createElement('li');
            var strong = document.createElement('strong');
            strong.textContent = item.label + ':';
            li.appendChild(strong);
            li.insertAdjacentText('beforeend', ' ' + item.value);
            regList.appendChild(li);
          });
        }
      }

      var dpoBlock = $('[data-dpo-block]');
      if (dpoBlock) {
        var dpoEmail = $('[data-dpo-email]', dpoBlock);
        if (dpoEmail && has(CONFIG.dpo.email)) {
          dpoEmail.textContent = CONFIG.dpo.email;
          dpoEmail.href = 'mailto:' + CONFIG.dpo.email;
        }
        var dpoName = $('[data-dpo-name]', dpoBlock);
        if (dpoName && has(CONFIG.dpo.name)) {
          dpoName.textContent = CONFIG.dpo.name;
        }
      }
    }
  };

  /* ------------------------------------------------------------------------
     nav - accessible small-screen menu.
     ---------------------------------------------------------------------- */
  var nav = {
    init: function () {
      var toggle = $('[data-nav-toggle]');
      var menu = $('[data-nav-menu]');
      if (!toggle || !menu) return;

      function setOpen(open) {
        menu.setAttribute('data-open', open ? 'true' : 'false');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      }

      setOpen(false);

      toggle.addEventListener('click', function () {
        setOpen(toggle.getAttribute('aria-expanded') !== 'true');
      });

      menu.addEventListener('click', function (event) {
        if (event.target.closest('a')) setOpen(false);
      });

      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
          setOpen(false);
          toggle.focus();
        }
      });

      window.addEventListener('resize', function () {
        if (window.innerWidth > 960) setOpen(false);
      });
    }
  };

  /* ------------------------------------------------------------------------
     filters - product range filter on products.html.
     Starts from a fully rendered list; without JS every range stays visible.
     ---------------------------------------------------------------------- */
  var filters = {
    init: function () {
      var list = $('[data-product-list]');
      if (!list) return;

      var buttons = $$('[data-filter-value]');
      var status = $('[data-filter-status]');
      var cards = $$('[data-category]', list);
      if (!buttons.length || !cards.length) return;

      function apply(value) {
        var shown = 0;
        cards.forEach(function (card) {
          var categories = (card.getAttribute('data-category') || '').split(/\s+/);
          var match = value === 'all' || categories.indexOf(value) !== -1;
          card.hidden = !match;
          if (match) shown += 1;
        });

        buttons.forEach(function (button) {
          button.setAttribute(
            'aria-pressed',
            button.getAttribute('data-filter-value') === value ? 'true' : 'false'
          );
        });

        if (status) {
          var label = value === 'all' ? 'all product ranges' : value;
          status.textContent = shown + ' of ' + cards.length + ' items shown (' + label + ').';
        }
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          apply(button.getAttribute('data-filter-value'));
        });
      });

      var hash = window.location.hash.replace('#', '');
      var known = buttons.map(function (button) {
        return button.getAttribute('data-filter-value');
      });
      apply(known.indexOf(hash) !== -1 ? hash : 'all');
    }
  };

  /* ------------------------------------------------------------------------
     Boot
     ---------------------------------------------------------------------- */
  function boot() {
    config.init();
    nav.init();
    filters.init();
    document.documentElement.setAttribute('data-js', 'ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
