# ClearCart AI 🛡️

**ClearCart AI**, e-ticaret sitelerindeki politika ve koşulları analiz ederek kullanıcının "satın alma" kararını destekleyen bir yapay zekâ asistanıdır.

## 🚀 Öne Çıkan Özellikler
- **Agentik akış:** Orchestrator, Advocate, Devil's Advocate ve Judge ajanlarıyla çok katmanlı analiz.
- **Model yönlendirme:** Google Gemini model rotasyonu ve yedek API key desteği.
- **Risk değerlendirmesi:** Ürün sayfası politika risklerini sınıflandırır.
- **Modern frontend:** React 19, TypeScript ve Tailwind ile hızlı kullanıcı deneyimi.

## 📁 Proje Yapısı
- `backend/`: FastAPI tabanlı API ve scraping servisi.
- `frontend/`: Vite + React uygulaması.
- `.env.example`: Gerekli ortam değişkenleri için örnek.
- `test_api.py`: Kök dizinde hızlı API kontrol aracı.

## 🧪 Testler
### Backend testleri
Backend için basit bir pytest altyapısı eklendi.

```bash
cd backend
pip install -r requirements.txt
pytest
```

> Bu testler şu anda temel endpoint kontrolü yapar: root endpoint ve `api/analysis/scan` için zorunlu `url` alanı doğrulaması.

## 🛠 Kurulum
### Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Üretim yapısı
Frontend derlemesi için:
```bash
cd frontend
npm run build
```

## 🔐 .gitignore ve Gereksiz Dosyalar
Aşağıdaki yerel ortamlar `.gitignore` içine eklendi:
- `.venv/`
- `myenv/`
- `.vscode/`
- `Document 34.pdf`

Eğer bu klasörler veya dosyalar daha önce Git'e eklenmişse, aşağıdaki komutlarla çıkarmanız gerekir:

```bash
git rm -r --cached .venv myenv .vscode "Document 34.pdf"
git commit -m "Remove local environment and unneeded files from repo"
```

## 🚀 Hızlı Başlangıç
1. `backend` ve `frontend` dizinlerinde gerekli kurulumları yapın.
2. `uvicorn` ile backend'i çalıştırın.
3. `npm run dev` ile frontend'i açın.
4. `pytest` ile backend testlerini çalıştırın.

## 📌 Not
Bu README, projenin GitHub'a gönderilmeden önceki temel kurulum ve test talimatlarını içerir. Daha ileri seviye üretim ve deploy işlemleri için Docker/CI eklemek faydalı olacaktır.
