import docker
import tarfile
import io
import time
import requests
from typing import Dict, Optional

class LanguageConfig:
    # ... (rest of LanguageConfig remains the same, assuming it's above this block, but I need to include imports here)
    """Configuration for each supported language"""
    
    PYTHON = {
        'image': 'python:3.10-slim',
        'extension': '.py',
        'compile_command': None,  # Python is interpreted
        'run_command': 'python -u main.py',
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
    
    
    @staticmethod
    def get_config(language: str) -> Optional[Dict]:
        """Get language configuration"""
        lang_map = {
            'python': LanguageConfig.PYTHON,
            'cpp': LanguageConfig.CPP,
        }
        return lang_map.get(language.lower())


class DockerSandbox:
    """
    Secure Docker-based code execution sandbox.
    Falls back to Piston API if Docker is not available (e.g. on Render).
    """
    
    def __init__(self):
        self.init_error = None
        self.client = None
        
        # Method 1: Standard from_env
        try:
            self.client = docker.from_env()
            self.client.ping()
            self._ensure_images()
            return
        except Exception as e:
            print(f"Standard Docker connection failed: {e}")
            self.init_error = str(e)
            self.client = None
            
        # Method 2: Explicit Windows Named Pipe
        if not self.client:
            try:
                print("Attempting to connect via Windows Named Pipe...")
                self.client = docker.DockerClient(base_url='npipe:////./pipe/docker_engine')
                self.client.ping()
                print("Connected via Windows Named Pipe")
                self.init_error = None
                self._ensure_images()
                return
            except Exception as e:
                print(f"Windows Pipe connection failed: {e}")
                self.init_error = f"{self.init_error} | Pipe Error: {str(e)}"
                self.client = None

        # Method 3: TCP Fallback
        if not self.client:
            try:
                print("Attempting to connect via TCP...")
                self.client = docker.DockerClient(base_url='tcp://localhost:2375')
                self.client.ping()
                print("Connected via TCP")
                self.init_error = None
                self._ensure_images()
                return
            except Exception as e:
                print(f"TCP connection failed: {e}")
                # Don't overwrite previous errors, just append or leave detailed one
                self.client = None
        
        if not self.client:
            print("⚠️ Docker unavailable. Falling back to Piston API for execution.")

    def _ensure_images(self):
        """Ensure all required Docker images are available"""
        if not self.client: return
        
        required_images = [
            'python:3.10-slim',
            'gcc:11',
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
        Execute code using Docker if available, otherwise Piston API
        """
        # Fallback to Piston if no Docker client
        if not self.client:
            return self._execute_piston(code, language, test_input)

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
            # Java requires specific class name, others use main + extension
            if 'filename' in config:
                filename = config['filename']
            else:
                filename = f"main{config['extension']}"
            self._copy_to_container(container, f"/workspace/{filename}", code)
            
            # Always create input.txt (empty if no input provided)
            self._copy_to_container(container, "/workspace/input.txt", test_input or "")
            
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
            # Always use input redirection for consistency
            run_command = f"{config['run_command']} < input.txt"
            
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
            try:
                stats = container.stats(stream=False)
                memory_kb = stats.get('memory_stats', {}).get('usage', 0) // 1024
            except:
                memory_kb = 0
            
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

    def _execute_piston(self, code: str, language: str, test_input: str) -> Dict[str, any]:
        """Execute code using Piston API (Fallback for Render)"""
        # Map languages to Piston runtime names
        # Piston v2: python, c++, etc.
        piston_lang_map = {
            'python': 'python',
            'cpp': 'c++',
            'c': 'c',
            'java': 'java'
        }
        
        target_lang = piston_lang_map.get(language, language)
        version = '*' # Use latest available
        
        payload = {
            "language": target_lang,
            "version": version,
            "files": [
                {
                    "content": code
                }
            ],
            "stdin": test_input,
            "run_timeout": 3000,
            "compile_timeout": 10000
        }
        
        try:
            start_time = time.time()
            response = requests.post(
                'https://emkc.org/api/v2/piston/execute', 
                json=payload,
                timeout=10
            )
            response.raise_for_status()
            result = response.json()
            
            run_stage = result.get('run', {})
            compile_stage = result.get('compile', {})
            
            # Check for compilation error
            if compile_stage and compile_stage.get('code', 0) != 0:
                return {
                    "verdict": "CE",
                    "stdout": compile_stage.get('stdout', ''),
                    "stderr": compile_stage.get('stderr', ''),
                    "runtime_ms": 0,
                    "memory_kb": 0
                }
            
            stdout = run_stage.get('stdout', '')
            stderr = run_stage.get('stderr', '')
            exit_code = run_stage.get('code', 0)
            
            # Piston doesn't give precise user time, estimating
            runtime_ms = int((time.time() - start_time) * 1000)
            
            if exit_code != 0:
                verdict = "RE"
            else:
                verdict = "AC"
                
            return {
                "verdict": verdict,
                "stdout": stdout,
                "stderr": stderr,
                "runtime_ms": runtime_ms,
                "memory_kb": 0  # Piston doesn't easily return memory usage
            }
            
        except Exception as e:
            return {
                "verdict": "ERROR",
                "stdout": "",
                "stderr": f"Piston Execution Error: {str(e)}",
                "runtime_ms": 0,
                "memory_kb": 0
            }

    def _exec_in_container(self, container, command: str, timeout: float = 5.0) -> Dict:
        """Execute command in container with timeout"""
        import threading
        
        result = {
            'exit_code': -1,
            'stdout': "",
            'stderr': "",
            'timed_out': False
        }
        
        def run_exec():
            try:
                exec_instance = container.exec_run(
                    command,
                    demux=True,
                    stdin=False,
                    tty=False
                )
                
                # Parse output
                stdout = exec_instance.output[0].decode('utf-8', errors='ignore') if exec_instance.output[0] else ""
                stderr = exec_instance.output[1].decode('utf-8', errors='ignore') if exec_instance.output[1] else ""
                
                result['exit_code'] = exec_instance.exit_code
                result['stdout'] = stdout
                result['stderr'] = stderr
            except Exception as e:
                result['exit_code'] = -1
                result['stderr'] = str(e)
        
        # Run execution in thread with timeout
        thread = threading.Thread(target=run_exec)
        thread.daemon = True
        thread.start()
        thread.join(timeout=timeout)
        
        if thread.is_alive():
            # Timeout occurred
            result['timed_out'] = True
            try:
                container.kill()
            except:
                pass
        
        return result

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
