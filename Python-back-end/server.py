import sys
import threading

from flask import Flask, request, jsonify
from flask_cors import CORS
from AttendanceViewer import main, scan_for_attendance_files, get_unique_dates, show_attendance
from FaceDataTrainer import train_face_data_model
from FaceRecognizer import load_subjects
from FaceRecognizer import mark_attendance
from FaceDataCollector import face_data_collector

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify({"message": "Hello from Python back-end!"})

# Function to handle Register New Student (to invoke FaceDataCollector.py)
@app.route('/api/register', methods=['POST'])
def register_new_student():
    data = request.json
    user_id = data.get('user_id')
    name = data.get('name')
    if not user_id or not name:
        return jsonify({"message": "Invalid input. 'user_id' and 'name' are required."}), 400

    result = face_data_collector(user_id, name)
    return jsonify(result)

# API endpoint to load subjects
@app.route('/api/load-subjects', methods=['GET'])
def api_load_subjects():
    subjects_file = "subjectNames.yml"  # Path to the subjects YAML file
    try:
        subjects = load_subjects(subjects_file)
        return jsonify(subjects=subjects)
    except Exception as e:
        return jsonify(error=str(e)), 500

# API endpoint to mark attendance
@app.route('/api/mark-attendance', methods=['POST'])
def api_mark_attendance():
    try:
        print("Inside mark attendance API")
        data = request.json

        # Check if request contains data
        if not data:
            return jsonify(error="No data provided."), 400

        subject_name = data.get("subject_name")

        if not subject_name:
            return jsonify(error="Subject name is required."), 400

        model_path = "trained_model.yml"
        haarcasecade_path = "haarcascade_frontalface_default.xml"
        student_details_file = "studentdetails.csv"
        attendance_file = f"{subject_name}_attendance.csv"

        print("Calling mark attendance function")
        result = mark_attendance(model_path, haarcasecade_path, student_details_file, subject_name, attendance_file)

        # Ensure mark_attendance returns the expected response
        if result:
            return jsonify(message=result, details=result), 200
        else:
            return jsonify(error="Failed to mark attendance. Please check the system logs for more details."), 500

    except KeyError as e:
        print(f"KeyError: {e}")
        return jsonify(error=f"Missing key in request data: {str(e)}"), 400

    except FileNotFoundError as e:
        print(f"FileNotFoundError: {e}")
        return jsonify(error=f"Required file not found: {str(e)}"), 500

    except Exception as e:
        print(f"Unexpected error: {e}")
        return jsonify(error=f"An unexpected error occurred: {str(e)}"), 500



# Function to handle View Attendance (to invoke AttendanceViewer.py)
@app.route('/api/view-attendance', methods=['GET'])
def view_attendance():
    main()

# Function to handle Train (invoking FaceDataTrainer.py)
@app.route('/api/train', methods=['GET'])
def train_model():
    train_face_data_model()
    return jsonify(message="Model has been trained. Registered students may mark attendance.")

@app.route('/api/attended-subjects', methods=['GET'])
def get_attended_Subjects():
    try:
        subjects = scan_for_attendance_files()
        return jsonify(subjects=subjects)
    except Exception as e:
        return jsonify(error=str(e)), 500

@app.route('/api/subject-dates', methods=['POST'])
def get_dates_for_subject():
    try:
        # Extract subject name from the POST request payload
        data = request.get_json()
        subject_name = data.get('subject')

        if not subject_name:
            return jsonify(error="Subject name is required"), 400

        # Get unique dates for the provided subject name
        unique_dates = get_unique_dates(subject_name)
        return jsonify(dates=unique_dates)
    except Exception as e:
        return jsonify(error=str(e)), 500

@app.route('/api/subject-attendance', methods=['POST'])
def get_attendance_for_subject():
    try:
        # Ensure JSON payload exists
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid request, JSON data required"}), 400

        # Retrieve subject and date from the payload
        subject_name = data.get('subject')
        date = data.get('date')

        # Validate input
        if not subject_name:
            return jsonify({"error": "Subject name is required"}), 400

        # Call the show_attendance function
        result = show_attendance(subject_name, date)
        return jsonify(result), 200

    except KeyError as e:
        # Handle missing keys in the data payload
        return jsonify({"error": f"Missing key in request: {str(e)}"}), 400

    except FileNotFoundError:
        # Handle missing attendance file
        return jsonify({"error": f"Attendance file for {subject_name} not found"}), 404

    except Exception as e:
        # Catch-all for other exceptions
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500



# Function to handle Exit
@app.route('/api/exit', methods=['GET'])
def exit_program():
    sys.exit()

if __name__ == '__main__':
    app.run(debug=True)
