from dotenv import load_dotenv
import os

load_dotenv()

MODEL_PATH = os.getenv("MODEL_PATH", "models/deepfake_model.pt")
DEBUG = os.getenv("DEBUG", "True") == "True"