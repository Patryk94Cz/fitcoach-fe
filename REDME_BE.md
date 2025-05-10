# FitCoach API Documentation

## Overview
FitCoach jest aplikacją webową do monitorowania treningów siłowych oraz analizy postępów sportowych. API FitCoach umożliwia dostęp do funkcjonalności systemu, w tym zarządzanie użytkownikami, profilami, ćwiczeniami, planami treningowymi, ocenianie treści oraz śledzenie postępów treningowych.

## Technologie
- Backend: Java Spring Boot 3.4
- Frontend: Angular
- Baza danych: MySQL/PostgreSQL
- Autoryzacja: JWT

## Podstawowa konfiguracja
- Bazowy URL API: `http://localhost:8080/api`
- Format wymiany danych: JSON
- Wymagane nagłówki:
  - `Content-Type: application/json`
  - `Authorization: Bearer {jwt_token}` (dla zabezpieczonych endpointów)

## 1. Autentykacja i Autoryzacja

### Rejestracja
```
POST /auth/register
```

**Request:**
```json
{
  "username": "testuser",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Użytkownik zarejestrowany pomyślnie!"
}
```
Status: 200 OK

### Logowanie
```
POST /auth/login
```

**Request:**
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "id": 1,
  "username": "testuser",
  "email": "user@example.com",
  "role": "USER"
}
```
Status: 200 OK

### Pobieranie danych aktualnego użytkownika
```
GET /users/me
```

**Response:**
```json
{
  "id": 1,
  "username": "testuser",
  "email": "user@example.com",
  "role": "USER"
}
```
Status: 200 OK

## 2. Ćwiczenia

### Pobieranie listy wszystkich publicznych ćwiczeń
```
GET /exercises?page=0&size=10&sortBy=name&sortDir=asc
```

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "name": "Pompki",
      "primaryMuscleGroup": "CHEST",
      "imageUrl": "https://przyklad.pl/pompki.jpg",
      "difficultyLevel": "BEGINNER",
      "averageRating": 4.5,
      "ratingsCount": 10
    },
    {
      "id": 2,
      "name": "Przysiady",
      "primaryMuscleGroup": "LEGS",
      "imageUrl": "https://przyklad.pl/przysiady.jpg",
      "difficultyLevel": "BEGINNER",
      "averageRating": 4.2,
      "ratingsCount": 8
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": {
      "empty": false,
      "sorted": true,
      "unsorted": false
    },
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "totalPages": 5,
  "totalElements": 42,
  "last": false,
  "size": 10,
  "number": 0,
  "sort": {
    "empty": false,
    "sorted": true,
    "unsorted": false
  },
  "numberOfElements": 10,
  "first": true,
  "empty": false
}
```
Status: 200 OK

### Pobieranie szczegółów ćwiczenia
```
GET /exercises/{id}
```

**Response:**
```json
{
  "id": 1,
  "name": "Pompki",
  "description": "Klasyczne ćwiczenie na klatkę piersiową, ramiona i triceps",
  "primaryMuscleGroup": "CHEST",
  "secondaryMuscleGroups": ["SHOULDERS", "TRICEPS", "CORE"],
  "imageUrl": "https://przyklad.pl/pompki.jpg",
  "videoUrl": "https://przyklad.pl/pompki-tutorial",
  "difficultyLevel": "BEGINNER",
  "equipmentNeeded": "Brak - tylko ciężar własnego ciała",
  "caloriesBurned": 100,
  "tags": ["klatka piersiowa", "bez sprzętu", "trening w domu"],
  "riskLevel": "LOW",
  "createdAt": "2025-04-01T12:00:00",
  "author": {
    "id": 2,
    "username": "trener1",
    "email": "trener@example.com",
    "role": "TRAINER"
  },
  "isPublic": true,
  "averageRating": 4.5,
  "ratingsCount": 10,
  "isRatedByCurrentUser": false
}
```
Status: 200 OK

### Tworzenie nowego ćwiczenia
```
POST /exercises
```

