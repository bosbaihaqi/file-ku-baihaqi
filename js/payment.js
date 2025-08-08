document.addEventListener('DOMContentLoaded', function () {
  const categoryHeaders = document.querySelectorAll('.category-header');
  const methodItems = document.querySelectorAll('.method-item');
  const payButton = document.getElementById('payButton');
  const waInput = document.getElementById('wa');

  let selectedMethod = null;
  let selectedAdmin = 0;
  let basePrice = 3000;

  const paketFromStorage = sessionStorage.getItem('selectedPaket');
  const hargaFromStorage = parseInt(sessionStorage.getItem('selectedHarga'));

if (paketFromStorage) {
  document.getElementById('paketName').textContent = paketFromStorage;
  document.getElementById('channelText').textContent = paketFromStorage; // bagian ringkasan
}

if (!isNaN(hargaFromStorage)) {
  basePrice = hargaFromStorage;
  document.getElementById('hargaTextAtas').textContent = `Rp ${formatRupiah(basePrice)}`; // <- TAMBAH INI
}

  if (paketFromStorage) {
    document.getElementById('paketName').textContent = paketFromStorage;
  }
  if (!isNaN(hargaFromStorage)) {
    basePrice = hargaFromStorage;
  }

  init();

  function init() {
    updateChannelText();
    updatePricing();
    bindEvents();
  }

  function bindEvents() {
    categoryHeaders.forEach(header => header.addEventListener('click', handleCategoryToggle));
    methodItems.forEach(item => item.addEventListener('click', handleMethodSelection));
    waInput.addEventListener('input', handleWAInput);
    payButton.addEventListener('click', handlePayment);
  }

  function handleCategoryToggle() {
    const category = this.closest('.category');
    const methodList = category.querySelector('.method-list');
    const isActive = this.classList.contains('active');

    categoryHeaders.forEach(h => {
      h.classList.remove('active');
      h.closest('.category').querySelector('.method-list').classList.remove('active');
    });

    if (!isActive) {
      this.classList.add('active');
      methodList.classList.add('active');
    }
  }

  // Fungsi menghitung admin fee sesuai dokumentasi
  function calculateAdmin(method, amount) {
    switch (method) {
      case 'dana':
      case 'ovo':
      case 'linkaja':
        return Math.ceil(amount * 0.018); // 1.8% dari harga paket
      case 'shopeepay':
        return Math.ceil(amount * 0.02); // 2% dari harga paket
      case 'qris':
        return Math.ceil(amount * 0.007); // QRIS - 0.7% dari harga paket
      case 'bcava':
        return 5500; // BCA Virtual Account - Rp 5.500
      case 'briva':
        return 3000; // BRI Virtual Account - Rp 3.000
      case 'mandiriva':
        return 4250; // Mandiri VA - Rp 4.250
      case 'bniva':
        return 4250; // BNI Virtual Account - Rp 4.250
      case 'permata':
        return 4250; // Permata VA - Rp 4.250
      case 'alfamart':
      case 'indomaret':
        return 5000; // Retail Store - Rp 5.000
      default:
        return 0;
    }
  }

  function handleMethodSelection() {
    methodItems.forEach(i => i.classList.remove('selected'));
    this.classList.add('selected');
    selectedMethod = this.dataset.value;
    selectedAdmin = calculateAdmin(selectedMethod, basePrice);

    updatePricing();
    updatePayButton();
    if (navigator.vibrate) navigator.vibrate(50);
  }

  function handleWAInput() {
    this.value = this.value.replace(/[^0-9]/g, '');
    let value = this.value;
    if (value.startsWith('0')) value = '62' + value.substring(1);
    else if (!value.startsWith('62')) value = '62' + value;

    updatePayButton();
  }

  function handlePayment() {
    if (this.disabled) return;

    const waNumber = waInput.value;
    if (!validateWANumber(waNumber)) {
      showMessage('Masukkan nomor WhatsApp yang valid (minimal 10 digit)!', 'error');
      waInput.focus();
      return;
    }

    if (!selectedMethod) {
      showMessage('Pilih metode pembayaran terlebih dahulu!', 'error');
      return;
    }

    processPayment();
  }

  function validateWANumber(number) {
    const cleanNumber = number.replace(/[^0-9]/g, '');
    return cleanNumber.length >= 10 && cleanNumber.length <= 15 && (cleanNumber.startsWith('62') || cleanNumber.startsWith('0'));
  }

  function processPayment() {
    const total = basePrice + selectedAdmin;
    console.log("Metode: ", selectedMethod);
    console.log("Base Price: ", basePrice);
    console.log("Admin Fee: ", selectedAdmin);
    console.log("Total Harga: ", total);
  }

  function updateChannelText() {
    const packageName = document.getElementById('paketName').textContent;
    document.getElementById('channelText').textContent = packageName;
  }

  function updatePricing() {
    document.getElementById('hargaTextBawah').textContent = `Rp ${formatRupiah(basePrice)}`;
    document.getElementById('adminText').textContent = `Rp ${formatRupiah(selectedAdmin)}`;
    document.getElementById('totalText').textContent = `Rp ${formatRupiah(basePrice + selectedAdmin)}`;
    document.getElementById('metodeText').textContent = selectedMethod || 'Pilih metode pembayaran';
  }

  function updatePayButton() {
    const hasMethod = selectedMethod !== null;
    const hasValidWA = validateWANumber(waInput.value);

    if (hasMethod && hasValidWA) {
      payButton.disabled = false;
      payButton.textContent = `Bayar ${formatRupiah(basePrice + selectedAdmin)}`;
      payButton.classList.remove('disabled');
    } else {
      payButton.disabled = true;
      if (!hasMethod && !hasValidWA) {
        payButton.textContent = 'Lengkapi Data Pembayaran';
      } else if (!hasMethod) {
        payButton.textContent = 'Pilih Metode Pembayaran';
      } else {
        payButton.textContent = 'Masukkan Nomor WhatsApp';
      }
      payButton.classList.add('disabled');
    }
  }

  function showMessage(message, type) {
    const existingMessages = document.querySelectorAll('.error-message, .success-message');
    existingMessages.forEach(msg => {
      msg.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => msg.remove(), 300);
    });

    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
    messageDiv.textContent = message;
    messageDiv.style.animation = 'fadeIn 0.3s ease-out';

    payButton.parentNode.insertBefore(messageDiv, payButton);

    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => messageDiv.remove(), 300);
      }
    }, 5000);
  }

  function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID').format(amount);
  }

  window.PaymentUtils = {
    getSelectedMethod: () => selectedMethod,
    getSelectedAdmin: () => selectedAdmin,
    getBasePrice: () => basePrice,
    getTotalPrice: () => basePrice + selectedAdmin,
    getWhatsAppNumber: () => waInput.value,
    resetForm: () => {
      selectedMethod = null;
      selectedAdmin = 0;
      waInput.value = '';
      methodItems.forEach(item => item.classList.remove('selected'));
      updatePricing();
      updatePayButton();
    }
  };

  window.addEventListener('beforeunload', function (e) {
    if (selectedMethod && waInput.value) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
});
