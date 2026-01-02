
import docker
import tarfile
import io
import time
import sys

def debug_sandbox():
    print("🚀 Starting Deep Sandbox Debug...")
    
    try:
        client = docker.from_env()
        image = 'python:3.10-slim'
        
        print(f"🐳 Creating container with {image}...")
        container = client.containers.create(
            image,
            command="sleep 300",
            working_dir="/workspace",
            detach=True,
            mem_limit="256m"
        )
        container.start()
        print(f"📦 Container started: {container.short_id}")

        # 1. Create Input File
        input_content = "10\n20"
        print(f"📝 Writing input.txt: {repr(input_content)}")
        
        tar_stream = io.BytesIO()
        with tarfile.open(fileobj=tar_stream, mode='w') as tar:
            data = input_content.encode('utf-8')
            info = tarfile.TarInfo(name='input.txt')
            info.size = len(data)
            tar.addfile(info, io.BytesIO(data))
        tar_stream.seek(0)
        container.put_archive('/workspace', tar_stream)

        # 2. Verify Input File inside container
        print("🔍 Verifying input.txt inside container...")
        exit_code, output = container.exec_run("cat input.txt")
        print(f"   [cat input.txt] Exit: {exit_code}, Output: {repr(output)}")
        
        if output.decode().strip() != input_content.strip():
            print("❌ Input file content mismatch!")
        else:
            print("✅ Input file verified.")

        # 3. Create Python Script
        script_content = """
import sys
print("--- SCRIPT START ---")
try:
    data = sys.stdin.read()
    print(f"Read {len(data)} chars")
    print(f"Content: {repr(data)}")
except Exception as e:
    print(f"Error: {e}")
print("--- SCRIPT END ---")
"""
        print("📝 Writing main.py...")
        tar_stream = io.BytesIO()
        with tarfile.open(fileobj=tar_stream, mode='w') as tar:
            data = script_content.encode('utf-8')
            info = tarfile.TarInfo(name='main.py')
            info.size = len(data)
            tar.addfile(info, io.BytesIO(data))
        tar_stream.seek(0)
        container.put_archive('/workspace', tar_stream)

        # 4. Execute Script
        cmd = "sh -c 'python -u main.py < input.txt'"
        print(f"▶️ Executing: {cmd}")
        
        exec_instance = container.exec_run(
            cmd,
            demux=True  # Split stdout/stderr
        )
        
        stdout = exec_instance.output[0]
        stderr = exec_instance.output[1]
        
        print(f"🏁 Execution finished. Exit Code: {exec_instance.exit_code}")
        print(f"   STDOUT: {repr(stdout)}")
        print(f"   STDERR: {repr(stderr)}")

        if stdout and b"--- SCRIPT END ---" in stdout:
            print("✅ Sandbox execution successful!")
        else:
            print("❌ Sandbox execution failed to produce expected output.")

    except Exception as e:
        print(f"❌ CRITICAL ERROR: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        if 'container' in locals():
            print("🧹 Cleaning up container...")
            container.remove(force=True)

if __name__ == "__main__":
    debug_sandbox()
