const hostname = "https://api.mayuni.co.id";
const token = "934bdf9b-f446-4be1-8305-1fa7dbdc2235";

// Fungsi untuk cek status transaksi
function checkPaymentStatus() {
  const merchantRef = sessionStorage.getItem("last_merchant_ref");

  if (!merchantRef) {
    console.warn("merchant_ref tidak ditemukan di sessionStorage.");
    return;
  }

  fetch(`${hostname}/api/v1/mayuni-partner/transaction/status/${merchantRef}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      token: token
    }
  })
    .then(res => res.json())
    .then(response => {
      console.log("📡 Status pembayaran Mayuni:", response);

      const data = response?.data;
      const status = data?.status?.toUpperCase();

      if (status === "PAID") {
        console.log(" Pembayaran berhasil, redirect ke history.html...");
        // Simpan data ke sessionStorage untuk digunakan di history.html
        sessionStorage.setItem("payment_success_data", JSON.stringify(data));
        window.location.href = "history.html";
      } else {
        console.log("Status belum dibayar. Cek lagi 30 detik...");
      }
    })
    .catch(err => {
      console.error("Gagal cek status pembayaran:", err);
    });
}

// Jalankan saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  setInterval(checkPaymentStatus, 30000); // cek setiap 30 detik
  checkPaymentStatus(); // langsung cek pertama kali
});
