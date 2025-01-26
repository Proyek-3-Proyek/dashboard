document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    Swal.fire({
      icon: "error",
      title: "Akses Ditolak",
      text: "Anda tidak memiliki akses. Silakan login sebagai admin.",
      confirmButtonText: "OK",
    }).then(() => {
      window.location.href = "/login";
    });
    return;
  }

  // Cek role user dari token JWT
  // Parse token untuk mendapatkan nama admin
  const userData = parseJwt(token);
  const adminName = userData.name; // Pastikan field ini sesuai dengan struktur token Anda
  document.getElementById("adminName").textContent = adminName;
  const userRole = parseJwt(token).role;
  if (userRole !== "admin") {
    Swal.fire({
      icon: "warning",
      title: "Akses Terbatas",
      text: "Anda tidak memiliki akses ke halaman ini.",
      confirmButtonText: "OK",
    }).then(() => {
      window.location.href = "/login";
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
});

// Fungsi parseJwt untuk mem-parse token JWT
function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
      .join("")
  );

  return JSON.parse(jsonPayload);
}

document.addEventListener("DOMContentLoaded", async () => {
  const API_URL =
    "https://backend-eight-phi-75.vercel.app/api/payment/transactions";
  const token = localStorage.getItem("token");
  let currentChart; // Menyimpan instance Chart.js

  try {
    const response = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const transactions = await response.json();
    console.log("Respons API:", transactions); // Log struktur data

    const productCounts = {};

    // Jika respons adalah array
    if (Array.isArray(transactions)) {
      transactions.forEach((transaction) => {
        const { nama_produk, jumlah } = transaction;

        if (!productCounts[nama_produk]) {
          productCounts[nama_produk] = 0;
        }
        productCounts[nama_produk] += jumlah;
      });
    } else {
      // Jika respons adalah objek tunggal
      const { nama_produk, jumlah } = transactions;

      if (!productCounts[nama_produk]) {
        productCounts[nama_produk] = 0;
      }
      productCounts[nama_produk] += jumlah;
    }

    const labels = Object.keys(productCounts);
    const data = Object.values(productCounts);

    // Fungsi untuk merender grafik
    const renderChart = (type) => {
      if (currentChart) {
        currentChart.destroy(); // Hapus grafik sebelumnya sebelum membuat yang baru
      }

      const ctx = document
        .getElementById("produkTerbanyakDibeliChart")
        .getContext("2d");
      currentChart = new Chart(ctx, {
        type: type,
        data: {
          labels: labels,
          datasets: [
            {
              label: "Jumlah Terjual",
              data: data,
              backgroundColor: [
                "rgba(54, 162, 235, 0.6)",
                "rgba(255, 99, 132, 0.6)",
                "rgba(255, 206, 86, 0.6)",
                "rgba(75, 192, 192, 0.6)",
                "rgba(153, 102, 255, 0.6)",
                "rgba(255, 159, 64, 0.6)",
              ],
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales:
            type === "pie" || type === "doughnut"
              ? {}
              : {
                  y: {
                    beginAtZero: true,
                  },
                },
        },
      });
    };

    // Render grafik awal (bar)
    renderChart("bar");

    // Tambahkan event listener untuk dropdown
    document.getElementById("chartType").addEventListener("change", (event) => {
      const chartType = event.target.value;
      renderChart(chartType);
    });
  } catch (error) {
    console.error("Error fetching or processing data:", error);
    Swal.fire({
      icon: "error",
      title: "Gagal Memuat Data",
      text: `Terjadi kesalahan: ${error.message}`,
    });
  }
});
