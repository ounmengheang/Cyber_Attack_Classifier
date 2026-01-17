from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import os
from datetime import datetime
import sqlite3
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# Load the trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'attack_type_model.pkl')
model = joblib.load(MODEL_PATH)

# Database setup
DB_PATH = os.path.join(os.path.dirname(__file__), 'prediction_history.db')

def init_db():
    """Initialize the SQLite database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            attack_type TEXT NOT NULL,
            attack_type_code INTEGER NOT NULL,
            confidence REAL NOT NULL,
            prob_ddos REAL NOT NULL,
            prob_intrusion REAL NOT NULL,
            prob_malware REAL NOT NULL,
            input_data TEXT NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# Define the top features used in the model (from the trained LightGBM model)
TOP_FEATURES = [
    'Source_Port',
    'Destination_Port',
    'Packet_Length',
    'Anomaly_Scores',
    'day',
    'hour',
    'payload_length',
    'month',
    'weekday',
    'Malware_Indicators',
    'IDS_IPS_Alerts',
    'Alerts_Warnings',
    'Firewall_Logs',
    'Traffic_Type_HTTP',
    'Protocol_TCP',
    'Action_Taken_Ignored',
    'Packet_Type_Control',
    'Action_Taken_Logged',
    'Network_Segment_Segment_B',
    'Protocol_UDP'
]

# Attack type mapping
ATTACK_TYPES = {
    0: 'DDoS',
    1: 'Intrusion',
    2: 'Malware',
    'DDoS': 'DDoS',
    'Intrusion': 'Intrusion',
    'Malware': 'Malware'
}

# Reverse mapping for getting codes from names
ATTACK_CODES = {
    'DDoS': 0,
    'Intrusion': 1,
    'Malware': 2
}

@app.route('/')
def home():
    return jsonify({
        'message': 'Cybersecurity Attack Classification API',
        'version': '1.0',
        'endpoints': {
            '/predict': 'POST - Predict attack type',
            '/health': 'GET - Health check'
        }
    })

@app.route('/health')
def health():
    return jsonify({'status': 'healthy', 'model_loaded': model is not None})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        # Validate input
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Create a DataFrame with the input features
        # Handle both single prediction and batch prediction
        if isinstance(data, list):
            df = pd.DataFrame(data)
        else:
            df = pd.DataFrame([data])
        
        # Ensure all required features are present
        missing_features = [f for f in TOP_FEATURES if f not in df.columns]
        if missing_features:
            return jsonify({
                'error': 'Missing required features',
                'missing_features': missing_features
            }), 400
        
        # Select only the top features in the correct order
        X = df[TOP_FEATURES]
        
        # Make prediction
        predictions = model.predict(X)
        probabilities = model.predict_proba(X)
        
        # Format response
        results = []
        for i, (pred, proba) in enumerate(zip(predictions, probabilities)):
            # Handle both string and numeric predictions
            if isinstance(pred, str):
                attack_type = pred
                attack_type_code = ATTACK_CODES.get(pred, -1)
            else:
                attack_type_code = int(pred)
                attack_type = ATTACK_TYPES.get(attack_type_code, 'Unknown')
            
            confidence = float(max(proba)) * 100
            
            result = {
                'attack_type': attack_type,
                'attack_type_code': attack_type_code,
                'confidence': round(confidence, 2),
                'probabilities': {
                    'DDoS': round(float(proba[0]) * 100, 2),
                    'Intrusion': round(float(proba[1]) * 100, 2),
                    'Malware': round(float(proba[2]) * 100, 2)
                }
            }
            results.append(result)
        
        # Store in database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        for i, result in enumerate(results):
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            input_data_json = json.dumps(X.iloc[i].to_dict() if i < len(X) else {})
            
            cursor.execute('''
                INSERT INTO predictions 
                (timestamp, attack_type, attack_type_code, confidence, 
                 prob_ddos, prob_intrusion, prob_malware, input_data)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                timestamp,
                result['attack_type'],
                result['attack_type_code'],
                result['confidence'],
                result['probabilities']['DDoS'],
                result['probabilities']['Intrusion'],
                result['probabilities']['Malware'],
                input_data_json
            ))
        
        conn.commit()
        conn.close()
        
        # Return single result or list based on input
        if len(results) == 1:
            return jsonify({'success': True, 'prediction': results[0]})
        else:
            return jsonify({'success': True, 'predictions': results})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/features', methods=['GET'])
def get_features():
    """Return the list of features required for prediction"""
    return jsonify({
        'features': TOP_FEATURES,
        'total_features': len(TOP_FEATURES)
    })

@app.route('/history', methods=['GET'])
def get_history():
    """Return the prediction history from database"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Get all predictions ordered by most recent first
        cursor.execute('''
            SELECT id, timestamp, attack_type, attack_type_code, confidence,
                   prob_ddos, prob_intrusion, prob_malware, input_data
            FROM predictions
            ORDER BY id DESC
            LIMIT 100
        ''')
        
        rows = cursor.fetchall()
        conn.close()
        
        history = []
        for row in rows:
            history.append({
                'id': row[0],
                'timestamp': row[1],
                'prediction': {
                    'attack_type': row[2],
                    'attack_type_code': row[3],
                    'confidence': row[4],
                    'probabilities': {
                        'DDoS': row[5],
                        'Intrusion': row[6],
                        'Malware': row[7]
                    }
                },
                'input_data': json.loads(row[8])
            })
        
        return jsonify({
            'success': True,
            'history': history,
            'total': len(history)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/history/clear', methods=['POST'])
def clear_history():
    """Clear the prediction history from database"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('DELETE FROM predictions')
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'History cleared successfully'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
