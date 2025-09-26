import psutil
import smtplib
import logging
import time
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# ====== CONFIG SETTINGS ======
CPU_THRESHOLD = 50     # percent
MEMORY_THRESHOLD = 50  # percent
CHECK_INTERVAL = 60    #1 minute 

# APP_PASSWORD="jljt szhs ojla jjrh"
APP_PASSWORD = "bfan xsiq mxik jyxj"  # Example app password, should be securely stored
EMAIL_FROM = "rkant48@gmail.com"
EMAIL_TO = "rkant48@gmail.com"
# EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")   # Get from environment variable
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

LOG_FILE = "server_monitor.log"

# ====== LOGGING SETUP ======
logging.basicConfig(filename=LOG_FILE,
                    level=logging.INFO,
                    format='%(asctime)s:%(levelname)s:%(message)s')


# ====== FUNCTION: Send Email ======
def send_email(subject, body):
    if not APP_PASSWORD:
        logging.error("EMAIL_PASSWORD is not set in environment variables.")
        return

    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_FROM
        msg['To'] = EMAIL_TO
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_FROM, APP_PASSWORD)
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
        body = (f"⚠️ High resource usage detected!\n\n"
                f"CPU Usage: {cpu}% (Limit: {CPU_THRESHOLD}%)\n"
                f"Memory Usage: {memory}% (Limit: {MEMORY_THRESHOLD}%)")
        send_email(subject, body)


# ====== LOOP: Run every 5 minutes ======
if __name__ == "__main__":
    logging.info("Monitoring started.")
    try:
        while True:
            check_system_resources()
            time.sleep(CHECK_INTERVAL)
    except KeyboardInterrupt:
        logging.info("Monitoring stopped by user.")
