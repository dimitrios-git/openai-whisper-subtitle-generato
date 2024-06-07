import os
import time
from flask import Flask, request, send_from_directory, jsonify
from werkzeug.utils import secure_filename
import subprocess
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Helper function to list uploaded files
def list_uploaded_files():
    files = os.listdir(app.config['UPLOAD_FOLDER'])
    video_files = [f for f in files if f.endswith(('.mp4', '.MP4', '.webm', '.WEBM', '.mkv', '.MKV', '.mov', '.MOV'))]
    subtitle_files = [f for f in files if f.endswith(('.vtt', '.VTT'))]
    return {'videos': video_files, 'subtitles': subtitle_files}


# Helper function to generate VTT subtitle
# Helper function to generate VTT subtitle
def generate_vtt(video_file):
    try:
        subprocess.run(["python3", "generate_vtt.py", video_file], check=True)
        subtitle_file = os.path.splitext(video_file)[0] + ".vtt"

        return subtitle_file
    except subprocess.CalledProcessError as e:
        # Print the error message if the subprocess fails
        print("Error:", e)
        return None
    except Exception as e:
        # Print any other exceptions that occur
        print("Error:", e)
        return None


# Route to handle file upload
@app.route('/upload', methods=['POST'])
def upload_file():
    # Code for uploading file...
    pass

# Route to get list of uploaded files
@app.route('/uploads', methods=['GET'])
def get_uploaded_files():
    return jsonify({'files': list_uploaded_files()})

# Route to serve video files
@app.route('/videos/<path:filename>', methods=['GET'])
def serve_video(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Route to serve subtitle files
@app.route('/subtitles/<path:filename>', methods=['GET'])
def serve_subtitle(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Route to delete video files
@app.route('/videos/<path:filename>', methods=['DELETE'])
def delete_video(filename):
    try:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        os.remove(file_path)
        return jsonify({'message': 'File deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# Route to generate subtitle for a video file
@app.route('/generate-subtitle/<path:filename>', methods=['POST'])
def generate_subtitle(filename):
    try:
        # Construct the full path to the video file
        video_file = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Call the generate_vtt function to generate subtitles for the specified video file
        print("Generating subtitle for", video_file)
        subtitle_file = generate_vtt(video_file)
        print("Subtitle file:", subtitle_file)
        
        if subtitle_file and os.path.exists(subtitle_file):
            print("Subtitle generated successfully")
            return send_from_directory(app.config['UPLOAD_FOLDER'], os.path.basename(subtitle_file), as_attachment=True)
        else:
            return jsonify({'error': 'Failed to generate subtitle'}), 500
    except Exception as e:
        print("Exception during subtitle generation:", e)
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)

