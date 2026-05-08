from flask import Flask, request, jsonify, send_from_directory
import requests
import os

# Gunakan absolute path agar path 'public' selalu terbaca dengan benar di mana pun server dijalankan
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, "public")

app = Flask(__name__, static_folder=PUBLIC_DIR, static_url_path="/static")

@app.route("/")
def index():
    try:
        return send_from_directory(PUBLIC_DIR, "index.html")
    except Exception as e:
        return str(e), 500

@app.route("/api/payment", methods=["POST"])
def process_payment():
    data = request.json
    if not data:
        return jsonify({"success": False, "message": "Invalid request"}), 400

    session_token = data.get("session_token")
    payment_method = data.get("payment_method", "shortlink")
    
    if not session_token:
        return jsonify({"success": False, "message": "Session token is required"}), 400

    url = "https://ezweystock.petrix.id/gpt/payment"
    
    payload = {
        "plan": "plus",
        "payment": payment_method,
        "currency": "Indonesia",
        "session": session_token
    }
    
    headers = {
        "Content-Type": "application/json",
        "Origin": "https://ezweystock.petrix.id",
        "Referer": "https://ezweystock.petrix.id/gpt/"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
