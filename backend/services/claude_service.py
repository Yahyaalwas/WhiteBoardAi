import anthropic
import json
import base64
import logging
from typing import Optional
from ai.prompts import WHITEBOARD_ANALYSIS_PROMPT, OCR_ENHANCEMENT_PROMPT
from models.schemas import AnalysisResult, Task, FlowchartData, Contributor, FlowNode, FlowEdge
import uuid

logger = logging.getLogger(__name__)


class ClaudeService:
    def __init__(self, api_key: str):
        self.client = anthropic.Anthropic(api_key=api_key)
        self.model = "claude-opus-4-7"

    async def analyze_whiteboard(
        self,
        image_bytes: bytes,
        image_media_type: str = "image/jpeg",
        session_id: str = "",
    ) -> AnalysisResult:
        """Send whiteboard image to Claude for full analysis."""
        try:
            image_b64 = base64.standard_b64encode(image_bytes).decode("utf-8")

            message = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": image_media_type,
                                    "data": image_b64,
                                },
                            },
                            {
                                "type": "text",
                                "text": WHITEBOARD_ANALYSIS_PROMPT,
                            },
                        ],
                    }
                ],
            )

            response_text = message.content[0].text
            return self._parse_analysis_response(response_text, session_id)

        except anthropic.APIError as e:
            logger.error(f"Claude API error: {e}")
            raise
        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            raise

    def _parse_analysis_response(self, response_text: str, session_id: str) -> AnalysisResult:
        """Parse Claude's JSON response into AnalysisResult."""
        try:
            # Strip markdown code blocks if present
            text = response_text.strip()
            if text.startswith("```"):
                lines = text.split("\n")
                text = "\n".join(lines[1:-1]) if lines[-1] == "```" else "\n".join(lines[1:])

            data = json.loads(text)

            # Parse tasks
            tasks = []
            for t in data.get("tasks", []):
                tasks.append(Task(
                    id=str(uuid.uuid4()),
                    title=t.get("title", ""),
                    owner=t.get("owner"),
                    priority=t.get("priority", "medium"),
                    deadline=t.get("deadline"),
                    status=t.get("status", "todo"),
                ))

            # Parse flowchart
            flowchart = None
            fc_data = data.get("flowchart")
            if fc_data:
                nodes = [FlowNode(id=n["id"], label=n["label"], type=n.get("type", "process"))
                         for n in fc_data.get("nodes", [])]
                edges = [FlowEdge(**{"from": e["from"], "to": e["to"], "label": e.get("label")})
                         for e in fc_data.get("edges", [])]
                flowchart = FlowchartData(
                    mermaid=fc_data.get("mermaid"),
                    nodes=nodes or None,
                    edges=edges or None,
                )

            # Parse contributors
            contributor_colors = [
                "from-violet-500 to-purple-600",
                "from-blue-500 to-cyan-600",
                "from-emerald-500 to-teal-600",
                "from-rose-500 to-pink-600",
            ]
            contributors = []
            for i, c in enumerate(data.get("contributors", [])):
                contributors.append(Contributor(
                    id=str(uuid.uuid4()),
                    label=c.get("label", f"Contributor {chr(65+i)}"),
                    handwriting_style=c.get("handwriting_style"),
                    items=c.get("items", []),
                    color=contributor_colors[i % len(contributor_colors)],
                ))

            return AnalysisResult(
                id=session_id or str(uuid.uuid4()),
                status="complete",
                summary=data.get("summary"),
                decisions=data.get("decisions", []),
                risks=data.get("risks", []),
                blockers=data.get("blockers", []),
                dependencies=data.get("dependencies", []),
                tasks=tasks,
                flowchart=flowchart,
                contributors=contributors,
                language_detected=data.get("language_detected", ["English"]),
            )

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Claude response as JSON: {e}\nResponse: {response_text[:500]}")
            return AnalysisResult(
                id=session_id or str(uuid.uuid4()),
                status="error",
                error_message="Failed to parse AI response",
                summary="Analysis completed but response could not be parsed.",
            )

    async def enhance_ocr_text(self, raw_text: str) -> str:
        """Use Claude to clean up and enhance OCR output."""
        try:
            message = self.client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=2048,
                messages=[
                    {
                        "role": "user",
                        "content": OCR_ENHANCEMENT_PROMPT.format(raw_text=raw_text),
                    }
                ],
            )
            return message.content[0].text
        except Exception as e:
            logger.warning(f"OCR enhancement failed: {e}")
            return raw_text
