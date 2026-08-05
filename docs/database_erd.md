# SupaCouple Database Entity Relationship Diagram (ERD)

This document describes the relational architecture of the SupaCouple backend database in PostgreSQL / Supabase.

---

## ER Diagram (Mermaid)

```mermaid
erDiagram
    auth_users ||--|| profiles : "1:1 account profile"
    profiles ||--o| profiles : "partner_id (1:1 self-reference)"
    profiles ||--o{ couples : "created_by"
    profiles ||--o{ invitations : "sender_id / receiver_id"
    couples ||--o{ invitations : "couple_id"
    couples ||--o{ statuses : "couple_id"
    profiles ||--o{ statuses : "user_id"
    couples ||--o{ plans : "couple_id"
    profiles ||--o{ plans : "created_by"
    couples ||--o{ proposals : "couple_id"
    profiles ||--o{ proposals : "created_by"
    couples ||--o{ memories : "couple_id"
    profiles ||--o{ memories : "uploaded_by"
    profiles ||--o{ notifications : "recipient_id / sender_id"

    profiles {
        uuid id PK,FK
        string email
        string display_name
        string avatar_url
        string relationship_status
        uuid partner_id FK
        timestamp created_at
        timestamp updated_at
    }

    couples {
        uuid id PK
        string relationship_name
        date anniversary
        string status
        uuid created_by FK
        timestamp created_at
        timestamp updated_at
    }

    invitations {
        uuid id PK
        string invite_code UK
        string email
        uuid sender_id FK
        uuid receiver_id FK
        uuid couple_id FK
        string status
        timestamp expires_at
        timestamp accepted_at
        timestamp created_at
        timestamp updated_at
    }

    statuses {
        uuid id PK
        uuid user_id FK
        uuid couple_id FK
        string status_text
        string emoji
        string visibility
        timestamp expires_at
        timestamp created_at
        timestamp updated_at
    }

    plans {
        uuid id PK
        uuid couple_id FK
        uuid created_by FK
        string title
        string description
        timestamp start_at
        timestamp end_at
        string location
        string color
        string priority
        boolean completed
        timestamp created_at
        timestamp updated_at
    }

    proposals {
        uuid id PK
        uuid couple_id FK
        uuid created_by FK
        string title
        string description
        timestamp planned_date
        string status
        string response_message
        timestamp created_at
        timestamp updated_at
    }

    memories {
        uuid id PK
        uuid couple_id FK
        uuid uploaded_by FK
        string title
        string caption
        string image_url
        date memory_date
        timestamp created_at
        timestamp updated_at
    }

    notifications {
        uuid id PK
        uuid recipient_id FK
        uuid sender_id FK
        string type
        string title
        string body
        boolean read
        timestamp created_at
    }
```

---

## Detailed Relationship Explanations

1. **`auth.users` → `profiles` (1:1)**:
   - Each authenticated Supabase user has exactly one corresponding profile entry.
   - Primary Key `profiles.id` directly references `auth.users.id` with `ON DELETE CASCADE`.
   - Automated creation via `handle_new_user()` trigger on `auth.users`.

2. **`profiles` → `profiles` (Self-Referencing 1:1)**:
   - `profiles.partner_id` references another `profiles.id` representing the linked romantic partner.

3. **`profiles` → `couples` (1:N)**:
   - `couples.created_by` references the user profile who initialized the couple space.

4. **`couples` → `invitations` / `statuses` / `plans` / `proposals` / `memories` (1:N)**:
   - All shared couple features link to a central `couples.id` via Foreign Keys with `ON DELETE CASCADE`.

5. **`profiles` → `notifications` (1:N)**:
   - `notifications.recipient_id` references the profile receiving the in-app notification.
   - `notifications.sender_id` references the user triggering the notification (optional).
