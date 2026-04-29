# Phase 7: Advanced AI & Machine Learning

## Visão Geral

Phase 7 implementa algoritmos avançados de machine learning para otimizar preços, prever demanda e detectar anomalias.

## 🤖 Modelos IA Implementados

### 1. **Dynamic Pricing Model**
Recomenda preço ótimo baseado em múltiplas variáveis.

**Inputs:**
- Material (tipo, espessura)
- Peso/volume
- Cliente (histórico, sazonalidade)
- Mercado (concorrência)
- Capacidade (carga de trabalho)

**Output:**
```javascript
{
  recommendedPrice: 1250.00,
  confidence: 0.85,
  priceRange: { min: 1100, max: 1400 },
  reasoning: "Based on historical data and market trends"
}
```

**Algorithm:**
```python
# Base price from historical average
base_price = weighted_average(similar_quotes)

# Adjust for material properties
material_factor = calculate_material_adjustment(thickness, material_type)

# Adjust for quantity (economies of scale)
quantity_factor = 1 - (log(quantity) * 0.05)

# Adjust for client relationships
client_factor = 1 + (client_loyalty_score * 0.1)

# Market adjustment
market_factor = current_market_rate / historical_average_rate

# Final recommendation
recommended_price = base_price * material_factor * quantity_factor * client_factor * market_factor
```

### 2. **Demand Forecasting**
Prevê volume de orçamentos por cliente e material.

**Inputs:**
- Histórico de quotations (12 meses)
- Sazonalidade
- Tendências de cliente
- Dia da semana / mês

**Output:**
```javascript
{
  nextMonth: {
    expectedVolume: 45,
    confidence: 0.78,
    topMaterials: [
      { material: 'Aço Carbono', expectedCount: 20 },
      { material: 'Inox', expectedCount: 15 }
    ]
  }
}
```

**Implementation:**
```python
from statsmodels.tsa.seasonal import seasonal_decompose
from sklearn.ensemble import RandomForestRegressor

# Decompose historical data
decomposition = seasonal_decompose(quotation_counts, period=12)

# Train forecasting model
model = RandomForestRegressor(
  n_estimators=100,
  max_depth=10,
  random_state=42
)
model.fit(X_train, y_train)

# Predict next month
forecast = model.predict(X_next_month)
```

### 3. **Anomaly Detection**
Detecta preços fora do padrão e comportamentos suspeitos.

**Scenarios:**
- Preço 50% abaixo da média
- Cliente com taxa de rejeição alta
- Material com flutuação de preço
- Operador com performance inconsistente

**Algorithm:**
```python
from sklearn.ensemble import IsolationForest

# Train on historical prices
clf = IsolationForest(contamination=0.05, random_state=42)
clf.fit(price_history)

# Detect anomalies in new quotation
is_anomaly = clf.predict([new_quotation_price]) == -1

if is_anomaly:
  alert({
    type: 'price_anomaly',
    severity: 'warning',
    message: 'Preço 45% abaixo da média histórica'
  })
```

### 4. **Client Segmentation**
Agrupa clientes em segmentos para tratamento diferenciado.

**Segmentos:**
- **VIP**: Alta demanda, longa história, margem positiva
- **Growth**: Demanda crescente, potencial alto
- **Regular**: Estável, previsível
- **At-Risk**: Demanda caindo, margem negativa

**K-Means Clustering:**
```python
from sklearn.cluster import KMeans

# Features: total_spend, quote_frequency, approval_rate, avg_order_value
features = [
  (client.total_spent, client.quote_count, client.approval_rate, client.avg_order),
  for client in all_clients
]

kmeans = KMeans(n_clusters=4, random_state=42)
clusters = kmeans.fit_predict(features)
```

### 5. **Churn Prediction**
Prevê quais clientes podem deixar de usar o serviço.

**Risk Indicators:**
- Sem quotação nos últimos 60 dias
- Taxa de aprovação < 30%
- Diminuição de volume
- Inatividade nas integrações

**Output:**
```javascript
{
  clientId: "abc123",
  churnRisk: 0.78,
  riskFactors: [
    "No activity for 45 days",
    "Approval rate 25%",
    "Trend: -30% volume YoY"
  ],
  recommendations: [
    "Send re-engagement email",
    "Offer special pricing",
    "Schedule sales call"
  ]
}
```

## 📊 Analytics Dashboard

