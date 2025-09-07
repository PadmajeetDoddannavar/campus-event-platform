# Campus Event Management Platform

A complete full-stack web application for managing campus events, student registrations, and attendance tracking.

## Features

### Admin Features
- **Dashboard**: View total events, registrations, students, and feedback
- **Event Management**: Create, view, and delete events
- **Student Management**: View student registrations and mark attendance
- **Real-time Updates**: Dashboard stats update automatically

### Student Features
- **Event Browsing**: View all available events
- **Registration**: Register for events with one click
- **Dashboard**: View personal statistics and registrations
- **Attendance Tracking**: See attendance status for registered events

## Tech Stack

- **Backend**: Python Flask
- **Frontend**: HTML, CSS (Tailwind), JavaScript (Alpine.js)
- **Database**: SQLite
- **Authentication**: Session-based (demo purposes)

## Quick Start

### Prerequisites
- Python 3.7 or higher
- pip (Python package installer)

### Installation

1. **Download the project files**
   - Download all files to a folder on your computer

2. **Install Python dependencies**
   ```bash
   pip install flask flask-cors
   ```

3. **Run the application**
   ```bash
   python simple_backend_no_qr.py
   ```

4. **Access the application**
   - Open your browser and go to: `http://localhost:5000`

## Default Login Credentials

### Admin Login
- **Username**: `admin`
- **Password**: `admin123`

### Student Registration
- Students can register directly from the student login page
- No pre-existing student accounts (demo mode)

## How to Use

### For Admins
1. Login with admin credentials
2. **Create Events**: Click "Create Event" to add new events
3. **View Dashboard**: See real-time statistics
4. **Manage Events**: View all events and their details

### For Students
1. Register as a new student or login
2. **Browse Events**: View all available events
3. **Register**: Click "Register" on any event
4. **View Dashboard**: See your registrations and statistics

## Project Structure

```
Campus-Event-Management/
├── simple_backend_no_qr.py    # Main Flask backend
├── simple_frontend.html       # Frontend HTML file
├── campus_events.db          # SQLite database (auto-created)
├── requirements.txt          # Python dependencies
└── README.md                # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/student/login` - Student login
- `POST /api/auth/student/register` - Student registration

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `DELETE /api/events/<id>` - Delete event

### Registrations
- `POST /api/events/<id>/register` - Register for event
- `GET /api/events/<id>/registrations` - Get event registrations
- `POST /api/events/<id>/mark-attendance` - Mark attendance

### Dashboard
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/student/dashboard` - Student dashboard data

## Database Schema

### Events Table
- `id` (Primary Key)
- `title`, `description`, `event_type`
- `start_date`, `end_date`, `location`
- `max_participants`, `created_at`

### Students Table
- `id` (Primary Key)
- `name`, `email`, `student_id`
- `created_at`

### Registrations Table
- `id` (Primary Key)
- `student_id`, `event_id`, `status`
- `registered_at`

### Attendance Table
- `id` (Primary Key)
- `student_id`, `event_id`, `status`
- `marked_at`

## Customization

### Adding New Event Types
Edit the `event_type` options in the create event form in `simple_frontend.html`

### Changing Database
Replace SQLite with PostgreSQL or MySQL by modifying the database connection in `simple_backend_no_qr.py`

### Styling
The frontend uses Tailwind CSS. Modify classes in `simple_frontend.html` to change the appearance.

## Troubleshooting

### Common Issues

1. **Port 5000 already in use**
   - Change the port in `simple_backend_no_qr.py`: `app.run(port=5001)`

2. **Database errors**
   - Delete `campus_events.db` and restart the application

3. **CORS errors**
   - Ensure you're accessing via `http://localhost:5000` not `file://`

### Getting Help

If you encounter issues:
1. Check the console for error messages
2. Ensure all dependencies are installed
3. Verify Python version compatibility

## Development

### Adding New Features
1. Backend: Add new routes in `simple_backend_no_qr.py`
2. Frontend: Add new UI elements in `simple_frontend.html`
3. Database: Add new tables/columns as needed

### Production Deployment
For production use:
1. Use a production WSGI server (Gunicorn)
2. Replace SQLite with PostgreSQL/MySQL
3. Implement proper JWT authentication
4. Add input validation and error handling
5. Use environment variables for configuration

## License

This project is for educational and demonstration purposes.

## Support

For questions or issues, please check the troubleshooting section above.