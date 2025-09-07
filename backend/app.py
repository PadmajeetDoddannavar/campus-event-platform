from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import qrcode
import io
import base64
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
# import pandas as pd  # Commented out for compatibility
from sqlalchemy import func, desc

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///campus_events.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-string')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
CORS(app)

# Database Models
class College(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(10), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    admins = db.relationship('Admin', backref='college', lazy=True)
    students = db.relationship('Student', backref='college', lazy=True)
    events = db.relationship('Event', backref='college', lazy=True)

class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    college_id = db.Column(db.Integer, db.ForeignKey('college.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(15))
    college_id = db.Column(db.Integer, db.ForeignKey('college.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    registrations = db.relationship('Registration', backref='student', lazy=True)
    attendance = db.relationship('Attendance', backref='student', lazy=True)
    feedback = db.relationship('Feedback', backref='student', lazy=True)

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    event_type = db.Column(db.String(50), nullable=False)  # hackathon, workshop, fest, seminar
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(200))
    max_participants = db.Column(db.Integer, default=100)
    registration_deadline = db.Column(db.DateTime)
    college_id = db.Column(db.Integer, db.ForeignKey('college.id'), nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('admin.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    qr_code = db.Column(db.Text)  # Store QR code data
    
    # Relationships
    registrations = db.relationship('Registration', backref='event', lazy=True)
    attendance = db.relationship('Attendance', backref='event', lazy=True)
    feedback = db.relationship('Feedback', backref='event', lazy=True)

class Registration(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    registered_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='registered')  # registered, waitlisted, cancelled
    
    # Unique constraint
    __table_args__ = (db.UniqueConstraint('student_id', 'event_id', name='unique_registration'),)

class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    checked_in_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Unique constraint
    __table_args__ = (db.UniqueConstraint('student_id', 'event_id', name='unique_attendance'),)

class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    comment = db.Column(db.Text)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Unique constraint
    __table_args__ = (db.UniqueConstraint('student_id', 'event_id', name='unique_feedback'),)

# Authentication Routes
@app.route('/api/auth/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    admin = Admin.query.filter_by(username=data['username'], is_active=True).first()
    
    if admin and check_password_hash(admin.password_hash, data['password']):
        access_token = create_access_token(identity={'id': admin.id, 'role': 'admin', 'college_id': admin.college_id})
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': admin.id,
                'username': admin.username,
                'name': admin.name,
                'college_id': admin.college_id,
                'role': 'admin'
            }
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/auth/student/login', methods=['POST'])
def student_login():
    data = request.get_json()
    student = Student.query.filter_by(email=data['email'], is_active=True).first()
    
    if student and check_password_hash(student.password_hash, data['password']):
        access_token = create_access_token(identity={'id': student.id, 'role': 'student', 'college_id': student.college_id})
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': student.id,
                'student_id': student.student_id,
                'email': student.email,
                'name': student.name,
                'college_id': student.college_id,
                'role': 'student'
            }
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/auth/student/register', methods=['POST'])
def student_register():
    data = request.get_json()
    
    # Check if student already exists
    if Student.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    if Student.query.filter_by(student_id=data['student_id']).first():
        return jsonify({'error': 'Student ID already exists'}), 400
    
    # Create new student
    student = Student(
        student_id=data['student_id'],
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        name=data['name'],
        phone=data.get('phone'),
        college_id=data['college_id']
    )
    
    db.session.add(student)
    db.session.commit()
    
    return jsonify({'message': 'Student registered successfully'}), 201

# Event Management Routes
@app.route('/api/events', methods=['GET'])
@jwt_required()
def get_events():
    current_user = get_jwt_identity()
    college_id = current_user['college_id']
    
    events = Event.query.filter_by(college_id=college_id, is_active=True).all()
    return jsonify([{
        'id': event.id,
        'title': event.title,
        'description': event.description,
        'event_type': event.event_type,
        'start_date': event.start_date.isoformat(),
        'end_date': event.end_date.isoformat(),
        'location': event.location,
        'max_participants': event.max_participants,
        'registration_deadline': event.registration_deadline.isoformat() if event.registration_deadline else None,
        'created_at': event.created_at.isoformat()
    } for event in events])

@app.route('/api/events', methods=['POST'])
@jwt_required()
def create_event():
    current_user = get_jwt_identity()
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    data = request.get_json()
    
    # Generate QR code for the event
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(f"event_{data['title']}_{datetime.now().strftime('%Y%m%d%H%M%S')}")
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert QR code to base64
    buffer = io.BytesIO()
    qr_img.save(buffer, format='PNG')
    qr_data = base64.b64encode(buffer.getvalue()).decode()
    
    event = Event(
        title=data['title'],
        description=data['description'],
        event_type=data['event_type'],
        start_date=datetime.fromisoformat(data['start_date']),
        end_date=datetime.fromisoformat(data['end_date']),
        location=data['location'],
        max_participants=data['max_participants'],
        registration_deadline=datetime.fromisoformat(data['registration_deadline']) if data.get('registration_deadline') else None,
        college_id=current_user['college_id'],
        created_by=current_user['id'],
        qr_code=qr_data
    )
    
    db.session.add(event)
    db.session.commit()
    
    return jsonify({'message': 'Event created successfully', 'event_id': event.id}), 201

@app.route('/api/events/<int:event_id>', methods=['PUT'])
@jwt_required()
def update_event(event_id):
    current_user = get_jwt_identity()
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    event = Event.query.filter_by(id=event_id, college_id=current_user['college_id']).first()
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    
    data = request.get_json()
    event.title = data.get('title', event.title)
    event.description = data.get('description', event.description)
    event.event_type = data.get('event_type', event.event_type)
    event.start_date = datetime.fromisoformat(data['start_date']) if data.get('start_date') else event.start_date
    event.end_date = datetime.fromisoformat(data['end_date']) if data.get('end_date') else event.end_date
    event.location = data.get('location', event.location)
    event.max_participants = data.get('max_participants', event.max_participants)
    event.registration_deadline = datetime.fromisoformat(data['registration_deadline']) if data.get('registration_deadline') else event.registration_deadline
    
    db.session.commit()
    return jsonify({'message': 'Event updated successfully'})

@app.route('/api/events/<int:event_id>', methods=['DELETE'])
@jwt_required()
def delete_event(event_id):
    current_user = get_jwt_identity()
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    event = Event.query.filter_by(id=event_id, college_id=current_user['college_id']).first()
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    
    event.is_active = False
    db.session.commit()
    return jsonify({'message': 'Event deleted successfully'})

# Registration Routes
@app.route('/api/events/<int:event_id>/register', methods=['POST'])
@jwt_required()
def register_for_event(event_id):
    current_user = get_jwt_identity()
    if current_user['role'] != 'student':
        return jsonify({'error': 'Student access required'}), 403
    
    event = Event.query.filter_by(id=event_id, is_active=True).first()
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    
    # Check if already registered
    existing_registration = Registration.query.filter_by(
        student_id=current_user['id'], 
        event_id=event_id
    ).first()
    
    if existing_registration:
        return jsonify({'error': 'Already registered for this event'}), 400
    
    # Check registration deadline
    if event.registration_deadline and datetime.utcnow() > event.registration_deadline:
        return jsonify({'error': 'Registration deadline has passed'}), 400
    
    # Check if event is full
    current_registrations = Registration.query.filter_by(event_id=event_id, status='registered').count()
    if current_registrations >= event.max_participants:
        # Add to waitlist
        registration = Registration(
            student_id=current_user['id'],
            event_id=event_id,
            status='waitlisted'
        )
        db.session.add(registration)
        db.session.commit()
        return jsonify({'message': 'Added to waitlist', 'status': 'waitlisted'})
    
    # Register normally
    registration = Registration(
        student_id=current_user['id'],
        event_id=event_id,
        status='registered'
    )
    db.session.add(registration)
    db.session.commit()
    
    return jsonify({'message': 'Registered successfully', 'status': 'registered'})

# Attendance Routes
@app.route('/api/events/<int:event_id>/checkin', methods=['POST'])
@jwt_required()
def check_in_event(event_id):
    current_user = get_jwt_identity()
    if current_user['role'] != 'student':
        return jsonify({'error': 'Student access required'}), 403
    
    # Check if student is registered
    registration = Registration.query.filter_by(
        student_id=current_user['id'], 
        event_id=event_id,
        status='registered'
    ).first()
    
    if not registration:
        return jsonify({'error': 'Not registered for this event'}), 400
    
    # Check if already checked in
    existing_attendance = Attendance.query.filter_by(
        student_id=current_user['id'], 
        event_id=event_id
    ).first()
    
    if existing_attendance:
        return jsonify({'error': 'Already checked in'}), 400
    
    attendance = Attendance(
        student_id=current_user['id'],
        event_id=event_id
    )
    db.session.add(attendance)
    db.session.commit()
    
    return jsonify({'message': 'Checked in successfully'})

# Feedback Routes
@app.route('/api/events/<int:event_id>/feedback', methods=['POST'])
@jwt_required()
def submit_feedback(event_id):
    current_user = get_jwt_identity()
    if current_user['role'] != 'student':
        return jsonify({'error': 'Student access required'}), 403
    
    data = request.get_json()
    
    # Check if already submitted feedback
    existing_feedback = Feedback.query.filter_by(
        student_id=current_user['id'], 
        event_id=event_id
    ).first()
    
    if existing_feedback:
        return jsonify({'error': 'Feedback already submitted'}), 400
    
    feedback = Feedback(
        student_id=current_user['id'],
        event_id=event_id,
        rating=data['rating'],
        comment=data.get('comment', '')
    )
    db.session.add(feedback)
    db.session.commit()
    
    return jsonify({'message': 'Feedback submitted successfully'})

# Dashboard and Reports Routes
@app.route('/api/admin/dashboard', methods=['GET'])
@jwt_required()
def admin_dashboard():
    current_user = get_jwt_identity()
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    college_id = current_user['college_id']
    
    # Get statistics
    total_events = Event.query.filter_by(college_id=college_id, is_active=True).count()
    total_students = Student.query.filter_by(college_id=college_id, is_active=True).count()
    total_registrations = db.session.query(Registration).join(Event).filter(Event.college_id == college_id).count()
    total_attendance = db.session.query(Attendance).join(Event).filter(Event.college_id == college_id).count()
    
    # Recent events
    recent_events = Event.query.filter_by(college_id=college_id, is_active=True).order_by(desc(Event.created_at)).limit(5).all()
    
    # Top events by registration
    top_events = db.session.query(
        Event.title, 
        func.count(Registration.id).label('registrations')
    ).join(Registration).filter(
        Event.college_id == college_id,
        Event.is_active == True
    ).group_by(Event.id).order_by(desc('registrations')).limit(5).all()
    
    return jsonify({
        'stats': {
            'total_events': total_events,
            'total_students': total_students,
            'total_registrations': total_registrations,
            'total_attendance': total_attendance
        },
        'recent_events': [{
            'id': event.id,
            'title': event.title,
            'event_type': event.event_type,
            'start_date': event.start_date.isoformat(),
            'created_at': event.created_at.isoformat()
        } for event in recent_events],
        'top_events': [{'title': title, 'registrations': count} for title, count in top_events]
    })

@app.route('/api/student/dashboard', methods=['GET'])
@jwt_required()
def student_dashboard():
    current_user = get_jwt_identity()
    if current_user['role'] != 'student':
        return jsonify({'error': 'Student access required'}), 403
    
    student_id = current_user['id']
    
    # Get student's registrations
    registrations = db.session.query(Registration, Event).join(Event).filter(
        Registration.student_id == student_id
    ).all()
    
    # Get student's attendance
    attendance = db.session.query(Attendance, Event).join(Event).filter(
        Attendance.student_id == student_id
    ).all()
    
    # Get student's feedback
    feedback = db.session.query(Feedback, Event).join(Event).filter(
        Feedback.student_id == student_id
    ).all()
    
    return jsonify({
        'registrations': [{
            'event_id': event.id,
            'title': event.title,
            'event_type': event.event_type,
            'start_date': event.start_date.isoformat(),
            'status': reg.status,
            'registered_at': reg.registered_at.isoformat()
        } for reg, event in registrations],
        'attendance': [{
            'event_id': event.id,
            'title': event.title,
            'checked_in_at': att.checked_in_at.isoformat()
        } for att, event in attendance],
        'feedback': [{
            'event_id': event.id,
            'title': event.title,
            'rating': fb.rating,
            'comment': fb.comment,
            'submitted_at': fb.submitted_at.isoformat()
        } for fb, event in feedback]
    })

# Leaderboard Route
@app.route('/api/leaderboard', methods=['GET'])
@jwt_required()
def get_leaderboard():
    current_user = get_jwt_identity()
    college_id = current_user['college_id']
    
    # Get top students by attendance
    top_students = db.session.query(
        Student.name,
        Student.student_id,
        func.count(Attendance.id).label('attendance_count')
    ).join(Attendance).filter(
        Student.college_id == college_id,
        Student.is_active == True
    ).group_by(Student.id).order_by(desc('attendance_count')).limit(10).all()
    
    return jsonify([{
        'name': name,
        'student_id': student_id,
        'attendance_count': count
    } for name, student_id, count in top_students])

# Certificate Generation Route
@app.route('/api/events/<int:event_id>/certificate/<int:student_id>', methods=['GET'])
@jwt_required()
def generate_certificate(event_id, student_id):
    current_user = get_jwt_identity()
    
    # Verify student attended the event
    attendance = Attendance.query.filter_by(
        student_id=student_id, 
        event_id=event_id
    ).first()
    
    if not attendance:
        return jsonify({'error': 'Student did not attend this event'}), 400
    
    student = Student.query.get(student_id)
    event = Event.query.get(event_id)
    
    # Generate PDF certificate
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Certificate design
    p.setFont("Helvetica-Bold", 24)
    p.drawCentredText(width/2, height - 100, "CERTIFICATE OF PARTICIPATION")
    
    p.setFont("Helvetica", 16)
    p.drawCentredText(width/2, height - 150, f"This is to certify that")
    
    p.setFont("Helvetica-Bold", 20)
    p.drawCentredText(width/2, height - 200, student.name)
    
    p.setFont("Helvetica", 16)
    p.drawCentredText(width/2, height - 250, f"has successfully participated in")
    
    p.setFont("Helvetica-Bold", 18)
    p.drawCentredText(width/2, height - 300, event.title)
    
    p.setFont("Helvetica", 14)
    p.drawCentredText(width/2, height - 350, f"held on {event.start_date.strftime('%B %d, %Y')}")
    
    p.setFont("Helvetica", 12)
    p.drawCentredText(width/2, height - 400, f"Generated on {datetime.now().strftime('%B %d, %Y')}")
    
    p.save()
    buffer.seek(0)
    
    return jsonify({
        'certificate': base64.b64encode(buffer.getvalue()).decode()
    })

# Initialize database
def create_tables():
    db.create_all()
    
    # Create default college if none exists
    if not College.query.first():
        college = College(name="Default College", code="DEFAULT")
        db.session.add(college)
        db.session.commit()
        
        # Create default admin
        admin = Admin(
            username="admin",
            email="admin@college.edu",
            password_hash=generate_password_hash("admin123"),
            name="System Administrator",
            college_id=college.id
        )
        db.session.add(admin)
        db.session.commit()

if __name__ == '__main__':
    with app.app_context():
        create_tables()
    app.run(debug=True, port=5000)
