import docker
import tarfile
import io
import time
from typing import Dict, Optional

class LanguageConfig:
    """Configuration for each supported language"""
    
    PYTHON = {
        'image': 'python:3.10-slim',
        'extension': '.py',
        'compile_command': None,  # Python is interpreted
        'run_command': 'python main.py',
        'starter_template': '''class Solution:
    def solve(self):
        # Your code here
        pass
'''
    }
    
    CPP = {
        'image': 'gcc:11',
        'extension': '.cpp',
        'compile_command': 'g++ -O2 -std=c++17 -o main main.cpp',
        'run_command': './main',
        'starter_template': '''#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    void solve() {
        // Your code here
    }
};
'''
    }
    
    C = {
        'image': 'gcc:11',
        'extension': '.c',
        'compile_command': 'gcc -O2 -std=c11 -o main main.c',
        'run_command': './main',
        'starter_template': '''#include <stdio.h>

int main() {
    // Your code here
    return 0;
}
'''
    }
    
    JAVA = {
        'image': 'openjdk:17-slim',
        'extension': '.java',
        'compile_command': 'javac Main.java',
        'run_command': 'java Main',
        'starter_template': '''public class Main {
    public static void main(String[] args) {
        // Your code here
    }
}
'''
    }
    
    @staticmethod
    def get_config(language: str) -> Optional[Dict]:
        """Get language configuration"""
        lang_map = {
            'python': LanguageConfig.PYTHON,
            'cpp': LanguageConfig.CPP,
            'c': LanguageConfig.C,
            'java': LanguageConfig.JAVA,
        }
        return lang_map.get(language.lower())


