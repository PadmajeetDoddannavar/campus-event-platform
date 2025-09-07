from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import sqlite3
import hashlib
import json
from datetime import datetime

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000", "file://"])

# Serve the frontend
@app.route('/')
def serve_frontend():
    return send_file('simple_frontend.html')

# Initialize SQLite database
def init_db():
    conn = sqlite3.connect('campus_events.db')
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS colleges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            code TEXT UNIQUE NOT NULL
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            college_id INTEGER,
            FOREIGN KEY (college_id) REFERENCES colleges (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            phone TEXT,
            college_id INTEGER,
            FOREIGN KEY (college_id) REFERENCES colleges (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            event_type TEXT NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            location TEXT,
            max_participants INTEGER DEFAULT 100,
            registration_deadline TEXT,
            college_id INTEGER,
            created_by INTEGER,
            qr_code TEXT,
            FOREIGN KEY (college_id) REFERENCES colleges (id),
            FOREIGN KEY (created_by) REFERENCES admins (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            event_id INTEGER,
            registered_at TEXT DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'registered',
            UNIQUE(student_id, event_id),
            FOREIGN KEY (student_id) REFERENCES students (id),
            FOREIGN KEY (event_id) REFERENCES events (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            event_id INTEGER,
            checked_in_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(student_id, event_id),
            FOREIGN KEY (student_id) REFERENCES students (id),
            FOREIGN KEY (event_id) REFERENCES events (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            event_id INTEGER,
            rating INTEGER NOT NULL,
            comment TEXT,
            submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(student_id, event_id),
            FOREIGN KEY (student_id) REFERENCES students (id),
            FOREIGN KEY (event_id) REFERENCES events (id)
        )
    ''')
    
    # Insert default data
    cursor.execute("SELECT COUNT(*) FROM colleges")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO colleges (name, code) VALUES (?, ?)", ("Default College", "DEFAULT"))
        college_id = cursor.lastrowid
        
        cursor.execute("INSERT INTO admins (username, email, password_hash, name, college_id) VALUES (?, ?, ?, ?, ?)",
                      ("admin", "admin@college.edu", hashlib.sha256("admin123".encode()).hexdigest(), "System Administrator", college_id))
    
    conn.commit()
    conn.close()

# Helper functions
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, hashed):
    return hash_password(password) == hashed

def generate_qr_code(event_title):
    # Simple QR code simulation without PIL dependency
    return f"QR_CODE_{event_title}_{datetime.now().strftime('%Y%m%d%H%M%S')}"

# API Routes
@app.route('/api/auth/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    conn = sqlite3.connect('campus_events.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM admins WHERE username = ?", (data['username'],))
    admin = cursor.fetchone()
    
    if admin and verify_password(data['password'], admin[3]):
        conn.close()
        return jsonify({
            'access_token': 'admin_token_' + str(admin[0]),
            'user': {
                'id': admin[0],
                'username': admin[1],
                'name': admin[4],
                'college_id': admin[5],
                'role': 'admin'
            }
        })
    
    conn.close()
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/auth/student/login', methods=['POST'])
def student_login():
    data = request.get_json()
    conn = sqlite3.connect('campus_events.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM students WHERE email = ?", (data['email'],))
    student = cursor.fetchone()
    
    if student and verify_password(data['password'], student[3]):
        conn.close()
        return jsonify({
            'access_token': 'student_token_' + str(student[0]),
            'user': {
                'id': student[0],
                'student_id': student[1],
                'email': student[2],
                'name': student[4],
                'college_id': student[6],
                'role': 'student'
            }
        })
    
    conn.close()
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/auth/student/register', methods=['POST'])
def student_register():
    data = request.get_json()
    conn = sqlite3.connect('campus_events.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute("INSERT INTO students (student_id, email, password_hash, name, phone, college_id) VALUES (?, ?, ?, ?, ?, ?)",
                      (data['student_id'], data['email'], hash_password(data['password']), data['name'], data.get('phone', ''), 1))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Student registered successfully'}), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'Email or Student ID already exists'}), 400

@app.route('/api/events', methods=['GET'])
def get_events():
    conn = sqlite3.connect('campus_events.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM events ORDER BY start_date DESC")
    events = cursor.fetchall()
    
    result = []
    for event in events:
        result.append({
            'id': event[0],
            'title': event[1],
            'description': event[2],
            'event_type': event[3],
            'start_date': event[4],
            'end_date': event[5],
            'location': event[6],
            'max_participants': event[7],
            'registration_deadline': event[8],
            'created_at': datetime.now().isoformat()
        })
    
    conn.close()
    return jsonify(result)

@app.route('/api/events', methods=['POST'])
def create_event():
    data = request.get_json()
    conn = sqlite3.connect('campus_events.db')
    cursor = conn.cursor()
    
    qr_code = generate_qr_code(data['title'])
    
    cursor.execute("INSERT INTO events (title, description, event_type, start_date, end_date, location, max_participants, registration_deadline, college_id, created_by, qr_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                  (data['title'], data['description'], data['event_type'], data['start_date'], data['end_date'], data['location'], data['max_participants'], data.get('registration_deadline'), 1, 1, qr_code))
    
    conn.commit()
    conn.close()
    return jsonify({'message': 'Event created successfully'}), 201

@app.route('/api/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    conn = sqlite3.connect('campus_events.db')
    cursor = conn.cursor()
    
    # Delete related data first
    cursor.execute("DELETE FROM feedback WHERE event_id = ?", (event_id,))
    cursor.execute("DELETE FROM attendance WHERE event_id = ?", (event_id,))
    cursor.execute("DELETE FROM registrations WHERE event_id = ?", (event_id,))
    cursor.execute("DELETE FROM events WHERE id = ?", (event_id,))
    
    conn.commit()
    conn.close()
    return jsonify({'message': 'Event deleted successfully'}), 200

@app.route('/api/events/<int:event_id>/register', methods=['POST'])
def register_for_event(event_id):
    # For demo purposes, using student_id = 1
    # In a real app, you'd get this from the JWT token
    student_id = 1
    
    conn = sqlite3.connect('campus_events.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute("INSERT INTO registrations (student_id, event_id, status) VALUES (?, ?, ?)",
                      (student_id, event_id, 'registered'))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Registered successfully'}), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'Already registered for this event'}), 400

@app.route('/api/events/<int:event_id>/checkin', methods=['POST'])
def check_in_event(event_id):
    conn = sqlite3.connect('campus_events.db')
    cursor = conn.cursor()
    
    student_id = 1  # For demo
    
    try:
        cursor.execute("INSERT INTO attendance (student_id, event_id) VALUES (?, ?)",
                      (student_id, event_id))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Checked in successfully'}), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'Already checked in'}), 400

@app.route('/api/events/<int:event_id>/feedback', methods=['POST'])
def submit_feedback(event_id):
    data = request.get_json()
    conn = sqlite3.connect('campus_events.db')
    cursor = conn.cursor()
    
    student_id = 1  # For demo
    
    try:
        cursor.execute("INSERT INTO feedback (student_id, event_id, rating, comment) VALUES (?, ?, ?, ?)",
                      (student_id, event_id, data['rating'], data.get('comment', '')))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Feedback submitted successfully'}), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'Feedback already submitted'}), 400

@app.route('/api/admin/dashboard', methods=['GET'])
def admin_dashboard():
    conn = sqlite3.connect('campus_events.db')
    cursor = conn.cursor()
    
    # Get stats
    cursor.execute("SELECT COUNT(*) FROM events")
    total_events = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM students")
    total_students = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM registrations")
    total_registrations = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM attendance")
    total_attendance = cursor.fetchone()[0]
    
    # Get recent events
    cursor.execute("SELECT * FROM events ORDER BY id DESC LIMIT 5")
    recent_events = cursor.fetchall()
    
    # Get top events
    cursor.execute("""
        SELECT e.title, COUNT(r.id) as registrations 
        FROM events e 
        LEFT JOIN registrations r ON e.id = r.event_id 
        GROUP BY e.id 
        ORDER BY registrations DESC 
        LIMIT 5
    """)
    top_events = cursor.fetchall()
    
    conn.close()
    
    return jsonify({
        'stats': {
            'total_events': total_events,
            'total_students': total_students,
            'total_registrations': total_registrations,
            'total_attendance': total_attendance
        },
        'recent_events': [{
            'id': event[0],
            'title': event[1],
            'event_type': event[3],
            'start_date': event[4],
            'created_at': datetime.now().isoformat()
        } for event in recent_events],
        'top_events': [{'title': title, 'registrations': count} for title, count in top_events]
    })

@app.route('/api/student/dashboard', methods=['GET'])
def student_dashboard():
    conn = sqlite3.connect('campus_events.db')
    cursor = conn.cursor()
    
    student_id = 1  # For demo
    
    # Get registrations
    cursor.execute("""
        SELECT r.*, e.title, e.event_type, e.start_date 
        FROM registrations r 
        JOIN events e ON r.event_id = e.id 
        WHERE r.student_id = ?
    """, (student_id,))
    registrations = cursor.fetchall()
    
    # Get attendance
    cursor.execute("""
        SELECT a.*, e.title 
        FROM attendance a 
        JOIN events e ON a.event_id = e.id 
        WHERE a.student_id = ?
    """, (student_id,))
    attendance = cursor.fetchall()
    
    # Get feedback
    cursor.execute("""
        SELECT f.*, e.title 
        FROM feedback f 
        JOIN events e ON f.event_id = e.id 
        WHERE f.student_id = ?
    """, (student_id,))
    feedback = cursor.fetchall()
    
    conn.close()
    
    return jsonify({
        'registrations': [{
            'event_id': reg[2],
            'title': reg[4],
            'event_type': reg[5],
            'start_date': reg[6],
            'status': reg[4],
            'registered_at': reg[3]
        } for reg in registrations],
        'attendance': [{
            'event_id': att[2],
            'title': att[4],
            'checked_in_at': att[3]
        } for att in attendance],
        'feedback': [{
            'event_id': fb[2],
            'title': fb[4],
            'rating': fb[3],
            'comment': fb[4],
            'submitted_at': fb[5]
        } for fb in feedback]
    })

@app.route('/api/reports/top-active-students', methods=['GET'])
def top_active_students():
    conn = sqlite3.connect('campus_events.db')
    cursor = conn.cursor()
    
    # Get top 3 most active students based on registrations
    cursor.execute("""
        SELECT s.id, s.name, s.email, s.student_id,
               COUNT(r.id) as total_registrations,
               COUNT(a.id) as total_attendance,
               COUNT(f.id) as total_feedback
        FROM students s
        LEFT JOIN registrations r ON s.id = r.student_id
        LEFT JOIN attendance a ON s.id = a.student_id
        LEFT JOIN feedback f ON s.id = f.student_id
        GROUP BY s.id, s.name, s.email, s.student_id
        ORDER BY total_registrations DESC, total_attendance DESC
        LIMIT 3
    """)
    
    students = cursor.fetchall()
    conn.close()
    
    return jsonify([{
        'id': student[0],
        'name': student[1],
        'email': student[2],
        'student_id': student[3],
        'total_registrations': student[4],
        'total_attendance': student[5],
        'total_feedback': student[6],
        'activity_score': student[4] + student[5] + student[6]
    } for student in students])

@app.route('/api/reports/events', methods=['GET'])
def flexible_event_reports():
    event_type = request.args.get('event_type', 'all')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    conn = sqlite3.connect('campus_events.db')
    cursor = conn.cursor()
    
    # Build query based on filters
    query = """
        SELECT e.*, 
               COUNT(r.id) as registration_count,
               COUNT(a.id) as attendance_count,
               AVG(f.rating) as avg_rating
        FROM events e
        LEFT JOIN registrations r ON e.id = r.event_id
        LEFT JOIN attendance a ON e.id = a.event_id
        LEFT JOIN feedback f ON e.id = f.event_id
    """
    
    conditions = []
    params = []
    
    if event_type != 'all':
        conditions.append("e.event_type = ?")
        params.append(event_type)
    
    if start_date:
        conditions.append("e.start_date >= ?")
        params.append(start_date)
    
    if end_date:
        conditions.append("e.end_date <= ?")
        params.append(end_date)
    
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    
    query += " GROUP BY e.id ORDER BY e.created_at DESC"
    
    cursor.execute(query, params)
    events = cursor.fetchall()
    conn.close()
    
    return jsonify([{
        'id': event[0],
        'title': event[1],
        'description': event[2],
        'event_type': event[3],
        'start_date': event[4],
        'end_date': event[5],
        'location': event[6],
        'max_participants': event[7],
        'created_at': event[8],
        'registration_count': event[9],
        'attendance_count': event[10],
        'avg_rating': round(event[11], 2) if event[11] else 0
    } for event in events])

@app.route('/api/events/<int:event_id>/registrations', methods=['GET'])
def get_event_registrations(event_id):
    conn = sqlite3.connect('campus_events.db')
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT r.id, s.name, s.student_id, s.email, r.registered_at, r.status,
               CASE WHEN a.id IS NOT NULL THEN 'present' ELSE 'absent' END as attendance_status
        FROM registrations r
        JOIN students s ON r.student_id = s.id
        LEFT JOIN attendance a ON r.student_id = a.student_id AND r.event_id = a.event_id
        WHERE r.event_id = ?
        ORDER BY r.registered_at DESC
    """, (event_id,))
    
    registrations = cursor.fetchall()
    conn.close()
    
    return jsonify([{
        'id': reg[0],
        'student_name': reg[1],
        'student_id': reg[2],
        'email': reg[3],
        'registered_at': reg[4],
        'status': reg[5],
        'attendance_status': reg[6]
    } for reg in registrations])

@app.route('/api/events/<int:event_id>/mark-attendance', methods=['POST'])
def mark_attendance(event_id):
    data = request.get_json()
    student_id = data['student_id']
    action = data['action']  # 'present' or 'absent'
    
    conn = sqlite3.connect('campus_events.db')
    cursor = conn.cursor()
    
    if action == 'present':
        try:
            cursor.execute("INSERT INTO attendance (student_id, event_id) VALUES (?, ?)",
                          (student_id, event_id))
            conn.commit()
            conn.close()
            return jsonify({'message': 'Student marked as present'}), 201
        except sqlite3.IntegrityError:
            conn.close()
            return jsonify({'message': 'Student already marked as present'}), 200
    elif action == 'absent':
        cursor.execute("DELETE FROM attendance WHERE student_id = ? AND event_id = ?",
                      (student_id, event_id))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Student marked as absent'}), 200
    
    conn.close()
    return jsonify({'error': 'Invalid action'}), 400

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    conn = sqlite3.connect('campus_events.db')
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT s.name, s.student_id, COUNT(a.id) as attendance_count
        FROM students s
        LEFT JOIN attendance a ON s.id = a.student_id
        GROUP BY s.id
        ORDER BY attendance_count DESC
        LIMIT 10
    """)
    
    leaderboard = cursor.fetchall()
    conn.close()
    
    return jsonify([{
        'name': name,
        'student_id': student_id,
        'attendance_count': count
    } for name, student_id, count in leaderboard])

if __name__ == '__main__':
    init_db()
    print("🚀 Campus Event Management Backend Starting...")
    print("📡 Backend API: http://localhost:5000")
    print("🔑 Admin Login: admin / admin123")
    print("👨‍🎓 Student Registration: Available")
    app.run(debug=True, port=5000)
