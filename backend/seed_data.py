"""
Seed script to populate UNIBOT with demo data.
Run: python manage.py shell < seed_data.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'unibot_backend.settings')
django.setup()

from accounts.models import User
from courses.models import Course, Enrollment, Assignment, Feedback
from datetime import datetime, timedelta
from django.utils import timezone

print("🌱 Seeding UNIBOT database...")

# ─── Create Users ─────────────────────────────────────────────
admin_user, _ = User.objects.get_or_create(
    username='admin',
    defaults={
        'email': 'admin@unibot.edu',
        'first_name': 'Admin',
        'last_name': 'User',
        'role': 'admin',
        'is_staff': True,
        'is_superuser': True,
    }
)
admin_user.set_password('admin123')
admin_user.save()

faculty1, _ = User.objects.get_or_create(
    username='prof_sharma',
    defaults={
        'email': 'sharma@unibot.edu',
        'first_name': 'Dr. Priya',
        'last_name': 'Sharma',
        'role': 'faculty',
        'department': 'Computer Science',
    }
)
faculty1.set_password('faculty123')
faculty1.save()

faculty2, _ = User.objects.get_or_create(
    username='prof_kumar',
    defaults={
        'email': 'kumar@unibot.edu',
        'first_name': 'Dr. Rajesh',
        'last_name': 'Kumar',
        'role': 'faculty',
        'department': 'Mathematics',
    }
)
faculty2.set_password('faculty123')
faculty2.save()

student1, _ = User.objects.get_or_create(
    username='student1',
    defaults={
        'email': 'student1@unibot.edu',
        'first_name': 'Ansh',
        'last_name': 'Patel',
        'role': 'student',
        'department': 'Computer Science',
    }
)
student1.set_password('student123')
student1.save()

student2, _ = User.objects.get_or_create(
    username='student2',
    defaults={
        'email': 'student2@unibot.edu',
        'first_name': 'Riya',
        'last_name': 'Singh',
        'role': 'student',
        'department': 'Computer Science',
    }
)
student2.set_password('student123')
student2.save()

print("✅ Users created")

# ─── Create Courses ───────────────────────────────────────────
cs101, _ = Course.objects.get_or_create(
    code='CS101',
    defaults={
        'name': 'Introduction to Computer Science',
        'department': 'Computer Science',
        'faculty': faculty1,
        'description': 'Fundamentals of programming, algorithms, and data structures.',
        'syllabus': (
            'Week 1-2: Introduction to Programming (Python)\n'
            'Week 3-4: Control Structures & Functions\n'
            'Week 5-6: Data Structures (Arrays, Lists, Stacks)\n'
            'Week 7-8: Object-Oriented Programming\n'
            'Week 9-10: Algorithms & Complexity\n'
            'Week 11-12: Database Basics\n'
            'Week 13-14: Web Development Introduction\n'
            'Week 15-16: Final Project & Review'
        ),
    }
)

cs201, _ = Course.objects.get_or_create(
    code='CS201',
    defaults={
        'name': 'Data Structures & Algorithms',
        'department': 'Computer Science',
        'faculty': faculty1,
        'description': 'Advanced data structures, sorting algorithms, and graph theory.',
        'syllabus': (
            'Week 1-2: Advanced Arrays & Linked Lists\n'
            'Week 3-4: Trees & Binary Search Trees\n'
            'Week 5-6: Heaps & Priority Queues\n'
            'Week 7-8: Hash Tables & Hashing\n'
            'Week 9-10: Graph Algorithms (BFS, DFS)\n'
            'Week 11-12: Sorting Algorithms\n'
            'Week 13-14: Dynamic Programming\n'
            'Week 15-16: Final Exam Prep'
        ),
    }
)

math101, _ = Course.objects.get_or_create(
    code='MATH101',
    defaults={
        'name': 'Calculus I',
        'department': 'Mathematics',
        'faculty': faculty2,
        'description': 'Limits, derivatives, and integrals.',
        'syllabus': (
            'Week 1-2: Limits and Continuity\n'
            'Week 3-4: Derivatives and Rules\n'
            'Week 5-6: Applications of Derivatives\n'
            'Week 7-8: Integration Basics\n'
            'Week 9-10: Techniques of Integration\n'
            'Week 11-12: Applications of Integrals\n'
            'Week 13-14: Sequences and Series\n'
            'Week 15-16: Review & Final Exam'
        ),
    }
)

print("✅ Courses created")

# ─── Create Enrollments ──────────────────────────────────────
Enrollment.objects.get_or_create(student=student1, course=cs101,
    defaults={'enrollment_num': 'ENR-2024-001'})
Enrollment.objects.get_or_create(student=student1, course=cs201,
    defaults={'enrollment_num': 'ENR-2024-002'})
Enrollment.objects.get_or_create(student=student1, course=math101,
    defaults={'enrollment_num': 'ENR-2024-003'})
Enrollment.objects.get_or_create(student=student2, course=cs101,
    defaults={'enrollment_num': 'ENR-2024-004'})
Enrollment.objects.get_or_create(student=student2, course=math101,
    defaults={'enrollment_num': 'ENR-2024-005'})

print("✅ Enrollments created")

# ─── Create Assignments ──────────────────────────────────────
now = timezone.now()
Assignment.objects.get_or_create(
    title='Python Basics Lab',
    course=cs101,
    defaults={
        'faculty': faculty1,
        'content': 'Complete exercises 1-10 from Chapter 3. Submit as .py files.',
        'due_date': now + timedelta(days=7),
    }
)
Assignment.objects.get_or_create(
    title='Binary Tree Implementation',
    course=cs201,
    defaults={
        'faculty': faculty1,
        'content': 'Implement a binary search tree with insert, delete, and traversal operations.',
        'due_date': now + timedelta(days=14),
    }
)
Assignment.objects.get_or_create(
    title='Derivatives Worksheet',
    course=math101,
    defaults={
        'faculty': faculty2,
        'content': 'Solve problems 1-20 from the derivatives chapter.',
        'due_date': now + timedelta(days=10),
    }
)

print("✅ Assignments created")
print("🎉 Seeding complete!")
print("\n📋 Login credentials:")
print("   Admin:   admin / admin123")
print("   Faculty: prof_sharma / faculty123")
print("   Faculty: prof_kumar / faculty123")
print("   Student: student1 / student123")
print("   Student: student2 / student123")
