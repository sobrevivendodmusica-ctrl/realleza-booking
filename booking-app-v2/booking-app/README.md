# Booking Platform for Musicians & Sound Engineers

A full-stack web application for managing event bookings, staff availability, and team coordination for musicians and sound engineers.

## Features

- 📅 **Calendar View** - Visual calendar showing all events with color-coded status
- 👥 **User Roles** - Manager, Musical Director, Head of Sound, Musicians, Sound Engineers, Lighting Engineers
- 🎯 **Position-Specific Roles** - Musicians choose their instrument (Drums, Guitar, Bass, Keys, Horn, Vocal, Other)
- ✅ **Smart Filtering** - Only people with matching roles see relevant booking opportunities
- 🔔 **Availability System** - Staff submit availability for dates
- 🎪 **Targeted Booking** - If manager needs Drums, only drummers see that opportunity
- 👀 **Accept/Decline** - Staff confirm or decline their specific bookings
- 📱 **Team Roster** - Everyone sees who's working on each event with contacts
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## How It Works

### The Position-Specific System

**When you register:**
- Choose your user type (Musician, Sound Engineer, Lighting Engineer, etc.)
- If you're a **Musician**, select your specific instrument: Drums, Guitar, Bass, Keys, Horn, Vocal, or Other
- If you're a **Sound Engineer**, select: FOH Engineer, Monitor Engineer, or System Tech
- If you're a **Lighting Engineer**, select: Lighting Tech or Lighting Designer

**When managers create events:**
- They select specific positions needed (e.g., "Drums", "Bass", "Guitar", "FOH Engineer")
- They can specify quantities (e.g., 2 guitarists, 1 drummer)

**When you submit availability:**
- You mark dates you're available
- Your availability is linked to YOUR specific role

**When bookers assign people:**
- They see the event needs "Drums"
- System shows ONLY people registered as "Drums" who are available
- They can't accidentally book a guitarist for a drum position
- Each person can only be booked once per event

This ensures the right people are matched to the right positions!

## Tech Stack

**Backend:**
- Node.js + Express
- PostgreSQL database
- JWT authentication
- RESTful API

**Frontend:**
- Next.js (React)
- Tailwind CSS
- FullCalendar
- Axios

## Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)
- **npm** or **yarn** (comes with Node.js)

## Installation

### 1. Extract the Project

Extract the downloaded zip file to your desired location.

```bash
cd booking-app
```

### 2. Set Up the Database

**Create a PostgreSQL database:**

```bash
# Open PostgreSQL terminal
psql -U postgres

# Create the database
CREATE DATABASE booking_app;

# Exit
\q
```

### 3. Set Up the Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file from template
cp .env.example .env

# Edit .env file with your database credentials
# nano .env (Linux/Mac) or notepad .env (Windows)
```

**Update the `.env` file:**

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=booking_app
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here
JWT_SECRET=your_random_secret_key_here
PORT=5000
```

**Initialize the database tables:**

```bash
npm run init-db
```

You should see: ✅ Database tables created successfully!

