
# Python Server Resource Monitoring and Email Alert System

This project is part of a basic DevOps course where we build practical tools using Python scripts. This project demonstrates how to **monitor CPU and memory usage** on a server or computer and send **email alerts** if usage crosses defined thresholds.

Monitoring CPU usage is one of the easiest ways to check if your computer or server is working normally or overloaded.

---

## Prerequisites

- **Python 3.x** installed (check with `python3 --version`)  
- **psutil library** (for monitoring system health)  
- **smtplib** (Python library to send emails via Gmail/SMTP)  
- **Gmail/SMTP account** (to send alerts to your inbox)

---

## Steps to Monitor CPU Resource Usage

This Python script helps you keep an eye on your server’s health and sends email alerts when CPU or memory usage gets too high.

### Step 1: Install psutil
Install the `psutil` library using pip:

```bash
pip install psutil
```

### Step 2: Create the Python Script
Create a new file called `resource_monitor.py` and paste the following code:

```python
import psutil
import smtplib
import logging
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# ====== CONFIG SETTINGS ======
CPU_THRESHOLD = 80     # percent
MEMORY_THRESHOLD = 75  # percent
CHECK_INTERVAL = 300   # seconds = 5 minutes

EMAIL_FROM = "your_email@gmail.com"
EMAIL_TO = "recipient_email@example.com"
EMAIL_PASSWORD = "your_app_password"
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

LOG_FILE = "server_monitor.log"

# ====== LOGGING SETUP ======
logging.basicConfig(filename=LOG_FILE,
                    level=logging.INFO,
                    format='%(asctime)s:%(levelname)s:%(message)s')

# ====== FUNCTION: Send Email ======
def send_email(subject, body):
    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_FROM
        msg['To'] = EMAIL_TO
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_FROM, EMAIL_PASSWORD)
        server.send_message(msg)
        server.quit()

        logging.info("Email alert sent.")
    except Exception as e:
        logging.error(f"Email failed: {e}")

# ====== FUNCTION: Check System Health ======
def check_system_resources():
    cpu = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory().percent

    logging.info(f"CPU: {cpu}%, Memory: {memory}%")

    if cpu > CPU_THRESHOLD or memory > MEMORY_THRESHOLD:
        subject = "Server Alert: High Usage"
        body = (f" High resource usage detected!\n\n"
                f"CPU Usage: {cpu}% (Limit: {CPU_THRESHOLD}%)\n"
                f"Memory Usage: {memory}% (Limit: {MEMORY_THRESHOLD}%)")
        send_email(subject, body)

# ====== LOOP: Run every 5 minutes ======
if __name__ == "__main__":
    logging.info("Monitoring started.")
    while True:
        check_system_resources()
        time.sleep(CHECK_INTERVAL)
```

### Step 3: Enable Gmail App Password
If using a Gmail account:

1. Go to [Google Account App Passwords](https://myaccount.google.com/apppasswords)  
2. Select **Mail** → **Other (Python Monitor)**  
3. Copy the 16-character app password  
4. Replace in your script:
```python
EMAIL_PASSWORD = "your_app_password"
```

> **Note:** Regular Gmail passwords won’t work due to security restrictions.

### Step 4: Run the Script
Navigate to the folder where your script is saved, then run:

```bash
python3 resource_monitor.py
```

**What happens:**
- CPU and memory are checked every 5 minutes  
- If thresholds are exceeded, an email alert is sent  
- Results are saved in `server_monitor.log`  

---

## How It Works

1. The script checks CPU and memory usage using the **psutil** library.  
2. CPU usage and RAM usage are captured as percentages.  
3. If values exceed set limits, an email alert is sent.  
4. Each check is logged in `server_monitor.log`.  
5. The process repeats every 5 minutes.

---

## Sample Email Alert

When thresholds are crossed, you will receive an email like:

```
Subject: Server Alert: High Usage

High resource usage detected!

CPU Usage: 82% (Limit: 80%)
Memory Usage: 78% (Limit: 75%)
```

---

## Conclusion

By building this Python-based **Server Resource Monitoring and Email Alert System**, you have:

- Learned to monitor CPU and memory usage in real time  
- Worked with Python libraries like `psutil`, `smtplib`, and `logging`  
- Implemented automatic email alerts to prevent server performance issues  

This project is a practical introduction to automating DevOps tasks using Python.

---
