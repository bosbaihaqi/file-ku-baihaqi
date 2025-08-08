
let token = "934bdf9b-f446-4be1-8305-1fa7dbdc2235";
let hostname = "https://api.mayuni.co.id";  // perbaikan: double slash
let path = "/transaction/create/va";
let method = "POST";
let merchant_ref = "trx " + ~~[Math.random()* 12345678]
let amount = 10000;
let expired_duration = 24;
let signature_key = "AidsEJRKCfuMK9EHsBq7LSftV2iC1SMOdt121qjodkRoS8zS63cYvxlhIE/aZ+g5VYs=";
let signature = hexMD5(path + method + merchant_ref + amount + expired_duration + signature_key);

let payload = {
    method: "briva",
    merchant_ref: merchant_ref,
    amount: amount,
    expired_duration: expired_duration,
    customer_name: "Osamu",
    customer_phone: "085536495868",
    customer_email: "customer@gmail.com",
    signature: signature,
    callback_url: "https://merchant.co.id/callback"
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

        const data = await res.json(); // tunggu promise json
        console.log(data); // tampilkan hasil di sini
        return data;

    } catch (error) {
        console.error("Gagal:", error);
        return error;
    }
};

fetchData(); // panggil fungsi