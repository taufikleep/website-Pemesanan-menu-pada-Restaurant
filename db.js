// db.js
let db;

const initDB = () => {
  const request = indexedDB.open("RestaurantOrderDB", 1);

  request.onerror = (event) => {
    console.error("Database error:", event.target.error);
  };

  request.onsuccess = (event) => {
    db = event.target.result;
    console.log("Database opened successfully");
    loadAllData();
  };

  request.onupgradeneeded = (event) => {
    db = event.target.result;

    // Tabel Makanan
    if (!db.objectStoreNames.contains("makanan")) {
      const makananStore = db.createObjectStore("makanan", {
        keyPath: "id",
        autoIncrement: true,
      });
      makananStore.createIndex("namaMakanan", "namaMakanan", { unique: false });
      makananStore.createIndex("kategoriId", "kategoriId", { unique: false });
      makananStore.createIndex("deskripsi", "deskripsi", { unique: false });
      makananStore.createIndex("harga", "harga", { unique: false });
      makananStore.createIndex("statusMakanan", "statusMakanan", { unique: false });
    }

    // Tabel Minuman
    if (!db.objectStoreNames.contains("minuman")) {
      const minumanStore = db.createObjectStore("minuman", {
        keyPath: "id",
        autoIncrement: true,
      });
      minumanStore.createIndex("namaMinuman", "namaMinuman", { unique: false });
      minumanStore.createIndex("kategoriId", "kategoriId", { unique: false });
      minumanStore.createIndex("deskripsi", "deskripsi", { unique: false });
      minumanStore.createIndex("harga", "harga", { unique: false });
      minumanStore.createIndex("statusMinuman", "statusMinuman", { unique: false });
    }

    // Tabel Pesanan
    if (!db.objectStoreNames.contains("pesanan")) {
      const pesananStore = db.createObjectStore("pesanan", {
        keyPath: "id",
        autoIncrement: true,
      });
      pesananStore.createIndex("pelangganId", "pelangganId", { unique: false });
      pesananStore.createIndex("makananId", "makananId", { unique: false });
      pesananStore.createIndex("minumanId", "minumanId", { unique: false });
      pesananStore.createIndex("jumlahMakanan", "jumlahMakanan", { unique: false });
      pesananStore.createIndex("jumlahMinuman", "jumlahMinuman", { unique: false });
      pesananStore.createIndex("catatanKhusus", "catatanKhusus", { unique: false });
      pesananStore.createIndex("totalHarga", "totalHarga", { unique: false });
    }

    // Tabel Pelanggan (remains the same as previous version)
    if (!db.objectStoreNames.contains("pelanggan")) {
      const pelangganStore = db.createObjectStore("pelanggan", {
        keyPath: "id",
        autoIncrement: true,
      });
      pelangganStore.createIndex("namaPelanggan", "namaPelanggan", { unique: false });
      pelangganStore.createIndex("noTelepon", "noTelepon", { unique: false });
      pelangganStore.createIndex("email", "email", { unique: true });
      pelangganStore.createIndex("alamat", "alamat", { unique: false });
    }

    // Tabel Kategori
    if (!db.objectStoreNames.contains("kategori")) {
      const kategoriStore = db.createObjectStore("kategori", {
        keyPath: "id",
        autoIncrement: true,
      });
      kategoriStore.createIndex("namaKategori", "namaKategori", { unique: false });
      kategoriStore.createIndex("deskripsiKategori", "deskripsiKategori", { unique: false });
      kategoriStore.createIndex("tipeKategori", "tipeKategori", { unique: false });
    }
  };
};