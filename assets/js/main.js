// OSA Hair — minimal interactive bits
(function(){
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile menu toggle
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('primary-menu');
  if (toggle && menu) {
    const closeMenu = () => { menu.style.display = ''; toggle.setAttribute('aria-expanded','false'); };
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      menu.style.display = expanded ? 'none' : 'flex';
      if (!expanded) menu.style.flexWrap = 'wrap';
    });
    // Close on link click (mobile)
    menu.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      if (window.innerWidth <= 640) closeMenu();
    });
    // Close on resize up
    window.addEventListener('resize', () => {
      if (window.innerWidth > 640) closeMenu();
    });
  }

  // Booking form -> WhatsApp prefill
  const form = document.querySelector('.booking-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const phone = (form.getAttribute('data-whatsapp-phone') || '').replace(/\D/g, '');
      const msg = `Запит на запис — OSA Hair\n` +
        `Імʼя: ${fd.get('name') || ''}\n` +
        `Телефон: ${fd.get('phone') || ''}\n` +
        `Послуга: ${fd.get('service') || ''}\n` +
        `Дата: ${fd.get('date') || ''} ${fd.get('time') || ''}\n` +
        `Коментар: ${fd.get('comment') || ''}`;
      const url = phone
        ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
        : `https://wa.me/?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
    });
  }

  // Extract brand colors from logo and apply to CSS variables
  const applyBrandFromLogo = async () => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = 'assets/img/logo.jpeg';
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const size = 64; // downscale for speed
      canvas.width = size; canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);
      const { data } = ctx.getImageData(0, 0, size, size);
      // Simple k-means-ish by averaging bright vs mid pixels
      let sum1=[0,0,0,0], n1=0, sum2=[0,0,0,0], n2=0;
      for (let i=0;i<data.length;i+=4){
        const r=data[i], g=data[i+1], b=data[i+2], a=data[i+3];
        // ignore near-transparent pixels
        if (a<32) continue;
        const lum = 0.2126*r + 0.7152*g + 0.0722*b;
        if (lum > 140){ sum1[0]+=r; sum1[1]+=g; sum1[2]+=b; sum1[3]+=a; n1++; }
        else { sum2[0]+=r; sum2[1]+=g; sum2[2]+=b; sum2[3]+=a; n2++; }
      }
      const c1 = n1? sum1.map(v=>Math.round(v/n1)) : [202,166,255,255];
      const c2 = n2? sum2.map(v=>Math.round(v/n2)) : [138,216,255,255];
      const toHex = ([r,g,b]) => `#${[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('')}`;
      const brand = toHex(c1);
      const brand2 = toHex(c2);
      const root = document.documentElement;
      root.style.setProperty('--brand', brand);
      root.style.setProperty('--brand-2', brand2);
      // Alpha helpers
      const a = (hex, alpha) => {
        const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };
      root.style.setProperty('--brand-a15', a(brand, .15));
      root.style.setProperty('--brand2-a15', a(brand2, .15));
      root.style.setProperty('--brand-a25', a(brand, .25));
      root.style.setProperty('--brand2-a18', a(brand2, .18));
      root.style.setProperty('--brand2-a25', a(brand2, .25));
    } catch (e) {
      // silently ignore if logo missing or cross-origin blocked
    }
  };
  applyBrandFromLogo();
})();
