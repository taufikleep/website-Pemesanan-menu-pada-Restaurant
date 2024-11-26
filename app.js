  // app.js
  document.addEventListener("DOMContentLoaded", initDB);

  // Show form based on formType
  function showForm(formType) {
    document.querySelectorAll(".form-section").forEach((form) => {
      form.style.display = "none";
    });
    document.getElementById(formType + "Form").style.display = "block";
    
    // Load dropdown data for specific forms
    if (formType === 'pesanan') {
      loadPelangganDropdown();
      loadMakananDropdown();
      loadMinumanDropdown();
    } else if (formType === 'makanan') {
      loadKategoriDropdown('Makanan');
    } else if (formType === 'minuman') {
      loadKategoriDropdown('Minuman');
    }
  }

  // Calculate total price when items or quantities change
  document.getElementById("makananPesanan")?.addEventListener("change", calculateTotalPrice);
  document.getElementById("minumanPesanan")?.addEventListener("change", calculateTotalPrice);
  document.getElementById("jumlahMakanan")?.addEventListener("change", calculateTotalPrice);
  document.getElementById("jumlahMinuman")?.addEventListener("change", calculateTotalPrice);

  function calculateTotalPrice() {
    const makananSelect = document.getElementById("makananPesanan");
    const minumanSelect = document.getElementById("minumanPesanan");
    const jumlahMakanan = document.getElementById("jumlahMakanan").value || 0;
    const jumlahMinuman = document.getElementById("jumlahMinuman").value || 0;
    
    let totalHarga = 0;
    
    if (makananSelect && makananSelect.selectedOptions.length > 0) {
      const transaction = db.transaction(["makanan"], "readonly");
      const store = transaction.objectStore("makanan");
      
      Array.from(makananSelect.selectedOptions).forEach(option => {
        const request = store.get(parseInt(option.value));
        request.onsuccess = () => {
          const makanan = request.result;
          totalHarga += makanan.harga * jumlahMakanan;
          updateTotalHarga(totalHarga);
        };
      });
    }
    
    if (minumanSelect && minumanSelect.selectedOptions.length > 0) {
      const transaction = db.transaction(["minuman"], "readonly");
      const store = transaction.objectStore("minuman");
      
      Array.from(minumanSelect.selectedOptions).forEach(option => {
        const request = store.get(parseInt(option.value));
        request.onsuccess = () => {
          const minuman = request.result;
          totalHarga += minuman.harga * jumlahMinuman;
          updateTotalHarga(totalHarga);
        };
      });
    }
  }

  function updateTotalHarga(total) {
    document.getElementById("totalHarga").value = total;
  }

  // Load dropdown data
  function loadPelangganDropdown() {
    const select = document.getElementById("pelangganPesanan");
    select.innerHTML = '<option value="">Pilih Pelanggan</option>';
    
    const transaction = db.transaction(["pelanggan"], "readonly");
    const store = transaction.objectStore("pelanggan");
    const request = store.openCursor();
    
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const option = document.createElement("option");
        option.value = cursor.value.id;
        option.textContent = cursor.value.namaPelanggan;
        select.appendChild(option);
        cursor.continue();
      }
    };
  }

  function loadMakananDropdown() {
    const select = document.getElementById("makananPesanan");
    select.innerHTML = '<option value="">Pilih Makanan</option>';
    
    const transaction = db.transaction(["makanan"], "readonly");
    const store = transaction.objectStore("makanan");
    const request = store.openCursor();
    
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        if (cursor.value.statusMakanan !== 'Habis') {
          const option = document.createElement("option");
          option.value = cursor.value.id;
          option.textContent = `${cursor.value.namaMakanan} (Rp ${cursor.value.harga.toLocaleString()})`;
          select.appendChild(option);
        }
        cursor.continue();
      }
    };
  }

  function loadMinumanDropdown() {
    const select = document.getElementById("minumanPesanan");
    select.innerHTML = '<option value="">Pilih Minuman</option>';
    
    const transaction = db.transaction(["minuman"], "readonly");
    const store = transaction.objectStore("minuman");
    const request = store.openCursor();
    
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        if (cursor.value.statusMinuman !== 'Habis') {
          const option = document.createElement("option");
          option.value = cursor.value.id;
          option.textContent = `${cursor.value.namaMinuman} (Rp ${cursor.value.harga.toLocaleString()})`;
          select.appendChild(option);
        }
        cursor.continue();
      }
    };
  }

  function loadKategoriDropdown(tipe) {
    const selectId = tipe === 'Makanan' ? 'kategoriMakanan' : 'kategoriMinuman';
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Pilih Kategori</option>';
    
    const transaction = db.transaction(["kategori"], "readonly");
    const store = transaction.objectStore("kategori");
    const index = store.index("tipeKategori");
    const request = index.openCursor(tipe);
    
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const option = document.createElement("option");
        option.value = cursor.value.id;
        option.textContent = cursor.value.namaKategori;
        select.appendChild(option);
        cursor.continue();
      }
    };
  }

  // Form submission handlers
  document.getElementById("formMakanan").addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      namaMakanan: document.getElementById("namaMakanan").value,
      kategoriId: parseInt(document.getElementById("kategoriMakanan").value),
      deskripsi: document.getElementById("deskripsi").value,
      harga: parseFloat(document.getElementById("harga").value),
      statusMakanan: document.getElementById("statusMakanan").value,
    };

    const transaction = db.transaction(["makanan"], "readwrite");
    const store = transaction.objectStore("makanan");

    const id = document.getElementById("makananId").value;
    if (id) {
      data.id = parseInt(id);
      store.put(data);
    } else {
      store.add(data);
    }

    transaction.oncomplete = () => {
      document.getElementById("formMakanan").reset();
      document.getElementById("makananId").value = "";
      loadMakananList();
    };
  });

  document.getElementById("formMinuman").addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      namaMinuman: document.getElementById("namaMinuman").value,
      kategoriId: parseInt(document.getElementById("kategoriMinuman").value),
      deskripsi: document.getElementById("deskripsiMinuman").value,
      harga: parseFloat(document.getElementById("hargaMinuman").value),
      statusMinuman: document.getElementById("statusMinuman").value,
    };

    const transaction = db.transaction(["minuman"], "readwrite");
    const store = transaction.objectStore("minuman");

    const id = document.getElementById("minumanId").value;
    if (id) {
      data.id = parseInt(id);
      store.put(data);
    } else {
      store.add(data);
    }

    transaction.oncomplete = () => {
      document.getElementById("formMinuman").reset();
      document.getElementById("minumanId").value = "";
      loadMinumanList();
    };
  });

  document.getElementById("formPesanan").addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      pelangganId: parseInt(document.getElementById("pelangganPesanan").value),
      makananId: Array.from(document.getElementById("makananPesanan").selectedOptions).map(option => parseInt(option.value)),
      minumanId: Array.from(document.getElementById("minumanPesanan").selectedOptions).map(option => parseInt(option.value)),
      jumlahMakanan: parseInt(document.getElementById("jumlahMakanan").value),
      jumlahMinuman: parseInt(document.getElementById("jumlahMinuman").value),
      catatanKhusus: document.getElementById("catatanKhusus").value,
      totalHarga: parseFloat(document.getElementById("totalHarga").value),
    };

    const transaction = db.transaction(["pesanan"], "readwrite");
    const pesananStore = transaction.objectStore("pesanan");

    const id = document.getElementById("pesananId").value;
    if (id) {
      data.id = parseInt(id);
      pesananStore.put(data);
    } else {
      pesananStore.add(data);
    }

    transaction.oncomplete = () => {
      document.getElementById("formPesanan").reset();
      document.getElementById("pesananId").value = "";
      loadPesananList();
    };
  });

  document.getElementById("formPelanggan").addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      namaPelanggan: document.getElementById("namaPelanggan").value,
      noTelepon: document.getElementById("noTelepon").value,
      email: document.getElementById("email").value,
      alamat: document.getElementById("alamat").value,
    };

    const transaction = db.transaction(["pelanggan"], "readwrite");
    const store = transaction.objectStore("pelanggan");

    const id = document.getElementById("pelangganId").value;
    if (id) {
      data.id = parseInt(id);
      store.put(data);
    } else {
      store.add(data);
    }

    transaction.oncomplete = () => {
      document.getElementById("formPelanggan").reset();
      document.getElementById("pelangganId").value = "";
      loadPelangganList();
    };
  });

  document.getElementById("formKategori").addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      namaKategori: document.getElementById("namaKategori").value,
      deskripsiKategori: document.getElementById("deskripsiKategori").value,
      tipeKategori: document.getElementById("tipeKategori").value,
    };

    const transaction = db.transaction(["kategori"], "readwrite");
    const store = transaction.objectStore("kategori");

    const id = document.getElementById("kategoriId").value;
    if (id) {
      data.id = parseInt(id);
      store.put(data);
    } else {
      store.add(data);
    }

    transaction.oncomplete = () => {
      document.getElementById("formKategori").reset();
      document.getElementById("kategoriId").value = "";
      loadKategoriList();
    };
  });

  // Load all data
  function loadAllData() {
    loadPelangganList();
    loadMakananList();
    loadMinumanList();
    loadPesananList();
    loadKategoriList();
  }

  // List loading functions (similar to previous implementation, but updated for new tables)
  function loadPelangganList() {
    const pelangganList = document.getElementById("pelangganList");
    pelangganList.innerHTML = "";

    const transaction = db.transaction(["pelanggan"], "readonly");
    const store = transaction.objectStore("pelanggan");
    const request = store.openCursor();

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const div = document.createElement("div");
        div.className = "list-item";
        div.innerHTML = `
          <strong>Nama:</strong> ${cursor.value.namaPelanggan}<br>
          <strong>Telepon:</strong> ${cursor.value.noTelepon}<br>
          <strong>Email:</strong> ${cursor.value.email}<br>
          <strong>Alamat:</strong> ${cursor.value.alamat}<br>
          <div class="action-buttons">
            <button class="submit-btn" onclick="editPelanggan(${cursor.value.id})">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="submit-btn" onclick="deletePelanggan(${cursor.value.id})">
              <i class="fas fa-trash"></i> Hapus
            </button>
          </div>
        `;
        pelangganList.appendChild(div);
        cursor.continue();
      }
    };
  }

  function loadMakananList() {
    const makananList = document.getElementById("makananList");
    makananList.innerHTML = "";

    const transaction = db.transaction(["makanan", "kategori"], "readonly");
    const makananStore = transaction.objectStore("makanan");
    const kategoriStore = transaction.objectStore("kategori");
    const request = makananStore.openCursor();

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const makanan = cursor.value;
        
        const kategoriRequest = kategoriStore.get(makanan.kategoriId);
        kategoriRequest.onsuccess = () => {
          const kategori = kategoriRequest.result;
          
          const div = document.createElement("div");
          div.className = "list-item";
          div.innerHTML = `
            <strong>Nama Makanan:</strong> ${makanan.namaMakanan}<br>
            <strong>Kategori:</strong> ${kategori ? kategori.namaKategori : 'N/A'}<br>
            <strong>Deskripsi:</strong> ${makanan.deskripsi}<br>
            <strong>Harga:</strong> Rp ${makanan.harga.toLocaleString()}<br>
            <strong>Status:</strong> ${makanan.statusMakanan}<br>
            <div class="action-buttons">
              <button class="submit-btn" onclick="editMakanan(${makanan.id})">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button class="submit-btn" onclick="deleteMakanan(${makanan.id})">
                <i class="fas fa-trash"></i> Hapus
              </button>
            </div>
          `;
          makananList.appendChild(div);
        };
        cursor.continue();
      }
    };
  }

  function loadMinumanList() {
  const minumanList = document.getElementById("minumanList");
  minumanList.innerHTML = "";

  const transaction = db.transaction(["minuman", "kategori"], "readonly");
  const minumanStore = transaction.objectStore("minuman");
  const kategoriStore = transaction.objectStore("kategori");
  const request = minumanStore.openCursor();

  request.onsuccess = (event) => {
    const cursor = event.target.result;
    if (cursor) {
      const minuman = cursor.value;
      
      const kategoriRequest = kategoriStore.get(minuman.kategoriId);
      kategoriRequest.onsuccess = () => {
        const kategori = kategoriRequest.result;
        
        const div = document.createElement("div");
        div.className = "list-item";
        div.innerHTML = `
          <strong>Nama Minuman:</strong> ${minuman.namaMinuman}<br>
          <strong>Kategori:</strong> ${kategori ? kategori.namaKategori : 'N/A'}<br>
          <strong>Deskripsi:</strong> ${minuman.deskripsiMinuman || minuman.deskripsi}<br>
          <strong>Harga:</strong> Rp ${minuman.harga.toLocaleString()}<br>
          <strong>Status:</strong> ${minuman.statusMinuman}<br>
          <div class="action-buttons">
            <button class="submit-btn" onclick="editMinuman(${minuman.id})">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="submit-btn" onclick="deleteMinuman(${minuman.id})">
              <i class="fas fa-trash"></i> Hapus
            </button>
          </div>
        `;
        minumanList.appendChild(div);
      };
      cursor.continue();
    }
  };
}

  function loadPesananList() {
    const pesananList = document.getElementById("pesananList");
    pesananList.innerHTML = "";

    const transaction = db.transaction(["pesanan", "pelanggan", "makanan", "minuman"], "readonly");
    const pesananStore = transaction.objectStore("pesanan");
    const pelangganStore = transaction.objectStore("pelanggan");
    const makananStore = transaction.objectStore("makanan");
    const minumanStore = transaction.objectStore("minuman");
    const request = pesananStore.openCursor();

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const pesanan = cursor.value;
        
        const pelangganRequest = pelangganStore.get(pesanan.pelangganId);
        pelangganRequest.onsuccess = () => {
          const pelanggan = pelangganRequest.result;
          
          // Fetch makanan details
          const makananPromises = pesanan.makananId.map(id => {
            return new Promise((resolve) => {
              const makananRequest = makananStore.get(id);
              makananRequest.onsuccess = () => resolve(makananRequest.result);
            });
          });

          // Fetch minuman details
          const minumanPromises = pesanan.minumanId.map(id => {
            return new Promise((resolve) => {
              const minumanRequest = minumanStore.get(id);
              minumanRequest.onsuccess = () => resolve(minumanRequest.result);
            });
          });

          Promise.all([...makananPromises, ...minumanPromises]).then((items) => {
            const makananItems = items.filter(item => item.namaMakanan);
            const minumanItems = items.filter(item => item.namaMinuman);

            const div = document.createElement("div");
            div.className = "list-item";
            div.innerHTML = `
              <strong>Pelanggan:</strong> ${pelanggan.namaPelanggan}<br>
              <strong>Makanan:</strong> ${makananItems.map(m => `${m.namaMakanan} (${pesanan.jumlahMakanan})`).join(', ')}<br>
              <strong>Minuman:</strong> ${minumanItems.map(m => `${m.namaMinuman} (${pesanan.jumlahMinuman})`).join(', ')}<br>
              <strong>Catatan:</strong> ${pesanan.catatanKhusus || 'Tidak ada'}<br>
              <strong>Total Harga:</strong> Rp ${pesanan.totalHarga.toLocaleString()}<br>
              <div class="action-buttons">
                <button class="submit-btn" onclick="editPesanan(${pesanan.id})">
                  <i class="fas fa-edit"></i> Edit
                </button>
                <button class="submit-btn" onclick="deletePesanan(${pesanan.id})">
                  <i class="fas fa-trash"></i> Hapus
                </button>
              </div>
            `;
            pesananList.appendChild(div);
          });
        };
        cursor.continue();
      }
    };
  }

  function loadKategoriList() {
    const kategoriList = document.getElementById("kategoriList");
    kategoriList.innerHTML = "";

    const transaction = db.transaction(["kategori"], "readonly");
    const store = transaction.objectStore("kategori");
    const request = store.openCursor();

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const div = document.createElement("div");
        div.className = "list-item";
        div.innerHTML = `
          <strong>Nama Kategori:</strong> ${cursor.value.namaKategori}<br>
          <strong>Deskripsi:</strong> ${cursor.value.deskripsiKategori}<br>
          <strong>Tipe:</strong> ${cursor.value.tipeKategori}<br>
          <div class="action-buttons">
            <button class="submit-btn" onclick="editKategori(${cursor.value.id})">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="submit-btn" onclick="deleteKategori(${cursor.value.id})">
              <i class="fas fa-trash"></i> Hapus
            </button>
          </div>
        `;
        kategoriList.appendChild(div);
        cursor.continue();
      }
    };
  }

  // Edit functions
  function editPelanggan(id) {
    const transaction = db.transaction(["pelanggan"], "readonly");
    const store = transaction.objectStore("pelanggan");
    const request = store.get(id);

    request.onsuccess = () => {
      const pelanggan = request.result;
      document.getElementById("pelangganId").value = pelanggan.id;
      document.getElementById("namaPelanggan").value = pelanggan.namaPelanggan;
      document.getElementById("noTelepon").value = pelanggan.noTelepon;
      document.getElementById("email").value = pelanggan.email;
      document.getElementById("alamat").value = pelanggan.alamat;
      showForm('pelanggan');
    };
  }

  function editMakanan(id) {
    const transaction = db.transaction(["makanan"], "readonly");
    const store = transaction.objectStore("makanan");
    const request = store.get(id);

    request.onsuccess = () => {
      const makanan = request.result;
      document.getElementById("makananId").value = makanan.id;
      document.getElementById("namaMakanan").value = makanan.namaMakanan;
      document.getElementById("kategoriMakanan").value = makanan.kategoriId;
      document.getElementById("deskripsi").value = makanan.deskripsi;
      document.getElementById("harga").value = makanan.harga;
      document.getElementById("statusMakanan").value = makanan.statusMakanan;
      showForm('makanan');
    };
  }

  function editMinuman(id) {
    const transaction = db.transaction(["minuman"], "readonly");
    const store = transaction.objectStore("minuman");
    const request = store.get(id);

    request.onsuccess = () => {
      const minuman = request.result;
      document.getElementById("minumanId").value = minuman.id;
      document.getElementById("namaMinuman").value = minuman.namaMinuman;
      document.getElementById("kategoriMinuman").value = minuman.kategoriId;
      document.getElementById("deskripsiMinuman").value = minuman.deskripsi;
      document.getElementById("hargaMinuman").value = minuman.harga;
      document.getElementById("statusMinuman").value = minuman.statusMinuman;
      showForm('minuman');
    };
  }

  function editPesanan(id) {
    const transaction = db.transaction(["pesanan"], "readonly");
    const store = transaction.objectStore("pesanan");
    const request = store.get(id);

    request.onsuccess = () => {
      const pesanan = request.result;
      document.getElementById("pesananId").value = pesanan.id;
      document.getElementById("pelangganPesanan").value = pesanan.pelangganId;
      
      // Set makanan and minuman selections
      const makananSelect = document.getElementById("makananPesanan");
      const minumanSelect = document.getElementById("minumanPesanan");
      
      // Clear previous selections
      Array.from(makananSelect.options).forEach(option => {
        option.selected = pesanan.makananId.includes(parseInt(option.value));
      });
      
      Array.from(minumanSelect.options).forEach(option => {
        option.selected = pesanan.minumanId.includes(parseInt(option.value));
      });
      
      document.getElementById("jumlahMakanan").value = pesanan.jumlahMakanan;
      document.getElementById("jumlahMinuman").value = pesanan.jumlahMinuman;
      document.getElementById("catatanKhusus").value = pesanan.catatanKhusus;
      document.getElementById("totalHarga").value = pesanan.totalHarga;
      
      showForm('pesanan');
    };
  }

  function editKategori(id) {
    const transaction = db.transaction(["kategori"], "readonly");
    const store = transaction.objectStore("kategori");
    const request = store.get(id);

    request.onsuccess = () => {
      const kategori = request.result;
      document.getElementById("kategoriId").value = kategori.id;
      document.getElementById("namaKategori").value = kategori.namaKategori;
      document.getElementById("deskripsiKategori").value = kategori.deskripsiKategori;
      document.getElementById("tipeKategori").value = kategori.tipeKategori;
      showForm('kategori');
    };
  }

  // Delete functions
  function deletePelanggan(id) {
    const transaction = db.transaction(["pelanggan"], "readwrite");
    const store = transaction.objectStore("pelanggan");
    const request = store.delete(id);

    request.onsuccess = () => {
      loadPelangganList();
    };
  }

  function deleteMakanan(id) {
    const transaction = db.transaction(["makanan"], "readwrite");
    const store = transaction.objectStore("makanan");
    const request = store.delete(id);

    request.onsuccess = () => {
      loadMakananList();
    };
  }

  function deleteMinuman(id) {
    const transaction = db.transaction(["minuman"], "readwrite");
    const store = transaction.objectStore("minuman");
    const request = store.delete(id);

    request.onsuccess = () => {
      loadMinumanList();
    };
  }

  function deletePesanan(id) {
    const transaction = db.transaction(["pesanan"], "readwrite");
    const store = transaction.objectStore("pesanan");
    const request = store.delete(id);

    request.onsuccess = () => {
      loadPesananList();
    };
  }

  function deleteKategori(id) {
    const transaction = db.transaction(["kategori"], "readwrite");
    const store = transaction.objectStore("kategori");
    const request = store.delete(id);

    request.onsuccess = () => {
      loadKategoriList();
    };
  }

