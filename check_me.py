import requests
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

# Авторизація адміністратора
auth_response = requests.post(f"{BASE_URL}/auth/jwt/create/", json={
    "username": "Dima",
    "password": "dima0911"
})

if auth_response.status_code != 200:
    print("❌ Помилка авторизації:", auth_response.json())
    exit()

access = auth_response.json()['access']
headers = {"Authorization": f"Bearer {access}"}

print("🔐 Успішна авторизація")

# Отримуємо ID першого лікаря і пацієнта
users_response = requests.get(f"{BASE_URL}/api/users/", headers=headers)
users = users_response.json()

doctor = next((u for u in users if u['role'] == 'DOCTOR'), None)
patient = next((u for u in users if u['role'] == 'PATIENT'), None)

if not doctor or not patient:
    print("❌ Не знайдено лікаря або пацієнта")
    exit()

# Формуємо час
now = datetime.now()
start = datetime(now.year, now.month, now.day, 14, 0)
end = start + timedelta(hours=1)

# Створюємо прийом
payload = {
    "doctor": doctor["id"],
    "patient": patient["id"],
    "scheduled_time": start.isoformat(),
    "end_time": end.isoformat(),
    "description": "Прийом, доданий через скрипт"
}

print("📨 Відправка запиту на створення прийому...")
response = requests.post(f"{BASE_URL}/api/appointments/", json=payload, headers=headers)

if response.status_code == 201:
    print("✅ Прийом створено успішно!")
else:
    print(f"⚠️ Помилка [{response.status_code}]:", response.json())
