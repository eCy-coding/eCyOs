
import time
import sys
import os
import statistics

# Add src to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../src")))

def benchmark_imports():
    start = time.perf_counter()
    import ecy.main
    import ecy.ui.prompt
    import ecy.session_manager
    end = time.perf_counter()
    return (end - start) * 1000

def benchmark_profile_load():
    from ecy.session_manager import SessionManager
    times = []
    mgr = SessionManager()
    for _ in range(100):
        start = time.perf_counter()
        mgr.load_profile("default")
        end = time.perf_counter()
        times.append((end - start) * 1000)
    return statistics.mean(times)

def benchmark_macro_resolution():
    from ecy.macro import MacroManager
    # Create dummy rc
    with open(".ecyrc_bench", "w") as f:
        for i in range(100):
            f.write(f"alias cmd{i}='echo test {i}'\n")
    
    mgr = MacroManager(rc_path=".ecyrc_bench")
    times = []
    for _ in range(100):
        start = time.perf_counter()
        mgr.resolve_alias("cmd50")
        end = time.perf_counter()
        times.append((end - start) * 1000)
    
    os.remove(".ecyrc_bench")
    return statistics.mean(times)

def main():
    print("--- eCy OS Benchmark ---")
    
    import_time = benchmark_imports()
    print(f"Import Time: {import_time:.2f} ms")
    
    profile_time = benchmark_profile_load()
    print(f"Profile Load (Avg): {profile_time:.4f} ms")
    
    macro_time = benchmark_macro_resolution()
    print(f"Macro Resolution (Avg): {macro_time:.4f} ms")

if __name__ == "__main__":
    main()