**Request:**
```json
{
  "name": "Pompki",
  "description": "Klasyczne ćwiczenie na klatkę piersiową, ramiona i triceps",
  "primaryMuscleGroup": "CHEST",
  "secondaryMuscleGroups": ["SHOULDERS", "TRICEPS", "CORE"],
  "imageUrl": "https://przyklad.pl/pompki.jpg",
  "videoUrl": "https://przyklad.pl/pompki-tutorial",
  "difficultyLevel": "BEGINNER",
  "equipmentNeeded": "Brak - tylko ciężar własnego ciała",
  "caloriesBurned": 100,
  "tags": ["klatka piersiowa", "bez sprzętu", "trening w domu"],
  "riskLevel": "LOW",
  "isPublic": true
}
```

**Response:**
Kompletny obiekt ćwiczenia (tak jak w GET /exercises/{id})
Status: 200 OK

### Aktualizacja ćwiczenia
```
PUT /exercises/{id}
```

**Request:**
Taki sam jak przy tworzeniu ćwiczenia.

**Response:**
Zaktualizowany obiekt ćwiczenia.
Status: 200 OK

### Usuwanie ćwiczenia
```
DELETE /exercises/{id}
```

**Response:**
```json
{
  "message": "Ćwiczenie zostało usunięte"
}
```
Status: 200 OK

### Filtrowanie ćwiczeń po grupie mięśniowej
```
GET /exercises/muscle/{muscleGroup}?page=0&size=10
```
Dostępne wartości dla muscleGroup: CHEST, BACK, SHOULDERS, BICEPS, TRICEPS, LEGS, CORE, GLUTES, CALVES, FOREARMS, FULL_BODY

**Response:**
Lista ćwiczeń (taka sama jak w GET /exercises)
Status: 200 OK

### Filtrowanie ćwiczeń po poziomie trudności
```
GET /exercises/difficulty/{level}?page=0&size=10
```
Dostępne wartości dla level: BEGINNER, INTERMEDIATE, ADVANCED

**Response:**
Lista ćwiczeń
Status: 200 OK

### Filtrowanie ćwiczeń po tagu
```
GET /exercises/tag/{tag}?page=0&size=10
```

**Response:**
Lista ćwiczeń
Status: 200 OK

### Wyszukiwanie ćwiczeń
```
GET /exercises/search?keyword=xyz&page=0&size=10
```

**Response:**
Lista ćwiczeń
Status: 200 OK

### Pobieranie najwyżej ocenianych ćwiczeń
```
GET /exercises/top-rated?page=0&size=10
```

**Response:**
Lista ćwiczeń
Status: 200 OK

### Pobieranie własnych ćwiczeń
```
GET /exercises/my?page=0&size=10
```

**Response:**
Lista ćwiczeń
Status: 200 OK

## 3. Oceny ćwiczeń

