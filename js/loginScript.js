document.addEventListener('DOMContentLoaded', () => {
  // --- CHAP Login ---
  window.doLogin = function () {
    const username = document.login.username.value;
    const password = document.login.password.value;
    const chapId = '$(chap-id)';
    const chapChallenge = '$(chap-challenge)';
    const hashed = hexMD5(chapId + password + chapChallenge);

    document.sendin.username.value = username;
    document.sendin.password.value = hashed;
    document.sendin.submit();
    return false;
  };

  // --- Tab Navigasi ---
  const menuItems = document.querySelectorAll('.login-method-menu');
  const tabContents = document.querySelectorAll('.tab-content');

  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      menuItems.forEach(el => el.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      item.classList.add('active');
      document.getElementById(item.id + '-content').classList.add('active');
    });
  });

  // --- Toggle Password ---
  const togglePassword = document.getElementById('showPassword');
  const passwordInput = document.getElementById('password');
  const showPasswordText = document.getElementById('showPasswordText');

  if (togglePassword && passwordInput && showPasswordText) {
    togglePassword.addEventListener('click', () => {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      showPasswordText.textContent = type === 'password' ? 'Show' : 'Hide';
    });
  }

  // --- Scroll Paket ---
  const paketList = document.getElementById('paketList');
  const scrollLeft = document.getElementById('scrollLeft');
  const scrollRight = document.getElementById('scrollRight');

  function updateScrollButtons() {
    const scrollLeftPos = paketList.scrollLeft;
    const maxScroll = paketList.scrollWidth - paketList.clientWidth;
    scrollLeft.classList.toggle('hidden', scrollLeftPos <= 0);
    scrollRight.classList.toggle('hidden', scrollLeftPos >= maxScroll - 5);
  }

  scrollLeft.addEventListener('click', () => {
    paketList.scrollBy({ left: -200, behavior: 'smooth' });
    setTimeout(updateScrollButtons, 300);
  });

  scrollRight.addEventListener('click', () => {
    paketList.scrollBy({ left: 200, behavior: 'smooth' });
    setTimeout(updateScrollButtons, 300);
  });

  paketList.addEventListener('scroll', updateScrollButtons);
  setTimeout(updateScrollButtons, 100);

  // --- Pilih & Beli Paket ---
  let selectedPaket = null;

  window.selectPaket = function (card, paket, harga) {
    document.querySelectorAll('.paket-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedPaket = { paket, harga };
    const btn = document.getElementById('beliPaket');
    btn.style.display = 'block';
    btn.onclick = () => window.beli(paket, harga);
  };
window.beli = function (paket, harga) {
  // Simpan ke sessionStorage, bukan ke URL
  sessionStorage.setItem('selectedPaket', paket);
  sessionStorage.setItem('selectedHarga', harga);

  // Arahkan ke halaman pembayaran tanpa data di URL
  window.location.href = 'payment.html';
};

});
