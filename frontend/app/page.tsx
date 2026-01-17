'use client';

import { useState } from 'react';
import axios from 'axios';

interface PredictionResult {
  attack_type: string;
  attack_type_code: number;
  confidence: number;
  probabilities: {
    DDoS: number;
    Intrusion: number;
    Malware: number;
  };
}

interface HistoryEntry {
  id: number;
  timestamp: string;
  prediction: PredictionResult;
  input_data: any;
}

export default function Home() {
  const [formData, setFormData] = useState({
    Source_Port: '',
    Destination_Port: '',
    Packet_Length: '',
    Anomaly_Scores: '',
    day: '',
    hour: '',
    payload_length: '',
    month: '',
    weekday: '',
    Malware_Indicators: '0',
    IDS_IPS_Alerts: '0',
    Alerts_Warnings: '0',
    Firewall_Logs: '0',
    Traffic_Type_HTTP: '0',
    Protocol_TCP: '0',
    Action_Taken_Ignored: '0',
    Packet_Type_Control: '0',
    Action_Taken_Logged: '0',
    Network_Segment_Segment_B: '0',
    Protocol_UDP: '0'
  });

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      // Convert string values to numbers
      const processedData: any = {};
      for (const [key, value] of Object.entries(formData)) {
        processedData[key] = parseFloat(value as string);
      }

      const response = await axios.post('http://localhost:5000/predict', processedData);
      setPrediction(response.data.prediction);
      // Refresh history after new prediction
      fetchHistory();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to get prediction. Make sure the Flask backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      Source_Port: '',
      Destination_Port: '',
      Packet_Length: '',
      Anomaly_Scores: '',
      day: '',
      hour: '',
      payload_length: '',
      month: '',
      weekday: '',
      Malware_Indicators: '0',
      IDS_IPS_Alerts: '0',
      Alerts_Warnings: '0',
      Firewall_Logs: '0',
      Traffic_Type_HTTP: '0',
      Protocol_TCP: '0',
      Action_Taken_Ignored: '0',
      Packet_Type_Control: '0',
      Action_Taken_Logged: '0',
      Network_Segment_Segment_B: '0',
      Protocol_UDP: '0'
    });
    setPrediction(null);
    setError(null);
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await axios.get('http://localhost:5000/history');
      setHistory(response.data.history);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const clearHistory = async () => {
    try {
      await axios.post('http://localhost:5000/history/clear');
      setHistory([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const getAttackColor = (attackType: string) => {
    switch (attackType) {
      case 'DDoS':
        return 'text-red-600 bg-red-100 border-2 border-red-300';
      case 'Intrusion':
        return 'text-orange-600 bg-orange-100 border-2 border-orange-300';
      case 'Malware':
        return 'text-purple-600 bg-purple-100 border-2 border-purple-300';
      default:
        return 'text-gray-600 bg-gray-100 border-2 border-gray-300';
    }
  };

  const inputClass = "w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black font-medium shadow-sm hover:border-blue-400 transition-all";
  const selectClass = "w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black font-medium shadow-sm hover:border-blue-400 transition-all";

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
            <span className="text-5xl">🛡️</span>
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-3 drop-shadow-lg">
            Cybersecurity Attack Classifier
          </h1>
          <p className="text-xl text-white/90 font-medium drop-shadow">
            AI-powered network traffic analysis and threat detection
          </p>
          
          {/* History Toggle Button */}
          <div className="mt-6">
            <button
              onClick={() => {
                setShowHistory(!showHistory);
                if (!showHistory && history.length === 0) {
                  fetchHistory();
                }
              }}
              className="bg-white/90 text-purple-700 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-white hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {showHistory ? '📋 Hide History' : '📜 View Previous Classifications'}
            </button>
          </div>
        </div>

        {/* History Section */}
        {showHistory && (
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-8 backdrop-blur-sm bg-opacity-95">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="text-3xl mr-2">📚</span> Classification History
              </h2>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                  🗑️ Clear History
                </button>
              )}
            </div>

            {loadingHistory ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No previous classifications yet.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-semibold text-gray-600">
                        #{entry.id} - {entry.timestamp}
                      </span>
                      <span className={`px-3 py-1 rounded-lg text-sm font-bold ${getAttackColor(entry.prediction.attack_type)}`}>
                        {entry.prediction.attack_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-700">
                        <strong>Confidence:</strong> {entry.prediction.confidence}%
                      </span>
                      <span className="text-gray-700">
                        <strong>DDoS:</strong> {entry.prediction.probabilities.DDoS}%
                      </span>
                      <span className="text-gray-700">
                        <strong>Intrusion:</strong> {entry.prediction.probabilities.Intrusion}%
                      </span>
                      <span className="text-gray-700">
                        <strong>Malware:</strong> {entry.prediction.probabilities.Malware}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm bg-opacity-95">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Port Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">🔌</span> Port Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Source Port
                  </label>
                  <input
                    type="number"
                    name="Source_Port"
                    min="0"
                    max="65535"
                    value={formData.Source_Port}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Destination Port
                  </label>
                  <input
                    type="number"
                    name="Destination_Port"
                    min="0"
                    max="65535"
                    value={formData.Destination_Port}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Packet Metrics */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">📊</span> Packet Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Packet Length
                  </label>
                  <input
                    type="number"
                    name="Packet_Length"
                    value={formData.Packet_Length}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Anomaly Scores
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="Anomaly_Scores"
                    value={formData.Anomaly_Scores}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Payload Length
                  </label>
                  <input
                    type="number"
                    name="payload_length"
                    value={formData.payload_length}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Timestamp */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">⏰</span> Timestamp
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Hour (0-23)
                  </label>
                  <input
                    type="number"
                    name="hour"
                    min="0"
                    max="23"
                    value={formData.hour}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Day (1-31)
                  </label>
                  <input
                    type="number"
                    name="day"
                    min="1"
                    max="31"
                    value={formData.day}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Month (1-12)
                  </label>
                  <input
                    type="number"
                    name="month"
                    min="1"
                    max="12"
                    value={formData.month}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Weekday (0-6)
                  </label>
                  <input
                    type="number"
                    name="weekday"
                    min="0"
                    max="6"
                    value={formData.weekday}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Security Indicators */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">🚨</span> Security Indicators
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['IDS_IPS_Alerts', 'Malware_Indicators', 'Alerts_Warnings', 'Firewall_Logs'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {field.replace(/_/g, ' ')}
                    </label>
                    <select
                      name={field}
                      value={formData[field as keyof typeof formData]}
                      onChange={handleInputChange}
                      className={selectClass}
                    >
                      <option value="0">No</option>
                      <option value="1">Yes</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Protocol & Packet Configuration */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-xl">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">🌐</span> Protocol & Packet Configuration
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { field: 'Protocol_TCP', label: 'Protocol TCP' },
                  { field: 'Protocol_UDP', label: 'Protocol UDP' },
                  { field: 'Traffic_Type_HTTP', label: 'Traffic Type HTTP' },
                  { field: 'Packet_Type_Control', label: 'Packet Type Control' }
                ].map((item) => (
                  <div key={item.field}>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {item.label}
                    </label>
                    <select
                      name={item.field}
                      value={formData[item.field as keyof typeof formData]}
                      onChange={handleInputChange}
                      className={selectClass}
                    >
                      <option value="0">No</option>
                      <option value="1">Yes</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Action & Network Segment */}
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-xl">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">⚙️</span> Action & Network Segment
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { field: 'Action_Taken_Ignored', label: 'Action Taken Ignored' },
                  { field: 'Action_Taken_Logged', label: 'Action Taken Logged' },
                  { field: 'Network_Segment_Segment_B', label: 'Network Segment B' }
                ].map((item) => (
                  <div key={item.field}>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {item.label}
                    </label>
                    <select
                      name={item.field}
                      value={formData[item.field as keyof typeof formData]}
                      onChange={handleInputChange}
                      className={selectClass}
                    >
                      <option value="0">No</option>
                      <option value="1">Yes</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                {loading ? '🔍 Analyzing...' : '🚀 Classify Attack'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-8 py-4 border-2 border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                🔄 Reset
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-6 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-xl shadow-lg animate-pulse">
              <p className="text-red-800 font-bold text-lg flex items-center">
                <span className="text-3xl mr-3">❌</span> {error}
              </p>
            </div>
          )}

          {/* Prediction Result */}
          {prediction && (
            <div className="mt-8 p-8 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-2xl border-2 border-green-300 shadow-2xl animate-fadeIn">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
                <span className="text-4xl mr-3">🎯</span> Classification Result
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white p-5 rounded-xl shadow-md">
                  <span className="text-lg font-bold text-gray-700">Detected Attack Type:</span>
                  <span className={`text-3xl font-extrabold px-6 py-3 rounded-xl shadow-lg ${getAttackColor(prediction.attack_type)}`}>
                    {prediction.attack_type}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white p-5 rounded-xl shadow-md">
                  <span className="text-lg font-bold text-gray-700">Confidence Level:</span>
                  <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    {prediction.confidence}%
                  </span>
                </div>

                <div className="mt-6 bg-white p-6 rounded-xl shadow-md">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <span className="text-2xl mr-2">📈</span> Probability Distribution
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(prediction.probabilities).map(([type, prob]) => (
                      <div key={type} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="text-base font-bold text-gray-800">{type}</span>
                          <span className="text-base font-bold text-indigo-600">{prob}%</span>
                        </div>
                        <div className="w-full bg-gray-300 rounded-full h-4 shadow-inner">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-700 shadow-md"
                            style={{ width: `${prob}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 text-center">
          <div className="inline-block bg-white/90 px-8 py-4 rounded-full shadow-lg">
            <p className="text-base font-bold text-gray-700">⚡ Powered by LightGBM Machine Learning Model</p>
          </div>
        </div>
      </div>
    </main>
  );
}
