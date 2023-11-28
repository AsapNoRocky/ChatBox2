(function () {
    const app = document.querySelector(".app");
    const socket = io();
    let uname;

    app.querySelector(".join-screen #join-user").addEventListener("click", function () {
        let username = app.querySelector(".join-screen #username").value;
        if (username.length === 0) {
            return;
        }
        socket.emit("newuser", username);
        uname = username;
        app.querySelector(".join-screen").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");
    });

    app.querySelector(".chat-screen #send-message").addEventListener("click", function () {
        let message = app.querySelector(".chat-screen #message-input").value;
        if (message.length === 0) {
            return;
        }
        renderMessage("my", {
            username: uname,
            text: message,
        });
        socket.emit("chat", {
            username: uname,
            text: message,
        });
        app.querySelector(".chat-screen #message-input").value = "";
    });

    app.querySelector(".chat-screen #exit-chat").addEventListener("click", function () {
        socket.emit("exituser", uname);
        app.querySelector(".join-screen").classList.add("active");
        app.querySelector(".chat-screen").classList.remove("active");
    });

    // File input change event
    app.querySelector("#file-input").addEventListener("change", function (event) {
        const fileInput = event.target;
        const file = fileInput.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onloadend = function () {
                const dataURL = reader.result;
                const fileData = {
                    filename: file.name,
                    dataURL,
                };

                socket.emit("file", fileData);
                renderMessage("my", {
                    username: uname,
                    text: `File: ${file.name}`,
                });
            };

            reader.readAsDataURL(file);
        }
    });

    socket.on("update", function (update) {
        renderMessage("update", update);
    });

    socket.on("chat", function (message) {
        renderMessage("other", message);
    });

    socket.on("file", function (fileInfo) {
        const { sender, filename } = fileInfo;
        renderMessage("other", {
            username: "System",
            text: `${uname} sent a file: ${filename}`,
        });
    });

    function renderMessage(type, message) {
        let messageContainer = app.querySelector(".chat-screen .messages");
        let el = document.createElement("div");

        if (type === "my") {
            el.setAttribute("class", "message my-message");
            el.innerHTML = `
                <div>
                    <div class="name">You</div>
                    <div class="text">${message.text}</div>
                </div>
            `;
        } else if (type === "other") {
            el.setAttribute("class", "message other-message");
            el.innerHTML = `
                <div>
                    <div class="name">${message.username}</div>
                    <div class="text">${message.text}</div>
                </div>
            `;
        } else if (type === "update") {
            el.setAttribute("class", "update");
            el.innerHTML = `${message}`;
        }

        // Append the message to
        messageContainer.appendChild(el);

        // scroll chat to end
        messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
    }
})();
