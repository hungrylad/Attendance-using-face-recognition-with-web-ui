import os
import tkinter as tk
from tkinter import ttk, messagebox
from datetime import datetime

# ----------------- File Handling Functions -----------------
def scan_for_attendance_files(directory="."):
    """Scan the given directory for attendance CSV files."""
    return [f.replace("_attendance.csv", "") for f in os.listdir(directory) if f.endswith("_attendance.csv")]

def read_attendance_file(subject_name):
    """Read the content of the attendance CSV file for the given subject."""
    file_name = f"{subject_name}_attendance.csv"
    if os.path.exists(file_name):
        with open(file_name, 'r') as file:
            return file.readlines()
    return None

def get_unique_dates(subject_name):
    """Get unique dates from the attendance data of the given subject."""
    attendance_data = read_attendance_file(subject_name)
    if not attendance_data:
        return []
    dates = {line.split(",")[2].strip() for line in attendance_data[1:]}  # Skip header
    return sorted(list(dates))

# ----------------- Data Processing Functions -----------------
def sort_data_by_date_and_id(attendance_data):
    """Sort attendance data by date and ID."""
    data = [line.strip().split(",") for line in attendance_data[1:]]  # Skip header
    for row in data:
        row[2] = datetime.strptime(row[2], "%Y-%m-%d")  # Convert date string to datetime
    return sorted(data, key=lambda x: (x[2], int(x[0])))  # Sort by date, then ID

# ----------------- GUI Functions -----------------
def show_attendance(subject_name, selected_date=None):
    """Retrieve and return attendance data for the given subject as JSON."""
    attendance_data = read_attendance_file(subject_name)
    print("subject_name " , subject_name)
    print("attendance_data " , attendance_data)
    sorted_data = sort_data_by_date_and_id(attendance_data)
    print("sorted_data " , sorted_data)

    if selected_date:
        sorted_data = [line for line in sorted_data if line[2].strftime("%Y-%m-%d") == selected_date]

    # Prepare the data for JSON response
    result = [
        {"ID": line[0], "Name": line[1], "Date": line[2].strftime("%Y-%m-%d"), "Subject": line[3]}
        for line in sorted_data
    ]
    print("result " , result)
    return result

def create_ui_with_dropdown(subjects):
    """Create the main UI window with a dropdown to select subjects."""
    root = tk.Tk()
    root.title("Attendance Viewer")
    root.configure(background="black")
    root.geometry("400x200")

    label = tk.Label(root, text="Select a subject:", bg="black", fg="white", font=("Helvetica", 16))
    label.pack(pady=10)

    subject_combobox = ttk.Combobox(root, values=subjects, state="readonly", font=("Helvetica", 14))
    subject_combobox.pack(pady=10)
    subject_combobox.set("Choose a Subject")

    def on_subject_select():
        selected_subject = subject_combobox.get()
        if selected_subject:
            show_subject_details(selected_subject)

    btn_show_attendance = tk.Button(root, text="Show Attendance", command=on_subject_select, bg="darkblue", fg="white", font=("Helvetica", 14, "bold"))
    btn_show_attendance.pack(pady=20)

    btn_exit = tk.Button(root, text="Exit", command=root.quit, bg="darkblue", fg="white", font=("Helvetica", 14, "bold"))
    btn_exit.pack(pady=10)

    root.mainloop()

def show_subject_details(subject_name):
    """Open a new window for selecting dates and viewing attendance by date."""
    subject_window = tk.Toplevel()
    subject_window.title(f"Attendance for {subject_name}")
    subject_window.configure(background="black")
    subject_window.geometry("600x400")

    unique_dates = get_unique_dates(subject_name)
    date_combobox = ttk.Combobox(subject_window, values=unique_dates, state="readonly", font=("Helvetica", 14))
    date_combobox.set("Choose a Date")
    date_combobox.pack(pady=20)

    def on_date_select(event):
        selected_date = date_combobox.get()
        show_attendance(subject_name, selected_date)

    date_combobox.bind("<<ComboboxSelected>>", on_date_select)

# ----------------- Main Function -----------------
def main():
    """Entry point of the application."""
    attendance_files = scan_for_attendance_files()
    if attendance_files:
        create_ui_with_dropdown(attendance_files)
    else:
        messagebox.showerror("No Attendance Files", "No attendance files found in the project directory.")

if __name__ == "__main__":
    main()
