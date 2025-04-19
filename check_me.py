import requests
from datetime import datetime, timedelta
import random

BASE_URL = "http://localhost:8000"
ADMIN_CREDENTIALS = {"username": "Dima", "password": "dima0911"}

# 🔐 Логін
login_res = requests.post(f"{BASE_URL}/api/token/", json=ADMIN_CREDENTIALS)
access = login_res.json().get("access")
headers = {"Authorization": f"Bearer {access}"}
print("🔐 Успішний логін")

# 👨‍⚕️ Лікарі
doctors_info = [
    {
        "username": "petrenko_i",
        "password": "test1234",
        "role": "DOCTOR",
        "doctor_profile": {
            "first_name": "Іван",
            "last_name": "Петренко",
            "middle_name": "Олексійович",
            "specialization": "Ортодонт",
            "experience_years": 7,
            "license_number": "ORT-2020-001",
            "license_issued": "2020-05-15",
            "education": "Львівський медуніверситет",
            "category": "вища",
            "phone_number": "+380971112201",
            "email": "ivan.petrenko@clinic.com",
            "address": "м. Львів, вул. Данила Галицького, 10"
        }
    },
    {
        "username": "kozlovska_o",
        "password": "test1234",
        "role": "DOCTOR",
        "doctor_profile": {
            "first_name": "Олена",
            "last_name": "Козловська",
            "middle_name": "Михайлівна",
            "specialization": "Хірург-стоматолог",
            "experience_years": 10,
            "license_number": "SURG-2015-089",
            "license_issued": "2015-04-22",
            "education": "Харківський медичний інститут",
            "category": "перша",
            "phone_number": "+380971112202",
            "email": "olena.kozlovska@clinic.com",
            "address": "м. Київ, вул. Академіка Вільямса, 5"
        }
    },
    {
        "username": "tkachenko_d",
        "password": "test1234",
        "role": "DOCTOR",
        "doctor_profile": {
            "first_name": "Дмитро",
            "last_name": "Ткаченко",
            "middle_name": "Ігорович",
            "specialization": "Терапевт",
            "experience_years": 5,
            "license_number": "THER-2018-321",
            "license_issued": "2018-11-02",
            "education": "НМУ ім. Богомольця",
            "category": "друга",
            "phone_number": "+380971112203",
            "email": "d.tkachenko@clinic.com",
            "address": "м. Дніпро, просп. Яворницького, 21"
        }
    }
]

doctors = []
for doc in doctors_info:
    res = requests.post(f"{BASE_URL}/api/users/create/", json=doc, headers=headers)
    print(f"👨‍⚕️ Лікар {doc['username']} створено:", res.status_code)
    doctors.append(res.json()["id"])

# 🧑‍💼 Пацієнти
patients_info = [
    {
        "username": "olga.kovalenko",
        "password": "test1234",
        "role": "PATIENT",
        "patient_profile": {
            "first_name": "Ольга",
            "last_name": "Коваленко",
            "middle_name": "Юріївна",
            "birth_date": "1992-07-12",
            "gender": "FEMALE",
            "phone_number": "+380991234561",
            "address": "м. Київ, вул. Хрещатик, 3",
            "inn": "1234567890",
            "medical_card_number": "MCN-101"
        }
    },
    {
        "username": "artem.ivanov",
        "password": "test1234",
        "role": "PATIENT",
        "patient_profile": {
            "first_name": "Артем",
            "last_name": "Іванов",
            "middle_name": "Сергійович",
            "birth_date": "1988-11-05",
            "gender": "MALE",
            "phone_number": "+380991234562",
            "address": "м. Одеса, вул. Приморська, 17",
            "inn": "1234567891",
            "medical_card_number": "MCN-102"
        }
    },
    {
        "username": "kateryna.litvinenko",
        "password": "test1234",
        "role": "PATIENT",
        "patient_profile": {
            "first_name": "Катерина",
            "last_name": "Литвиненко",
            "middle_name": "Петрівна",
            "birth_date": "1995-03-20",
            "gender": "FEMALE",
            "phone_number": "+380991234563",
            "address": "м. Харків, вул. Пушкінська, 12",
            "inn": "1234567892",
            "medical_card_number": "MCN-103"
        }
    }
]

patients = []
for pat in patients_info:
    res = requests.post(f"{BASE_URL}/api/users/create/", json=pat, headers=headers)
    print(f"🧑‍💼 Пацієнт {pat['username']} створено:", res.status_code)
    patients.append(res.json()["id"])

# 📋 Прийоми
descriptions = [
    "Контроль після ортодонтичного лікування",
    "Планова чистка зубів",
    "Видалення зуба мудрості",
    "Підозра на карієс",
    "Консультація щодо брекетів",
    "Пломбування верхнього різця",
    "Заміна старої пломби",
    "Діагностика зубного болю",
    "Рекомендації перед імплантацією",
    "Фотополімерна реставрація"
]

print("📅 Створення прийомів...")
for i in range(10):
    is_past = i < 5
    day_offset = -10 + i if is_past else i + 1
    start = datetime.now() + timedelta(days=day_offset, hours=9 + i % 5)
    end = start + timedelta(minutes=30)
    appointment_data = {
        "doctor": random.choice(doctors),
        "patient": random.choice(patients),
        "scheduled_time": start.isoformat(),
        "end_time": end.isoformat(),
        "description": descriptions[i]
    }
    res = requests.post(f"{BASE_URL}/api/appointments/", json=appointment_data, headers=headers)
    print(f"📋 Прийом #{i+1}: {res.status_code}")

print("✅ Успішно заповнено базу")
