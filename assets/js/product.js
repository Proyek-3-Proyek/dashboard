const productList = document.getElementById("productList");
const modal = document.getElementById("modal");
const openModal = document.getElementById("openModal");
const closeModal = document.getElementById("closeModal");
const productForm = document.getElementById("productForm");
const modalTitle = document.getElementById("modalTitle");
const categoryFilter = document.getElementById("categoryFilter");
const productCategory = document.getElementById("productCategory");
const token = localStorage.getItem("token");
const BASE_URL = "https://backend-eight-phi-75.vercel.app/api";

// Fetch Produk

async function fetchProducts(categoryName = "") {
  Swal.fire({
    title: "Memuat Data Produk",
    text: "Silakan tunggu...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const response = await fetch(`${BASE_URL}/produk/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Gagal mengambil data produk");

    const products = await response.json();

    // Filter berdasarkan jenis_kategori
    const filteredProducts = categoryName
      ? products.filter(
          (product) => product.kategori.jenis_kategori === categoryName
        )
      : products;

    renderProducts(filteredProducts);
    Swal.close();
  } catch (error) {
    console.error(error);
    Swal.fire({
      title: "Error",
      text: "Gagal memuat data produk. Silakan coba lagi.",
      icon: "error",
    });
  }
}

/// Fetch Kategori
async function fetchCategories() {
  try {
    const response = await fetch(`${BASE_URL}/kategori/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Gagal mengambil data kategori");

    const categories = await response.json();

    // Tambahkan opsi kategori ke dropdown
    categoryFilter.innerHTML = '<option value="">Semua Kategori</option>';
    categories.forEach((category) => {
      const option = `<option value="${category.jenis_kategori}">${category.jenis_kategori}</option>`;
      categoryFilter.innerHTML += option;
    });
  } catch (error) {
    console.error(error);
    Swal.fire("Error", "Gagal memuat kategori.", "error");
  }
}

// Render Produk
function renderProducts(products) {
  productList.innerHTML = "";
  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "bg-white p-4 rounded-lg shadow-md";
    productCard.innerHTML = `
      <img src="https://qzbythadanrtksusxdtq.supabase.co/storage/v1/object/public/gambar/${
        product.gambar
      }" class="w-full h-40 object-cover rounded mb-4">
      <h3 class="text-lg font-semibold text-gray-700">${product.nama}</h3>
      <p class="text-sm text-gray-500">${product.deskripsi}</p>
      <p class="text-gray-500">Kategori: ${product.kategori.jenis_kategori}</p>
      <p class="text-gray-500">Harga: Rp${product.harga.toLocaleString()}</p>
      <p class="text-gray-500">Stok: ${product.qty}</p>
      <div class="mt-4 space-x-2">
        <button class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600" onclick="editProduct(${
          product.id
        })">Edit</button>
        <button class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onclick="deleteProduct(${
          product.id
        })">Hapus</button>
      </div>
    `;
    productList.appendChild(productCard);
  });
}

// Tambah/Edit Produk
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("productId").value;
  const formData = new FormData();
  formData.append("nama", document.getElementById("productName").value);
  formData.append(
    "deskripsi",
    document.getElementById("productDescription").value
  );
  formData.append("nama_kategori", productCategory.value);
  formData.append("harga", document.getElementById("productPrice").value);
  formData.append("qty", document.getElementById("productStock").value);
  if (document.getElementById("productImage").files[0]) {
    formData.append("file", document.getElementById("productImage").files[0]);
  }

  try {
    const response = await fetch(
      id ? `${BASE_URL}/produk/update/${id}` : `${BASE_URL}/produk/create`,
      {
        method: id ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );
    if (!response.ok) throw new Error("Gagal menyimpan data");

    Swal.fire("Berhasil!", "Produk berhasil disimpan.", "success");
    modal.classList.add("hidden");
    fetchProducts();
  } catch (error) {
    console.error(error);
    Swal.fire("Error", "Terjadi kesalahan saat menyimpan produk", "error");
  }
});

// Hapus Produk
async function deleteProduct(id) {
  Swal.fire({
    title: "Konfirmasi Hapus",
    text: "Apakah Anda yakin ingin menghapus produk ini?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, hapus!",
    cancelButtonText: "Batal",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`${BASE_URL}/produk/delete/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Gagal menghapus produk");

        Swal.fire("Dihapus!", "Produk berhasil dihapus.", "success");
        fetchProducts();
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Terjadi kesalahan saat menghapus produk", "error");
      }
    }
  });
}

// Edit Produk
async function editProduct(id) {
  try {
    const response = await fetch(`${BASE_URL}/produk/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Gagal mengambil data produk");

    const product = await response.json();
    document.getElementById("productId").value = product.id;
    document.getElementById("productName").value = product.nama;
    document.getElementById("productDescription").value = product.deskripsi;
    document.getElementById("productPrice").value = product.harga;
    document.getElementById("productStock").value = product.qty;
    document.getElementById("productCategory").value =
      product.kategori.jenis_kategori;

    modalTitle.textContent = "Edit Produk";
    modal.classList.remove("hidden");
  } catch (error) {
    console.error(error);
    Swal.fire("Error", "Error saat mengambil data produk", "error");
  }
}

// Inisialisasi
fetchProducts();
fetchCategories();

// Modal Handling
openModal.addEventListener("click", () => {
  productForm.reset();
  document.getElementById("productId").value = "";
  modalTitle.textContent = "Tambah Produk";
  modal.classList.remove("hidden");
});
closeModal.addEventListener("click", () => modal.classList.add("hidden"));

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

// Fetch Produk berdasarkan kategori
async function fetchProducts(categoryId = "") {
  Swal.fire({
    title: "Memuat Data Produk",
    text: "Silakan tunggu...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const endpoint = categoryId
      ? `${BASE_URL}/produk/kategori/${categoryId}`
      : `${BASE_URL}/produk/all`;
    const response = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Gagal mengambil data produk");

    const products = await response.json();
    renderProducts(products);
    Swal.close();
  } catch (error) {
    console.error(error);
    Swal.fire({
      title: "Error",
      text: "Gagal memuat data produk. Silakan coba lagi.",
      icon: "error",
    });
  }
}

// Tambahkan Event Listener untuk Filter Kategori
categoryFilter.addEventListener("change", () => {
  const selectedCategoryName = categoryFilter.value; // Nama kategori
  fetchProducts(selectedCategoryName);
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
