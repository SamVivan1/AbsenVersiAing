import ddddocr
import urllib.request
import ssl

# Ignore SSL warnings just in case
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://simkuliah.usk.ac.id/index.php/login/captcha_image'
print("Downloading captcha...")
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, context=ctx) as response:
    img_bytes = response.read()

with open('/tmp/captcha.jpg', 'wb') as f:
    f.write(img_bytes)

print("Initializing ddddocr...")
ocr = ddddocr.DdddOcr(show_ad=False)
res = ocr.classification(img_bytes)
print(f"CAPTCHA SOLVED: {res}")