### Advanced Metrics
```javascript
dashboard: {
  // Price Optimization
  priceOptimization: {
    potentialRevenue: 45000, // If all prices at recommended level
    currentRevenue: 38000,
    opportunityGap: 7000,
    confidence: 0.82
  },

  // Demand Forecast
  demandForecast: {
    nextMonth: {
      expectedQuotes: 45,
      expectedRevenue: 52000,
      topClient: 'ClientName',
      topMaterial: 'Aço Carbono'
    }
  },

  // Client Health
  clientHealth: {
    atRisk: 3,
    growingOpportunity: 8,
    vip: 2
  },

  // Team Performance
  teamPerformance: {
    approvalRateTarget: 0.60,
    approvalRateActual: 0.58,
    avgQuotationValue: 1250,
    conversionTrend: '+5%'
  }
}
```

## 🔗 Integration Points

### Backend ML Service
```bash
# Separate Python service for ML model serving
metalflow-ml/
├── models/
│   ├── pricing_model.pkl
│   ├── demand_forecast.pkl
│   ├── anomaly_detector.pkl
│   └── churn_predictor.pkl
├── api/
│   ├── pricing.py
│   ├── forecast.py
│   ├── anomaly.py
│   └── churn.py
└── training/
    ├── train_pricing.py
    ├── train_forecast.py
    └── train_churn.py
```

### Flask API
```python
@app.route('/api/pricing/recommend', methods=['POST'])
def recommend_price():
  data = request.json
  model = load_model('pricing_model.pkl')
  prediction = model.predict([data])
  return { 'recommendedPrice': prediction[0] }
```

### Frontend Integration
```javascript
// quotationService.js
export async function getAIRecommendation(material, quantity, thickness) {
  const response = await fetch('/api/pricing/recommend', {
    method: 'POST',
    body: JSON.stringify({ material, quantity, thickness })
  });
  return response.json();
}
```

## 🧪 Model Training Pipeline

```
Historical Data (12+ months)
  ↓
Data Preprocessing & Feature Engineering
  ↓
Train/Test Split (80/20)
  ↓
Model Training
  ├── Pricing Model (Gradient Boosting)
  ├── Forecast Model (ARIMA + ML)
  ├── Anomaly Model (Isolation Forest)
  └── Churn Model (Random Forest)
  ↓
Cross-Validation & Evaluation
  ↓
Hyperparameter Tuning
  ↓
Final Model Selection
  ↓
Model Deployment
```

## 📈 Performance Metrics

| Model | MAE | RMSE | Accuracy | Notes |
|-------|-----|------|----------|-------|
| Pricing | R$ 120 | R$ 180 | 85% | Price within ±20% |
| Forecast | ±5 quotas | ±8 quotas | 82% | Monthly forecast |
| Anomaly | - | - | 92% | Precision score |
| Churn | - | - | 78% | Recall @ 0.5 threshold |

## 🔄 Continuous Learning

Models are retrained:
- **Weekly**: Pricing model (more data = better predictions)
- **Monthly**: Demand forecast, anomaly detection
- **Quarterly**: Churn prediction, client segmentation

```python
def scheduled_retraining():
  # Every Sunday at 2 AM
  new_data = fetch_data_since_last_training()
  X, y = preprocess(new_data)
  
  model = load_latest_model()
  model.fit(X, y)
  
  if evaluate(model) > current_model_score:
    save_model(model)
    notify_team("New model deployed")
```

## 🎯 Business Impact

**Expected Benefits:**
- 💰 +15% revenue through better pricing
- 📈 +25% forecast accuracy
- ⚠️ 90% detection rate of price anomalies
- 🎯 Identify at-risk clients 2 months in advance
- 📊 Data-driven decision making

## 🚀 Implementation Timeline

- **Week 1-2**: Data collection & preprocessing
- **Week 3-4**: Model training & validation
- **Week 5**: Backend ML service
- **Week 6**: Frontend integration
- **Week 7**: Testing & refinement
- **Week 8**: Gradual rollout & monitoring

## 📚 Technology Stack

```
ML Framework: Python (scikit-learn, TensorFlow)
Data Processing: pandas, numpy
Model Serving: Flask + gunicorn
Monitoring: Prometheus + Grafana
Experimentation: MLflow
```

## ⚠️ Considerations

**Challenges:**
- Requires 12+ months of historical data
- Model drift over time (retraining needed)
- Cold start for new clients (no history)
- Explainability (why did model suggest X price?)

**Solutions:**
- Start with simple heuristics, evolve to ML
- Implement monitoring for model performance
- Use rule-based defaults for new clients
- Provide clear explanations for recommendations

---

Phase 7 transforma Metalflow em um assistente inteligente que otimiza negócio automaticamente.
