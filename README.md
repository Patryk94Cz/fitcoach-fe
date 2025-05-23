FitCoach - Aplikacja do zarządzania treningami
Spis treści

Wprowadzenie
Architektura aplikacji
Widoki aplikacji

Strona główna i uwierzytelnianie
Panel główny (Dashboard)
Zarządzanie ćwiczeniami
Zarządzanie planami treningowymi
Rejestracja i przeglądanie treningów
Statystyki i postępy


Technologie
Wdrożenie

Wprowadzenie
FitCoach to kompleksowa aplikacja webowa służąca do zarządzania treningami, śledzenia postępów i planowania aktywności fizycznej. Aplikacja umożliwia użytkownikom tworzenie własnych planów treningowych, rejestrowanie sesji treningowych, śledzenie postępów oraz analizę wyników w czasie. FitCoach został zaprojektowany z myślą o osobach, które chcą systematycznie rozwijać swoją formę fizyczną, niezależnie od poziomu zaawansowania.
Architektura aplikacji
Aplikacja FitCoach została zbudowana w oparciu o nowoczesną architekturę Single Page Application (SPA) z wykorzystaniem frameworka Angular. Architektura opiera się na komponentach standalone, co ułatwia modularność i utrzymanie kodu. Aplikacja jest podzielona na następujące moduły funkcjonalne:

Core - zawiera główne serwisy aplikacji, guardy i interceptory
Features - zawiera moduły funkcjonalne aplikacji podzielone tematycznie
Shared - zawiera współdzielone komponenty, dyrektywy i pipe'y
Models - zawiera modele danych wykorzystywane w aplikacji

Widoki aplikacji
Strona główna i uwierzytelnianie
Strona główna (HomeComponent)

Ścieżka: /home
Opis: Strona startowa prezentująca główne funkcje i zalety aplikacji.
Funkcjonalności:

Prezentacja kluczowych funkcji aplikacji
Zachęcenie do rejestracji
Przekierowanie do panelu logowania/rejestracji



Logowanie (LoginComponent)

Ścieżka: /login
Opis: Ekran logowania umożliwiający użytkownikom dostęp do swojego konta.
Funkcjonalności:

Uwierzytelnianie użytkownika
Obsługa błędów logowania
Przekierowanie do rejestracji dla nowych użytkowników
Przechowywanie tokenu JWT po udanym logowaniu



Rejestracja (RegisterComponent)

Ścieżka: /register
Opis: Formularz rejestracji nowego konta użytkownika.
Funkcjonalności:

Walidacja danych rejestracyjnych
Tworzenie nowego konta użytkownika
Komunikaty o powodzeniu/błędach rejestracji
Automatyczne przekierowanie do logowania po rejestracji



Panel główny (Dashboard)
Dashboard (DashboardComponent)

Ścieżka: /dashboard
Opis: Centralny panel kontrolny użytkownika prezentujący najważniejsze informacje i statystyki.
Funkcjonalności:

Przegląd aktywności treningowej
Wizualizacja tygodniowej aktywności treningowej
Statystyki dotyczące wykonanych treningów
Interaktywny kalendarz aktywności (heatmapa)
Szybki dostęp do najczęściej używanych funkcji



Zarządzanie ćwiczeniami
Lista ćwiczeń (ExerciseListComponent)

Ścieżka: /exercises
Opis: Przeglądarka dostępnych ćwiczeń z możliwością filtrowania i wyszukiwania.
Funkcjonalności:

Wyświetlanie listy ćwiczeń w postaci kart
Zaawansowane filtrowanie (grupa mięśniowa, poziom trudności, autor)
Wyszukiwanie ćwiczeń według nazwy
Dodawanie ćwiczeń do ulubionych
Przycisk do tworzenia nowego ćwiczenia
Paginacja wyników



Szczegóły ćwiczenia (ExerciseDetailComponent)

Ścieżka: /exercises/:id
Opis: Szczegółowy widok informacji o wybranym ćwiczeniu.
Funkcjonalności:

Pełny opis ćwiczenia i techniki wykonania
Informacje o zaangażowanych grupach mięśniowych
System oceniania i komentowania ćwiczeń
Możliwość dodania do ulubionych
Dla autora: możliwość edycji lub usunięcia ćwiczenia



Formularz ćwiczenia (ExerciseFormComponent)

Ścieżka: /exercises/create i /exercises/edit/:id
Opis: Formularz do tworzenia nowych ćwiczeń lub edycji istniejących.
Funkcjonalności:

