# Batch CSV Prediction - User Guide

## Overview
The Batch CSV Prediction feature allows you to upload a CSV file containing multiple network traffic records and get attack type predictions for all records at once. This is useful for analyzing large datasets or historical traffic logs.

## How to Use

### Step 1: Prepare Your CSV File
Your CSV file must contain all required features as columns. You can use the provided `sample_batch_input.csv` as a template.

**Required Columns:**
1. `Source_Port` - Source port number (0-65535)
2. `Destination_Port` - Destination port number (0-65535)
3. `Packet_Length` - Length of the packet in bytes
4. `Anomaly_Scores` - Anomaly detection score (0-1)
5. `day` - Day of month (1-31)
6. `hour` - Hour of day (0-23)
7. `payload_length` - Payload length in bytes
8. `month` - Month number (1-12)
9. `weekday` - Day of week (0=Monday, 6=Sunday)
10. `Malware_Indicators` - Binary (0 or 1)
11. `IDS_IPS_Alerts` - Binary (0 or 1)
12. `Alerts_Warnings` - Binary (0 or 1)
13. `Firewall_Logs` - Binary (0 or 1)
14. `Traffic_Type_HTTP` - Binary (0 or 1)
15. `Protocol_TCP` - Binary (0 or 1)
16. `Action_Taken_Ignored` - Binary (0 or 1)
17. `Packet_Type_Control` - Binary (0 or 1)
18. `Action_Taken_Logged` - Binary (0 or 1)
19. `Network_Segment_Segment_B` - Binary (0 or 1)
20. `Protocol_UDP` - Binary (0 or 1)

### Step 2: Access Batch Mode
1. Open the web application
2. Click the **"📁 Batch CSV Prediction"** button at the top of the page

### Step 3: Upload Your CSV File
1. Click the file upload button in the Batch CSV Prediction section
2. Select your prepared CSV file
3. The file name and size will be displayed once selected

### Step 4: Preview Predictions
1. Click **"🚀 Preview Predictions"** to process the file
2. The system will analyze all records and display:
   - Summary statistics (count of each attack type)
   - Detailed table showing predictions for each row
   - Confidence scores and probability distributions

### Step 5: Download Results
1. Click **"💾 Download Results CSV"** to export the predictions
2. The downloaded CSV will include:
   - All original columns from your input file
   - `Predicted_Attack_Type` - The predicted attack type
   - `Attack_Type_Code` - Numeric code (0=DDoS, 1=Intrusion, 2=Malware)
   - `Confidence` - Prediction confidence percentage
   - `Probability_DDoS` - Probability of DDoS attack
   - `Probability_Intrusion` - Probability of Intrusion
   - `Probability_Malware` - Probability of Malware

## Example CSV Format

```csv
Source_Port,Destination_Port,Packet_Length,Anomaly_Scores,day,hour,payload_length,month,weekday,Malware_Indicators,IDS_IPS_Alerts,Alerts_Warnings,Firewall_Logs,Traffic_Type_HTTP,Protocol_TCP,Action_Taken_Ignored,Packet_Type_Control,Action_Taken_Logged,Network_Segment_Segment_B,Protocol_UDP
443,80,1500,0.85,15,14,1200,5,2,1,1,0,1,1,1,0,0,1,0,0
8080,443,750,0.42,20,10,600,6,3,0,0,1,0,0,1,0,1,0,1,0
53,53,512,0.95,5,22,300,3,5,1,1,1,1,0,0,1,0,1,0,1
```

## Expected Output Format

After processing, your CSV will have these additional columns:

```csv
...(original columns)...,Predicted_Attack_Type,Attack_Type_Code,Confidence,Probability_DDoS,Probability_Intrusion,Probability_Malware
...,DDoS,0,87.5,87.5,8.3,4.2
...,Intrusion,1,75.2,15.3,75.2,9.5
...,Malware,2,92.1,3.2,4.7,92.1
```

## Tips

- **Large Files**: The system can handle CSV files with thousands of records
- **Missing Features**: If any required columns are missing, you'll receive an error message listing the missing features
- **Data Validation**: Ensure all values are numeric and within valid ranges
- **File Format**: Only .csv files are accepted
- **Preview First**: Use the preview feature to verify results before downloading

## Troubleshooting

### Error: "CSV is missing required features"
**Solution**: Check that your CSV has all 20 required columns with exact names (case-sensitive)

### Error: "File must be a CSV"
**Solution**: Ensure your file has a .csv extension

### Error: "Failed to read CSV file"
**Solution**: 
- Check that the CSV is properly formatted
- Ensure there are no special characters in the file
- Verify all values are numeric (except headers)

### No Results Showing
**Solution**:
- Make sure you clicked "Preview Predictions" first
- Check the browser console for any errors
- Ensure the Flask backend is running

## Performance Notes

- Small files (< 100 rows): Instant processing
- Medium files (100-1000 rows): 1-3 seconds
- Large files (1000+ rows): May take several seconds

The preview shows all results in the browser, while the download option generates a complete CSV file with all predictions.
