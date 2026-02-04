# src/ecy/senses/bci.py
"""Bio‑Digital Interface (BCI) module.

Provides a minimal wrapper around the *brainflow* library for OpenBCI devices.
If the library or hardware is unavailable, the module falls back to a mock
implementation that records data in‑memory. This mirrors the pattern used for the
Sonic and Vision modules.
"""

from __future__ import annotations

import os
from typing import List, Tuple, Any

# Attempt to import the real brainflow library. If unavailable, use a mock.
try:
    from brainflow.board_shim import BoardShim, BrainFlowInputParams, BoardIds
    _HAS_BRAINFLOW = True
except Exception:  # pragma: no cover – import may fail on systems without hardware
    _HAS_BRAINFLOW = False


class BCI:
    """Simple BCI interface.

    The class abstracts the acquisition of EEG data. In *real* mode it uses
    ``brainflow`` to stream data from an OpenBCI board. In *mock* mode it
    generates synthetic sine‑wave data.
    """

    def __init__(self, board_id: int = BoardIds.CYTON_BOARD.value if _HAS_BRAINFLOW else -1):
        self.board_id = board_id
        self.mock_mode = not _HAS_BRAINFLOW
        self._board: Any = None
        self._data: List[Tuple[float, List[float]]] = []  # (timestamp, samples)

    def start(self, duration_sec: int = 2) -> None:
        """Start data acquisition for *duration_sec* seconds.

        In mock mode synthetic data is generated; otherwise the board streams real
        samples.
        """
        if self.mock_mode:
            self._generate_mock_data(duration_sec)
        else:
            params = BrainFlowInputParams()
            self._board = BoardShim(self.board_id, params)
            self._board.prepare_session()
            self._board.start_stream()
            # Sleep for the required duration – using a simple loop to avoid
            # importing ``time`` at module level (keeps import side‑effects low).
            import time
            time.sleep(duration_sec)
            self._board.stop_stream()
            self._data = self._board.get_board_data().tolist()
            self._board.release_session()

    def _generate_mock_data(self, duration_sec: int) -> None:
        """Create deterministic synthetic data for testing.

        Generates a sine wave for each channel at 10 Hz sampled at 250 Hz.
        """
        import math
        sample_rate = 250
        total_samples = duration_sec * sample_rate
        for i in range(total_samples):
            t = i / sample_rate
            # Example with three channels
            samples = [math.sin(2 * math.pi * 10 * t) for _ in range(3)]
            self._data.append((t, samples))

    def get_data(self) -> List[Tuple[float, List[float]]]:
        """Return the collected data as a list of ``(timestamp, samples)``.
        """
        return self._data

    def __repr__(self) -> str:
        mode = "Mock" if self.mock_mode else "Real"
        return f"<BCI mode={mode} board_id={self.board_id}>"
