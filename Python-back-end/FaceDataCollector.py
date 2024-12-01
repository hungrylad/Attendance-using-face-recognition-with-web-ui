from flask import Flask, request, jsonify
import os
import cv2
import csv

app = Flask(__name__)

def face_data_collector(user_id, name):
    # Directory to save face images
    dataset_path = "dataset"
    if not os.path.exists(dataset_path):
        os.makedirs(dataset_path)

    # Load Haar Cascade for face detection
    face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')

    # Initialize webcam
    cam = cv2.VideoCapture(0)
    if not cam.isOpened():
        return {"message": "Could not open webcam."}

    cam.set(3, 640)  # Set video width
    cam.set(4, 480)  # Set video height

    # Directory for this user's images
    user_path = os.path.join(dataset_path, user_id)
    if not os.path.exists(user_path):
        os.makedirs(user_path)

    # Create or append to the studentdetails.csv file
    student_details_file = "studentdetails.csv"

    # Check if the CSV file already exists. If not, create it with headers.
    if not os.path.exists(student_details_file):
        with open(student_details_file, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(["ID", "Name"])

    # Append the new user's details (ID, Name) to the CSV file
    with open(student_details_file, mode='a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([user_id, name])

    # Capture face images
    count = 0
    while count < 100:
        ret, frame = cam.read()
        if not ret:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        for (x, y, w, h) in faces:
            count += 1
            image_path = f"{user_path}/User.{user_id}.{count}.jpg"
            cv2.imwrite(image_path, gray[y:y+h, x:x+w])
            if count >= 100:
                break

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cam.release()
    cv2.destroyAllWindows()
    return {"message": f"Registration data has been collected for id {user_id} and name {name}, Consider training the model to complete the registration process."}