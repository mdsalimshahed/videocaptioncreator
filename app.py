from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

# Initialize the Flask app
app = Flask(__name__)

# --- Production Configuration ---
# This allows requests ONLY from your live website and your local test environment.
# This is a crucial security step.
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
    # Check if a file was sent in the request
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file part in the request"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"success": False, "error": "No file selected"}), 400

    # Prepare the file for forwarding to file.io
    files_to_forward = {'file': (file.filename, file.read(), file.content_type)}

    try:
        # Make the server-to-server request to file.io
        response = requests.post('https://file.io', files=files_to_forward)
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
        
        # Return the response from file.io back to the frontend
        return jsonify(response.json())

    except requests.exceptions.RequestException as e:
        # This will log the actual error on the server for debugging
        print(f"Error forwarding to file.io: {e}")
        return jsonify({"success": False, "error": "Failed to upload to file hosting service"}), 500

# This part is not strictly needed for Render, but it's good practice
if __name__ == '__main__':
    # Render will use Gunicorn, but this allows local testing
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
