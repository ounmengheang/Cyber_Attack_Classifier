import pandas as pd
from datetime import datetime

# Read the original CSV
df = pd.read_csv('batch-test.csv')

# Parse timestamp to extract date/time components
df['Timestamp'] = pd.to_datetime(df['Timestamp'])
df['day'] = df['Timestamp'].dt.day
df['hour'] = df['Timestamp'].dt.hour
df['month'] = df['Timestamp'].dt.month
df['weekday'] = df['Timestamp'].dt.weekday

# Calculate payload length (using Packet Length as proxy)
df['payload_length'] = df['Packet Length'] - 40  # Approximate header size

# Map column names to required feature names
df_formatted = pd.DataFrame()
df_formatted['Source_Port'] = df['Source Port']
df_formatted['Destination_Port'] = df['Destination Port']
df_formatted['Packet_Length'] = df['Packet Length']
df_formatted['Anomaly_Scores'] = df['Anomaly Scores']
df_formatted['day'] = df['day']
df_formatted['hour'] = df['hour']
df_formatted['payload_length'] = df['payload_length']
df_formatted['month'] = df['month']
df_formatted['weekday'] = df['weekday']

# Convert binary indicators (0/1)
df_formatted['Malware_Indicators'] = (df['Malware Indicators'] == 'IoC Detected').astype(int)
df_formatted['IDS_IPS_Alerts'] = df['IDS/IPS Alerts'].notna().astype(int)
df_formatted['Alerts_Warnings'] = (df['Alerts/Warnings'] == 'Alert Triggered').astype(int)
df_formatted['Firewall_Logs'] = (df['Firewall Logs'] == 'Log Data').astype(int)
df_formatted['Traffic_Type_HTTP'] = (df['Traffic Type'] == 'HTTP').astype(int)
df_formatted['Protocol_TCP'] = (df['Protocol'] == 'TCP').astype(int)
df_formatted['Action_Taken_Ignored'] = (df['Action Taken'] == 'Ignored').astype(int)
df_formatted['Packet_Type_Control'] = (df['Packet Type'] == 'Control').astype(int)
df_formatted['Action_Taken_Logged'] = (df['Action Taken'] == 'Logged').astype(int)
df_formatted['Network_Segment_Segment_B'] = (df['Network Segment'] == 'Segment B').astype(int)
df_formatted['Protocol_UDP'] = (df['Protocol'] == 'UDP').astype(int)

# Save the formatted CSV
output_file = 'batch-test-formatted.csv'
df_formatted.to_csv(output_file, index=False)

print(f"✅ Converted {len(df_formatted)} records")
print(f"📁 Output saved to: {output_file}")
print(f"\n📊 Sample of first 5 rows:")
print(df_formatted.head())
print(f"\n✅ All required columns present: {list(df_formatted.columns)}")
