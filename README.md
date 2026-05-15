# ![ClearCart AI Banner](file:///C:/Users/KAAN/.gemini/antigravity/brain/e8996d60-0d32-405d-b9fd-a9f02e10c565/clearcart_ai_banner_1778859498746.png)

# ClearCart AI: Probabilistic Trust & Multi-Agent Audit Engine 🛡️

**ClearCart AI**, e-ticaret dünyasındaki bilgi asimetrisini ortadan kaldırmak için tasarlanmış, **araştırma düzeyinde bir olasılıksal güven katmanıdır.** Klasik "AI asistanı" yaklaşımlarının ötesine geçerek, pazar yeri ilanlarını otonom ajanlar arası bir "tartışma ve uzlaşma" (Multi-Agent Consensus) mekanizmasıyla denetler.

---

## 🧠 Vizyon ve Mimari: Neden Farklı?

Çoğu AI sistemi size sadece bir "karar" verir. ClearCart AI ise size bir **kanıt hipotez alanı** sunar.

### 🛡️ Çoklu Ajan Konsensüsü (Multi-Agent Consensus)
Sistemimiz, her ilanı üç farklı perspektiften eş zamanlı olarak analiz eder:
1. **Savunmacı (Advocate):** İlandaki olumlu sinyalleri, güven verici unsurları ve kullanıcı lehine olan politikaları bulur.
2. **Şüpheci (Devil's Advocate):** "Dark pattern"ları, gizli riskleri ve psikolojik baskı unsurlarını (FOMO) deşifre eder.
3. **Hakem (Judge):** Her iki tarafın argümanlarını teknik bir titizlikle tartar, çelişkileri çözer ve nihai olasılık dağılımını hesaplar.

### 📊 Olasılıksal Güven Motoru (Probabilistic Trust Engine)
Kararlarımız ikili (Evet/Hayır) değildir. Sistem, **Epistemik Belirsizlik (Epistemic Uncertainty)** analizi yaparak; verinin eksikliği ile verideki anomali arasındaki farkı ayırt eder.

---

## 🚀 Öne Çıkan Özellikler

- **Otonom Denetim Akışı:** URL'den veri yakalamadan (Data Capture) nihai uzlaşma puanlamasına kadar tam otomatik pipeline.
- **Kategori Bazlı Doğrulama:** Ürünün kategorisine göre (Elektronik, Kozmetik vb.) özelleşmiş fiyat tabanı ve politika analizi.
- **Davranışsal Baskı Tespiti:** Yapay aciliyet ve yanıltıcı stok sinyallerinin otonom tespiti.
- **Şeffaf Analiz (Logic Explorer):** Kararın arkasındaki ajan ağırlıklarını ve karar eşiklerini görebileceğiniz interaktif panel.

---

## 🛠 Teknik Yığın (Tech Stack)

### Backend
- **Framework:** FastAPI (Python)
- **AI Core:** Google Gemini 2.0 (Pro/Flash/Lite Rotasyonu)
- **Architecture:** Agentic Workflows (LangChain/Custom Logic)
- **Scraping:** Advanced Multi-Proxy Content Extraction

### Frontend
- **Engine:** Vite + React 19 + TypeScript
- **Styling:** Premium Custom CSS Design System (Tailwind tabanlı değil, tamamen özelleştirilmiş)
- **Visuals:** Lucide Icons & Framer Motion Animations

---

## ⚙️ Kurulum ve Çalıştırma

### 1. Ortam Değişkenleri
`.env.example` dosyasını `.env` olarak kopyalayın ve Gemini API anahtarınızı ekleyin.

### 2. Backend Kurulumu
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows için: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### 3. Frontend Kurulumu
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Kalite Güvencesi
Sistem, her modül için otonom doğrulama testlerine sahiptir:
```bash
cd backend
pytest  # Çekirdek denetim mantığı testleri
```

---

## 📌 Not
*Bu proje, marketplace güvenliği üzerine bir Ar-Ge prototipidir. Kararlar tavsiye niteliğindedir ve teknik analiz sonuçlarına dayanır.*

---
**ClearCart AI** - *E-Ticarette Şeffaflık ve Güvenin Yeni Standartı.*