### Pobieranie ocen dla ćwiczenia
```
GET /exercises/{exerciseId}/ratings?page=0&size=10&sortBy=createdAt&sortDir=desc
```

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "user": {
        "id": 3,
        "username": "user123",
        "email": "user123@example.com",
        "role": "USER"
      },
      "rating": 5,
      "comment": "Świetne ćwiczenie! Bardzo efektywne na klatkę piersiową.",
      "createdAt": "2025-04-01T10:30:00"
    },
    {
      "id": 2,
      "user": {
        "id": 4,
        "username": "fitness_fan",
        "email": "fan@example.com",
        "role": "USER"
      },
      "rating": 4,
      "comment": "Dobre ćwiczenie, ale wymaga poprawnej techniki.",
      "createdAt": "2025-03-28T16:45:00"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": {
      "empty": false,
      "sorted": true,
      "unsorted": false
    },
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "totalPages": 1,
  "totalElements": 2,
  "last": true,
  "size": 10,
  "number": 0,
  "sort": {
    "empty": false,
    "sorted": true,
    "unsorted": false
  },
  "numberOfElements": 2,
  "first": true,
  "empty": false
}
```
Status: 200 OK

### Ocenianie ćwiczenia
```
POST /exercises/{exerciseId}/ratings
```

**Request:**
```json
{
  "rating": 5,
  "comment": "Świetne ćwiczenie! Bardzo efektywne na klatkę piersiową."
}
```

**Response:**
```json
{
  "id": 1,
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "user@example.com",
    "role": "USER"
  },
  "rating": 5,
  "comment": "Świetne ćwiczenie! Bardzo efektywne na klatkę piersiową.",
  "createdAt": "2025-04-06T12:30:00"
}
```
Status: 200 OK

### Aktualizacja oceny
```
PUT /exercises/{exerciseId}/ratings
```

**Request:**
```json
{
  "rating": 4,
  "comment": "Dobre ćwiczenie, ale wymaga poprawnej techniki."
}
```

**Response:**
Zaktualizowany obiekt oceny (jak w odpowiedzi na POST)
Status: 200 OK

### Usuwanie oceny
```
DELETE /exercises/{exerciseId}/ratings
```

**Response:**
```json
{
  "message": "Ocena została usunięta"
}
```
Status: 200 OK

### Sprawdzanie czy użytkownik ocenił ćwiczenie
```
GET /exercises/{exerciseId}/ratings/has-rated
```

**Response:**
```json
true
```
lub
```json
false
```
Status: 200 OK

### Pobieranie swojej oceny dla ćwiczenia
```
GET /exercises/{exerciseId}/ratings/me
```

**Response:**
Obiekt oceny (jak w odpowiedzi na POST) lub błąd 404 jeśli ocena nie istnieje
Status: 200 OK

## 4. Plany treningowe

### Pobieranie wszystkich publicznych planów treningowych
```
GET /workout-plans?page=0&size=10&sortBy=name&sortDir=asc
```

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "name": "Plan na masę",
      "imageUrl": "https://przyklad.pl/plan-masa.jpg",
      "difficultyLevel": "INTERMEDIATE",
      "goal": "MUSCLE_GAIN",
      "suggestedFrequencyPerWeek": 4,
      "averageRating": 4.7,
      "ratingsCount": 15,
      "participantsCount": 120,
      "totalDays": 30
    },
    {
      "id": 2,
      "name": "Plan redukcyjny",
      "imageUrl": "https://przyklad.pl/plan-redukcja.jpg",
      "difficultyLevel": "ADVANCED",
      "goal": "WEIGHT_LOSS",
      "suggestedFrequencyPerWeek": 5,
      "averageRating": 4.5,
      "ratingsCount": 22,
      "participantsCount": 85,
      "totalDays": 42
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": {
      "empty": false,
      "sorted": true,
      "unsorted": false
    },
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "totalPages": 3,
  "totalElements": 28,
  "last": false,
  "size": 10,
  "number": 0,
  "sort": {
    "empty": false,
    "sorted": true,
    "unsorted": false
  },
  "numberOfElements": 10,
  "first": true,
  "empty": false
}
```
Status: 200 OK

### Pobieranie szczegółów planu treningowego
```
GET /workout-plans/{id}
```

