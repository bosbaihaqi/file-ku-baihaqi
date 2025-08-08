let selectedPaket = null;

window.selectPaket = function (element, namaPaket, harga) {
  selectedPaket = namaPaket;
  document.querySelectorAll(".paket-card").forEach(card => card.classList.remove("selected"));
  element.classList.add("selected");

  document.getElementById("beliPaket").style.display = "inline-block";
};

document.addEventListener("DOMContentLoaded", () => {
  const beliBtn = document.getElementById("beliPaket");
  if (beliBtn) {
    beliBtn.addEventListener("click", async () => {
      if (!selectedPaket) return alert("Pilih paket dulu!");

      const res = await fetch("http://localhost:3000/buat-voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paket: selectedPaket })
      });

      const data = await res.json();

      if (data.error) {
        alert("Gagal: " + data.error);
      } else {
        alert(`Voucher berhasil dibuat!\nUsername: ${data.username}\nPassword: ${data.password}`);
      }
    });
  }
});
