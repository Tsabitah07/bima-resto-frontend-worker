# Bima Resto — Worker Management Panel

A React admin panel for managing users, menus, food packages, and bookings for the Bima Resto API.

## Stack
- **React 18** with React Router v6
- **Axios** for API requests
- **react-hot-toast** for notifications
- **lucide-react** for icons

## Project Structure

```
src/
├── App.jsx                    # Root router & providers
├── index.js / index.css       # Entry point & global styles
├── context/
│   └── AuthContext.jsx        # JWT auth state (login/logout)
├── services/
│   └── api.js                 # All API calls mapped to backend routes
├── components/
│   ├── Layout.jsx / .css      # Sidebar + topbar shell
│   ├── Modal.jsx              # Reusable modal dialog
│   └── ConfirmDelete.jsx      # Delete confirmation dialog
└── pages/
    ├── Login.jsx / .css       # Login screen
    ├── Dashboard.jsx / .css   # Stats overview
    ├── Users.jsx              # CRUD users + change password
    ├── Menus.jsx              # CRUD menus + poster upload/delete
    ├── FoodPackages.jsx       # CRUD food packages
    ├── BookingSessions.jsx    # CRUD booking time sessions
    └── Bookings.jsx           # CRUD bookings + detail view
```

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Set API URL (edit .env)
REACT_APP_API_URL=http://localhost:8000

# 3. Run dev server
npm start
```

## API Endpoints Used

| Module | Endpoints |
|---|---|
| Auth | `POST /auth/login` |
| Users | `GET/POST /users/`, `GET/PUT/DELETE /users/:id`, `POST /users/:id/change-password` |
| Roles | `GET /roles/` |
| Menus | `GET/POST /menus/`, `GET/PUT/DELETE /menus/:id`, `POST /menus/:id/posters/upload`, `DELETE /menus/posters/:id` |
| Food Packages | `GET/POST /food-packages/`, `GET/PUT/DELETE /food-packages/:id` |
| Booking Sessions | `GET/POST /booking-sessions/`, `GET/PUT/DELETE /booking-sessions/:id` |
| Bookings | `GET/POST /bookings/`, `GET/PUT/DELETE /bookings/:id` |

## Notes
- Token is stored in `localStorage` as `access_token` and auto-attached to all requests.
- Unauthorized (401) responses automatically redirect to `/login`.
- Menu posters are uploaded as multipart/form-data and served from `/uploads/` on the backend.
