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
            <td class="px-4 py-2">${transaction.jumlah}</td>
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

// ----------------------fecth pendapatan diagram-------------------------------------------------------------
async function fetchPendapatanData() {
  const token = localStorage.getItem("token"); // Token autentikasi
  const apiUrl =
    "https://backend-eight-phi-75.vercel.app/api/payment/transactions";

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Gagal mengambil data transaksi.");
    }

    const transactions = await response.json();

    // Proses pendapatan
    const pendapatan = {
      day: new Array(24).fill(0),
      week: new Array(7).fill(0),
      month: new Array(31).fill(0),
    };

    transactions.forEach((transaction) => {
      if (transaction.status === "paid") {
        const createdAt = new Date(transaction.created_at);
        const grossAmount = transaction.gross_amount;
        const qty = transaction.jumlah;

        // Hari ini
        if (isToday(createdAt)) {
          const hour = createdAt.getHours();
          pendapatan.day[hour] += grossAmount * qty;
        }

        // Minggu ini
        if (isThisWeek(createdAt)) {
          const dayOfWeek = createdAt.getDay();
          pendapatan.week[dayOfWeek] += grossAmount * qty;
        }

        // Bulan ini
        if (isThisMonth(createdAt)) {
          const dateOfMonth = createdAt.getDate() - 1;
          pendapatan.month[dateOfMonth] += grossAmount * qty;
        }
      }
    });

    // Perbarui diagram dengan data pendapatan
    updateChart(pendapatan);
  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: "error",
      title: "Terjadi Kesalahan",
      text: "Gagal mengambil data transaksi.",
    });
  }
}

function isToday(date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function isThisWeek(date) {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
  const endOfWeek = new Date(startOfWeek.setDate(startOfWeek.getDate() + 6));
  return date >= startOfWeek && date <= endOfWeek;
}

function isThisMonth(date) {
  const today = new Date();
  return (
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function updateChart(pendapatan) {
  const labels = {
    day: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    week: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
    month: Array.from({ length: 31 }, (_, i) => `${i + 1}`),
  };

  // Default filter ke "week"
  const filter = document.getElementById("filterPendapatan").value;
  pendapatanChart.data.labels = labels[filter];
  pendapatanChart.data.datasets[0].data = pendapatan[filter];
  pendapatanChart.update();
}

// Event Listener untuk filter
document
  .getElementById("filterPendapatan")
  .addEventListener("change", fetchPendapatanData);

// Panggil fetchPendapatanData setelah halaman dimuat
document.addEventListener("DOMContentLoaded", fetchPendapatanData);

// ----------------------diagram total pendapatan-------------------------------
const ctx = document.getElementById("pendapatanChart").getContext("2d");

const pendapatanChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [], // Akan diperbarui saat data diterima
    datasets: [
      {
        label: "Pendapatan (Rp)",
        data: [],
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

// -----------------Total Pesanan--------------------------------
async function fetchTotalPesanan() {
  const token = localStorage.getItem("token"); // Token autentikasi
  const apiUrl =
    "https://backend-eight-phi-75.vercel.app/api/payment/transactions";

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Gagal mengambil data transaksi.");
    }

    const transactions = await response.json();

    // Hitung total transaksi
    const totalPesanan = transactions.length;

    // Tampilkan ke elemen HTML
    document.getElementById("totalPesanan").textContent = totalPesanan;
  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: "error",
      title: "Terjadi Kesalahan",
      text: "Gagal menghitung total pesanan.",
    });
  }
}

// Panggil fungsi fetchTotalPesanan setelah halaman dimuat
document.addEventListener("DOMContentLoaded", fetchTotalPesanan);
