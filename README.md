# Campus Course Enrollment Portal

A full-stack Course Enrollment & Academic Management system built with **React 19**, **Vite**, and **Spring Boot 3**. Features strict **Role-Based Access Control (RBAC)** across Admins, Instructors, and Students, real-time seat limit enforcement, course lifecycle approvals, and an interactive dashboard.

---

## 🌟 Key Features

- **Multi-Role Authentication & RBAC**:
    - **Admin**: Approve/reject course proposals, manage users (enable/disable accounts), view all enrolled students across all courses.
    - **Instructor**: Create new course proposals (`PENDING` state), edit course details/seat limits for owned courses, inspect enrolled students in their courses.
    - **Student**: Browse approved courses, self-enroll in available courses with seat limits, view enrolled courses in profile, access classmate directory for enrolled courses.
- **Seat Capacity & Concurrency Enforcement**:
    - Dynamic seat limit validation preventing over-enrollment.
    - Prevents instructors from decreasing seat limits below currently enrolled students.
    - Prevents course deletion if active students are enrolled.
- **Security & Token Lifecycle**:
    - Stateless JWT authentication with refresh token rotation and automatic silent refresh.
    - Granular route-level and method-level security (`@PreAuthorize`).
    - Strict course ownership authorization matching creator email.
- **Responsive & Accessible Design**:
    - Polished dashboard with collapsible sidebar for mobile, tablet, and desktop.
    - Real-time inline form validation powered by **Zod**.
    - Accessible dialogs, toast notifications, and empty/loading states.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, React Router v7, Zod, Vitest, Vanilla CSS Design System with CSS variables.
- **Backend**: Java 21, Spring Boot 3, Spring Security 6, Spring Data JPA, Hibernate, SQLite.
- **API Testing**: Newman CLI / Postman Collections.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher) & **npm**
- **Java JDK 21** & Maven wrapper (included)

### 1. Backend Setup

```bash
cd backend

# Run backend test suite
./mvnw test

# Start the Spring Boot API server (runs on port 3000)
./mvnw spring-boot:run
```

The backend API starts on `http://localhost:3000`. Swagger OpenAPI docs are available at `http://localhost:3000/swagger-ui.html`.

### 2. Frontend Setup

```bash
# In the project root directory
npm install

# Run frontend test suite
npm test

# Run ESLint check
npm run lint

# Start the Vite development server
npm run dev
```

The frontend application will be running at `http://localhost:5173`.

---

## ⚙️ Environment Variables

Create or edit `.env` in the root directory if needed:

```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## 🔑 Demo & Test Credentials

The database comes pre-seeded with active test accounts:

| Role             | Email                    | Password          | Permissions & Notes                                                  |
| :--------------- | :----------------------- | :---------------- | :------------------------------------------------------------------- |
| **Admin**        | `admin@campus.com`       | `Admin@1234`      | Full system access, course approvals, user directory, status updates |
| **Instructor 1** | `instructor1@campus.com` | `Instructor@1234` | Owns "Web Development" & "Cloud Computing", view owned students      |
| **Instructor 2** | `instructor2@campus.com` | `Instructor@1234` | Owns "Data Structures & Algorithms"                                  |
| **Student**      | `student@campus.com`     | `Student@1234`    | Enrolled in "Web Development", can browse & enroll in open courses   |

_All newly registered test students (`emma.watson@campus.com`, `liam.johnson@campus.com`, etc.) also use `Student@1234`._

---

## 🧪 Testing

### Frontend Unit & Integration Tests (Vitest)

```bash
npm test -- --run
```

Runs 61 frontend tests verifying schema validation, state transitions, API interceptors, permissions, and token storage.

### Backend Unit & Integration Tests (JUnit 5 / Spring Boot Test)

```bash
cd backend && ./mvnw test
```

Runs 64 backend tests verifying service logic, security authorization, and database constraints.

### End-to-End API Security Tests (Newman)

```bash
npx -y newman run course-enrollment-postman.json
```

Runs 44 self-authenticating API requests validating all 403 Forbidden checks, authentication flows, and allowed operations.
