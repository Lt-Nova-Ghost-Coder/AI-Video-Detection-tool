import base64
import cv2
import numpy as np


def decode_base64_image(base64_string):
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]

    image_bytes = base64.b64decode(base64_string)

    np_arr = np.frombuffer(image_bytes, np.uint8)

    image = cv2.imdecode(
        np_arr,
        cv2.IMREAD_COLOR
    )

    return image


def preprocess_frames(frames):
    processed = []
    for frame in frames:
        image = decode_base64_image(frame["dataUrl"])
        if image is None:
            continue
        processed.append(
            {
                "index": frame["index"],
                "time": frame["time"],
                "image": image,
            }
        )
    return processed