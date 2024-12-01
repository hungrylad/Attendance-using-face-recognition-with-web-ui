import cv2
import numpy as np
import time
import csv
import datetime
import os
import yaml
from flask import jsonify


# Function to load the subject names from the YAML file
def load_subjects(subjects_file):
    try:
        with open(subjects_file, 'r') as file:
            subjects = yaml.safe_load(file)
        if not subjects:
            raise ValueError("No subjects found in the file.")
        return subjects
    except FileNotFoundError:
        raise FileNotFoundError("Subject file not found.")
    except Exception as e:
        raise Exception(f"Error loading subjects: {e}")

# Function to load student details from the CSV file
def load_students(student_details_file):
    students = {}
    with open(student_details_file, mode='r') as file:
        reader = csv.reader(file)
        next(reader)  # Skip header
        for row in reader:
            user_id, name = row
            students[int(user_id)] = name
    return students

# Function to mark attendance
def mark_attendance(model_path, haarcasecade_path, student_details_file, subject_name, attendance_file):
    print("Inside function mark attendance")
    # Load the face recognition model
    recognizer = cv2.face.LBPHFaceRecognizer_create()
    try:
        print("Scanning for attendance")
        recognizer.read(model_path)
    except cv2.error:
        print("cv2 error")
        return jsonify(error="Error: No students registered. Register and train the model first.")
    except FileNotFoundError:
        print("file not found error")
        return jsonify(error="Error: Face model data not found.")
    except Exception:
        print("general exception")
        return jsonify(error="Error: Error while reading face data model.")

    face_cascade = cv2.CascadeClassifier(haarcasecade_path)

    students = load_students(student_details_file)
    cam = cv2.VideoCapture(0)
    start_time = time.time()

    if not os.path.exists(attendance_file):
        with open(attendance_file, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(["ID", "Name", "Date", "Subject"])

    # Loop for face recognition
    while True:
        ret, frame = cam.read()
        if not ret:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.2, minNeighbors=5)

        match_found = False

        for (x, y, w, h) in faces:
            Id, conf = recognizer.predict(gray[y:y+h, x:x+w])
            if conf < 50:  # If the confidence is below the threshold
                print("face match, searching name")
                name = students.get(Id, "Unknown")
                if name != "Unknown":
                    print("match found")
                    current_date = datetime.datetime.now().strftime("%Y-%m-%d")
                    with open(attendance_file, mode='a', newline='') as file:
                        writer = csv.writer(file)
                        writer.writerow([Id, name, current_date, subject_name])

                    match_found = True
                    break  # Exit the loop as soon as a match is found

        if time.time() - start_time > 10:
            if not match_found:
                return "Timeout: No match found."
            break  # Exit the loop after timeout

        if match_found:
            break  # Exit the loop if a match is found

        cv2.imshow("Face Recognition", frame)

        if cv2.waitKey(10) & 0xFF == 27:
            break

    cam.release()
    cv2.destroyAllWindows()

    return f"Attendance marked for: {Id}, {name} for {subject_name} on {datetime.datetime.now().strftime('%Y-%m-%d')}" if match_found else "No match found."
