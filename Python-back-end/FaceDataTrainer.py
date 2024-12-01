import cv2
import numpy as np
import os
from PIL import Image

def train_face_data_model():
    # Path to the dataset directory
    dataset_path = "dataset"
    # Path where to save the trained model
    model_path = "trained_model.yml"

    # Initialize the face recognizer
    recognizer = cv2.face.LBPHFaceRecognizer_create()
    # Load Haar Cascade for face detection
    face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')

    # Prepare training data
    faces = []
    ids = []

    # Read images from the dataset folder
    for user_folder in os.listdir(dataset_path):
        user_path = os.path.join(dataset_path, user_folder)

        if not os.path.isdir(user_path):
            continue

        # Loop through each image in the user's folder
        for image_name in os.listdir(user_path):
            image_path = os.path.join(user_path, image_name)
            image = Image.open(image_path).convert('L')  # Convert to grayscale
            image_np = np.array(image, 'uint8')

            # Extract the user ID from the image filename
            user_id = int(user_folder)
            faces.append(image_np)
            ids.append(user_id)

            # Optionally show each face being trained
            cv2.imshow("Training on image...", image_np)
            cv2.waitKey(10)

    if os.path.exists(model_path):
        recognizer.read(model_path)  # Load the existing model
        recognizer.update(faces, np.array(ids))  # Update instead of train
    else:
        recognizer.train(faces, np.array(ids))  # Train the model from scratch

    # Save the trained model
    recognizer.save(model_path)
    print(f"[INFO] Model trained and saved at {model_path}")

    delete_dataset_files(dataset_path)

    cv2.destroyAllWindows()

def delete_dataset_files(dataset_path):
    # Delete all files and folders inside the dataset folder (but not the dataset folder itself)
    for user_folder in os.listdir(dataset_path):
        user_path = os.path.join(dataset_path, user_folder)
        if os.path.isdir(user_path):
            # Remove all files in the directory
            for file in os.listdir(user_path):
                file_path = os.path.join(user_path, file)
                if os.path.isfile(file_path):
                    os.remove(file_path)
            # Remove the directory itself after deleting its contents
            os.rmdir(user_path)

    print(f"[INFO] All files and subfolders inside '{dataset_path}' have been deleted.")

# train_face_data_model()