**Response:**
```json
{
  "id": 1,
  "name": "Plan na masę",
  "description": "Kompleksowy plan treningowy skupiony na budowaniu masy mięśniowej.",
  "imageUrl": "https://przyklad.pl/plan-masa.jpg",
  "difficultyLevel": "INTERMEDIATE",
  "goal": "MUSCLE_GAIN",
  "estimatedDurationMinutes": 60,
  "suggestedFrequencyPerWeek": 4,
  "equipmentNeeded": "Hantle, ławka, drążek",
  "caloriesBurned": 450,
  "tags": ["masa", "siła", "pełny", "split"],
  "createdAt": "2025-01-15T10:20:00",
  "author": {
    "id": 2,
    "username": "trener1",
    "email": "trener@example.com",
    "role": "TRAINER"
  },
  "isPublic": true,
  "averageRating": 4.7,
  "ratingsCount": 15,
  "participantsCount": 120,
  "isRatedByCurrentUser": false,
  "workoutDays": [
    {
      "id": 1,
      "dayNumber": 1,
      "name": "Dzień 1: Klatka piersiowa i triceps",
      "description": "Skupiamy się na klatce piersiowej i tricepsach",
      "exercises": [
        {
          "id": 1,
          "exercise": {
            "id": 1,
            "name": "Wyciskanie sztangi na ławce prostej",
            "primaryMuscleGroup": "CHEST",
            "imageUrl": "https://przyklad.pl/wyciskanie.jpg",
            "difficultyLevel": "INTERMEDIATE",
            "averageRating": 4.8,
            "ratingsCount": 25
          },
          "order": 1,
          "setsCount": 4,
          "repsCount": 8,
          "restTimeSeconds": 90,
          "weight": "70-80% 1RM",
          "notes": "Skup się na kontrolowanym opuszczaniu sztangi"
        },
        {
          "id": 2,
          "exercise": {
            "id": 5,
            "name": "Rozpiętki z hantlami na ławce skośnej",
            "primaryMuscleGroup": "CHEST",
            "imageUrl": "https://przyklad.pl/rozpietki.jpg",
            "difficultyLevel": "INTERMEDIATE",
            "averageRating": 4.6,
            "ratingsCount": 18
          },
          "order": 2,
          "setsCount": 3,
          "repsCount": 12,
          "restTimeSeconds": 60,
          "weight": "Średnie hantle",
          "notes": "Skup się na maksymalnym rozciągnięciu mięśni"
        }
      ]
    },
    {
      "id": 2,
      "dayNumber": 2,
      "name": "Dzień 2: Plecy i biceps",
      "description": "Trening pleców i bicepsów",
      "exercises": [
        {
          "id": 3,
          "exercise": {
            "id": 10,
            "name": "Podciąganie na drążku",
            "primaryMuscleGroup": "BACK",
            "imageUrl": "https://przyklad.pl/podciaganie.jpg",
            "difficultyLevel": "ADVANCED",
            "averageRating": 4.9,
            "ratingsCount": 30
          },
          "order": 1,
          "setsCount": 4,
          "repsCount": 10,
          "restTimeSeconds": 120,
          "weight": "Masa ciała",
          "notes": "Jeśli nie możesz wykonać wystarczającej liczby powtórzeń, użyj gum powerband"
        }
      ]
    }
  ]
}
```
Status: 200 OK

### Tworzenie nowego planu treningowego
```
POST /workout-plans
```

**Request:**
```json
{
  "name": "Plan na masę",
  "description": "Kompleksowy plan treningowy skupiony na budowaniu masy mięśniowej.",
  "imageUrl": "https://przyklad.pl/plan-masa.jpg",
  "difficultyLevel": "INTERMEDIATE",
  "goal": "MUSCLE_GAIN",
  "estimatedDurationMinutes": 60,
  "suggestedFrequencyPerWeek": 4,
  "equipmentNeeded": "Hantle, ławka, drążek",
  "caloriesBurned": 450,
  "tags": ["masa", "siła", "pełny", "split"],
  "isPublic": true,
  "workoutDays": [
    {
      "dayNumber": 1,
      "name": "Dzień 1: Klatka piersiowa i triceps",
      "description": "Skupiamy się na klatce piersiowej i tricepsach",
      "exercises": [
        {
          "exerciseId": 1,
          "order": 1,
          "setsCount": 4,
          "repsCount": 8,
          "restTimeSeconds": 90,
          "weight": "70-80% 1RM",
          "notes": "Skup się na kontrolowanym opuszczaniu sztangi"
        },
        {
          "exerciseId": 5,
          "order": 2,
          "setsCount": 3,
          "repsCount": 12,
          "restTimeSeconds": 60,
          "weight": "Średnie hantle",
          "notes": "Skup się na maksymalnym rozciągnięciu mięśni"
        }
      ]
    },
    {
      "dayNumber": 2,
      "name": "Dzień 2: Plecy i biceps",
      "description": "Trening pleców i bicepsów",
      "exercises": [
        {
          "exerciseId": 10,
          "order": 1,
          "setsCount": 4,
          "repsCount": 10,
          "restTimeSeconds": 120,
          "weight": "Masa ciała",
          "notes": "Jeśli nie możesz wykonać wystarczającej liczby powtórzeń, użyj gum powerband"
        }
      ]
    }
  ]
}
```