### 4. Set Up the Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
```

## Running the Application

### Start the Backend Server

In the `backend` directory:

```bash
npm run dev
```

You should see: 🚀 Server running on port 5000

### Start the Frontend Server

In a **new terminal**, in the `frontend` directory:

```bash
npm run dev
```

You should see: ✓ Ready on http://localhost:3000

### Access the Application

Open your browser and go to: **http://localhost:3000**

## First Time Setup

### Create Your First Users

1. Go to http://localhost:3000/register
2. Create a **Manager** account first
3. Create a **Musical Director** account
4. Create a **Musician** account
5. Create a **Sound Engineer** account

### Test the Workflow

**As Manager:**
1. Login and click "Create Event"
2. Fill in event details (name, date, venue, time)
3. Select positions needed:
   - Click "Drums" (adds 1 drummer position)
   - Click "Bass" (adds 1 bassist position)
   - Click "Guitar" and set quantity to 2 (adds 2 guitarist positions)
   - Click "FOH Engineer" (adds sound position)
4. Create the event

**As a Drummer (Musician):**
1. Register with User Type: "Musician" and Specific Role: "Drums"
2. Login and go to "My Availability"
3. Mark yourself available on the event date
4. You will ONLY see booking requests for drum positions

**As a Guitarist (Musician):**
1. Register with User Type: "Musician" and Specific Role: "Guitar"
2. Mark availability on the same date
3. You will ONLY see booking requests for guitar positions
4. You won't see the drum position (because you're registered as guitar)

**As Musical Director:**
1. Login and go to "Booking Needs"
2. See the event with positions needed
3. For the "Drums" position, you see ONLY the drummer who's available
4. For the "Guitar" positions, you see ONLY guitarists who are available
5. Book each person to their matching position

**As the Booked Musicians:**
1. Check "My Bookings"
2. Accept or decline the booking for YOUR specific position

**Everyone:**
1. View the calendar
2. Click on the event to see full team roster
3. See each person's position, contact info, and status

## User Roles Explained

### Manager
- Creates events with specific position requirements
- Specifies which roles are needed (Drums, Guitar, FOH Engineer, etc.)
- Can request multiple quantities per position
- Views calendar

### Musical Director
- Views events needing musicians
- Sees only musicians who match the required position
- Books musicians for specific roles
- Cannot book someone for a role they're not registered for

### Head of Sound
- Views events needing sound/lighting engineers
- Sees only engineers who match the required position
- Books engineers for specific roles

### Musicians
- Registers with specific instrument (Drums, Guitar, Bass, Keys, Horn, Vocal, Other)
- Submits availability
- Receives booking requests ONLY for their registered instrument
- Cannot be booked for other instruments
- Accepts or declines bookings
- Views team roster for their events

### Sound Engineers / Lighting Engineers
- Registers with specific specialty
- Same workflow as musicians but for technical positions
- Position-matched booking system

## Event Status Colors

- 🔴 **Red** - Unfilled (no bookings yet)
- 🟡 **Yellow** - Partially filled (some positions filled)
- 🟢 **Green** - Confirmed (all positions filled and confirmed)
- ⚫ **Gray** - Completed (past event)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (managers only)
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `GET /api/events/:id/roster` - Get event roster

### Bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id/accept` - Accept booking
- `PUT /api/bookings/:id/decline` - Decline booking
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/booking-needs` - Get events needing bookings

### Availability
- `GET /api/availability` - Get availability
- `POST /api/availability` - Submit availability
- `POST /api/availability/bulk` - Submit multiple dates
- `DELETE /api/availability/:id` - Delete availability

## Database Schema

### users
- id, name, email, password_hash, user_type, **role_category**, contact, emergency_contact

### events
- id, date, space, time, event_name, notes, status, created_by

### event_positions
- id, event_id, **position** (e.g., "Drums", "FOH Engineer"), **quantity**

### bookings
- id, event_id, **position**, user_id, status, booked_by, booked_at, confirmed_at

### availability
- id, date, user_id, available, notes

**Key Changes:**
- `role_category` in users stores the specific role (e.g., "Drums", "Guitar")
- `event_positions` table stores what roles are needed for each event
- `position` in bookings matches against user's `role_category`
- Availability is linked to user_id (their role is automatically included)

## Troubleshooting

### Database Connection Error
- Check PostgreSQL is running: `sudo service postgresql status` (Linux) or check Services (Windows)
- Verify database credentials in `.env`
- Ensure database exists: `psql -U postgres -c "\l"`

### Port Already in Use
- Backend: Change `PORT` in `.env`
- Frontend: Kill process on port 3000 or use: `npm run dev -- -p 3001`

### Can't Login After Registration
- Check backend console for errors
- Verify JWT_SECRET is set in `.env`
- Clear browser localStorage and try again

### Events Not Showing
- Check browser console for errors
- Verify backend is running on port 5000
- Check NEXT_PUBLIC_API_URL in frontend/.env.local

## Development

### Backend Development
```bash
cd backend
npm run dev  # Auto-restarts on file changes
```

### Frontend Development
```bash
cd frontend
npm run dev  # Hot reload enabled
```

### Database Reset
```bash
# Drop all tables
psql -U postgres -d booking_app -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Recreate tables
cd backend
npm run init-db
```

## Production Deployment

### Backend
1. Set up PostgreSQL on your server
2. Update .env with production values
3. Run: `npm start`

### Frontend
1. Update NEXT_PUBLIC_API_URL to your backend URL
2. Build: `npm run build`
3. Start: `npm start`

### Recommended Hosting
- **Backend**: Heroku, Railway, DigitalOcean
- **Frontend**: Vercel, Netlify
- **Database**: Neon, Supabase, Railway

## Future Enhancements

- 📧 Email notifications
- 📱 Mobile apps (iOS/Android)
- 🔄 Recurring events
- 💰 Payment tracking
- ⭐ Rating system
- 🔗 Calendar sync (Google/Apple)
- 📊 Analytics dashboard

## License

MIT License - Feel free to use this project for your needs

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the technical specifications document
3. Check database logs and browser console

---

**Built with ❤️ for musicians and sound engineers**
