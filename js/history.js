document.addEventListener("DOMContentLoaded", () => {
    const transactionIdEl = document.getElementById("transactionId");
    const voucherCodeEl = document.getElementById("voucherCode");
    const voucherPasswordEl = document.getElementById("voucherPassword");
    const paketNameEl = document.getElementById("paketName");
    const paymentMethodEl = document.getElementById("paymentMethod");
    const hargaPaketEl = document.getElementById("hargaPaket");
    const adminFeeEl = document.getElementById("adminFee");
    const totalBayarEl = document.getElementById("totalBayar");

    const token = "934bdf9b-f446-4be1-8305-1fa7dbdc2235";
    const harga = parseInt(sessionStorage.getItem("selectedHarga")) || 0;
    const admin = parseInt(sessionStorage.getItem("admin_fee")) || 0;
    const paketLabel = sessionStorage.getItem("selectedPaket") || "Paket WiFi";
    const urlParams = new URLSearchParams(window.location.search);
    const merchantRef = urlParams.get("ref");

    const savedData = JSON.parse(sessionStorage.getItem("trxDetail") || "{}");

    function tampilkanData(data) {
        transactionIdEl.textContent = data.merchant_ref || "-";
        voucherCodeEl.textContent = data.voucherCode || "Voucher tidak ditemukan";
        voucherPasswordEl.textContent = data.voucherPassword || "-";
        paymentMethodEl.textContent = data.paymentMethod || "-";
        hargaPaketEl.textContent = formatRupiah(data.hargaPaket || 0);
        adminFeeEl.textContent = formatRupiah(data.adminFee || 0);
        totalBayarEl.textContent = formatRupiah(data.totalBayar || 0);
        paketNameEl.textContent = data.paketName || "-";
    }

    if (
        savedData &&
        savedData.merchant_ref &&
        savedData.voucherCode &&
        savedData.voucherCode !== "Voucher tidak ditemukan"
    ) {
        tampilkanData(savedData);
    } else {
        if (!merchantRef) {
            alert("Data transaksi tidak ditemukan.");
            window.location.href = "payment.html";
            return;
        }

        const profileMap = {
            "Paket Basic": "3-jam",
            "Paket Premium 1": "6-jam",
            "Paket Premium 2": "12-jam",
            "Paket VIP": "24-jam",
            "Paket VVIP": "1-hari"
            };

            const profile = encodeURIComponent(profileMap[paketLabel] || "default");
            const apiUrl = `http://10.254.254.114/api.php?profile=${profile}`;

            console.log("API URL:", apiUrl);

        fetch(`https://api.mayuni.co.id/api/v1/mayuni-partner/transaction/check-status?merchant_ref=${merchantRef}`, {
            headers: { token: token }
        })
        .then(result => result.json())
        .then(response => {
            const data = response?.data;
            const status = data?.status?.toLowerCase();
            const keterangan = data?.keterangan?.toUpperCase();

            if (keterangan !== "SUCCESS" && status !== "success") {
                alert("Pembayaran belum berhasil.");
                window.location.href = "payment.html";
                return;
            }

            fetch(apiUrl)
                .then(async res => {
                    if (!res.ok) throw new Error("Gagal akses API voucher");
                    const text = await res.text();
                    // console.log("API Voucher Response:", text);

                    try {
                        const voucherList = JSON.parse(text);
                        const selectedVoucher = voucherList[0]; // ambil voucher pertama

                        const trxData = {
                            merchant_ref: data.merchant_ref || "-",
                            voucherCode: selectedVoucher?.username || "Voucher tidak ditemukan",
                            voucherPassword: selectedVoucher?.password || "-",
                            paymentMethod: data.payment_method_code || "-",
                            hargaPaket: harga || data.harga_paket || 0,
                            adminFee: admin || data.admin_fee || 0,
                            totalBayar: (harga || 0) + (admin || 0),
                            paketName: paketLabel || data.paket_name || "-"
                        };
                        sessionStorage.setItem("trxDetail", JSON.stringify(trxData));
                        tampilkanData(trxData);
                    } catch (e) {
                        console.error("Gagal parse JSON:", e);
                        const trxData = {
                            merchant_ref: data.merchant_ref || "-",
                            voucherCode: "Voucher tidak ditemukan",
                            voucherPassword: "-",
                            paymentMethod: data.payment_method_code || "-",
                            hargaPaket: harga || data.harga_paket || 0,
                            adminFee: admin || data.admin_fee || 0,
                            totalBayar: (harga || 0) + (admin || 0),
                            paketName: paketLabel || data.paket_name || "-"
                        };
                        sessionStorage.setItem("trxDetail", JSON.stringify(trxData));
                        tampilkanData(trxData);
                    }
                })
                .catch(err => {
                    console.error("Gagal ambil voucher:", err);
                    const trxData = {
                        merchant_ref: data.merchant_ref || "-",
                        voucherCode: "Voucher tidak ditemukan",
                        voucherPassword: "-",
                        paymentMethod: data.payment_method_code || "-",
                        hargaPaket: harga || data.harga_paket || 0,
                        adminFee: admin || data.admin_fee || 0,
                        totalBayar: (harga || 0) + (admin || 0),
                        paketName: paketLabel || data.paket_name || "-"
                    };
                    sessionStorage.setItem("trxDetail", JSON.stringify(trxData));
                    tampilkanData(trxData);
                });
        })
        .catch(err => {
            console.error("Gagal ambil data dari Mayuni:", err);
            alert("Terjadi kesalahan.");
            window.location.href = "payment.html";
        });
    }

    function formatRupiah(angka) {
        return "Rp " + new Intl.NumberFormat("id-ID").format(angka);
    }

    window.copyVoucher = async () => {
        try {
            const code = voucherCodeEl?.textContent || "";
            const pass = voucherPasswordEl?.textContent || "";
            const text = `Kode: ${code}\nPassword: ${pass}`;
            await navigator.clipboard.writeText(text);
            showNotification("Kode voucher berhasil disalin!");
        } catch (err) {
            console.error("Gagal salin voucher:", err);
        }
    };

    window.shareVoucher = () => {
        const code = voucherCodeEl?.textContent || "";
        const pass = voucherPasswordEl?.textContent || "";
        const trx = transactionIdEl?.textContent || "";
        const shareText = `🎉 Voucher WiFi saya sudah aktif!\n\nKode: ${code}\nPassword: ${pass}\nTransaksi: ${trx}\nTerima kasih sudah pakai layanan kami 📶`;

        if (navigator.share) {
            navigator.share({
                title: "Voucher WiFi",
                text: shareText
            }).catch(() => {});
        } else {
            window.copyVoucher();
        }
    };

    function showNotification(message) {
        const note = document.createElement("div");
        note.textContent = message;
        note.className = "notif-toast";
        document.body.appendChild(note);
        setTimeout(() => {
            note.style.animation = "slideUp 0.3s ease-in forwards";
            setTimeout(() => {
                document.body.removeChild(note);
            }, 300);
        }, 3000);
    }
});
