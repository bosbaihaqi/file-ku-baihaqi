let merchand_ref = "trx " + ~~[Math.random()* 12345678]
let token = "934bdf9b-f446-4be1-8305-1fa7dbdc2235";
let path = "https://api.mayuni.co.id/api/v1/mayuni-partner/transaction/check-status?merchant_ref="
let method = "GET"


const fetchData = async () => {
    try {
        const res = await fetch( path, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "token": token
            },
        });

        const data = await res.json(); //tunggu promise json
        console.log(data); // tampilkan hasil di sini
        return data;

    } catch (error) {
        console.error("Gagal:", error);
        return error;
    }
};

fetchData(); // panggil fungsi