document.addEventListener("DOMContentLoaded", () => {
  // Periksa token di localStorage
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

  try {
    // Fetch data from API
    const response = await fetch(API_URL);
    const transactions = await response.json();

    // Process data to count product purchases
    const productCounts = {};
    transactions.forEach((transaction) => {
      transaction.items.forEach((item) => {
        if (!productCounts[item.productName]) {
          productCounts[item.productName] = 0;
        }
        productCounts[item.productName] += item.quantity;
      });
    });

    // Prepare data for Chart.js
    const labels = Object.keys(productCounts);
    const data = Object.values(productCounts);

    // Render chart
    const ctx = document
      .getElementById("produkTerbanyakDibeliChart")
      .getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Jumlah Terjual",
            data: data,
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching or processing data:", error);
  }
});