Podstawowe informacje o ćwiczeniu (nazwa, opis, poziom trudności)
Wybór grup mięśniowych (główna i dodatkowe)
Dodawanie tagów dla łatwiejszego wyszukiwania
Definiowanie poziomu ryzyka i potrzebnego sprzętu
Możliwość dodania linku do zdjęcia i wideo instruktażowego



Historia ćwiczeń (ExerciseHistoryTableComponent)

Ścieżka: /exercise-history-table
Opis: Tabela prezentująca historię wykonań poszczególnych ćwiczeń.
Funkcjonalności:

Filtrowanie historii według nazwy ćwiczenia
Sortowanie według różnych parametrów (data, obciążenie)
Szczegółowe informacje o każdym wykonaniu (serie, powtórzenia, obciążenie)



Zarządzanie planami treningowymi
Lista planów treningowych (WorkoutPlanListComponent)

Ścieżka: /workout-plans
Opis: Przeglądarka dostępnych planów treningowych.
Funkcjonalności:

Wyświetlanie listy planów w postaci kart
Filtrowanie według celu, poziomu trudności, autora i częstotliwości
Wyszukiwanie planów według nazwy
Przycisk do tworzenia nowego planu treningowego
Paginacja wyników



Szczegóły planu treningowego (WorkoutPlanDetailComponent)

Ścieżka: /workout-plans/:id
Opis: Szczegółowy widok informacji o wybranym planie treningowym.
Funkcjonalności:

Pełny opis planu treningowego
Przeglądanie dni treningowych i przypisanych ćwiczeń
System oceniania i komentowania planów
Możliwość dołączenia do planu
Dla uczestników: informacje o postępie i możliwość rejestracji treningu
Dla autora: możliwość edycji lub usunięcia planu



Formularz planu treningowego (WorkoutPlanFormComponent)

Ścieżka: /workout-plans/create i /workout-plans/edit/:id
Opis: Wieloetapowy formularz do tworzenia/edycji planów treningowych.
Funkcjonalności:

Podstawowe informacje o planie (nazwa, opis, cel, poziom trudności)
Definiowanie dni treningowych
Dodawanie ćwiczeń do każdego dnia
Konfiguracja parametrów ćwiczeń (serie, powtórzenia, odpoczynek)
Podgląd całego planu przed zapisaniem



Moje plany treningowe (MyWorkoutPlansComponent)

Ścieżka: /workout-plans
Opis: Lista planów treningowych, do których dołączył użytkownik.
Funkcjonalności:

Podgląd wszystkich zapisanych planów
Filtry (wszystkie/w trakcie/ukończone)
Informacje o postępie w każdym planie
Możliwość zakończenia planu
Możliwość reaktywacji ukończonego planu



Rejestracja i przeglądanie treningów
Nowy trening (NewWorkoutComponent)

Ścieżka: /new-workout
Opis: Formularz do rejestracji nowej sesji treningowej.
Funkcjonalności:

Wybór planu treningowego i dnia
Wprowadzenie wyników dla każdego ćwiczenia (serie, powtórzenia, obciążenie)
Dodawanie notatek do każdego ćwiczenia i całej sesji
Automatyczna aktualizacja postępu w planie treningowym



Historia treningów (WorkoutHistoryComponent)

Ścieżka: /my-workouts
Opis: Lista wszystkich zarejestrowanych sesji treningowych.
Funkcjonalności:

Przeglądanie wszystkich sesji treningowych
Filtrowanie według planu treningowego
Podgląd podstawowych informacji o sesji
Przejście do szczegółów sesji
Usuwanie sesji treningowych



Szczegóły sesji (SessionDetailComponent)

Ścieżka: /workout-sessions/:id
Opis: Szczegółowy widok informacji o wybranej sesji treningowej.
Funkcjonalności:

Pełne informacje o wykonanych ćwiczeniach
Porównanie z zaplanowanymi parametrami ćwiczeń
Notatki z treningu
Możliwość usunięcia sesji



Statystyki i postępy
Statystyki ćwiczeń (ExerciseStatsComponent)

Ścieżka: /exercise-stats
Opis: Zaawansowane statystyki i wykresy dla wybranych ćwiczeń.
Funkcjonalności:

Wybór ćwiczenia do analizy
Wykresy zmian obciążenia w czasie
Filtry czasowe (tydzień/miesiąc/rok)
Statystyki podsumowujące (min/max/średnie obciążenie)
Analiza postępu w czasie



Technologie
Aplikacja FitCoach została zbudowana przy użyciu następujących technologii:

Frontend: Angular 17, TypeScript, RxJS, Angular Material
Wizualizacje danych: D3.js
Style: SCSS, Angular Material Components
Uwierzytelnianie: JWT (JSON Web Tokens)
Zarządzanie stanem: RxJS, Services
