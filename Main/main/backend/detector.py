try:
    from utils.preprocessing import preprocess_frames
    from utils.inference import run_model
except ImportError:
    from .utils.preprocessing import preprocess_frames
    from .utils.inference import run_model


def detect_deepfake(frames, metadata):
    processed = preprocess_frames(frames)
    return run_model(processed, metadata)