// Nexus Events interactions

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const page = body.dataset.page;

  if (page) {
    const activeLink = document.querySelector(`[data-nav="${page}"]`);
    if (activeLink) activeLink.classList.add('active');
  }

  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const partyBtn = document.querySelector('[data-party-toggle]');
  if (partyBtn) {
    const setLabel = () => {
      partyBtn.textContent = body.classList.contains('party') ? 'Party Mode: ON' : 'Party Mode: OFF';
    };
    partyBtn.addEventListener('click', () => {
      body.classList.toggle('party');
      setLabel();
    });
    setLabel();
  }

  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  const cards = Array.from(document.querySelectorAll('[data-event-card]'));
  const searchInput = document.querySelector('[data-search]');
  let activeFilter = 'all';

  const applyFilters = () => {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    cards.forEach(card => {
      const tags = (card.dataset.tags || '').toLowerCase();
      const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
      const matchesFilter = activeFilter === 'all' || tags.includes(activeFilter);
      const matchesSearch = !query || title.includes(query) || tags.includes(query);
      card.style.display = (matchesFilter && matchesSearch) ? '' : 'none';
    });
  };

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter || 'all';
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  });

  if (searchInput) searchInput.addEventListener('input', applyFilters);

  const ticketRows = document.querySelectorAll('[data-ticket-row]');
  const totalEl = document.querySelector('[data-total]');

  const updateTotal = () => {
    let total = 0;
    ticketRows.forEach(row => {
      const qtyInput = row.querySelector('[data-qty]');
      const price = Number(row.dataset.price || 0);
      const qty = Number(qtyInput ? qtyInput.value : 0);
      total += price * qty;
    });
    if (totalEl) {
      totalEl.textContent = total.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
      });
    }
  };

  ticketRows.forEach(row => {
    const minus = row.querySelector('[data-qty-minus]');
    const plus = row.querySelector('[data-qty-plus]');
    const input = row.querySelector('[data-qty]');

    const clamp = () => {
      if (!input) return;
      const val = Math.max(0, Math.min(9, Number(input.value || 0)));
      input.value = String(val);
    };

    if (input) {
      input.addEventListener('change', () => {
        clamp();
        updateTotal();
      });
    }

    if (minus && input) {
      minus.addEventListener('click', () => {
        input.value = String(Math.max(0, Number(input.value || 0) - 1));
        updateTotal();
      });
    }

    if (plus && input) {
      plus.addEventListener('click', () => {
        input.value = String(Math.min(9, Number(input.value || 0) + 1));
        updateTotal();
      });
    }
  });

  if (ticketRows.length) updateTotal();

  document.querySelectorAll('[data-accordion]').forEach(section => {
    const items = section.querySelectorAll('.accordion-item');
    items.forEach(item => {
      const btn = item.querySelector('button');
      if (!btn) return;
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        items.forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  });

  const pulse = document.querySelector('[data-pulse]');
  if (pulse) {
    setInterval(() => {
      pulse.classList.toggle('pulse');
    }, 1400);
  }

  // Checkout functionality
  const checkoutSection = document.getElementById('checkout-section');
  if (checkoutSection) {
    const payBtn = document.getElementById('checkout-pay-btn');
    const modal = document.getElementById('checkout-modal');
    const modalSummary = document.getElementById('modal-summary');
    const modalQrBtn = document.getElementById('modal-qr-btn');
    const modalQrPanel = document.getElementById('modal-qr-panel');
    const modalQrName = document.getElementById('modal-qr-name');
    const modalQrEvent = document.getElementById('modal-qr-event');
    const modalQrRef = document.getElementById('modal-qr-ref');
    const summaryLines = document.getElementById('summary-lines');
    const summaryEmpty = document.getElementById('summary-empty');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryFee = document.getElementById('summary-fee');
    const summaryGrand = document.getElementById('summary-grand');
    const summaryDiscountRow = document.getElementById('summary-discount-row');
    const summaryDiscountVal = document.getElementById('summary-discount-val');
    const summaryEventBox = document.getElementById('summary-event-box');
    const summaryEventText = document.getElementById('summary-event-text');
    const checkoutEvent = document.getElementById('checkout-event');
    const checkoutFname = document.getElementById('checkout-fname');
    const checkoutLname = document.getElementById('checkout-lname');
    const checkoutEmail = document.getElementById('checkout-email');
    const checkoutPromo = document.getElementById('checkout-promo');
    const checkoutPromoBtn = document.getElementById('checkout-promo-btn');
    const checkoutPromoMsg = document.getElementById('checkout-promo-msg');
    const checkoutTerms = document.getElementById('checkout-terms');
    const paymentTabs = document.querySelectorAll('.payment-tab');

    let discount = 0;
    let discountType = '';

    const updateSummary = () => {
      const lines = [];
      let subtotal = 0;
      ticketRows.forEach(row => {
        const qtyInput = row.querySelector('[data-qty]');
        const qty = Number(qtyInput ? qtyInput.value : 0);
        if (qty > 0) {
          const price = Number(row.dataset.price || 0);
          const name = row.querySelector('strong')?.textContent || 'Ticket';
          lines.push(`<div class="summary-row"><span>${qty} × ${name}</span><span>$${(price * qty).toFixed(2)}</span></div>`);
          subtotal += price * qty;
        }
      });

      if (lines.length) {
        summaryEmpty.style.display = 'none';
        summaryLines.innerHTML = lines.join('');
      } else {
        summaryEmpty.style.display = '';
        summaryLines.innerHTML = '';
      }

      let adjustedSubtotal = subtotal;
      if (discountType === 'percent') {
        adjustedSubtotal = subtotal * (1 - discount / 100);
      } else if (discountType === 'fixed') {
        adjustedSubtotal = Math.max(0, subtotal - discount);
      }

      const fee = adjustedSubtotal * 0.05;
      const grand = adjustedSubtotal + fee;

      summarySubtotal.textContent = subtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      summaryFee.textContent = fee.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      summaryGrand.textContent = grand.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

      if (discount > 0) {
        summaryDiscountRow.style.display = '';
        const discountAmount = discountType === 'percent' ? subtotal * (discount / 100) : discount;
        summaryDiscountVal.textContent = '-' + discountAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      } else {
        summaryDiscountRow.style.display = 'none';
      }

      // Enable/disable pay button
      const hasTickets = subtotal > 0;
      const hasEvent = checkoutEvent.value;
      const hasName = checkoutFname.value.trim() && checkoutLname.value.trim();
      const hasEmail = checkoutEmail.value.trim();
      const agreed = checkoutTerms.checked;
      payBtn.disabled = !(hasTickets && hasEvent && hasName && hasEmail && agreed);
    };

    // Update summary when tickets change
    ticketRows.forEach(row => {
      const qtyInput = row.querySelector('[data-qty]');
      if (qtyInput) {
        qtyInput.addEventListener('input', updateSummary);
      }
      const minus = row.querySelector('[data-qty-minus]');
      const plus = row.querySelector('[data-qty-plus]');
      if (minus) minus.addEventListener('click', updateSummary);
      if (plus) plus.addEventListener('click', updateSummary);
    });

    // Promo code handling
    checkoutPromoBtn.addEventListener('click', () => {
      const code = checkoutPromo.value.trim().toLowerCase();
      if (code === 'tralalelotralala') {
        discount = 10;
        discountType = 'percent';
        checkoutPromoMsg.textContent = '10% discount applied!';
        checkoutPromoMsg.style.color = 'green';
      } else if (code === 'ballerinocappucio') {
        discount = 20;
        discountType = 'fixed';
        checkoutPromoMsg.textContent = '$20 discount applied!';
        checkoutPromoMsg.style.color = 'green';
      } else {
        discount = 0;
        discountType = '';
        checkoutPromoMsg.textContent = 'Invalid promo code.';
        checkoutPromoMsg.style.color = 'red';
      }
      checkoutPromoMsg.style.display = 'block';
      updateSummary();
    });

    // Event selection
    checkoutEvent.addEventListener('change', () => {
      if (checkoutEvent.value) {
        summaryEventBox.style.display = '';
        summaryEventText.textContent = checkoutEvent.value;
      } else {
        summaryEventBox.style.display = 'none';
      }
      updateSummary();
    });

    // Form inputs
    [checkoutFname, checkoutLname, checkoutEmail].forEach(input => {
      input.addEventListener('input', updateSummary);
    });
    checkoutTerms.addEventListener('change', updateSummary);

    // Payment tabs
    paymentTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        paymentTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const method = tab.dataset.method;
        document.querySelectorAll('.pay-panel').forEach(panel => {
          panel.style.display = panel.id === `pay-${method}` ? '' : 'none';
        });
      });
    });

    // Pay button
    payBtn.addEventListener('click', () => {
      // Generate order summary for modal
      const lines = [];
      ticketRows.forEach(row => {
        const qtyInput = row.querySelector('[data-qty]');
        const qty = Number(qtyInput ? qtyInput.value : 0);
        if (qty > 0) {
          const name = row.querySelector('strong')?.textContent || 'Ticket';
          lines.push(`<div>${qty} × ${name}</div>`);
        }
      });

      const subtotal = Number(summarySubtotal.textContent.replace(/[^0-9.-]+/g, ''));
      const fee = Number(summaryFee.textContent.replace(/[^0-9.-]+/g, ''));
      const grand = Number(summaryGrand.textContent.replace(/[^0-9.-]+/g, ''));

      lines.push(`<div style="border-top:1px solid #ccc;padding-top:0.5rem;margin-top:0.5rem;font-weight:700;">Subtotal: ${summarySubtotal.textContent}</div>`);
      if (discount > 0) {
        lines.push(`<div>Discount: ${summaryDiscountVal.textContent}</div>`);
      }
      lines.push(`<div>Service Fee: ${summaryFee.textContent}</div>`);
      lines.push(`<div style="font-size:1.1em;font-weight:700;">Total: ${summaryGrand.textContent}</div>`);

      modalSummary.innerHTML = lines.join('');

      // QR details
      const ref = 'NX' + Date.now().toString().slice(-6);
      modalQrRef.textContent = ref;
      modalQrName.textContent = `${checkoutFname.value} ${checkoutLname.value}`;
      modalQrEvent.textContent = checkoutEvent.value;

      // Show modal
      modal.style.display = 'flex';
    });

    // Modal QR toggle
    modalQrBtn.addEventListener('click', () => {
      modalQrPanel.style.display = modalQrPanel.style.display === 'none' ? '' : 'none';
    });

    // Close modal on click outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });

    // Initial update
    updateSummary();
  }
});
