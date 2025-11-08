import os
import time
import logging
import traceback
import datetime
from zoneinfo import ZoneInfo
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from dotenv import load_dotenv

# Helper function untuk mendapatkan timestamp yang aman untuk nama file
def get_timestamp():
    """Mengembalikan timestamp format DD-MM-YYYY_HH-MM-SS"""
    # Menggunakan Asia/Jakarta karena Simkuliah menggunakan Waktu Indonesia Barat
    return datetime.datetime.now(ZoneInfo("Asia/Jakarta")).strftime("%d-%m-%Y_%H-%M-%S")

# --- Muat variabel dari file .env ---
load_dotenv('.env.local')  # Ubah sesuai nama file .env Anda
NPM = os.getenv("NPM")
PASSWORD = os.getenv("PASSWORD")

# --- Validasi kredensial ---
if not NPM or not PASSWORD:
    print("❌ ERROR: NPM atau Password tidak ditemukan di file .env.")
    exit()

# --- Persiapan direktori log ---
# Struktur direktori sekarang tanpa sub-folder tanggalan
photo_dir = "log/error/photo"
log_dir = "log/error/log"
os.makedirs(photo_dir, exist_ok=True)
os.makedirs(log_dir, exist_ok=True)

# Nama file log harian
today_str = datetime.datetime.now().strftime("%d-%m-%Y")
log_filename = f"{log_dir}/error_{today_str}.log"

# --- Setup logging ---
logger = logging.getLogger("AbsenLogger")
logger.setLevel(logging.DEBUG)

# File handler (log lengkap harian)
fh = logging.FileHandler(log_filename)
fh.setLevel(logging.DEBUG)
fh.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))

# Console handler (log ringkas)
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)
ch.setFormatter(logging.Formatter("%(levelname)s - %(message)s"))

# Hapus handler yang mungkin sudah ada dari run sebelumnya
if logger.hasHandlers():
    logger.handlers.clear()
    
logger.addHandler(fh)
logger.addHandler(ch)

# --- Setup browser ---
options = Options()
# options.add_argument("--headless")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument(
    "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
)
driver = webdriver.Chrome(options=options)
logger.info("Driver Chrome berhasil diinisialisasi.")


