const users = [];

// Add a new user
const addUser = ({ id, username, room }) => {
  // Validate input
  if (!id || !username || !room) return { error: "Lack information" };

  // Clean data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Check if there exists a user of the same name in the same room
  const containsUser = users.find(
    (user) => username === user.username && room === user.room
  );
  if (containsUser) return { error: "User already exists" };

  const user = { id, username, room };
  users.push(user);
  return { user };
};

// Remove a user
const removeUser = (id) => {
  if (!id) return { error: "Lack info" };
  const removedIndex = users.findIndex((user) => user.id == id);
  if (removedIndex != -1) return users.splice(removedIndex, 1)[0];
};

// Get user
const getUser = (id) => {
  if (!id) return { error: "Lack Info" };
  const user = users.find((user) => user.id === id);
  return user;
};

// Get users in room
const getUsersInRoom = (room) => {
  if (!room) return { error: "Lack info" };
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
