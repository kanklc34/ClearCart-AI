# ClearCart AI 🛡️

**ClearCart AI**, e-ticaret sitelerindeki karmaşık politikaları (iade, kargo, BNPL) deşifre eden ve kullanıcıya "satın alma kararı" konusunda destek olan yapay zekâ tabanlı bir alışveriş asistanıdır.

## 🚀 Öne Çıkan Özellikler
- **Agentic Workflow:** Gemini 1.5 Flash ve Pro modellerinin birlikte çalıştığı çoklu ajan yapısı.
- **Model Routing:** Hız için Flash, derinlemesine analiz için Pro modeline dinamik yönlendirme.
- **Risk Scorecard:** Trafik ışığı sistemiyle ürün bazlı risk analizi.
- **Premium UI:** React + Tailwind + Framer Motion ile modern ve akıcı kullanıcı deneyimi.

## 🧠 Mimari Yapı
Proje, BTK Hackathon kriterlerine uygun olarak "Ajan Odaklı" kurgulanmıştır:
1. **Orchestrator Agent (Flash):** Gelen isteği analiz eder ve strateji belirler.
2. **Scraper Service:** Ürün ve politika metinlerini ayıklar.
3. **Risk Analyzer Agent (Pro):** Politikaları muhakeme eder ve risk skorunu belirler.

## 🛠 Kurulum
### Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📄 Lisans
Bu proje Hackathon26 BTK Akademi kapsamında geliştirilmiştir.
