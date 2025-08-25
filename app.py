from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import traceback # Import the traceback module

app = Flask(__name__)

CORS(app, resources={
    r"/upload": {
        "origins": [
            "http://127.0.0.1:5501", 
            "https://videocaptioncreator.pages.dev"
        ]
    }
})

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file part in the request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "error": "No file selected"}), 400

    files_to_forward = {'file': (file.filename, file.read(), file.content_type)}

    try:
        print("Attempting to forward file to file.io...")
        response = requests.post('https://file.io', files=files_to_forward, timeout=10) # Added a 10-second timeout
        response.raise_for_status()
        print("Successfully forwarded file. Response from file.io:", response.status_code)
        return jsonify(response.json())

    except requests.exceptions.RequestException as e:
        # --- ENHANCED LOGGING ---
        # This will print the full, detailed error to your Render logs
        print("--- START OF ERROR ---")
        print(f"A requests exception occurred: {e}")
        print("Full traceback:")
        traceback.print_exc() # This prints the detailed error stack trace
        print("--- END OF ERROR ---")
        # --- END OF ENHANCED LOGGING ---
        return jsonify({"success": False, "error": "Failed to upload to file hosting service"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
