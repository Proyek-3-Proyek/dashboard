const BASE_URL = "https://backend-eight-phi-75.vercel.app/api";
const token = localStorage.getItem("token");

const categoryList = document.getElementById("categoryList");
const categoryModal = document.getElementById("categoryModal");
const openCategoryModal = document.getElementById("openCategoryModal");
const closeCategoryModal = document.getElementById("closeCategoryModal");
const categoryForm = document.getElementById("categoryForm");
const categoryModalTitle = document.getElementById("categoryModalTitle");

// Fetch Kategori
// Fetch Kategori
const fetchCategories = async () => {
  Swal.fire({
    title: "Memuat Data...",
    text: "Mohon tunggu, data kategori sedang dimuat.",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const response = await fetch(`${BASE_URL}/kategori/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Gagal mengambil data kategori");

    const categories = await response.json();
    renderCategories(categories);

    // Tutup SweetAlert setelah data selesai dimuat
    Swal.close();
  } catch (error) {
    console.error(error);

    Swal.fire({
      icon: "error",
      title: "Gagal Memuat",
      text: "Gagal mengambil data kategori.",
    });
  }
};

// Render Daftar Kategori
const renderCategories = (categories) => {
  categoryList.innerHTML = "";
  categories.forEach((category) => {
    const categoryCard = document.createElement("div");
    categoryCard.className = "bg-white p-4 rounded-lg shadow-md";
    categoryCard.innerHTML = `
      <h3 class="text-lg font-semibold">${category.jenis_kategori}</h3>
      <div class="mt-4 space-x-2">
        <button class="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600" onclick="editCategory(${category.id_kategori}, '${category.jenis_kategori}')">Edit</button>
        <button class="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600" onclick="deleteCategory(${category.id_kategori})">Hapus</button>
      </div>
    `;
    categoryList.appendChild(categoryCard);
  });
};

// add kategori
categoryForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("categoryId").value;
  const jenis_kategori = document.getElementById("categoryName").value;

  // Validasi input
  if (!jenis_kategori) {
    Swal.fire("Error", "Nama kategori tidak boleh kosong.", "error");
    return;
  }

  // Konfirmasi sebelum menyimpan
  Swal.fire({
    title: "Apakah Anda yakin?",
    text: "Data kategori akan disimpan.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, simpan!",
    cancelButtonText: "Batal",
  }).then(async (result) => {
    if (result.isConfirmed) {
      const endpoint = id
        ? `${BASE_URL}/kategori/update/${id}`
        : `${BASE_URL}/kategori/create`;
      const method = id ? "PUT" : "POST";

      try {
        const response = await fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ jenis_kategori }),
        });
        if (!response.ok) throw new Error("Gagal menyimpan kategori, Nama kategori sudah ada atau tidak sesuai format (berupa huruf dan tidak diisi dengan sembarangan).");

        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Kategori berhasil disimpan.",
        });
        categoryModal.classList.add("hidden");
        fetchCategories();
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Gagal menyimpan kategori.",
        });
      }
    }
  });
});

// Hapus Kategori
const deleteCategory = async (id_kategori) => {
  Swal.fire({
    title: "Hapus Kategori?",
    text: "Yakin ingin menghapus kategori ini?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya, Hapus!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `${BASE_URL}/kategori/delete/${id_kategori}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("Gagal menghapus kategori");

        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Kategori berhasil dihapus.",
        });
        fetchCategories();
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Gagal menghapus kategori.",
        });
      }
    }
  });
};

// Edit Kategori
const editCategory = (id_kategori, name) => {
  document.getElementById("categoryId").value = id_kategori;
  document.getElementById("categoryName").value = name;
  categoryModalTitle.textContent = "Edit Kategori";
  categoryModal.classList.remove("hidden");
};

// Modal Handling
openCategoryModal.addEventListener("click", () => {
  document.getElementById("categoryId").value = "";
  document.getElementById("categoryName").value = "";
  categoryModalTitle.textContent = "Tambah Kategori";
  categoryModal.classList.remove("hidden");
});
closeCategoryModal.addEventListener("click", () => {
  categoryModal.classList.add("hidden");
});

// Inisialisasi
document.addEventListener("DOMContentLoaded", fetchCategories);

document.addEventListener("DOMContentLoaded", () => {
  // Periksa token di localStorage
  const token = localStorage.getItem("token");

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

  // Cek role user dari token JWT
  const userRole = parseJwt(token).role;
  if (userRole !== "admin") {
    Swal.fire({
      icon: "error",
      title: "Akses Ditolak",
      text: "Anda tidak memiliki akses ke halaman ini.",
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
