# Campus Event Management System
## About the project

This project is a Campus Event Reporting system that I made for the Webknot campus drive assignment. The main idea is to manage events, students, attendance and feedback in one single place instead of doing everything on paper or with excel sheets.

I decided to use Flask as backend since it is light weight and easy to build APIs. For database, I used SQLite because it doesn’t require big setup and works well for a prototype. For the UI, I added simple HTML pages with Bootstrap and Chart.js so that reports can be shown in a nice way.

## My understanding 

Every student belongs to a college.

Events are created by admin for a college.

Students can register for events (but not more than once).

On the event day, attendance is marked.

After the event, students can submit feedback (rating + comment).

Admins can generate reports to check which events are popular, how many events a student participated, average feedback etc.

I wanted to make the UI simple but not too boring, so I added tables for students and charts for admin dashboard.

## Features I made

Add Colleges, Students, Events

Students can register for events

Attendance marking

Feedback form (only one per student per event)

## Reports:

Event popularity

Student participation

Average feedback per event

Top active students

Few design choices (and mistakes I made)

I started with only 3 models (Student, Event, Feedback) but later realized I need Registration separately for attendance, so I changed my design midway.

I forgot to handle cancelled events at first, then added a small check.

For UI, I first tried plain HTML but it looked very ugly, so I switched to Bootstrap.

I didn’t make authentication (login) because of time limits.

## How to run (basic steps)

Go inside backend folder:
```
cd backend
```

Create venv and install deps:
```bash
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

Seed the db with sample data:
```bash
python seed.py

```
Run the server:
```bash
python app.py

```
Open browser:

Student UI → http://127.0.0.1:5000/

Admin UI → http://127.0.0.1:5000/admin

## Screenshots
<img width="1203" height="1625" alt="localhost_5000_" src="https://github.com/user-attachments/assets/9dcbeaf0-cd3f-469a-854e-f5774a078c7f" />
![Screenshot_7-9-2025_12849_localhost](https://github.com/user-attachments/assets/66e57757-d3f1-4312-acb9-11581f7109b1)
![Screenshot_7-9-2025_12626_localhost](https://github.com/user-attachments/assets/440da71d-091c-4a52-954c-a67df5aa607a)




## Things I would improve if more time

Add login for admin and students.

Add ability to upload event poster/images.

Use PostgreSQL instead of SQLite for production.

More charts and analytics for admin.

This is my simple understanding and approach. It may not be perfect but it covers the requirements.

