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
    // console.log("Products fetched:", products); // Debug log
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

let cachedCategories = [];
/// Fetch Kategori
async function fetchCategories() {
  if (cachedCategories.length > 0) return cachedCategories;

  try {
    const response = await fetch(`${BASE_URL}/kategori/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Gagal mengambil data kategori");

    const categories = await response.json();
    cachedCategories = categories;

    categoryFilter.innerHTML = '<option value="">Semua Kategori</option>';
    productCategory.innerHTML = '<option value="">Pilih Kategori</option>';

    categories.forEach((category) => {
      const option = `<option value="${category.id_kategori}">${category.jenis_kategori}</option>`;
      categoryFilter.innerHTML += option;
      productCategory.innerHTML += option;
    });
    console.log("Categories fetched:", categories);
    return categories;
  } catch (error) {
    console.error(error);
    Swal.fire("Error", "Error saat memuat kategori", "error");
    return [];
  }
}

// Render Produk
function renderProducts(products) {
  productList.innerHTML = "";
  products.forEach((product) => {
    const kategori = product.kategori?.jenis_kategori || "Tidak Diketahui";

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
          product.id_produk
        })">Edit</button>
        <button class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onclick="deleteProduct(${
          product.id_produk
        })">Hapus</button>
      </div>
    `;
    productList.appendChild(productCard);
  });
}

// Tambah/Edit Produk
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Gunakan kategori yang sudah di-cache
  const categories = await fetchCategories();

  // Validasi apakah categories berhasil diambil
  if (!Array.isArray(categories)) {
    Swal.fire("Error", "Gagal memuat kategori. Silakan coba lagi.", "error");
    return;
  }

  // Ambil nilai dari form
  const selectedCategory = productCategory.value; // ID kategori
  const id = document.getElementById("productId")?.value; // Untuk update
  const productName = document.getElementById("productName").value;
  const productDescription =
    document.getElementById("productDescription").value;
  const productPrice = document.getElementById("productPrice").value;
  const productStock = document.getElementById("productStock").value;
  const productImage = document.getElementById("productImage").files[0];
  const oldProductImage = document.getElementById("oldProductImage").value;

  console.log("Selected Category:", selectedCategory);
  console.log("Dropdown Value:", productCategory.value);
  console.log("Categories Array:", categories);

  if (id && isNaN(Number(id))) {
    Swal.fire("Error", "ID produk tidak valid.", "error");
    return;
  }
  // Validasi kategori
  const validCategory = categories.find(
    (cat) => cat.id_kategori == selectedCategory
  );

  if (!validCategory) {
    console.error("Valid Category not found!");
    Swal.fire(
      "Error",
      "Kategori tidak valid. Pilih kategori yang benar.",
      "error"
    );
    return;
  }

  if (!selectedCategory || selectedCategory === "") {
    Swal.fire(
      "Error",
      "Silakan pilih kategori yang valid sebelum menyimpan.",
      "error"
    );
    return;
  }

  if (productPrice < 1000) {
    Swal.fire({
      icon: "error",
      title: "Validasi Gagal",
      text: "Harga produk tidak boleh kurang dari 1000.",
    });
    return;
  }

  if (productStock < 1) {
    Swal.fire({
      icon: "error",
      title: "Validasi Gagal",
      text: "Stok produk tidak boleh kurang dari 1.",
    });
    return;
  }
  if (!id && !productImage) {
    Swal.fire("Error", "Gambar produk wajib diunggah.", "error");
    return;
  }

  // Validasi input
  if (
    !productName ||
    !productDescription ||
    !productPrice ||
    !productStock ||
    !productImage
  ) {
    Swal.fire("Error", "Semua field dan file harus diisi.", "error");
    return;
  }

  // Konfirmasi sebelum menyimpan
  Swal.fire({
    title: "Apakah Anda yakin?",
    text: "Data produk akan disimpan.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, simpan!",
    cancelButtonText: "Batal",
  }).then(async (result) => {
    if (result.isConfirmed) {
      // Siapkan data untuk dikirim
      const formData = new FormData();
      formData.append("nama", productName);
      formData.append("deskripsi", productDescription);
      formData.append("nama_kategori", validCategory.jenis_kategori);
      formData.append("harga", productPrice);
      formData.append("qty", productStock);
      if (id && !productImage) {
        // Jika tidak ada gambar baru, gunakan gambar lama
        formData.append("gambar", oldProductImage);
      } else if (productImage) {
        formData.append("file", productImage);
      }

      try {
        const url = id
          ? `${BASE_URL}/produk/update/${id}`
          : `${BASE_URL}/produk/create`;

        const method = id ? "PUT" : "POST";

        const response = await fetch(url, {
          method: method,
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!response.ok) throw new Error(await response.text());

        Swal.fire(
          "Berhasil!",
          id ? "Produk berhasil diperbarui." : "Produk berhasil dibuat.",
          "success"
        );
        modal.classList.add("hidden");
        fetchProducts();
      } catch (error) {
        console.error("Error:", error);
        Swal.fire("Error", error.message || "Terjadi kesalahan", "error");
      }
    }
  });
});

