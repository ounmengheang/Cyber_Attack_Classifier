import joblib
import sys

# Load the model
model = joblib.load('../attack_type_model.pkl')

# Check if model has feature_name_ attribute (LightGBM specific)
if hasattr(model, 'feature_name_'):
    features = model.feature_name_
    print("Model Features:")
    for i, feature in enumerate(features, 1):
        print(f"{i}. {feature}")
    print(f"\nTotal features: {len(features)}")
else:
    print("Could not determine feature names from model")
    print(f"Model type: {type(model)}")