class DockerSandbox:
    """Secure Docker-based code execution sandbox"""
    
    def __init__(self):
        try:
            # Use from_env() without version forcing - let Docker auto-negotiate
            self.client = docker.from_env()
            self._ensure_images()
        except Exception as e:
            print(f"Docker initialization failed: {e}")
            self.client = None

    def _ensure_images(self):
        """Ensure all required Docker images are available"""
        required_images = [
            'python:3.10-slim',
            'gcc:11',
            'openjdk:17-slim'
        ]
        for image_name in required_images:
            try:
                self.client.images.get(image_name)
            except docker.errors.ImageNotFound:
                print(f"Pulling {image_name}...")
                try:
                    self.client.images.pull(image_name)
                except Exception as e:
                    print(f"Warning: Could not pull {image_name}: {e}")

    def execute(
        self, 
        code: str, 
        language: str, 
        test_input: str = "",
        time_limit_ms: int = 2000,
        memory_limit_mb: int = 256
    ) -> Dict[str, any]:
        """
        Execute code in a secure Docker container
        
        Args:
            code: User-submitted source code
            language: Programming language (python, cpp, c, java)
            test_input: Input data to pass to the program
            time_limit_ms: Execution time limit in milliseconds
            memory_limit_mb: Memory limit in MB
            
        Returns:
            Dict containing:
                - verdict: AC, WA, TLE, RE, CE, or ERROR
                - stdout: Program output
                - stderr: Error output
                - runtime_ms: Execution time
                - memory_kb: Memory used
        """
        if not self.client:
            return {
                "verdict": "ERROR",
                "stdout": "",
                "stderr": "Docker service unavailable",
                "runtime_ms": 0,
                "memory_kb": 0
            }

        config = LanguageConfig.get_config(language)
        if not config:
            return {
                "verdict": "ERROR",
                "stdout": "",
                "stderr": f"Unsupported language: {language}",
                "runtime_ms": 0,
                "memory_kb": 0
            }

        container = None
        start_time = time.time()
        
        try:
            # Create container
            container = self.client.containers.create(
                config['image'],
                command="sleep 300",  # Initial command, we'll exec later
                working_dir="/workspace",
                stdin_open=True,
                tty=False,
                network_mode="none",  # No internet access
                mem_limit=f"{memory_limit_mb}m",
                pids_limit=50,
                detach=True
            )
            
            # Prepare source file
            filename = f"main{config['extension']}"
            self._copy_to_container(container, f"/workspace/{filename}", code)
            
            # Copy input if provided
            if test_input:
                self._copy_to_container(container, "/workspace/input.txt", test_input)
            
            # Start container
            container.start()
            
            # Compilation phase (if needed)
            if config['compile_command']:
                compile_result = self._exec_in_container(
                    container,
                    config['compile_command'],
                    timeout=10
                )
                
                if compile_result['exit_code'] != 0:
                    compile_time = int((time.time() - start_time) * 1000)
                    container.remove(force=True)
                    return {
                        "verdict": "CE",  # Compilation Error
                        "stdout": compile_result['stdout'],
                        "stderr": compile_result['stderr'],
                        "runtime_ms": compile_time,
                        "memory_kb": 0
                    }
            
            # Execution phase
            exec_start = time.time()
            run_command = f"{config['run_command']} < input.txt" if test_input else config['run_command']
            
            exec_result = self._exec_in_container(
                container,
                f"sh -c '{run_command}'",
                timeout=time_limit_ms / 1000.0
            )
            
            exec_time = int((time.time() - exec_start) * 1000)
            
            # Determine verdict
            if exec_result['timed_out']:
                verdict = "TLE"  # Time Limit Exceeded
            elif exec_result['exit_code'] != 0:
                verdict = "RE"  # Runtime Error
            else:
                verdict = "AC"  # Accepted (but needs output comparison)
            
            # Get container stats for memory usage
            stats = container.stats(stream=False)
            memory_kb = stats['memory_stats'].get('usage', 0) // 1024
            
            container.remove(force=True)
            
            return {
                "verdict": verdict,
                "stdout": exec_result['stdout'],
                "stderr": exec_result['stderr'],
                "runtime_ms": exec_time,
                "memory_kb": memory_kb
            }
            
        except docker.errors.ContainerError as e:
            if container:
                container.remove(force=True)
            return {
                "verdict": "RE",
                "stdout": "",
                "stderr": str(e),
                "runtime_ms": int((time.time() - start_time) * 1000),
                "memory_kb": 0
            }
            
        except Exception as e:
            if container:
                try:
                    container.remove(force=True)
                except:
                    pass
            return {
                "verdict": "ERROR",
                "stdout": "",
                "stderr": f"System error: {str(e)}",
                "runtime_ms": 0,
                "memory_kb": 0
            }

    def _exec_in_container(self, container, command: str, timeout: float = 5.0) -> Dict:
        """Execute command in container with timeout"""
        try:
            exec_instance = container.exec_run(
                command,
                demux=True,
                stdin=True,
                tty=False
            )
            
            # Wait with timeout
            start = time.time()
            while container.status == 'running' and (time.time() - start) < timeout:
                time.sleep(0.1)
            
            timed_out = (time.time() - start) >= timeout
            
            stdout = exec_instance.output[0].decode('utf-8') if exec_instance.output[0] else ""
            stderr = exec_instance.output[1].decode('utf-8') if exec_instance.output[1] else ""
            
            return {
                'exit_code': exec_instance.exit_code,
                'stdout': stdout,
                'stderr': stderr,
                'timed_out': timed_out
            }
            
        except Exception as e:
            return {
                'exit_code': -1,
                'stdout': "",
                'stderr': str(e),
                'timed_out': False
            }

    def _copy_to_container(self, container, path: str, content: str):
        """Copy content to container as a file"""
        tar_stream = io.BytesIO()
        with tarfile.open(fileobj=tar_stream, mode='w') as tar:
            encoded_content = content.encode('utf-8')
            filename = path.split('/')[-1]
            tar_info = tarfile.TarInfo(name=filename)
            tar_info.size = len(encoded_content)
            tar_info.mode = 0o644
            tar.addfile(tar_info, io.BytesIO(encoded_content))
        
        tar_stream.seek(0)
        directory = path.rsplit('/', 1)[0] or '/'
        container.put_archive(path=directory, data=tar_stream)
