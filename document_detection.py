import sys
import cv2
import numpy as np

def detect_document_boundary(image_path):
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 100, 200)
    contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)

    if contours:
        largest_contour = contours[0]
        bounding_rect = cv2.boundingRect(largest_contour)
        x, y, w, h = bounding_rect
        cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)

        result_image_path = 'result_with_boundary.png'
        cv2.imwrite(result_image_path, image)
        return result_image_path

    return None

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python document_detection.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]
    result_image_path = detect_document_boundary(image_path)
    if result_image_path:
        print(result_image_path)
    else:
        print("No document boundary detected")
