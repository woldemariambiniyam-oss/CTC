from flask import Flask, request, jsonify
from flask_cors import CORS
import qrcode
import io
import base64
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = 'uploads'
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

@app.route('/generate', methods=['POST'])
def generate_qr():
    try:
        data = request.json.get('data', '')
        size = request.json.get('size', 300)
        
        if not data:
            return jsonify({'error': 'Data is required'}), 400
        
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(data)
        qr.make(fit=True)
        
        # Create image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Resize if needed
        if size != 300:
            img = img.resize((size, size))
        
        # Save to file
        filename = f"qr_{datetime.now().strftime('%Y%m%d%H%M%S')}_{hash(data) % 10000}.png"
        filepath = os.path.join(UPLOAD_DIR, filename)
        img.save(filepath)
        
        # Convert to base64 for direct URL
        img_buffer = io.BytesIO()
        img.save(img_buffer, format='PNG')
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        
        # Return URL (in production, this should be a proper URL)
        qr_url = f"http://localhost:5001/uploads/{filename}"
        
        return jsonify({
            'success': True,
            'qr_code_url': qr_url,
            'qr_code_data': data,
            'qr_code_base64': f"data:image/png;base64,{img_base64}"
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/uploads/<filename>', methods=['GET'])
def serve_file(filename):
    from flask import send_from_directory
    return send_from_directory(UPLOAD_DIR, filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)


