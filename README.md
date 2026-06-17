# IntelliConnect Chatbot

IntelliConnect is an intelligent, friendly, and helpful AI assistant web application powered by the Google Gemini API. Built with Flask, it features multi-turn conversation memory and a seamless user interface.

## Features

- **Google Gemini API Integration**: Uses the Gemini Generative AI model (`gemini-2.5-flash-lite`) for fast, accurate, and conversational responses.
- **Multi-turn Conversation**: Maintains chat history to contextually understand multi-part questions.
- **Session Management**: Securely handles user sessions with chat history.
- **Clear History**: Ability to reset the conversation and start fresh.
- **RESTful API**: Frontend communicates with the backend via JSON-based API endpoints.

## Prerequisites

- Python 3.8+
- A Google Gemini API Key. You can obtain one from [Google AI Studio](https://aistudio.google.com/).

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   # On Windows use:
   venv\Scripts\activate
   # On macOS/Linux use:
   source venv/bin/activate
   ```

3. **Install the dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Setup:**
   - Copy the `.env.example` file to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and add your Gemini API key:
     ```env
     GEMINI_API_KEY=your_actual_api_key_here
     FLASK_SECRET_KEY=your_secret_key_here
     ```

## Usage

1. **Start the Flask development server:**
   ```bash
   python app.py
   ```

2. **Access the Application:**
   Open your web browser and go to `http://127.0.0.1:5000`.

## Tech Stack

- **Backend**: Python, Flask
- **AI Integration**: Google Generative AI SDK (`google-generativeai`)
- **Environment Management**: `python-dotenv`
- **Frontend**: HTML/CSS/JS (Templates and Static assets)

## Customization

You can modify the chatbot's persona by updating the `SYSTEM_PROMPT` variable in `app.py`. By default, it is configured as an intelligent, friendly, and helpful AI assistant.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