// Hapus Produk
async function deleteProduct(id_produk) {
  if (!id_produk) {
    Swal.fire("Error", "ID produk tidak valid.", "error");
    return;
  }

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
        const response = await fetch(`${BASE_URL}/produk/delete/${id_produk}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Gagal menghapus produk");

        Swal.fire("Dihapus!", "Produk berhasil dihapus.", "success");
        fetchProducts();
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Terjadi kesalahan saat menghapus produk.", "error");
      }
    }
  });
}

// Edit Produk
async function editProduct(id_produk) {
  if (!id_produk) {
    Swal.fire("Error", "ID produk tidak valid.", "error");
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/produk/${id_produk}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Gagal mengambil data produk");

    const product = await response.json();

    // Isi elemen form dengan data produk
    document.getElementById("productId").value = product.id_produk;
    document.getElementById("productName").value = product.nama;
    document.getElementById("productDescription").value = product.deskripsi;
    document.getElementById("productPrice").value = product.harga;
    document.getElementById("productStock").value = product.qty;
    document.getElementById("productCategory").value =
      product.kategori.id_kategori;

    // // Simpan nama gambar lama di input hidden
    // document.getElementById("oldProductImage").value = product.gambar;

    // // Menampilkan gambar lama jika ada
    // const previewOldImage = document.getElementById("previewOldImage");
    // const oldImageContainer = document.getElementById("oldImageContainer");
    // if (product.gambar) {
    //   previewOldImage.src = `https://qzbythadanrtksusxdtq.supabase.co/storage/v1/object/public/gambar/${product.gambar}`;
    //   oldImageContainer.classList.remove("hidden"); // Tampilkan container gambar lama
    // } else {
    //   oldImageContainer.classList.add("hidden"); // Sembunyikan jika tidak ada gambar
    // }

    console.log("Form Setelah Diisi:", {
      id_produk: product.id_produk,
      nama: product.nama,
      deskripsi: product.deskripsi,
      harga: product.harga,
      qty: product.qty,
      id_kategori: product.kategori.id_kategori,
      gambar: product.gambar,
    }); // Log elemen form setelah diisi

    modalTitle.textContent = "Edit Produk";
    modal.classList.remove("hidden");
  } catch (error) {
    console.error("Error:", error);
    Swal.fire("Error", "Error saat mengambil data produk", "error");
  }
}

// Inisialisasi
fetchProducts();
fetchCategories();

// Modal Handling
openModal.addEventListener("click", () => {
  productForm.reset(); // Reset semua input form
  document.getElementById("productId").value = ""; // Reset ID produk
  document.getElementById("productCategory").value = ""; // Reset kategori
  // document.getElementById("oldProductImage").value = ""; // Reset gambar lama

  // // Sembunyikan container gambar lama
  // const oldImageContainer = document.getElementById("oldImageContainer");
  // oldImageContainer.classList.add("hidden");

  modalTitle.textContent = "Tambah Produk";
  modal.classList.remove("hidden");
});

closeModal.addEventListener("click", () => modal.classList.add("hidden"));

document.addEventListener("DOMContentLoaded", () => {
  // Periksa token di localStorage
  let token = localStorage.getItem("token");

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

// Tambahkan Event Listener untuk Filter Kategori
// Inisialisasi kategori saat DOM sudah siap
document.addEventListener("DOMContentLoaded", async () => {
  await fetchCategories(); // Memuat kategori untuk dropdown
  fetchProducts(); // Memuat semua produk

  // Event listener untuk filter kategori
  categoryFilter.addEventListener("change", () => {
    const selectedCategoryId = categoryFilter.value; // Ambil nilai dari dropdown
    console.log("Selected Category ID:", selectedCategoryId); // Log untuk debug
    console.log("Category Filter InnerHTML:", categoryFilter.innerHTML);

    // Panggil fetchProducts dengan ID kategori yang dipilih
    fetchProducts(selectedCategoryId || ""); // Jika kosong, ambil semua produk
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
