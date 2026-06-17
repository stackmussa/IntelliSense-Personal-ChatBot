import os
from flask import Flask, render_template, request, jsonify, session
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Set secret key for session management
# Ideally set via environment variable, but falls back to a default development key
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev_secret_key_for_nova_chatbot_12345")

# Configure Google Gemini API SDK
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
else:
    print("WARNING: GEMINI_API_KEY not found in environment variables. Please check your .env file.")

# Define the persona/system instructions for the chatbot
SYSTEM_PROMPT = (
    "You are IntelliConnect, an intelligent, friendly, and helpful AI assistant. "
    "Introduce yourself as IntelliConnect when asked or during initial greetings. "
    "Keep your answers concise, clear, and highly focused. "
    "Handle greetings naturally and politely. "
    "If you do not know the answer to a question, admit it honestly rather than making something up. "
    "Stay on topic and strictly avoid generating harmful, offensive, or inappropriate content. "
    "Format your responses cleanly using Markdown, using bullet points when listing items or steps."
)

@app.route("/")
def index():
    """Renders the main page of the chatbot application."""
    return render_template("index.html")

@app.route("/api/chat", methods=["POST"])
def chat():
    """
    Endpoint to receive chat messages from the frontend.
    Maintains session-based multi-turn conversation memory and calls the Gemini API.
    """
    # Verify API key is configured
    if not api_key:
        return jsonify({
            "error": "Gemini API key is not configured on the server. Please check your .env file."
        }), 500

    # Parse and validate the incoming JSON request
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "Bad Request: 'message' is required"}), 400
    
    user_message = data["message"].strip()
    if not user_message:
        return jsonify({"error": "Bad Request: message cannot be empty"}), 400

    try:
        # Retrieve existing chat history from payload (client-side) or fallback to session
        client_history = data.get("history")
        
        formatted_history = []
        if isinstance(client_history, list):
            for msg in client_history:
                role = msg.get("role")
                if role == "bot":
                    role = "model"
                parts = msg.get("parts")
                if not parts:
                    content = msg.get("content", "")
                    parts = [content]
                formatted_history.append({
                    "role": role,
                    "parts": parts
                })
        else:
            session_history = session.get("chat_history", [])
            for msg in session_history:
                formatted_history.append({
                    "role": msg["role"],
                    "parts": msg["parts"]
                })
        
        # Initialize the model with the system instruction
        model_name = os.getenv("GEMINI_MODEL_NAME", "gemini-2.5-flash-lite")
        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=SYSTEM_PROMPT
        )
        
        # Start a multi-turn chat session with the conversation history
        chat_session = model.start_chat(history=formatted_history)
        
        # Send the new user message to the model
        response = chat_session.send_message(user_message)
        
        # Store updated history in session if using session-based fallback
        if client_history is None:
            updated_history = []
            for msg in chat_session.history:
                updated_history.append({
                    "role": msg.role,
                    "parts": [part.text for part in msg.parts]
                })
            session["chat_history"] = updated_history
            session.modified = True
        
        return jsonify({
            "status": "success",
            "reply": response.text
        })
        
    except Exception as e:
        print(f"Error calling Gemini API: {str(e)}")
        return jsonify({
            "error": f"Failed to get response from AI: {str(e)}"
        }), 500

@app.route("/api/reset", methods=["POST"])
def reset():
    """
    Endpoint to clear the conversation history stored in the Flask session.
    """
    session.pop("chat_history", None)
    return jsonify({
        "status": "success",
        "message": "Chat history has been reset successfully."
    })

if __name__ == "__main__":
    # Start the server locally on port 5000 in debug mode
    app.run(debug=True, port=5000)
