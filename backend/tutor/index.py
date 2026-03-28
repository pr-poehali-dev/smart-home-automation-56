"""
AI-тьютор английского языка: генерирует задания и оценивает ответы через OpenAI GPT-4o.
Поддерживает 4 части сессии: грамматика, упражнения, письмо, чтение.
"""
import json
import os
from openai import OpenAI

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
}


def handler(event: dict, context) -> dict:
    """Генерация заданий и оценка ответов AI-тьютора английского A2-B1."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    body = json.loads(event.get("body") or "{}")
    action = body.get("action")

    if action == "generate_session":
        return generate_session()
    elif action == "evaluate_grammar":
        return evaluate_grammar(body.get("answers", []), body.get("questions", []))
    elif action == "evaluate_fill":
        return evaluate_fill(body.get("answers", []), body.get("exercises", []))
    elif action == "evaluate_writing":
        return evaluate_writing(body.get("text", ""), body.get("prompt", ""))
    else:
        return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Unknown action"})}


def generate_session() -> dict:
    """Генерирует полную сессию: 5 вопросов грамматики, 3 упражнения, задание на письмо, ссылку на чтение."""
    prompt = """Generate a complete English learning session for A2-B1 level. Return ONLY valid JSON, no markdown.

{
  "grammar": {
    "questions": [
      {
        "id": 1,
        "question": "She ___ to the store every day.",
        "options": ["go", "goes", "went", "gone"],
        "correct": 1,
        "explanation": "We use third person singular -s with 'she' in Present Simple."
      }
    ]
  },
  "fill": {
    "exercises": [
      {
        "id": 1,
        "sentence": "I ___ (go) to the gym every morning.",
        "correct_answer": "go",
        "hint": "Present Simple, first person",
        "explanation": "We use base form of verb with 'I' in Present Simple."
      }
    ]
  },
  "writing": {
    "prompt": "Write about your favorite hobby. Explain why you enjoy it, when you do it, and how it makes you feel.",
    "min_sentences": 5,
    "max_sentences": 7,
    "tips": ["Use Present Simple for regular activities", "Add adjectives to describe your feelings"]
  },
  "reading": {
    "title": "Daily Routines",
    "url": "https://www.englishclub.com/reading/simple/",
    "description": "A short text about everyday activities for A2-B1 learners.",
    "questions": ["What time does the person wake up?", "What do they do in the evening?"]
  }
}

Create 5 grammar questions, 3 fill-in-the-blank exercises, 1 writing prompt, and 1 reading link. Make them varied and interesting."""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.8,
        response_format={"type": "json_object"},
    )

    data = json.loads(response.choices[0].message.content)
    return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps(data)}


def evaluate_grammar(answers: list, questions: list) -> dict:
    """Оценивает ответы на вопросы грамматики."""
    score = 0
    results = []
    for i, q in enumerate(questions):
        user_answer = answers[i] if i < len(answers) else -1
        is_correct = user_answer == q.get("correct")
        if is_correct:
            score += 1
        results.append({
            "id": q.get("id"),
            "correct": is_correct,
            "user_answer": user_answer,
            "correct_answer": q.get("correct"),
            "explanation": q.get("explanation", ""),
        })

    total = len(questions)
    percentage = round((score / total) * 100) if total > 0 else 0

    prompt = f"""The student answered {score} out of {total} grammar questions correctly ({percentage}%).
Give a short encouraging feedback in Russian (2-3 sentences). Be warm, specific, and motivating."""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )

    feedback = response.choices[0].message.content.strip()
    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps({"score": score, "total": total, "percentage": percentage, "results": results, "feedback": feedback}),
    }


def evaluate_fill(answers: list, exercises: list) -> dict:
    """Оценивает ответы на упражнения с заполнением пропусков."""
    results = []
    score = 0
    for i, ex in enumerate(exercises):
        user_answer = answers[i].strip().lower() if i < len(answers) else ""
        correct = ex.get("correct_answer", "").strip().lower()
        is_correct = user_answer == correct
        if is_correct:
            score += 1
        results.append({
            "id": ex.get("id"),
            "correct": is_correct,
            "user_answer": answers[i] if i < len(answers) else "",
            "correct_answer": ex.get("correct_answer"),
            "explanation": ex.get("explanation", ""),
        })

    total = len(exercises)
    percentage = round((score / total) * 100) if total > 0 else 0

    prompt = f"""Student completed {score}/{total} fill-in-the-blank exercises correctly ({percentage}%).
Give short encouraging feedback in Russian (2-3 sentences). Be specific and warm."""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )

    feedback = response.choices[0].message.content.strip()
    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps({"score": score, "total": total, "percentage": percentage, "results": results, "feedback": feedback}),
    }


def evaluate_writing(text: str, prompt: str) -> dict:
    """Оценивает текст ученика по критериям A2-B1."""
    if not text or len(text.strip()) < 10:
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"score": 0, "feedback": "Пожалуйста, напишите хотя бы несколько предложений.", "details": {}}),
        }

    eval_prompt = f"""You are an English teacher evaluating an A2-B1 student's writing.

Writing prompt: {prompt}

Student's text: {text}

Evaluate and return JSON only (no markdown):
{{
  "score": 7,
  "max_score": 10,
  "grammar_score": 3,
  "vocabulary_score": 2,
  "content_score": 2,
  "feedback_ru": "Overall feedback in Russian (3-4 sentences, warm and encouraging)",
  "corrections": [
    {{"original": "I go to gym", "corrected": "I go to the gym", "explanation_ru": "Нужен артикль 'the' перед 'gym'"}}
  ],
  "strengths_ru": ["Good use of Present Simple", "Clear structure"],
  "improvements_ru": ["Add more adjectives", "Try using Past Simple"]
}}

Be encouraging but honest. Max 3 corrections. Respond in JSON."""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": eval_prompt}],
        temperature=0.6,
        response_format={"type": "json_object"},
    )

    data = json.loads(response.choices[0].message.content)
    return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps(data)}
