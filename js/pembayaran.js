// ======================== KONFIGURASI API MAYUNI ========================
const hostname = "https://api.mayuni.co.id";
const token = "934bdf9b-f446-4be1-8305-1fa7dbdc2235";
const signature_key = "AidsEJRKCfuMK9EHsBq7LSftV2iC1SMOdt121qjodkRoS8zS63cYvxlhIE/aZ+g5VYs=";
const expired_duration = 24;

// ======================== INISIALISASI ========================
document.addEventListener("DOMContentLoaded", () => {
  const waInput = document.getElementById("wa");
  const payButton = document.getElementById("payButton");
  const popup = document.getElementById("paymentResultPopup");
  const popupBody = document.getElementById("resultBody");

  let selectedMethod = "";
  let selectedAmount = parseInt(sessionStorage.getItem("selectedHarga")) || 0;
  let selectedDuration = document.getElementById("paketName").textContent;

  const payload = {
    method: "",
    merchant_ref: "",
    amount: selectedAmount,
    expired_duration: expired_duration,
    customer_name: "User Hotspot",
    customer_phone: "",
    customer_email: "",
    callback_url: "https://hotspotku.com/mayuni-callback",
    signature: ""
  };

  const endpointMap = {
    dana: "/api/v1/mayuni-partner/transaction/create/ewallet",
    ovo: "/api/v1/mayuni-partner/transaction/create/ewallet",
    linkaja: "/api/v1/mayuni-partner/transaction/create/ewallet",
    qris: "/api/v1/mayuni-partner/transaction/create/qris",
    shopeepay: "/api/v1/mayuni-partner/transaction/create/ewallet",
    bcava: "/api/v1/mayuni-partner/transaction/create/va",
    briva: "/api/v1/mayuni-partner/transaction/create/va",
    mandiriva: "/api/v1/mayuni-partner/transaction/create/va",
    bniva: "/api/v1/mayuni-partner/transaction/create/va",
    alfamart: "/api/v1/mayuni-partner/transaction/create/retail",
    indomaret: "/api/v1/mayuni-partner/transaction/create/retail"
  };

  const signaturePathMap = {
    dana: "/transaction/create/ewallet",
    ovo: "/transaction/create/ewallet",
    linkaja: "/transaction/create/ewallet",
    qris: "/transaction/create/qris",
    shopeepay: "/transaction/create/ewallet",
    briva: "/transaction/create/va",
    bcava: "/transaction/create/va",
    mandiriva: "/transaction/create/va",
    bniva: "/transaction/create/va",
    alfamart: "/transaction/create/retail",
    indomaret: "/transaction/create/retail"
  };

  function validateWA(number) {
    return number.length >= 10 && number.length <= 15 && number.startsWith("62");
  }

  function formatRupiah(amount) {
    return new Intl.NumberFormat("id-ID").format(amount);
  }

  function calculateAmountWithAdmin() {
    const fixedAdminMap = {
      briva: 3000,
      bcava: 5500,
      mandiriva: 4250,
      bniva: 4250,
      alfamart: 5000,
      indomaret: 5000
    };

    const percentAdminMap = {
      ovo: 0.018,
      linkaja: 0.018,
      dana: 0.018,
      shopeepay: 0.02,
      qris: 0.007
    };

    let admin = 0;
    if (fixedAdminMap[selectedMethod]) {
      admin = fixedAdminMap[selectedMethod];
    } else if (percentAdminMap[selectedMethod]) {
      admin = Math.ceil(selectedAmount * percentAdminMap[selectedMethod]);
    }

    const total = selectedAmount + admin;
    payload.amount = total;
    payload._admin = admin;

    document.getElementById("adminText").textContent = "Rp " + formatRupiah(admin);
    document.getElementById("totalText").textContent = "Rp " + formatRupiah(total);
  }

  function updatePaymentDetail() {
    document.getElementById("metodeText").textContent = selectedMethod || "Pilih metode";
    document.getElementById("channelText").textContent = selectedDuration;
    document.getElementById("hargaTextBawah").textContent = "Rp " + formatRupiah(selectedAmount);
    calculateAmountWithAdmin();
  }

  function updatePayButton() {
    if (selectedMethod && validateWA(payload.customer_phone)) {
      payButton.disabled = false;
      payButton.textContent = "Bayar Sekarang";
    } else {
      payButton.disabled = true;
      payButton.textContent = "Pilih Metode Pembayaran";
    }
  }

  document.querySelectorAll(".method-item").forEach(item => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".method-item").forEach(el => el.classList.remove("selected"));
      item.classList.add("selected");

      selectedMethod = item.dataset.value.toLowerCase();
      const endpoint = endpointMap[selectedMethod];
      const pathForSign = signaturePathMap[selectedMethod];

      payload.method = selectedMethod;
      payload.merchant_ref = "trx-" + Date.now();
      sessionStorage.setItem("last_merchant_ref", payload.merchant_ref);
      payload._endpoint = endpoint;

      calculateAmountWithAdmin();

      const signature = hexMD5(
        pathForSign + "POST" + payload.merchant_ref + payload.amount + expired_duration + signature_key
      );
      payload.signature = signature;

      updatePaymentDetail();
      updatePayButton();
    });
  });

  waInput.addEventListener("input", () => {
    let value = waInput.value.replace(/[^0-9]/g, '');
    if (value.startsWith("0")) value = "62" + value.substring(1);
    else if (!value.startsWith("62")) value = "62" + value;
    waInput.value = value;

    payload.customer_phone = value;
    payload.customer_email = value + "@hotspotku.com";

    updatePayButton();
  });

  payButton.addEventListener("click", () => {
    if (payButton.disabled) return;

    calculateAmountWithAdmin();

    if (!payload._endpoint) {
      alert("Silakan pilih metode pembayaran terlebih dahulu.");
      return;
    }

    fetch(hostname + payload._endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: token
      },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(response => {
      const data = response?.data;
      if (!data) return alert("Transaksi gagal.");

      const ewalletMethods = ["dana", "ovo", "linkaja", "shopeepay"];
      if (ewalletMethods.includes(selectedMethod)) {
        const checkoutUrl = data?.actions?.desktop_web_checkout_url;
        if (checkoutUrl) window.location.href = checkoutUrl;
        else alert("URL pembayaran tidak ditemukan.");
        return;
      }

      const merchantRef = data?.merchant_ref || payload.merchant_ref;
      const paymentCode = data?.payment_code || data?.va_number || "-";
      const methodName = selectedMethod.toUpperCase();
      const harga = selectedAmount;
      const admin = payload._admin || 0;
      const total = payload.amount;
      const expiredText = data?.expired_at_convert || "-";

      let qrisHTML = "";
      if (selectedMethod === "qris" && data.payment_code) {
        qrisHTML = `<div id="qrisCanvas" style="margin: 12px auto; max-width: 240px;"></div>`;
        setTimeout(() => {
          const canvas = document.getElementById("qrisCanvas");
          if (canvas) {
            canvas.innerHTML = "";
            new QRCode(canvas, {
              text: data.payment_code,
              width: 240,
              height: 240,
              correctLevel: QRCode.CorrectLevel.H
            });
          }
        }, 100);
      }

      popupBody.innerHTML = `
        <div style="text-align:center">
          ${qrisHTML}
          <p><strong>Metode:</strong> ${methodName}</p>
          <p><strong>Kode Pembayaran:</strong><br><span style="font-size:18px">${paymentCode}</span></p>
          <p><strong>Harga:</strong> Rp ${formatRupiah(harga)}</p>
          <p><strong>Biaya Admin:</strong> Rp ${formatRupiah(admin)}</p>
          <p><strong>Total:</strong> Rp ${formatRupiah(total)}</p>
          <p><strong>Kedaluwarsa:</strong> ${expiredText}</p>
          <p><strong>Status:</strong> <span style="color:red; font-weight:bold">Belum Dibayar</span></p>
          <button id="btnToHistory" style="
            margin-top: 12px;
            padding: 8px 18px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          ">
            Cek Status Pembayaran
          </button>
        </div>
      `;

      popup.classList.remove("hidden");

      setTimeout(() => {
        const btn = document.getElementById("btnToHistory");
        if (btn) {
          btn.addEventListener("click", () => {
            checkTransactionStatus(merchantRef);
          });
        }
      }, 100);
    })
    .catch(err => {
      console.error("Gagal hubungi API Mayuni:", err);
      alert("Gagal menghubungi API Mayuni.");
    });
  });

  updatePaymentDetail();
});

// ============ CEK STATUS API MAYUNI RESMI ============
function checkTransactionStatus(merchantRef) {
  fetch(`${hostname}/api/v1/mayuni-partner/transaction/check-status?merchant_ref=${merchantRef}`, {
    method: "GET",
    headers: {
      "token": token
    }
  })
  .then(res => res.json())
  .then(response => {
    const data = response.data;
    if (!data) {
      alert("Transaksi tidak ditemukan.");
      return;
    }

    if (data.keterangan === "SUCCESS" || data.status.toLowerCase() === "success") {
      window.location.href = `animasi.html?ref=${merchantRef}`;
    } else {
      alert("Pembayaran belum selesai.");
    }
  })
  .catch(err => {
    console.error("Gagal cek status Mayuni:", err);
    alert("Gagal cek status transaksi.");
  });
}

window.onbeforeunload = null;
