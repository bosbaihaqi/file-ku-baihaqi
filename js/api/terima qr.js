// Jika pakai di browser, pastikan hexMD5 sudah terdefinisi sebelumnya
// Contoh: pakai library js-md5 atau crypto-js
// const md5 = require('crypto-js/md5'); // jika di Node.js

let token = "934bdf9b-f446-4be1-8305-1fa7dbdc2235";
let hostname = "https://api.mayuni.co.id";  // perbaikan: double slash
let path = "/transaction/create/qris";
let payment_code = "00020101021226670016COM.NOBUBANK.WWW01189360050300000888380214020200006903560303UME51440014ID.CO.QRIS.WWW0215ID20232463522640303UME5204653153033605405100005802ID5906FINDIG6004PATI610559173626401142160554687387905120855364958680611trx 45649400703A010804POSP6304A745";
let method = "POST";
let merchant_ref = "trx " + ~~[Math.random()* 12345678];
let amount = 10000;
let expired_duration = 24;
let signature_key = "AidsEJRKCfuMK9EHsBq7LSftV2iC1SMOdt121qjodkRoS8zS63cYvxlhIE/aZ+g5VYs=";


let signature = hexMD5(merchant_ref + amount + payment_code +signature_key)
let payload = {
    reference:"6566dbbd40385b85770a5f8f",
    merchant_ref: merchant_ref,
    payment_code: payment_code,
    payment_method: "qris",
    payment_method_code: "qris",
    amount_recieved: "9820",
    fee: "180",
    customer_name:"osamu",
    amount: amount,
    total_amount: "10000",
    status: "200",
    paid_at: "30 November 2023 13:35:42",
    note: "Transaksi Sukses",
    signature: signature,
};

const fetchData = async () => {
    try {
        const res = await fetch(hostname + "/api/v1/mayuni-partner" + path, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "token": token
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json(); 
        console.log(data); // tampilkan hasil di sini
        return data;

    } catch (error) {
        console.error("Gagal:", error);
        return error;
    }
};

fetchData(); // panggil fungsi