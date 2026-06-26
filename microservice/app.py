from flask import Flask, request, jsonify
from flask_cors import CORS  # <--- Make sure this is imported
import joblib
import pandas as pd
from pathlib import Path
import os

app = Flask(__name__)
CORS(app) # <--- This tells Flask: "It's okay to talk to my Node backend"

# Load your model (Make sure the path is correct!)
MODEL_PATH = Path(__file__).resolve().parent / 'car_price_model.pkl'
model = None
expected_columns = None
model_load_error = None

try:
    _bundle = joblib.load(MODEL_PATH)

    if isinstance(_bundle, dict) and 'model' in _bundle:
        model = _bundle['model']
        _cols = _bundle.get('columns')
        expected_columns = list(_cols) if _cols is not None else None
    else:
        model = _bundle
        expected_columns = None
except Exception as e:
    model_load_error = str(e)


@app.route('/health', methods=['GET'])
def health():
    healthy = model is not None and model_load_error is None
    return (
        jsonify(
            {
                "status": "ok" if healthy else "error",
                "model_loaded": model is not None,
                "model_path": str(MODEL_PATH),
                "expected_columns": len(expected_columns) if expected_columns is not None else None,
                "error": model_load_error,
            }
        ),
        200 if healthy else 503,
    )

@app.route('/predict-price', methods=['POST'])
def predict():
    try:
        if model is None:
            return (
                jsonify(
                    {
                        "error": "Model not loaded",
                        "details": model_load_error,
                    }
                ),
                503,
            )

        data = request.json
        print(f"🤖 AI received request for: {data.get('make')} {data.get('model')}")
        
        # --- YOUR LOGIC HERE ---
        # 1. Convert incoming JSON to a DataFrame
        df = pd.DataFrame([data])

        # Align to the training schema if available.
        if expected_columns is not None:
            df = df.reindex(columns=expected_columns)
        
        # 2. Make prediction
        prediction = model.predict(df)[0]
        
        # 3. Create the "V7 Valuation" object
        response = {
            "make": data.get('make'),
            "model": data.get('model'),
            "year": data.get('year'),
            "status": "Verified by V7 AI Engine",
            "target_price": round(prediction, -3), # Round to nearest 1000
            "great_deal": round(prediction * 0.92, -3),
            "overpriced": round(prediction * 1.10, -3)
        }
        
        return jsonify(response)
    
    except Exception as e:
        print(f"❌ Python Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5001))
    host = os.environ.get('HOST', '0.0.0.0')
    
    app.run(host=host, port=port, debug=True)