FROM nvidia/cuda:12.4.1-devel-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV HF_HOME=/app/hf-cache
ENV CMAKE_ARGS="-DGGML_CUDA=on"
ENV FORCE_CMAKE=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-dev \
    git \
    wget \
    build-essential \
    cmake \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN git clone --depth 1 https://github.com/AudarAI/Audar-TTS-V1.git /app/Audar-TTS-V1

RUN sed -i 's/\.cpu()\.numpy()\[0, 0, :\]/.detach().cpu().numpy()[0, 0, :]/' /app/Audar-TTS-V1/examples/synthesize_gguf.py

COPY requirements.txt /app/requirements.txt

RUN python3 -m pip install --no-cache-dir --upgrade pip setuptools wheel && \
    python3 -m pip install --no-cache-dir -r /app/requirements.txt && \
    python3 -m pip install --no-cache-dir llama-cpp-python && \
    rm -rf /root/.cache/pip

RUN wget -q -O /app/demo_male_3_source.wav \
    https://huggingface.co/audarai/Audar-TTS-V1-Flash/resolve/main/samples/demo_male_3_source.wav

COPY handler.py /app/handler.py

CMD ["python3", "-u", "/app/handler.py"]
