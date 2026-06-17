/**
 * PROJECT: IntelliConnect AI Chatbot
 * FILE: static/script.js
 * DESCRIPTION: Handles user submissions, server fetch requests, localStorage-based chat history,
 *              dark/light mode switching, side panel rendering, and mobile transitions.
 */

document.addEventListener("DOMContentLoaded", () => {
    // =========================================================================
    // 1. DOM ELEMENT REFERENCES
    // =========================================================================
    const chatForm = document.getElementById("chatForm");
    const userInput = document.getElementById("userInput");
    const chatViewport = document.getElementById("chatViewport");
    const messagesList = document.getElementById("messagesList");
    const typingIndicator = document.getElementById("typingIndicator");
    const resetBtn = document.getElementById("resetBtn");
    const sendBtn = document.getElementById("sendBtn");
    const chatsList = document.getElementById("chatsList");
    const newChatBtn = document.getElementById("newChatBtn");
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
    const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
    const appContainer = document.getElementById("appContainer");
    const chatTitle = document.getElementById("chatTitle");

    // =========================================================================
    // 2. STATE VARIABLES
    // =========================================================================
    let chats = [];
    let activeChatId = null;

    // =========================================================================
    // 3. THEME MANAGEMENT
    // =========================================================================
    function initTheme() {
        const savedTheme = localStorage.getItem("theme") || "dark";
        document.documentElement.setAttribute("data-theme", savedTheme);
        updateThemeButtonUI(savedTheme);
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        updateThemeButtonUI(newTheme);
    }

    function updateThemeButtonUI(theme) {
        const themeText = themeToggleBtn.querySelector(".theme-text");
        if (themeText) {
            themeText.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
        }
    }

    // =========================================================================
    // 4. CHAT HISTORY STATE & LOCALSTORAGE MANAGEMENT
    // =========================================================================
    function loadChats() {
        const savedChats = localStorage.getItem("intelliconnect_chats");
        if (savedChats) {
            try {
                chats = JSON.parse(savedChats);
            } catch (e) {
                console.error("Failed to parse saved chats:", e);
                chats = [];
            }
        }
        
        activeChatId = localStorage.getItem("intelliconnect_active_chat_id");
        
        if (chats.length === 0) {
            createNewChat();
        } else {
            // Validate if activeChatId exists, otherwise take first chat
            const exists = chats.some(c => c.id === activeChatId);
            if (!exists) {
                activeChatId = chats[0].id;
                localStorage.setItem("intelliconnect_active_chat_id", activeChatId);
            }
            renderChatsList();
            renderActiveChat();
        }
    }

    function saveChats() {
        localStorage.setItem("intelliconnect_chats", JSON.stringify(chats));
        localStorage.setItem("intelliconnect_active_chat_id", activeChatId);
    }

    function createNewChat() {
        const newId = "chat_" + Date.now();
        const newChat = {
            id: newId,
            title: "New Chat",
            messages: []
        };
        chats.unshift(newChat); // Put new chat at top
        activeChatId = newId;
        saveChats();
        renderChatsList();
        renderActiveChat();
        userInput.focus();
    }

    function deleteChat(id, event) {
        if (event) {
            event.stopPropagation(); // Avoid triggering chat item click
        }
        if (!confirm("Are you sure you want to delete this chat?")) {
            return;
        }

        chats = chats.filter(c => c.id !== id);
        
        if (activeChatId === id) {
            if (chats.length > 0) {
                activeChatId = chats[0].id;
            } else {
                activeChatId = null;
            }
        }
        
        if (chats.length === 0) {
            createNewChat();
        } else {
            saveChats();
            renderChatsList();
            renderActiveChat();
        }
    }

    function getActiveChat() {
        return chats.find(c => c.id === activeChatId);
    }

    // =========================================================================
    // 5. RENDERING FUNCTIONS
    // =========================================================================
    function renderChatsList() {
        chatsList.innerHTML = "";
        chats.forEach(chat => {
            const chatItem = document.createElement("div");
            chatItem.classList.add("chat-item");
            if (chat.id === activeChatId) {
                chatItem.classList.add("active");
            }
            
            chatItem.addEventListener("click", () => {
                activeChatId = chat.id;
                saveChats();
                renderChatsList();
                renderActiveChat();
                // Close sidebar on mobile after choosing a chat
                appContainer.classList.remove("sidebar-open");
            });

            const leftDiv = document.createElement("div");
            leftDiv.classList.add("chat-item-left");

            const iconSpan = document.createElement("span");
            iconSpan.classList.add("chat-item-icon");
            iconSpan.textContent = "💬";

            const titleSpan = document.createElement("span");
            titleSpan.classList.add("chat-item-title");
            titleSpan.textContent = chat.title;

            leftDiv.appendChild(iconSpan);
            leftDiv.appendChild(titleSpan);

            const deleteBtn = document.createElement("button");
            deleteBtn.classList.add("chat-item-delete");
            deleteBtn.setAttribute("aria-label", "Delete Chat");
            deleteBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            `;
            deleteBtn.addEventListener("click", (e) => deleteChat(chat.id, e));

            chatItem.appendChild(leftDiv);
            chatItem.appendChild(deleteBtn);
            chatsList.appendChild(chatItem);
        });
    }

    function renderActiveChat() {
        const activeChat = getActiveChat();
        if (!activeChat) return;

        // Update header chat title
        chatTitle.textContent = activeChat.title;

        // Clear messages list
        messagesList.innerHTML = "";

        if (activeChat.messages.length === 0) {
            // Append welcome card
            const card = document.createElement("div");
            card.classList.add("welcome-card");
            card.id = "welcomeCard";
            card.innerHTML = `
                <div class="welcome-icon">👋</div>
                <h2>Meet IntelliConnect</h2>
                <p>I am your general-purpose intelligent assistant. Ask me questions, brainstorm ideas, or just chat. How can I help you today?</p>
            `;
            messagesList.appendChild(card);
        } else {
            activeChat.messages.forEach(msg => {
                appendMessageToDOM(msg.content, msg.sender, msg.timestamp);
            });
        }
        scrollToBottom();
    }

    // =========================================================================
    // 6. HELPER FUNCTIONS
    // =========================================================================
    function getCurrentTime() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    }

    function parseMarkdown(text) {
        let escapedText = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        const lines = escapedText.split("\n");
        let formattedLines = [];
        let inList = false;

        for (let line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith("* ") || trimmedLine.startsWith("- ")) {
                if (!inList) {
                    formattedLines.push("<ul>");
                    inList = true;
                }
                const content = trimmedLine.substring(2);
                formattedLines.push(`<li>${formatInlineElements(content)}</li>`);
            } else {
                if (inList) {
                    formattedLines.push("</ul>");
                    inList = false;
                }
                if (trimmedLine !== "") {
                    formattedLines.push(`<p>${formatInlineElements(line)}</p>`);
                }
            }
        }
        
        if (inList) {
            formattedLines.push("</ul>");
        }

        return formattedLines.join("");
    }

    function formatInlineElements(text) {
        let formatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        formatted = formatted.replace(/`(.*?)`/g, "<code>$1</code>");
        return formatted;
    }

    function appendMessageToDOM(content, sender, timestamp) {
        const card = document.getElementById("welcomeCard");
        if (card) {
            card.remove();
        }

        const messageRow = document.createElement("div");
        messageRow.classList.add("message-row", sender);

        const bubble = document.createElement("div");
        bubble.classList.add("message-bubble");

        if (sender === "user") {
            const textNode = document.createElement("p");
            textNode.textContent = content;
            bubble.appendChild(textNode);
        } else if (sender === "bot") {
            bubble.innerHTML = parseMarkdown(content);
        } else {
            bubble.textContent = content;
        }

        const meta = document.createElement("div");
        meta.classList.add("message-meta");
        meta.textContent = timestamp || getCurrentTime();

        messageRow.appendChild(bubble);
        messageRow.appendChild(meta);
        messagesList.appendChild(messageRow);
    }

    function scrollToBottom() {
        chatViewport.scrollTop = chatViewport.scrollHeight;
    }

    function setFormState(isLoading) {
        if (isLoading) {
            userInput.disabled = true;
            sendBtn.disabled = true;
            chatForm.classList.add("disabled");
            typingIndicator.style.display = "block";
            scrollToBottom();
        } else {
            userInput.disabled = false;
            sendBtn.disabled = false;
            chatForm.classList.remove("disabled");
            typingIndicator.style.display = "none";
            userInput.focus();
        }
    }

    // =========================================================================
    // 7. CORE CHAT METHODS
    // =========================================================================
    async function sendMessage() {
        const messageText = userInput.value.trim();
        if (!messageText) return;

        const activeChat = getActiveChat();
        if (!activeChat) return;

        const timestamp = getCurrentTime();

        // 1. Append message to DOM immediately
        appendMessageToDOM(messageText, "user", timestamp);
        
        // 2. Save message to activeChat state
        activeChat.messages.push({
            sender: "user",
            content: messageText,
            timestamp: timestamp
        });

        // 3. If it's the first message, update chat title
        if (activeChat.title === "New Chat") {
            let truncatedTitle = messageText;
            if (truncatedTitle.length > 28) {
                truncatedTitle = truncatedTitle.substring(0, 25) + "...";
            }
            activeChat.title = truncatedTitle;
            chatTitle.textContent = truncatedTitle;
            renderChatsList();
        }

        saveChats();
        userInput.value = "";
        setFormState(true);

        try {
            // Prepare history payload for API call
            // We format messages into Gemini expectations: parts as array of text, role as 'user' or 'bot'
            const apiHistory = activeChat.messages.slice(0, activeChat.messages.length - 1).map(msg => ({
                role: msg.sender,
                parts: [msg.content]
            }));

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: messageText,
                    history: apiHistory
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Server status: ${response.status}`);
            }

            if (data.status === "success" && data.reply) {
                const botTimestamp = getCurrentTime();
                appendMessageToDOM(data.reply, "bot", botTimestamp);
                
                activeChat.messages.push({
                    sender: "bot",
                    content: data.reply,
                    timestamp: botTimestamp
                });
                saveChats();
            } else {
                appendMessageToDOM("Error: Received invalid message structure.", "system", getCurrentTime());
            }

        } catch (error) {
            console.error("API Communication failure:", error);
            appendMessageToDOM(`Sorry, I couldn't reach the server. Please check your connection. (${error.message})`, "system", getCurrentTime());
        } finally {
            setFormState(false);
        }
    }

    function clearCurrentChat() {
        const activeChat = getActiveChat();
        if (!activeChat) return;

        if (activeChat.messages.length === 0) return;

        if (!confirm("Are you sure you want to clear the messages in the current chat?")) {
            return;
        }

        activeChat.messages = [];
        saveChats();
        renderActiveChat();
    }

    // =========================================================================
    // 8. EVENT LISTENERS
    // =========================================================================
    chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        sendMessage();
    });

    newChatBtn.addEventListener("click", createNewChat);
    resetBtn.addEventListener("click", clearCurrentChat);
    themeToggleBtn.addEventListener("click", toggleTheme);

    // Sidebar toggles for mobile
    sidebarToggleBtn.addEventListener("click", () => {
        appContainer.classList.add("sidebar-open");
    });

    sidebarCloseBtn.addEventListener("click", () => {
        appContainer.classList.remove("sidebar-open");
    });

    // Close sidebar on tapping the overlay area (container backdrop)
    appContainer.addEventListener("click", (e) => {
        if (e.target === appContainer && appContainer.classList.contains("sidebar-open")) {
            appContainer.classList.remove("sidebar-open");
        }
    });

    // Initialization
    initTheme();
    loadChats();
});
