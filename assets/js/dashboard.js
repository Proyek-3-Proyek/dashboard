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
      window.location.href =
        "https://proyek-3-proyek.github.io/tokline.github.io/src/page/auth/login.html";
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
      window.location.href =
        "https://proyek-3-proyek.github.io/tokline.github.io/src/page/auth/login.html";
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
            window.location.href =
              "https://proyek-3-proyek.github.io/tokline.github.io/src/page/auth/login.html";
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
