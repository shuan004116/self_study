"""Dispatcher Agent - intent classification and subject routing."""

import re
import json
from typing import Optional

from langchain_core.messages import HumanMessage, SystemMessage

from backend.config import settings
from backend.llm.llm_client import LLMClient
from backend.llm.prompts import SYSTEM_PROMPTS, DISPATCHER_EXTRACTION_PROMPT

# Keyword-based fast-path classification
SUBJECT_KEYWORDS: dict[str, list[str]] = {
    "数学": [
        "导数", "积分", "微积分", "矩阵", "向量", "概率", "统计",
        "线性代数", "高数", "极限", "函数", "方程", "微分", "傅里叶",
        "拉普拉斯", "梯度", "泰勒", "级数", "行列式", "特征值",
    ],
    "计算机": [
        "代码", "编程", "算法", "数据结构", "数据库", "网络",
        "tcp", "http", "排序", "搜索", "递归", "指针",
        "二叉树", "链表", "栈", "队列", "复杂度", "debug",
        "python", "java", "c++", "javascript", "前端", "后端",
        "api", "bug", "报错", "编译",
    ],
    "物理": [
        "力学", "电磁", "热力学", "量子", "相对论", "牛顿",
        "麦克斯韦", "薛定谔", "加速度", "力", "能量", "场",
        "速度", "质量", "电荷", "磁场", "光学", "波动",
    ],
    "人文": [
        "文学", "历史", "哲学", "诗歌", "小说", "鲁迅", "孔子",
        "红楼梦", "唐宋", "文言文", "文化", "艺术", "美学",
        "道德", "存在主义", "现代主义",
    ],
}

INTENT_KEYWORDS: dict[str, list[str]] = {
    "答疑": ["什么是", "解释", "为什么", "如何", "区别", "关系", "概念", "原理", "说明"],
    "出题": ["出题", "练习题", "考题", "题目", "测验", "练习", "出几道", "测试"],
    "规划": ["规划", "计划", "安排", "学习计划", "复习计划", "时间表", "schedule"],
    "总结": ["总结", "概括", "摘要", "归纳", "梳理", "提炼"],
    "代码": ["代码", "程序", "bug", "报错", "调试", "debug", "编译", "运行"],
}


class SubjectDetector:
    """Rule-based + LLM hybrid subject and intent detection."""

    def __init__(self):
        self.llm = LLMClient()

    def fast_classify_subject(self, message: str) -> Optional[str]:
        """Quick keyword-based subject classification."""
        msg_lower = message.lower()
        for subject, keywords in SUBJECT_KEYWORDS.items():
            for kw in keywords:
                if kw.lower() in msg_lower:
                    return subject
        return None

    def fast_classify_intent(self, message: str) -> Optional[str]:
        """Quick keyword-based intent classification."""
        msg_lower = message.lower()
        scores = {}
        for intent, keywords in INTENT_KEYWORDS.items():
            score = sum(1 for kw in keywords if kw.lower() in msg_lower)
            if score > 0:
                scores[intent] = score
        if scores:
            return max(scores, key=scores.get)
        # Default: if code-related keywords found
        if any(kw in msg_lower for kw in ["```", "def ", "class ", "function", "import "]):
            return "代码"
        return "答疑"  # Default intent

    async def llm_classify(self, message: str) -> dict:
        """Use LLM for classification when keyword-based fails."""
        system_msg = SystemMessage(content=SYSTEM_PROMPTS["dispatcher"])
        user_msg = HumanMessage(content=f"{DISPATCHER_EXTRACTION_PROMPT}\n\n用户问题: {message}")
        try:
            response = await self.llm.achat([system_msg, user_msg], role="dispatcher")
            # Try to parse JSON from response
            # Find JSON block
            json_match = re.search(r'\{[^}]+\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            # Fallback
            return {"intent": "答疑", "subject": "跨学科", "reasoning": "LLM分类失败，使用默认值"}
        except Exception:
            return {"intent": "答疑", "subject": "跨学科", "reasoning": "LLM分类异常，使用默认值"}

    async def classify(self, message: str) -> dict:
        """Two-stage classification: keyword then LLM."""
        subject = self.fast_classify_subject(message)
        intent = self.fast_classify_intent(message)

        # If both detected, return fast result
        if subject and intent:
            return {
                "intent": intent,
                "subject": subject,
                "reasoning": f"关键词匹配: subject={subject}, intent={intent}",
            }

        # Otherwise use LLM for better accuracy
        llm_result = await self.llm_classify(message)
        # Override with fast results if available
        if subject:
            llm_result["subject"] = subject
        if intent:
            llm_result["intent"] = intent
        return llm_result


class DispatcherAgent:
    """Main dispatcher that orchestrates multi-agent collaboration."""

    def __init__(self):
        self.detector = SubjectDetector()
        self.llm = LLMClient()

    async def process(self, message: str, context: str = "") -> dict:
        """Process user message and return classification + routing info."""
        classification = await self.detector.classify(message)
        return {
            "intent": classification["intent"],
            "subject": classification["subject"],
            "reasoning": classification.get("reasoning", ""),
        }

    async def assemble_response(
        self,
        user_message: str,
        agent_outputs: dict[str, str],
        classification: dict,
    ) -> str:
        """Assemble final response from multiple agent outputs."""
        subject = classification.get("subject", "跨学科")
        intent = classification.get("intent", "答疑")

        if len(agent_outputs) == 1:
            return list(agent_outputs.values())[0]

        parts = []
        if subject and intent:
            parts.append(f"【{subject} · {intent}】\n")

        for agent_name, output in agent_outputs.items():
            if output:
                parts.append(output)
                parts.append("\n---\n")

        return "\n".join(parts).strip()
