FROM nvidia/cuda:12.4.1-devel-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV HF_HOME=/app/hf-cache

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    git \
    wget \
    curl \
    build-essential \
    cmake \
    libsndfile1 \
    libsndfile1-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Audar TTS source
RUN git clone https://github.com/AudarAI/Audar-TTS-V1.git /app/Audar-TTS-V1

# Python dependencies
COPY requirements.txt /app/requirements.txt
RUN python3 -m pip install --upgrade pip setuptools wheel
RUN python3 -m pip install --no-cache-dir -r /app/requirements.txt

# Build llama-cpp-python with NVIDIA CUDA support
ENV CMAKE_ARGS="-DGGML_CUDA=on"
ENV FORCE_CMAKE=1
RUN python3 -m pip install --no-cache-dir llama-cpp-python

# Download the exact synthetic voice we selected: demo_male_3
RUN wget -O /app/demo_male_3_source.wav \
    https://huggingface.co/audarai/Audar-TTS-V1-Flash/resolve/main/samples/demo_male_3_source.wav

COPY handler.py /app/handler.py

CMD ["python3", "-u", "/app/handler.py"]
