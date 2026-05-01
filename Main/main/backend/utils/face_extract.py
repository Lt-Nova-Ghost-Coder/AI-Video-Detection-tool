import cv2


def extract_face(frame):
    
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades +
        'haarcascade_frontalface_default.xml'
    )

    gray=cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2GRAY
    )

    faces=face_cascade.detectMultiScale(
        gray,
        1.1,
        4
    )

    if len(faces)==0:
        return None

    x,y,w,h=faces[0]

    face=frame[y:y+h,x:x+w]

    face=cv2.resize(
        face,
        (224,224)
    )

    return face