const socket = io();
const $messageForm = document.querySelector(".message-form");
const $sendLocationBtn = document.querySelector(".send-coordinates-btn");
const $inputMessage = document.querySelector("input");
const $messageFormBtn = document.querySelector(".send-btn");
const $messages = document.querySelector(".messages");
const $sidebar = document.querySelector(".chat__sidebar");

// Message template
const messageTemplate = document.querySelector(".message-template").innerHTML;
const sidebarTemplate = document.querySelector(".sidebar-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  ".location-message-template"
).innerHTML;

// Get username and room from query string
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// Join user to a new room
socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

const autoscroll = () => {
  // Get new message height
  const $newMessage = $messages.lastElementChild;
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageHeight =
    $newMessage.offsetHeight + parseInt(newMessageStyles.marginBottom);

  // Get full message container height
  const containerHeight = $messages.scrollHeight;

  // Get messages' visible height
  const visisbleHeight = $messages.offsetHeight;

  // Get top scroll height
  const scrollOffSet = $messages.scrollTop + visisbleHeight;

  // Scroll to bottom
  if (containerHeight - newMessageHeight <= scrollOffSet + 1) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

// Listening to new messages
socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

// Update user list on sidebar
socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  $sidebar.innerHTML = html;
});

socket.on("locationMessage", (location) => {
  const html = Mustache.render(locationMessageTemplate, {
    username: location.username,
    location: location.url,
    createdAt: moment().format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

// Send a message
$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  $messageFormBtn.setAttribute("disabled", "disabled");

  socket.emit("sendMessages", e.target.elements.message.value, (error) => {
    $messageFormBtn.removeAttribute("disabled");
    $inputMessage.value = "";
    $inputMessage.focus();
    if (error) return alert(error);
    console.log("Message delivered");
  });
});

// Send current location
$sendLocationBtn.addEventListener("click", () => {
  if (!navigator.geolocation)
    return alert("Geolocation is not supported by your browser");
  $sendLocationBtn.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        x: position.coords.latitude,
        y: position.coords.longitude,
      },
      (message) => {
        $sendLocationBtn.removeAttribute("disabled");
        console.log(message);
      }
    );
  });
});
