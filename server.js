const net = require("node:net");
const { createHash } = require("node:crypto");

const server = net.createServer();

let sockets = [];
server.on("connection", (socket) => {
  const id = createHash("sha256")
    .update(socket.remoteAddress + socket.remotePort)
    .digest("hex")
    .substring(0, 10);

  console.log("user connected with id %s", id);
  sockets.push({ id, socket });
  const sockets_without_current = sockets.filter((socket) => socket.id !== id);

  sockets_without_current.forEach(({ socket }) =>
    socket.write(`user @${id} joined to chat.`)
  );

  socket.on("data", (data) => {
    sockets.forEach(({ socket }) => socket.write(data));
  });

  socket.on("end", () => {
    sockets.forEach(({ socket }) => socket.write(`user @${id} left the chat.`));
  });

  socket.on("error", () => {
    sockets.map(({ socket }) => {
      socket.write(`User ${clientId} left!`);
    });
  });
});

server.listen(3008, "127.0.0.1", () => {
  console.log("server running on", server.address());
});
