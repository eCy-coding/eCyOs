
import os
import yaml
from pathlib import Path

class SessionManager:
    def __init__(self, profiles_path=None):
        if profiles_path:
            self.profiles_path = Path(profiles_path)
        else:
            self.profiles_path = Path(__file__).parent / "profiles.yaml"
            
    def load_profiles(self):
        if not self.profiles_path.exists():
            return {}
        with open(self.profiles_path, "r") as f:
            return yaml.safe_load(f)
            
    def load_profile(self, name):
        profiles = self.load_profiles()
        return profiles.get(name, {})
