import runpod
import subprocess
import tempfile
import base64
import os

AUDAR_DIR = "/app/Audar-TTS-V1"
REF_WAV = "/app/demo_male_3_source.wav"

# النص المطابق لملف demo_male_3 المرجعي
REF_TEXT = os.environ.get("AUDAR_REF_TEXT", "")


def handler(job):
    job_input = job.get("input", {})
    text = job_input.get("text", "").strip()

    if not text:
        return {"error": "No text provided"}

    if not REF_TEXT:
        return {"error": "AUDAR_REF_TEXT is not configured"}

    with tempfile.TemporaryDirectory() as temp_dir:
        output_file = os.path.join(temp_dir, "output.wav")

        cmd = [
            "python3",
            os.path.join(AUDAR_DIR, "examples", "synthesize_gguf.py"),
            text,
            "--ref", REF_WAV,
            "--ref-text", REF_TEXT,
            "--tier", "turbo",
            "--gpu-layers", "-1",
            "--out", output_file,
        ]

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=600
        )

        if result.returncode != 0:
            return {
                "error": "Audar generation failed",
                "details": result.stderr[-4000:]
            }

        if not os.path.exists(output_file):
            return {"error": "Output WAV was not created"}

        with open(output_file, "rb") as audio_file:
            audio_base64 = base64.b64encode(audio_file.read()).decode("utf-8")

        return {
            "audio_base64": audio_base64,
            "format": "wav",
            "sample_rate": 24000,
            "voice": "demo_male_3"
        }


runpod.serverless.start({"handler": handler})
