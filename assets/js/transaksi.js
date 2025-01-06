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
            <td class="px-4 py-2 text-center">
              <button onclick="viewDetails('${
                transaction.transaksi_id
              }')" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Detail</button>
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
  const apiUrl = "https://backend-eight-phi-75.vercel.app/api/payment/transactions";

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

    // Tampilkan hasil
    console.log(`Total Pendapatan: Rp${totalPendapatan.toLocaleString()}`);
    console.log(`Total Produk Terjual: ${totalProdukTerjual}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Panggil fungsi untuk menghitung total
calculateTotalSales();




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