try:
    # --- Login ---
    logger.info("Mencoba login...")
    driver.get("https://simkuliah.usk.ac.id/")
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, "username"))).send_keys(NPM)
    driver.find_element(By.NAME, "password").send_keys(PASSWORD)
    driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]').click()
    time.sleep(2)

    # --- Deteksi login gagal ---
    login_failed = False
    try:
        WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div.alert.alert-danger.icons-alert"))
        )
        login_failed = True
    except:
        pass

    if login_failed or "login" in driver.current_url.lower():
        msg = "❌ Gagal login: kemungkinan salah username/password atau CAPTCHA."
        print(msg)
        logger.warning(msg)
        # Penamaan screenshot dengan timestamp
        driver.save_screenshot(f"{photo_dir}/login_failed_{get_timestamp()}.png")
        driver.quit()
        exit()
    
    logger.info("Login berhasil. Menuju halaman absensi.")

    # --- Masuk halaman absensi ---
    driver.get("https://simkuliah.usk.ac.id/index.php/absensi")
    time.sleep(2)

    absen_berhasil = 0
    absen_gagal = 0
    anomali = []

    # --- Deteksi pesan 'Belum masuk waktu absen' ---
    try:
        # Cek apakah elemen ini ada (berarti tidak ada jadwal)
        driver.find_element(By.XPATH, "//p[contains(., 'Belum masuk waktu absen')]")
        msg = "ℹ Belum masuk waktu absen (tidak ada jadwal absen saat ini)."
        print(msg)
        logger.info(msg)
        anomali.append("Belum masuk waktu absen.")
        
    except Exception as no_time_e:
        # Jika tidak ada pesan itu, lanjutkan deteksi tombol absen
        try:
            # Ambil semua tombol absen yang ditemukan saat ini
            absen_buttons = driver.find_elements(By.CSS_SELECTOR, ".btn.btn-success")
            
            if not absen_buttons:
                msg = "ℹ Tidak ada tombol absen ditemukan (mungkin tidak ada jadwal)."
                print(msg)
                logger.info(msg)
                anomali.append("Tidak ada tombol absen ditemukan.")
            else:
                msg = f"🔎 Ditemukan {len(absen_buttons)} jadwal absen yang tersedia."
                print(msg)
                logger.info(msg)

                # --- Lakukan iterasi berdasarkan jumlah tombol yang ditemukan, maks 2 kali ---
                percobaan = min(2, len(absen_buttons))
                
                for i in range(percobaan):
                    try:
                        # Re-locate tombol dengan WebDriverWait (mencari tombol pertama yang muncul)
                        absen_button = WebDriverWait(driver, 5).until(
                            EC.element_to_be_clickable((By.CSS_SELECTOR, ".btn.btn-success"))
                        )

                        logger.info(f"Percobaan absen ke-{i+1} dimulai.")
                        
                        # KLIK TOMBOL ABSEN
                        driver.execute_script("arguments[0].click();", absen_button)
                        time.sleep(2)

                        # KLIK TOMBOL KONFIRMASI (Pop-up SweetAlert)
                        konfirmasi_button = WebDriverWait(driver, 10).until(
                            EC.element_to_be_clickable((By.CLASS_NAME, "confirm"))
                        )
                        driver.execute_script("arguments[0].click();", konfirmasi_button)
                        time.sleep(3) # Tunggu SweetAlert hilang dan DOM diperbarui

                        msg = f"✅ Absen ke-{i+1} berhasil!"
                        print(msg)
                        logger.info(msg)
                        absen_berhasil += 1
                        
                        # Setelah sukses, skrip akan mengulangi loop dan mencari tombol sukses berikutnya yang tersisa.

                    except Exception as e_btn:
                        err_type = type(e_btn).__name__
                        err_msg = str(e_btn).split("\n")[0]
                        msg = f"❌ Gagal absen ke-{i+1}: {err_type} - {err_msg}"
                        print(msg)
                        logger.error(f"{msg}\n{traceback.format_exc()}")
                        # Penamaan screenshot dengan timestamp
                        driver.save_screenshot(f"{photo_dir}/error_absen_{i+1}_{get_timestamp()}.png")
                        absen_gagal += 1
                        anomali.append(msg)
                        break
        except Exception as e:
            err_type = type(e).__name__
            err_msg = str(e).split("\n")[0]
            msg = f"⚠ Error saat proses absen: {err_type} - {err_msg}"
            print(msg)
            logger.error(f"{msg}\n{traceback.format_exc()}")
            # Penamaan screenshot dengan timestamp
            driver.save_screenshot(f"{photo_dir}/error_proses_{get_timestamp()}.png")
            anomali.append(msg)

    # --- Ringkasan ---
    print("\n--- Ringkasan Logging ---")
    print(f"Jumlah absen berhasil: {absen_berhasil}")
    print(f"Jumlah absen gagal: {absen_gagal}")
    if anomali:
        print("Anomali/Info:")
        for a in anomali:
            print(f"- {a}")

    logger.info(f"Ringkasan: {absen_berhasil} berhasil, {absen_gagal} gagal.")

except Exception as e:
    err_type = type(e).__name__
    err_msg = str(e).split("\n")[0]
    simple_err = f"⚠ Error global: {err_type} - {err_msg}"
    print(simple_err)
    logger.error(f"{simple_err}\n{traceback.format_exc()}")
    
    if 'driver' in locals() and driver:
        # Penamaan screenshot dengan timestamp
        driver.save_screenshot(f"{photo_dir}/error_global_{get_timestamp()}.png")

finally:
    if 'driver' in locals() and driver:
        try:
            driver.quit()
        except Exception as quit_e:
            logger.warning(f"Gagal menutup driver: {quit_e}")