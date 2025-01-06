document.addEventListener("DOMContentLoaded", () => {
  const transactionTable = document.getElementById("transactionTable");
  const token = localStorage.getItem("token");

  // Periksa token login
  if (!token) {
    Swal.fire({
      icon: "error",
      title: "Akses Ditolak",
      text: "Anda tidak memiliki akses. Silakan login sebagai admin.",
    }).then(() => {
      window.location.href = "/login";
    });
    return;
  }
  const userRole = parseJwt(token)?.role;
  if (userRole !== "admin") {
    Swal.fire({
      icon: "error",
      title: "Akses Ditolak",
      text: "Anda tidak memiliki akses ke halaman ini.",
    }).then(() => {
      window.location.href = "/login";
    });
    return;
  }

  // Fungsi fetch data transaksi
  async function fetchTransactions() {
    Swal.fire({
      title: "Memuat Data...",
      text: "Mohon tunggu, data transaksi sedang dimuat.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      const response = await fetch(
        "https://backend-eight-phi-75.vercel.app/api/payment/transactions",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil data transaksi.");
      }

      const transactions = await response.json();

      // Render data transaksi ke tabel
      transactionTable.innerHTML = ""; // Kosongkan tabel sebelum render
      transactions.forEach((transaction) => {
        const row = document.createElement("tr");
        row.className = "hover:bg-gray-100";

        row.innerHTML = `
            <td class="px-4 py-2">${transaction.transaksi_id}</td>
            <td class="px-4 py-2">${transaction.nama_produk}</td>
            <td class="px-4 py-2">${new Date(
              transaction.created_at
            ).toLocaleString()}</td>
            <td class="px-4 py-2">Rp${transaction.gross_amount.toLocaleString()}</td>
            <td class="px-4 py-2">
              <span class="${getStatusClass(
                transaction.status
              )} px-2 py-1 rounded">${transaction.status}</span>
            </td>
            
          `;

        transactionTable.appendChild(row);
      });

      Swal.close();
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: "Gagal mengambil data transaksi.",
      });
    }
  }

  // Fungsi untuk mendapatkan kelas status
  function getStatusClass(status) {
    switch (status) {
      case "pending":
        return "bg-yellow-500 text-white";
      case "Berhasil":
      case "paid":
        return "bg-green-500 text-white";
      case "Gagal":
        return "bg-red-500 text-white";
      default:
        return "";
    }
  }

  // Fungsi untuk melihat detail transaksi
  function viewDetails(id) {
    Swal.fire({
      title: "Detail Transaksi",
      text: `Detail transaksi dengan ID: ${id}`,
      icon: "info",
      confirmButtonText: "Tutup",
    });
  }

  // Tambahkan event listener untuk tombol logout
  document.getElementById("logoutButton").addEventListener("click", () => {
    Swal.fire({
      title: "Konfirmasi Logout",
      text: "Apakah Anda yakin ingin logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, logout",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        Swal.fire("Logout Berhasil", "Anda telah logout.", "success").then(
          () => {
            window.location.href = "/login";
          }
        );
      }
    });
  });

  // Mulai fetch data setelah halaman selesai dimuat
  fetchTransactions();
});

// calculasiPendapatan
async function calculateTotalSales() {
  const token = localStorage.getItem("token"); // Token untuk autentikasi
  const apiUrl =
    "https://backend-eight-phi-75.vercel.app/api/payment/transactions";

  try {
    // Fetch data transaksi
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Gagal mengambil data transaksi");
    }

    const transactions = await response.json();

    // Inisialisasi variabel untuk total
    let totalPendapatan = 0;
    let totalProdukTerjual = 0;

    // Proses data transaksi
    transactions.forEach((transaction) => {
      if (transaction.status === "paid") {
        totalPendapatan += transaction.gross_amount * transaction.jumlah;
        totalProdukTerjual += transaction.jumlah;
      }
    });

    // Update elemen HTML dengan hasil perhitungan
    document.getElementById("totalProduk").textContent = totalProdukTerjual;
    document.getElementById(
      "totalPendapatan"
    ).textContent = `Rp${totalPendapatan.toLocaleString()}`;
  } catch (error) {
    console.error("Error:", error);

    // Tampilkan error ke UI jika terjadi masalah
    Swal.fire({
      icon: "error",
      title: "Terjadi Kesalahan",
      text: "Gagal mengambil data transaksi.",
    });
  }
}

// Panggil fungsi setelah halaman selesai dimuat
document.addEventListener("DOMContentLoaded", calculateTotalSales);

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Invalid JWT Token:", error);
    return null;
  }
}

// ----------------------diagram total pendapatan-------------------------------
const ctx = document.getElementById("pendapatanChart").getContext("2d");

const data = {
  day: [300, 500, 700, 900, 1200],
  week: [4000, 4500, 4800, 5200, 5800, 6000, 6500],
  month: [
    10000, 12000, 14000, 16000, 18000, 20000, 22000, 24000, 26000, 28000, 30000,
    32000,
  ],
};

// Labels (default untuk minggu ini)
const labels = {
  day: ["08:00", "10:00", "12:00", "14:00", "16:00"],
  week: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
  month: ["1", "5", "10", "15", "20", "25", "30"],
};

// Inisialisasi Chart.js
let pendapatanChart = new Chart(ctx, {
  type: "line", // Gunakan tipe diagram garis
  data: {
    labels: labels["week"], // Default adalah "Minggu Ini"
    datasets: [
      {
        label: "Pendapatan (Rp)",
        data: data["week"], // Data default
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
  },
});

// Event Listener untuk Filter
document.getElementById("filterPendapatan").addEventListener("change", (e) => {
  const selected = e.target.value; // Ambil nilai filter (day/week/month)
  pendapatanChart.data.labels = labels[selected]; // Update label
  pendapatanChart.data.datasets[0].data = data[selected]; // Update data
  pendapatanChart.update(); // Perbarui diagram
});
