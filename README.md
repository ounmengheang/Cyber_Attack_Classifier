# Cybersecurity Attack Classifier

A full-stack web application for classifying cybersecurity attacks using machine learning.

## Project Structure

```
project_portfolio/
├── backend/                 # Flask API
│   ├── app.py              # Main Flask application
│   └── requirements.txt    # Python dependencies
├── frontend/               # Next.js application
│   ├── app/
│   │   ├── page.tsx       # Main page component
│   │   ├── layout.tsx     # Layout component
│   │   └── globals.css    # Global styles
│   ├── package.json
│   ├── next.config.js
│   └── tsconfig.json
├── attack_type_model.pkl   # Trained LightGBM model
└── Cyber_Attack_Classified.ipynb  # Model training notebook
```

## Features

- **Machine Learning Backend**: Flask API serving a LightGBM model for attack classification
- **Interactive Frontend**: Modern Next.js interface with TypeScript and Tailwind CSS
- **Real-time Predictions**: Classify network traffic into DDoS, Intrusion, or Malware
- **Detailed Analysis**: View confidence scores and probability distributions
- **User-friendly Interface**: Clean, responsive design with form validation
- **Prediction History**: SQLite database stores all previous classifications with timestamps and input data
- **History Management**: View, browse, and clear prediction history

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Make sure the model file `attack_type_model.pkl` is in the parent directory

5. Start the Flask server:
```bash
python app.py
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Usage

1. **Start the Backend**: Make sure the Flask server is running on port 5000
2. **Open the Frontend**: Access the Next.js app at http://localhost:3000
3. **Enter Network Traffic Data**: Fill in the form with network metrics
4. **Get Classification**: Click "Classify Attack" to receive predictions

### Input Features

The classifier requires the following features:

**Network Metrics:**
- Packet Length
- Anomaly Scores
- Payload Length

**Traffic Data:**
- Bytes Sent
- Bytes Received

**Timestamp:**
- Hour (0-23)
- Day (1-31)
- Month (1-12)
- Weekday (0-6)

**Security Indicators:**
- IDS/IPS Alerts
- Malware Indicators
- Alerts/Warnings
- Firewall Logs

**Protocol & Traffic Type:**
- Protocol (TCP/UDP)
- Traffic Type (HTTP/DNS)

**Additional Context:**
- Severity Level
- Network Segment

## API Endpoints

### `GET /`
Health check and API information

### `GET /health`
Server health status

### `GET /features`
List of required features for prediction

### `POST /predict`
Classify network traffic

**Request Body:**
```json
{
  "Packet_Length": 1500,
  "Anomaly_Scores": 0.75,
  "hour": 14,
  ...
}
```

**Response:**
```json
{
  "success": true,
  "prediction": {
    "attack_type": "DDoS",
    "attack_type_code": 0,
    "confidence": 87.5,
    "probabilities": {
      "DDoS": 87.5,
      "Intrusion": 8.3,
      "Malware": 4.2
    }
  }
}
```

### `GET /history`
Get all prediction history (up to 100 most recent)

**Response:**
```json
{
  "success": true,
  "history": [
    {
      "id": 1,
      "timestamp": "2026-01-17 10:30:45",
      "prediction": { ... },
      "input_data": { ... }
    }
  ],
  "total": 1
}
```

### `POST /history/clear`
Clear all prediction history from the database

## Technology Stack

**Backend:**
- Flask 3.0.0
- LightGBM 4.1.0
- scikit-learn 1.3.2
- pandas, numpy
- SQLite3 (built-in)

**Frontend:**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Axios

## Model Information

The classification model is trained using LightGBM on the cybersecurity attacks dataset. It achieves approximately 34% accuracy across three attack types:
- DDoS (Distributed Denial of Service)
- Intrusion
- Malware

The model uses the top 20 most important features selected through feature importance analysis.

## Development

### Backend Development
- Modify `backend/app.py` to update API logic
- Update `TOP_FEATURES` list if model features change
- Add new endpoints as needed

### Frontend Development
- Edit `frontend/app/page.tsx` for UI changes
- Modify styles in `frontend/app/globals.css`
- Update API calls in the axios configuration

## Troubleshooting

**CORS Issues:**
- Make sure flask-cors is installed
- Verify the backend is running on port 5000

**Model Loading Error:**
- Check that `attack_type_model.pkl` exists in the correct location
- Verify the model was trained with the correct features

**Frontend Connection Error:**
- Ensure the Flask backend is running
- Check that the API URL is correct (http://localhost:5000)

## License

This project is for educational purposes as part of a Data Mining class portfolio.
