const net = require("node:net");
const readline = require("node:readline/promises");
const { createHash } = require("node:crypto");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function clearLine(dir) {
  return new Promise((res, rej) =>
    process.stdout.clearLine(dir, () => {
      res();
    })
  );
}

function moveCursor(dx, dy) {
  return new Promise((res, rej) => {
    process.stdout.moveCursor(dx, dy, () => {
      res();
    });
  });
}

let id;

const socket = net.createConnection({ host: "127.0.0.1", port: 3008 }, () => {
  id = createHash("sha256")
    .update(socket.localAddress + socket.localPort)
    .digest("hex")
    .substring(0, 10);

  console.log(
    "Connected to the server successfully.\nyour id is @%s.",
    id
  );

  async function ask() {
    const message = await rl.question("Enter a message > ");
    await moveCursor(0, -1);
    await clearLine(0);
    socket.write(`> @${id}: ${message}`);
  }
  ask();

  socket.on("data", async (data) => {
    console.log();
    await moveCursor(0, -1);
    await clearLine(0);
    console.log(data.toString("utf-8"));
    ask();
  });
});

socket.on("end", () => {
  console.log("server closed");
});
