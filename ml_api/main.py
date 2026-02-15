import os
import datetime
import uuid
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from collections import defaultdict

FIRESTORE_EMULATOR = os.environ.get("FIRESTORE_EMULATOR_HOST", "")
USE_EMULATOR = bool(FIRESTORE_EMULATOR)

if USE_EMULATOR:
    os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    
    firebase_initialized = False
    if not firebase_admin._apps:
        try:
            cred_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
            if cred_path and os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred, {'projectId': 'cancer-analysis-522ef'})
                firebase_initialized = True
        except Exception:
            pass
    
    if firebase_initialized:
        db = firestore.client()
    else:
        db = None
except Exception:
    db = None

# In-memory storage as fallback
in_memory_patients = []

app = FastAPI(title="Breast Cancer Risk Analysis API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model variables
model = None
feature_names = []
target_names = []
metrics = {}

# Load or train model
MODEL_PATH = "ml_api/model.joblib"

def train_model():
    """Train the breast cancer prediction model"""
    global model, feature_names, target_names, metrics
    
    from sklearn.datasets import load_breast_cancer
    from sklearn.model_selection import train_test_split
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.metrics import accuracy_score, precision_score, recall_score
    
    print("Loading Breast Cancer dataset...")
    data = load_breast_cancer()
    X = pd.DataFrame(data.data, columns=data.feature_names)
    y = data.target
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    metrics = {
        'accuracy': accuracy_score(y_test, y_pred),
        'precision': precision_score(y_test, y_pred),
        'recall': recall_score(y_test, y_pred)
    }
    
    feature_names = data.feature_names.tolist()
    target_names = data.target_names.tolist()
    
    model_data = {
        'model': model,
        'feature_names': feature_names,
        'target_names': target_names,
        'metrics': metrics
    }
    
    os.makedirs("ml_api", exist_ok=True)
    joblib.dump(model_data, MODEL_PATH)
    print(f"Model trained and saved. Accuracy: {metrics['accuracy']:.4f}")
    return model

# Load existing model or train new one
if os.path.exists(MODEL_PATH):
    try:
        model_data = joblib.load(MODEL_PATH)
        model = model_data['model']
        feature_names = model_data['feature_names']
        target_names = model_data['target_names']
        metrics = model_data['metrics']
        print(f"Model loaded. Accuracy: {metrics.get('accuracy', 0):.4f}")
    except Exception as e:
        print(f"Error loading model: {e}. Training new model...")
        train_model()
else:
    print("Model not found. Training new model...")
    train_model()

class PredictionInput(BaseModel):
    features: List[float]
    patientName: Optional[str] = ""
    patientEmail: Optional[str] = ""
    patientPhone: Optional[str] = ""

@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": model is not None}

@app.get("/dataset-info")
def get_dataset_info():
    if model is None:
        raise HTTPException(status_code=503, detail="Model not trained")
    return {
        "feature_names": feature_names,
        "class_names": target_names,
        "total_features": len(feature_names)
    }

@app.get("/analytics")
async def get_analytics():
    global in_memory_patients
    
    try:
        if db is not None:
            docs = db.collection("patients").stream()
            predictions = [doc.to_dict() for doc in docs]
        else:
            predictions = in_memory_patients
        
        total = len(predictions)
        malignant = sum(1 for p in predictions if p.get("prediction") == "Malignant")
        benign = sum(1 for p in predictions if p.get("prediction") == "Benign")
        
        avg_prob = 0
        if total > 0:
            avg_prob = sum(p.get("probability", 0) for p in predictions) / total

        return {
            "total_predictions": total,
            "malignant_count": malignant,
            "benign_count": benign,
            "average_probability": round(avg_prob, 4),
            "model_metrics": metrics if 'model' in globals() else {}
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/patient-history")
async def get_patient_history():
    global in_memory_patients
    
    try:
        if db is not None:
            docs = db.collection("patients").order_by("createdAt", direction=firestore.Query.DESCENDING).stream()
            patients = [doc.to_dict() for doc in docs]
        else:
            patients = sorted(in_memory_patients, key=lambda x: x.get("createdAt", ""), reverse=True)
        return patients
    except Exception as e:
        return {"error": str(e)}

@app.post("/predict")
async def predict(input_data: PredictionInput):
    global in_memory_patients
    
    if model is None:
        raise HTTPException(status_code=503, detail="Model not trained")
    
    if len(input_data.features) != len(feature_names):
        raise HTTPException(status_code=400, detail=f"Expected {len(feature_names)} features, got {len(input_data.features)}")

    # Prepare features for prediction
    features_array = np.array(input_data.features).reshape(1, -1)
    
    # Prediction
    prediction_idx = int(model.predict(features_array)[0])
    probabilities = model.predict_proba(features_array)[0]
    
    label = "Malignant" if prediction_idx == 0 else "Benign"
    prob = float(probabilities[prediction_idx])
    
    confidence = "Low"
    if prob > 0.7:
        confidence = "High"
    elif prob > 0.4:
        confidence = "Medium"
        
    if label == "Malignant":
        consult_doctor = True
        recommendation = f"The model detected feature patterns similar to malignant cases with {prob*100:.1f}% probability."
        precautions = ["Consult an oncologist immediately", "Schedule a biopsy", "Perform detailed mammography"]
    else:
        consult_doctor = prob < 0.8
        recommendation = f"The model detected feature patterns similar to benign cases with {prob*100:.1f}% probability."
        precautions = ["Regular self-examination", "Annual checkups", "Maintain healthy lifestyle"]

    result = {
        "patientId": str(uuid.uuid4())[:8],
        "patientName": input_data.patientName,
        "patientEmail": input_data.patientEmail,
        "patientPhone": input_data.patientPhone,
        "prediction": label,
        "probability": round(prob, 4),
        "confidence": confidence,
        "recommendation": recommendation,
        "precautions": precautions,
        "consultDoctor": consult_doctor,
        "createdAt": datetime.datetime.now().isoformat(),
        "features": input_data.features
    }

    # Store in Firestore or fallback to in-memory
    if db is not None:
        try:
            db.collection("patients").document(result["patientId"]).set(result)
        except Exception:
            in_memory_patients.append(result)
    else:
        in_memory_patients.append(result)

    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
