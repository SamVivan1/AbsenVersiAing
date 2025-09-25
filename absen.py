from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# --- Ganti dengan akunmu ---
USERNAME = "terserah"
PASSWORD = "terserah"  # ganti sendiri

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
    time.sleep(2)

    if "login" in driver.current_url.lower():
        print("❌ Gagal login.")
        driver.quit()
        exit()

    # Masuk halaman absensi
    driver.get("https://simkuliah.usk.ac.id/index.php/absensi")
    time.sleep(2)

    try:
        absen_button = WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, ".btn.btn-success"))
        )
        absen_button.click()
        time.sleep(1)

        konfirmasi_button = WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable((By.CLASS_NAME, "confirm"))
        )
        konfirmasi_button.click()
        print("✅ Absen berhasil!")
    except:
        print("ℹ Tidak ada tombol absen (mungkin tidak ada jadwal).")

except Exception as e:
    print("⚠ Error:", e)

finally:
    driver.quit()
