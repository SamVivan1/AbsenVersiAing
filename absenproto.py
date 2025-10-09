import os
import time
import logging
import traceback
import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# --- Ganti dengan akunmu ---
USERNAME = ""
PASSWORD = ""  # ganti sendiri

# --- Persiapan direktori log ---
today_str = datetime.datetime.now().strftime("%d-%m-%Y")
photo_dir = f"log/error/photo/{today_str}"
log_dir = f"log/error/log/{today_str}"
os.makedirs(photo_dir, exist_ok=True)
os.makedirs(log_dir, exist_ok=True)

# --- Setup logging ---
logger = logging.getLogger("AbsenLogger")
logger.setLevel(logging.DEBUG)

# File handler (log lengkap harian)
fh = logging.FileHandler(f"{log_dir}/error.log")
fh.setLevel(logging.DEBUG)
fh.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))

# Console handler (log ringkas)
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)
ch.setFormatter(logging.Formatter("%(levelname)s - %(message)s"))

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

try:
    # --- Login ---
    driver.get("https://simkuliah.usk.ac.id/")
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, "username"))).send_keys(USERNAME)
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
        driver.save_screenshot(f"{photo_dir}/login_failed.png")
        driver.quit()
        exit()

    # --- Masuk halaman absensi ---
    driver.get("https://simkuliah.usk.ac.id/index.php/absensi")
    time.sleep(2)

    absen_berhasil = 0
    absen_gagal = 0
    anomali = []

    # --- Deteksi pesan 'Belum masuk waktu absen' ---
    try:
        belum_masuk = driver.find_element(By.XPATH, "//p[contains(., 'Belum masuk waktu absen')]")
        if belum_masuk:
            msg = "ℹ Belum masuk waktu absen (tidak ada jadwal absen saat ini)."
            print(msg)
            logger.info(msg)
            anomali.append("Belum masuk waktu absen.")
    except Exception:
        # --- Jika tidak ada pesan itu, lanjutkan deteksi tombol absen ---
        try:
            absen_buttons = driver.find_elements(By.CSS_SELECTOR, ".btn.btn-success")
            if not absen_buttons:
                msg = "ℹ Tidak ada tombol absen ditemukan (mungkin tidak ada jadwal)."
                print(msg)
                logger.info(msg)
                anomali.append("Tidak ada tombol absen ditemukan.")
            else:
                msg = f"🔎 Ditemukan {len(absen_buttons)} jadwal absen."
                print(msg)
                logger.info(msg)

                # --- Lakukan maksimal 2 kali percobaan absen ---
                percobaan = min(2, len(absen_buttons))
                for i in range(percobaan):
                    try:
                        absen_button = absen_buttons[i]
                        logger.info(f"Percobaan absen ke-{i+1} dimulai.")
                        driver.execute_script("arguments[0].click();", absen_button)
                        time.sleep(2)

                        konfirmasi_button = WebDriverWait(driver, 10).until(
                            EC.element_to_be_clickable((By.CLASS_NAME, "confirm"))
                        )
                        driver.execute_script("arguments[0].click();", konfirmasi_button)
                        time.sleep(2)

                        msg = f"✅ Absen ke-{i+1} berhasil!"
                        print(msg)
                        logger.info(msg)
                        absen_berhasil += 1
                        time.sleep(3)

                    except Exception as e_btn:
                        err_type = type(e_btn).__name__
                        err_msg = str(e_btn).split("\n")[0]
                        msg = f"❌ Gagal absen ke-{i+1}: {err_type} - {err_msg}"
                        print(msg)
                        logger.error(f"{msg}\n{traceback.format_exc()}")
                        driver.save_screenshot(f"{photo_dir}/error_absen_{i+1}.png")
                        absen_gagal += 1
                        anomali.append(msg)
                        break
        except Exception as e:
            err_type = type(e).__name__
            err_msg = str(e).split("\n")[0]
            msg = f"⚠ Error saat proses absen: {err_type} - {err_msg}"
            print(msg)
            logger.error(f"{msg}\n{traceback.format_exc()}")
            driver.save_screenshot(f"{photo_dir}/error_proses.png")
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
    driver.save_screenshot(f"{photo_dir}/error_global.png")

finally:
    driver.quit()