**Response:**
Kompletny obiekt planu treningowego (tak jak w GET /workout-plans/{id})
Status: 200 OK

### Aktualizacja planu treningowego
```
PUT /workout-plans/{id}
```

**Request:**
Taki sam jak przy tworzeniu planu treningowego.

**Response:**
Zaktualizowany obiekt planu treningowego.
Status: 200 OK

### Usuwanie planu treningowego
```
DELETE /workout-plans/{id}
```

**Response:**
```json
{
  "message": "Plan treningowy został usunięty"
}
```
Status: 200 OK

### Filtrowanie planów treningowych po poziomie trudności
```
GET /workout-plans/difficulty/{difficultyLevel}?page=0&size=10
```
Dostępne wartości dla difficultyLevel: BEGINNER, INTERMEDIATE, ADVANCED

**Response:**
Lista planów treningowych
Status: 200 OK

### Filtrowanie planów treningowych po celu
```
GET /workout-plans/goal/{goal}?page=0&size=10
```
Dostępne wartości dla goal: STRENGTH, ENDURANCE, WEIGHT_LOSS, MUSCLE_GAIN, GENERAL_FITNESS, FLEXIBILITY

**Response:**
Lista planów treningowych
Status: 200 OK

### Filtrowanie planów treningowych po tagu
```
GET /workout-plans/tag/{tag}?page=0&size=10
```

**Response:**
Lista planów treningowych
Status: 200 OK

### Wyszukiwanie planów treningowych
```
GET /workout-plans/search?keyword=xyz&page=0&size=10
```

**Response:**
Lista planów treningowych
Status: 200 OK

### Pobieranie najwyżej ocenianych planów treningowych
```
GET /workout-plans/top-rated?page=0&size=10
```

**Response:**
Lista planów treningowych
Status: 200 OK

### Pobieranie najpopularniejszych planów treningowych
```
GET /workout-plans/most-popular?page=0&size=10
```

**Response:**
Lista planów treningowych
Status: 200 OK

### Pobieranie rekomendowanych planów treningowych
```
GET /workout-plans/recommended?maxFrequencyPerWeek=3&maxDifficultyLevel=INTERMEDIATE&page=0&size=10
```

**Response:**
Lista planów treningowych
Status: 200 OK

### Pobieranie własnych planów treningowych
```
GET /workout-plans/my?page=0&size=10
```

**Response:**
Lista planów treningowych
Status: 200 OK

## 5. Oceny planów treningowych

