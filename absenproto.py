from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import logging

# --- Ganti dengan akunmu ---
USERNAME = "2304111010054"
PASSWORD = "52479618"  # ganti sendiri

# Setup logging
logging.basicConfig(
    filename="absen.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

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
        print("❌ Gagal login.")
        try:
            alert_div = driver.find_element(By.CSS_SELECTOR, "div.alert.alert-danger.icons-alert")
            error_message = alert_div.text.strip()
            if error_message:
                print(f"🔒 Pesan error: {error_message}")
                if "username" in error_message.lower() or "password" in error_message.lower():
                    print("⚠ Username atau password salah.")
                    logging.warning("Login gagal: Username/Password salah.")
                    driver.quit()
                    exit()
            else:
                print("⚠ Username atau password kemungkinan salah, atau ada masalah lain saat login.")
                logging.warning("Login gagal: kemungkinan salah username/password.")
        except Exception:
            print("⚠ Username atau password kemungkinan salah, atau ada masalah lain saat login.")
            logging.warning("Login gagal: error tidak diketahui.")
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
            logging.info(msg)
            anomali.append("Belum masuk waktu absen.")
    except Exception:
        # Jika tidak ada pesan "Belum masuk waktu absen", cek apakah sudah absen
        try:
            sudah_absen_p = driver.find_element(By.XPATH, "//p[contains(., 'Anda sudah absen')]")
            if sudah_absen_p:
                print("ℹ Anda sudah absen hari ini.")
                logging.info("Sudah absen hari ini.")
                anomali.append("Sudah absen, tidak ada proses absen.")
        except Exception:
            # Jika belum absen, lanjutkan proses absen
            try:
                absen_buttons = driver.find_elements(By.CSS_SELECTOR, ".btn.btn-success")
                if not absen_buttons:
                    print("ℹ Tidak ada tombol absen (mungkin tidak ada jadwal).")
                    logging.info("Tidak ada tombol absen ditemukan.")
                    anomali.append("Tidak ada tombol absen ditemukan.")
                else:
                    print(f"🔎 Ditemukan {len(absen_buttons)} jadwal absen.")
                    logging.info(f"Ditemukan {len(absen_buttons)} jadwal absen.")
                    for idx, absen_button in enumerate(absen_buttons, 1):
                        try:
                            WebDriverWait(driver, 5).until(EC.element_to_be_clickable((By.CSS_SELECTOR, ".btn.btn-success")))
                            absen_button.click()
                            time.sleep(1)
                            konfirmasi_button = WebDriverWait(driver, 5).until(
                                EC.element_to_be_clickable((By.CLASS_NAME, "confirm"))
                            )
                            konfirmasi_button.click()
                            print(f"✅ Absen ke-{idx} berhasil!")
                            logging.info(f"Absen ke-{idx} berhasil.")
                            absen_berhasil += 1
                        except Exception as e_btn:
                            print(f"❌ Gagal absen ke-{idx}: {e_btn}")
                            logging.error(f"Gagal absen ke-{idx}: {e_btn}")
                            absen_gagal += 1
                            anomali.append(f"Gagal absen ke-{idx}: {e_btn}")
            except Exception as e:
                print(f"⚠ Error saat proses absen: {e}")
                logging.error(f"Error saat proses absen: {e}")
                anomali.append(f"Error proses absen: {e}")

    print("\n--- Ringkasan Logging ---")
    print(f"Jumlah absen berhasil: {absen_berhasil}")
    print(f"Jumlah absen gagal: {absen_gagal}")
    if anomali:
        print("Anomali/Info:")
        for a in anomali:
            print(f"- {a}")

except Exception as e:
    print("⚠ Error:", e)
    logging.error(f"Error global: {e}")

finally:
    driver.quit()
