from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import logging
import traceback

# --- Ganti dengan akunmu ---
USERNAME = "2304111010054"
PASSWORD = "52479618"  # ganti sendiri

# --- Setup logging ---
logger = logging.getLogger("AbsenLogger")
logger.setLevel(logging.DEBUG)

# File handler (log lengkap)
fh = logging.FileHandler("absen.log")
fh.setLevel(logging.DEBUG)
fh.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))

# Console handler (log ringkas)
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)
ch.setFormatter(logging.Formatter("%(levelname)s - %(message)s"))

logger.addHandler(fh)
logger.addHandler(ch)

# Setup browser
options = Options()
# options.add_argument("--headless")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
driver = webdriver.Chrome(options=options)

try:
    # Login
    driver.get("https://simkuliah.usk.ac.id/")
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.NAME, "username"))
    ).send_keys(USERNAME)
    driver.find_element(By.NAME, "password").send_keys(PASSWORD)
    driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]').click()

    # Tunggu apakah login berhasil atau muncul pesan error
    login_failed = False
    try:
        WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div.alert.alert-danger.icons-alert"))
        )
        login_failed = True
    except:
        pass

    if login_failed or "login" in driver.current_url.lower():
        msg = "❌ Gagal login."
        print(msg)
        logger.warning("Login gagal: kemungkinan salah username/password.")
        driver.quit()
        exit()

    # Masuk halaman absensi
    driver.get("https://simkuliah.usk.ac.id/index.php/absensi")
    time.sleep(2)

    absen_berhasil = 0
    absen_gagal = 0
    anomali = []

    # --- Deteksi pesan "Belum masuk waktu absen." ---
    try:
        belum_masuk = driver.find_element(By.XPATH, "//p[contains(., 'Belum masuk waktu absen')]")
        if belum_masuk:
            msg = "ℹ Belum masuk waktu absen (tidak ada jadwal absen saat ini)."
            print(msg)
            logger.info(msg)
            anomali.append("Belum masuk waktu absen.")
    except Exception:
        # Jika tidak ada pesan "Belum masuk waktu absen", cek apakah sudah absen
        try:
            sudah_absen_p = driver.find_element(By.XPATH, "//p[contains(., 'Anda sudah absen')]")
            if sudah_absen_p:
                msg = "ℹ Anda sudah absen hari ini."
                print(msg)
                logger.info(msg)
                anomali.append("Sudah absen, tidak ada proses absen.")
        except Exception:
            # Jika belum absen, lanjutkan proses absen
            try:
                absen_buttons = driver.find_elements(By.CSS_SELECTOR, "button.btn.btn-success[id^='konfirmasi-kehadiran']")
                if not absen_buttons:
                    msg = "ℹ Tidak ada tombol absen (mungkin tidak ada jadwal)."
                    print(msg)
                    logger.info(msg)
                    anomali.append("Tidak ada tombol absen ditemukan.")
                else:
                    msg = f"🔎 Ditemukan {len(absen_buttons)} jadwal absen."
                    print(msg)
                    logger.info(msg)
                    for idx, absen_button in enumerate(absen_buttons, 1):
                        try:
                            # Cek apakah tombol sudah disabled atau ada tulisan sudah absen di parent/element terkait
                            parent = absen_button.find_element(By.XPATH, "..")
                            sudah_absen = False
                            # Cek apakah ada tulisan 'sudah absen' di parent atau tombol disabled
                            if 'disabled' in absen_button.get_attribute('class').lower() or 'sudah absen' in parent.text.lower():
                                msg = f"ℹ Jadwal ke-{idx} sudah absen."
                                print(msg)
                                logger.info(msg)
                                anomali.append(f"Jadwal ke-{idx} sudah absen.")
                                continue
                            WebDriverWait(driver, 5).until(
                                EC.element_to_be_clickable((By.CSS_SELECTOR, f"button.btn.btn-success[id^='konfirmasi-kehadiran']"))
                            )
                            absen_button.click()
                            time.sleep(1)
                            konfirmasi_button = WebDriverWait(driver, 5).until(
                                EC.element_to_be_clickable((By.CLASS_NAME, "confirm"))
                            )
                            konfirmasi_button.click()
                            msg = f"✅ Absen ke-{idx} berhasil!"
                            print(msg)
                            logger.info(msg)
                            absen_berhasil += 1
                        except Exception as e_btn:
                            # Console log singkat
                            err_type = type(e_btn).__name__
                            err_msg = str(e_btn).split("\n")[0]
                            simple_err = f"Gagal absen ke-{idx}: {err_type} - {err_msg}"
                            print(f"❌ {simple_err}")

                            # File log lengkap
                            logger.error(f"Gagal absen ke-{idx}:\n{traceback.format_exc()}")

                            absen_gagal += 1
                            anomali.append(simple_err)
            except Exception as e:
                err_type = type(e).__name__
                err_msg = str(e).split("\n")[0]
                simple_err = f"Error saat proses absen: {err_type} - {err_msg}"

                print(f"⚠ {simple_err}")
                logger.error(f"Error saat proses absen:\n{traceback.format_exc()}")
                anomali.append(simple_err)

    print("\n--- Ringkasan Logging ---")
    print(f"Jumlah absen berhasil: {absen_berhasil}")
    print(f"Jumlah absen gagal: {absen_gagal}")
    if anomali:
        print("Anomali/Info:")
        for a in anomali:
            print(f"- {a}")

except Exception as e:
    err_type = type(e).__name__
    err_msg = str(e).split("\n")[0]
    simple_err = f"Error global: {err_type} - {err_msg}"

    print(f"⚠ {simple_err}")
    logger.error(f"Error global:\n{traceback.format_exc()}")

finally:
    driver.quit()
