#
# Client-side python app for courseHero
#
# Final Project for CS 310
#
import requests  # calling web service
import jsons  # relational-object mapping

import uuid
import pathlib
import logging
import sys
import os
import base64
import boto3

from configparser import ConfigParser
from getpass import getpass

import matplotlib.pyplot as plt
import matplotlib.image as img

import tkinter as tk
from tkinter import ttk, font

FLAG = False
USERID = None

###################################################################
#
# classes
#
class User:
  userid: int  
  username: str
  pwdhash: str



class Job:
  jobid: int  
  userid: int
  courseid: str
  status: str
  datafileName: str
  datafilekey: str
  resultsfilekey: str

class CourseAppGUI:
  def __init__(self, master, baseurl):

    self.master = master
    master.title("CourseApp Client")

    master.geometry("800x600")

    darker_blue = '#add8e6'
    master.configure(background=darker_blue)

    customFont = font.Font(family="Helvetica", size=12)

    style = ttk.Style()
    style.configure('TButton', font=('Helvetica', 12), borderwidth='4')
    style.configure('TFrame', background=darker_blue)

    frame = ttk.Frame(master, style='TFrame')
    frame.pack(side=tk.TOP, pady=10, expand=True)

    self.label = ttk.Label(frame, text="CourseApp Client Interface", font=customFont, background=darker_blue)
    self.label.pack(side=tk.TOP, pady=(0, 10))

    self.baseurl = baseurl


    # Buttons with better styling
    self.get_users_button = ttk.Button(frame,
                                        text="List all Students",
                                        command=lambda: self.users(baseurl))
    self.get_users_button.pack(pady=(0, 5))

    self.get_jobs_button = ttk.Button(frame,
                                      text="List all materials",
                                      command=lambda: self.jobs(baseurl))
    self.get_jobs_button.pack(pady=(0, 5))

    self.add_user_button = ttk.Button(frame,
                                      text="Register as Student",
                                      command=lambda: self.register(baseurl))
    self.add_user_button.pack(pady=(0, 5))

    self.login_button = ttk.Button(frame,
                                    text="Login as Students",
                                    command=lambda: self.login(baseurl))
    self.login_button.pack(pady=(0, 5))

    self.upload_button = ttk.Button(frame,
                                    text="Find your ID",
                                    command=lambda: self.findId(baseurl))

    self.upload_button = ttk.Button(frame,
                                    text="Upload a material",
                                    command=lambda: self.upload(baseurl))
    self.upload_button.pack(pady=(0, 5))

    self.download_button = ttk.Button(frame,
                                      text="Download a material",
                                      command=lambda: self.download(baseurl))
    self.download_button.pack(pady=(0, 5))

    self.view_sessions_button = ttk.Button(
        frame, text="Analyze material", command=lambda: self.analyze(baseurl))
    self.view_sessions_button.pack(pady=(0, 5))

    self.like_button = ttk.Button(
        frame, text="Press Like", command=lambda: self.like(baseurl))
    self.like_button.pack(pady=(0, 5))

    self.Display_like_button = ttk.Button(
        frame, text="Display Like", command=lambda: self.display_like(baseurl))
    self.Display_like_button.pack(pady=(0, 5))

    self.logout_all_button = ttk.Button(
        frame, text="Log Out", command=lambda: self.logOut(baseurl))
    self.logout_all_button.pack(pady=(0, 5))
    

  def users(self, baseurl):

    try:
      #
      # call the web service:
      #
      api = '/users'
      url = baseurl + api

      res = requests.get(url)

      if res.status_code != 200:
        # failed:
        print("Failed with status code:", res.status_code)
        print("url: " + url)
        if res.status_code == 400:  # we'll have an error message
          body = res.json()
          print("Error message:", body["message"])
        #
        return

      #
      # deserialize and extract users:
      #
      body = res.json()
      # print(body)
      #
      # let's map each dictionary into a User object:
      #
      users = []
      for row in body["data"]:        #row is a dic
        user = jsons.load(row, User)
        # print(user)                   # user is a object
        users.append(user)
      #
      # Now we can think OOP:
      #
      for user in users:
        print("User number: ", user.userid)
        print("User name: ", user.username)
        print(" ")

    except Exception as e:
      logging.error("users() failed:")
      logging.error("url: " + url)
      logging.error(e)
      return


  def jobs(self, baseurl):

    try:
      api = '/jobs'
      url = baseurl + api

      res = requests.get(url)

      if res.status_code != 200:
        # failed:
        print("Failed with status code:", res.status_code)
        print("url: " + url)
        if res.status_code == 400:  # we'll have an error message
          body = res.json()
          print("Error message:", body["message"])
        #
        return

      body = res.json()

      jobs = []
      for row in body:
        job = jsons.load(row, Job)
        jobs.append(job)

      for ele in jobs:
        print("Job Id: ", ele.jobid)
        print("User Id: ", ele.userid)
        print("Course Id: ", ele.courseid)
        print("File Name: ", ele.originaldatafile)
        print("File Key: ", ele.datafilekey)
        print()


    except Exception as e:
      logging.error("assets() failed:")
      logging.error("url: " + url)
      logging.error(e)
      return


  def login(self, baseurl):
    global FLAG, USERID
    if (FLAG) :
      print("You are already logged in")
      return
    api = '/login'
    url = baseurl + api

    username = input("Please enter your username: ")
    password = input("Please enter your password: ")
    credentials = {'username': username, 'password': password}

    response = requests.post(url, json = credentials)

    if response.status_code == 200:
      print("Login successful.")
      data = response.json()  # Convert the response to JSON

      # Extract and display the access token
      if 'accessToken' in data:
          access_token = data['accessToken']
          username = data["username"]
          userid = data["userid"]
          print("Welcome: ", username)
          print(" Userid: ", userid)
          FLAG = True
          USERID = userid
          return access_token
      else:
          print("Access token not found in the response.")
          return None
    else:
      print("Login failed. Status code:", response.status_code, "," ,response.text)
      return None


  def register(self, baseurl):
    
    api = '/regis'
    url = baseurl + api
    
    username = input("Please enter your username: ")
    password = input("Please enter your password: ")
    credentials = {'username': username, 'password': password}

    # Send POST request to the server
    response = requests.post(url, json=credentials)

    if response.status_code == 201:
      print("Registration successful.")
      return True 
    else:
      print("Registration failed. Status code:", response.status_code, "," ,response.text)
      return False


  def findId(self, baseurl):
    # print(FLAG)
    if (FLAG) :
      print("Your ID is: ", USERID)
      return
    print("Please login first")


  def logOut(self, baseurl):
    global FLAG, USERID
    if (not FLAG) :
      print("Please login as user first")
      return
    FLAG = False
    USERID = None
    print("Logged out successfully")


  def like(self, baseurl):
    global FLAG
    if (not FLAG) :
      print("Please login as user first")
      return
    job_id = input("Enter the job ID for the file you want to like: ")
    url = f"{baseurl}/like/{job_id}"

    response = requests.get(url)

    if response.status_code == 201:
      print("Press Like successful")
    else:
      print(f"Failed to like file. Status code: {response.status_code}, Message: {response.text}")


  def upload(self, baseurl):
    global FLAG
    if (not FLAG) :
        print("Please login as user first")
        return
    
    user_id = input("Please enter your user_id: ")
    course_id = input("Enter the course ID (e.g., CS101): ")
    url = f"{baseurl}/pdf/{user_id}"

    # List PDF files in the current directory
    print("Available PDF files:")
    pdf_files = [f for f in os.listdir('.') if f.endswith('.pdf')]
    for i, file in enumerate(pdf_files):
        print(f"{i + 1}: {file}")

    # Let the user select a file
    file_index = int(input("Select the file number to upload: ")) - 1
    file_path = pdf_files[file_index]

    # Perform the file upload
    with open(file_path, 'rb') as file:
        files = {'file': file}
        data = {'courseid': course_id}
        response = requests.post(url, files=files, data=data)

    # Handle response
    if response.status_code == 200:
        print("Upload successful:", response.json())
    else:
        print("Upload failed. Status code:", response.status_code, "Response:", response.text)


  def display_like(self, baseurl):
    # global FLAG
    # if (not FLAG) :
    #   print("Please login as user first")
    #   return
    url = f"{baseurl}/likelist"

    response = requests.get(url)

    if response.status_code == 200:
      data = response.json()
      print("Like results:")
      for key, value in data.items():
          print(f"{key}: {value}")
    else:
      print(f"Failed to like file. Status code: {response.status_code}, Message: {response.text}")

  def download(self, baseurl):
    global FLAG
    if (not FLAG) :
        print("Please login as user first")
        return
      
    job_id = input("Enter the job ID for the file you want to download: ")
    url = f"{baseurl}/download/{job_id}"

    response = requests.get(url, stream=True)

    if response.status_code == 200:
        # Extract filename from Content-Disposition header if present
        filename = response.headers.get('Content-Disposition', '').split('filename=')[-1].strip('"')
        if not filename:
            filename = f"downloaded_file_{job_id}"  # Fallback filename

        # Save the file
        with open(filename, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192): 
                f.write(chunk)

        print(f"File downloaded successfully as {filename}")
    else:
        print(f"Failed to download file. Status code: {response.status_code}, Message: {response.text}")


  def analyze(self, baseurl):
    global FLAG
    if (not FLAG) :
        print("Please login as user first")
        return

    job_id = input("Enter the job ID for the file you want to analyze: ")
    url = f"{baseurl}/compute/{job_id}"

    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        print("Analysis results:")
        for key, value in data.items():
            print(f"{key}: {value}")
    else:
        print(f"Failed to analyze file. Status code: {response.status_code}, Message: {response.text}")






#########################################################################
# main
#
print('** Welcome to CourseHero **')
print()

# eliminate traceback so we just get error message:
sys.tracebacklimit = 0

#
# what config file should we use for this session?
#
config_file = 'CourseAPP-client-config.ini'

if not pathlib.Path(config_file).is_file():
  print("**ERROR: config file '", config_file, "' does not exist, exiting")
  sys.exit(0)

configur = ConfigParser()
configur.read(config_file)
baseurl = configur.get('client', 'webservice')

root = tk.Tk()
app = CourseAppGUI(root, baseurl)
root.mainloop()


print()
print('** done **')

