### Pobieranie ocen dla planu treningowego
```
GET /workout-plans/{planId}/ratings?page=0&size=10&sortBy=createdAt&sortDir=desc
```

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "user": {
        "id": 3,
        "username": "user123",
        "email": "user123@example.com",
        "role": "USER"
      },
      "rating": 5,
      "comment": "Świetny plan! Po 2 miesiącach widać pierwsze efekty.",
      "createdAt": "2025-04-01T10:30:00"
    },
    {
      "id": 2,
      "user": {
        "id": 4,
        "username": "fitness_fan",
        "email": "fan@example.com",
        "role": "USER"
      },
      "rating": 4,
      "comment": "Bardzo dobry plan, ale wymagający.",
      "createdAt": "2025-03-28T16:45:00"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": {
      "empty": false,
      "sorted": true,
      "unsorted": false
    },
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "totalPages": 1,
  "totalElements": 2,
  "last": true,
  "size": 10,
  "number": 0,
  "sort": {
    "empty": false,
    "sorted": true,
    "unsorted": false
  },
  "numberOfElements": 2,
  "first": true,
  "empty": false
}
```
Status: 200 OK

### Ocenianie planu treningowego
```
POST /workout-plans/{planId}/ratings
```

**Request:**
```json
{
  "rating": 5,
  "comment": "Świetny plan! Po 2 miesiącach widać pierwsze efekty."
}
```

**Response:**
```json
{
  "id": 1,
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "user@example.com",
    "role": "USER"
  },
  "rating": 5,
  "comment": "Świetny plan! Po 2 miesiącach widać pierwsze efekty.",
  "createdAt": "2025-04-06T12:30:00"
}
```
Status: 200 OK

### Aktualizacja oceny planu
```
PUT /workout-plans/{planId}/ratings
```

**Request:**
```json
{
  "rating": 4,
  "comment": "Bardzo dobry plan, ale wymagający."
}
```

**Response:**
Zaktualizowany obiekt oceny
Status: 200 OK

### Usuwanie oceny planu
```
DELETE /workout-plans/{planId}/ratings
```

**Response:**
```json
{
  "message": "Ocena została usunięta"
}
```
Status: 200 OK

### Sprawdzanie czy użytkownik ocenił plan treningowy
```
GET /workout-plans/{planId}/ratings/has-rated
```

**Response:**
```json
true
```
lub
```json
false
```
Status: 200 OK

### Pobieranie swojej oceny dla planu treningowego
```
GET /workout-plans/{planId}/ratings/me
```

**Response:**
Obiekt oceny (jak w odpowiedzi na POST) lub błąd 404 jeśli ocena nie istnieje
Status: 200 OK

## 6. Zapisywanie się na plany treningowe i śledzenie postępów

### Zapisywanie się na plan treningowy
```
POST /user/workout-plans/join
```

**Request:**
```json
{
  "workoutPlanId": 1
}
```

**Response:**
```json
{
  "id": 1,
  "workoutPlan": {
    "id": 1,
    "name": "Plan na masę",
    "imageUrl": "https://przyklad.pl/plan-masa.jpg",
    "difficultyLevel": "INTERMEDIATE",
    "goal": "MUSCLE_GAIN",
    "suggestedFrequencyPerWeek": 4,
    "averageRating": 4.7,
    "ratingsCount": 15,
    "participantsCount": 121,
    "totalDays": 30
  },
  "startDate": "2025-04-10T14:30:00",
  "currentDay": 1,
  "status": "IN_PROGRESS",
  "completionDate": null,
  "progressPercentage": 0
}
```
Status: 200 OK

### Aktualizacja postępu w planie treningowym
```
PUT /user/workout-plans/{userPlanId}
```

**Request:**
```json
{
  "currentDay": 5,
  "status": "IN_PROGRESS",
  "progressPercentage": 17
}
```

**Response:**
```json
{
  "id": 1,
  "workoutPlan": {
    "id": 1,
    "name": "Plan na masę",
    "imageUrl": "https://przyklad.pl/plan-masa.jpg",
    "difficultyLevel": "INTERMEDIATE",
    "goal": "MUSCLE_GAIN",
    "suggestedFrequencyPerWeek": 4,
    "averageRating": 4.7,
    "ratingsCount": 15,
    "participantsCount": 121,
    "totalDays": 30
  },
  "startDate": "2025-04-10T14:30:00",
  "currentDay": 5,
  "status": "IN_PROGRESS",
  "completionDate": null,
  "progressPercentage": 17
}
```
Status: 200 OK

### Porzucanie planu treningowego
```
DELETE /user/workout-plans/{userPlanId}
```

**Response:**
```json
{
  "message": "Plan treningowy został porzucony"
}
```
Status: 200 OK

### Pobieranie szczegółów planu treningowego użytkownika
```
GET /user/workout-plans/{userPlanId}
```

**Response:**
```json
{
  "id": 1,
  "workoutPlan": {
    "id": 1,
    "name": "Plan na masę",
    "description": "Kompleksowy plan treningowy skupiony na budowaniu masy mięśniowej.",
    "imageUrl": "https://przyklad.pl/plan-masa.jpg",
    "difficultyLevel": "INTERMEDIATE",
    "goal": "MUSCLE_GAIN",
    "estimatedDurationMinutes": 60,
    "suggestedFrequencyPerWeek": 4,
    "equipmentNeeded": "Hantle, ławka, drążek",
    "caloriesBurned": 450,
    "tags": ["masa", "siła", "peł
