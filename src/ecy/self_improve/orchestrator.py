import asyncio
import logging
from datetime import datetime
from ecy.intelligence.debate import DebateCoordinator
from ecy.self_improve.feedback_loop import FeedbackLoop
from ecy.memory.supabase_client import create_improvement_cycle, log_patch

logger = logging.getLogger(__name__)

class Orchestrator:
    """Service that periodically runs a debate cycle, processes the verdict,
    generates code improvements, and applies them.
    """

    def __init__(self, interval_seconds: int = 3600):
        self.interval = interval_seconds
        self.debate = DebateCoordinator()
        self.feedback = FeedbackLoop()
        self._task: asyncio.Task | None = None

    async def _run_cycle(self):
        """Execute one full improvement cycle.
        1. Trigger a debate on a system‑wide topic.
        2. Store cycle metadata in Supabase.
        3. Feed the verdict to the feedback loop which may generate a patch.
        4. Apply the patch via healer_v2 and record the result.
        """
        topic = "How can eCy OS improve its performance and developer experience?"
        logger.info("Starting debate cycle for topic: %s", topic)
        verdict = await self.debate.run_debate(topic)
        cycle_id = await create_improvement_cycle(topic, datetime.utcnow().isoformat())
        logger.info("Debate verdict received, cycle id %s", cycle_id)
        patch = await self.feedback.process_verdict(verdict)
        if patch:
            # Apply patch using existing healer_v2 logic (assumed to be async function)
            from ecy.healer_v2 import apply_patch
            success = await apply_patch(patch)
            await log_patch(cycle_id, patch, success)
            logger.info("Patch applied: %s, success=%s", patch[:30], success)
        else:
            logger.info("No actionable patch generated for this cycle.")

    async def _scheduler(self):
        while True:
            try:
                await self._run_cycle()
            except Exception as e:
                logger.exception("Improvement cycle failed: %s", e)
            await asyncio.sleep(self.interval)

    def start(self):
        if self._task is None:
            self._task = asyncio.create_task(self._scheduler())
            logger.info("Orchestrator started with interval %s seconds", self.interval)

    def stop(self):
        if self._task:
            self._task.cancel()
            self._task = None
            logger.info("Orchestrator stopped")
