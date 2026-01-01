"""
Updated Docker diagnostic with image pulling
"""
import docker

print("Testing Docker connection...")

try:
    client = docker.from_env()
    print(f"✅ Connected to Docker")
    print(f"   API Version: {client.api.api_version}")
    print(f"   Server Version: {client.version()['Version']}")
    
    # Pull image first
    print("\nPulling python:3.10-slim image...")
    print("(This may take 30-60 seconds on first run)")
    
    try:
        client.images.get('python:3.10-slim')
        print("✅ Image already exists")
    except docker.errors.ImageNotFound:
        print("📥 Downloading image (120MB)...")
        image = client.images.pull('python:3.10-slim')
        print(f"✅ Downloaded: {image.tags}")
    
    # Test running a Python container
    print("\nTesting Python container...")
    result = client.containers.run(
        "python:3.10-slim",
        command="python -c 'print(\"Hello from Docker!\")'",
        remove=True,
        detach=False
    )
    print(f"✅ Container test successful!")
    print(f"   Output: {result.decode('utf-8').strip()}")
    
    print("\n🎉 Docker is fully working!")
    print("   Ready to run code submissions!")
    
except docker.errors.DockerException as e:
    print(f"❌ Docker Error: {e}")
except Exception as e:
    print(f"❌ General Error: {e}")
    import traceback
    traceback.print_exc()
