import os
import whisper
import sys

# Load the Whisper model
model = whisper.load_model("base")

# Function to format timestamps for VTT
def format_timestamp(seconds):
    millis = int(seconds * 1000)
    hours, millis = divmod(millis, 3600000)
    minutes, millis = divmod(millis, 60000)
    seconds, millis = divmod(millis, 1000)
    return f"{hours:02}:{minutes:02}:{seconds:02}.{millis:03}"

# Function to extract audio from video file using FFmpeg
def extract_audio(video_file):
    audio_file = "audio.mp3"
    os.system(f"ffmpeg -i \"{video_file}\" -q:a 0 -map a {audio_file}")
    return audio_file

# Main function to generate subtitles
def generate_subtitles(video_file):
    subtitles_file = os.path.splitext(video_file)[0] + ".vtt"
    
    # Check if subtitles file already exists
    if os.path.exists(subtitles_file):
        print(f"{subtitles_file} already exists. Exiting without overwriting the existing .vtt file.")
        return
    
    audio_file = extract_audio(video_file)
    result = model.transcribe(audio_file)
    
    with open(subtitles_file, "w") as f:
        f.write("WEBVTT\n\n")
        for i, segment in enumerate(result["segments"]):
            start = segment["start"]
            end = segment["end"]
            text = segment["text"]
            start_time = format_timestamp(start)
            end_time = format_timestamp(end)
            f.write(f"{i + 1}\n")
            f.write(f"{start_time} --> {end_time}\n")
            f.write(f"{text}\n\n")
    
    # Remove the temporary audio file
    os.remove(audio_file)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python generate_vtt.py input_video_file")
        sys.exit(1)
    input_video_file = sys.argv[1]
    generate_subtitles(input_video_file)

