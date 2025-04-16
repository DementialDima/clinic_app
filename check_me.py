
import requests
from datetime import datetime, timedelta

# 🔐 Авторизація
username = "Dima"
password = "dima0911"

base_url = "http://127.0.0.1:8000"
auth_url = f"{base_url}/auth/jwt/create/"
users_url = f"{base_url}/api/users/"
appointments_url = f"{base_url}/api/appointments/"
treatments_url = f"{base_url}/api/treatments/"

auth_data = {"username": username, "password": password}
auth_response = requests.post(auth_url, json=auth_data)

if auth_response.status_code != 200:
    print("❌ Авторизація не вдалася")
    exit()

access_token = auth_response.json()["access"]
headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}

# 🔍 Отримуємо всіх користувачів
response = requests.get(users_url, headers=headers)
users = response.json()

# 🔎 Знаходимо ID по username
def get_id(username):
    for user in users:
        if user["username"] == username:
            return user["id"]
    return None

doctor_usernames = ["doctor1", "doctor2"]
patient_usernames = ["patient1", "patient2"]

doctor_ids = [get_id(u) for u in doctor_usernames]
patient_ids = [get_id(u) for u in patient_usernames]

# Дані для прийомів
appointment_descriptions = [
    "Первинна консультація",
    "Планове обстеження",
    "Лікування карієсу",
    "Контроль після лікування"
]

# Дані для лікувань
treatments = [
    {"diagnosis": "Карієс", "procedure": "Пломбування", "recommendations": "Не їсти тверде"},
    {"diagnosis": "Гінгівіт", "procedure": "Полоскання та чистка", "recommendations": "Полоскати рот ромашкою"},
    {"diagnosis": "Пульпіт", "procedure": "Лікування каналів", "recommendations": "Приймати знеболювальне"},
    {"diagnosis": "Профілактика", "procedure": "Чистка зубів", "recommendations": ""}
]

# Створення прийомів
for patient_id in patient_ids:
    for i in range(4):
        doctor_id = doctor_ids[i % len(doctor_ids)]
        scheduled_time = (datetime.now() + timedelta(days=i)).isoformat()

        if doctor_id is None or patient_id is None:
            print(f"❌ Пропущено: лікар або пацієнт не знайдені")
            continue

        appointment_data = {
            "patient": patient_id,
            "doctor": doctor_id,
            "scheduled_time": scheduled_time,
            "description": appointment_descriptions[i]
        }
        appt_response = requests.post(appointments_url, headers=headers, json=appointment_data)
        print(f"📅 Прийом #{i+1} для пацієнта {patient_id}: {appt_response.status_code}")

        if appt_response.status_code == 201:
            appointment_id = appt_response.json()["id"]
            treatment_data = treatments[i]
            treatment_data["appointment"] = appointment_id

            treat_response = requests.post(treatments_url, headers=headers, json=treatment_data)
            print(f"  🩺 Лікування: {treat_response.status_code}")
        else:
            print(f"  ❌ Не вдалося створити прийом: {appt_response.text}")
            print("🔍 Doctor IDs:", doctor_ids)
print("🔍 Patient IDs:", patient_ids)
