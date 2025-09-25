# AbsenVersiAing

## Deskripsi

Script Python ini digunakan untuk melakukan absensi otomatis pada website [simkuliah.usk.ac.id](https://simkuliah.usk.ac.id/) menggunakan Selenium WebDriver.

## Fitur

- Login otomatis ke akun SIM Kuliah USK
- Navigasi ke halaman absensi
- Klik tombol absen dan konfirmasi secara otomatis
- Menampilkan status absensi di terminal

## Cara Penggunaan

1. **Install Python**

   - Pastikan Python 3.x sudah terinstall di komputer Anda.

2. **Install Google Chrome**

   - Script ini menggunakan Chrome WebDriver, pastikan browser Google Chrome sudah terpasang.

3. **Install Selenium dan ChromeDriver**
   Jalankan perintah berikut di terminal:

   ```pwsh
   pip install selenium
   ```

   - Download ChromeDriver yang sesuai dengan versi Chrome Anda dari [sini](https://chromedriver.chromium.org/downloads) dan letakkan di folder yang sudah ada di PATH atau satu folder dengan script.

4. **Edit Akun**

   - Buka file `absen.py` dan ganti bagian berikut dengan username dan password SIM Kuliah Anda:
     ```python
     USERNAME = "terserah"  # ganti dengan username Anda
     PASSWORD = "terserah"  # ganti dengan password Anda
     ```

5. **Jalankan Script**
   - Buka terminal di folder project, lalu jalankan:
     ```pwsh
     python absen.py
     ```
   - Status absensi akan muncul di terminal.

## Teknologi yang Digunakan

- **Python 3.x**
- **Selenium WebDriver**
- **Google Chrome & ChromeDriver**

## Catatan

- Script ini hanya bekerja jika ada jadwal absensi yang aktif.
- Jangan bagikan username dan password Anda ke orang lain.
- Untuk penggunaan headless (tanpa membuka jendela browser), aktifkan baris berikut di `absen.py`:
  ```python
  options.add_argument("--headless")
  ```

## Lisensi

Script ini dibuat untuk keperluan edukasi dan penggunaan pribadi.
