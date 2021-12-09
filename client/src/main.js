import { createConnection } from "net";

let currentCommand = '';
let isAuthenticated = false;

const client = createConnection({ port: 4242 }, () => {
  console.log("client connected.");
});

client.on("data", (data) => {
  const message = data.toString();
  console.log("Message received:", message);

  const [status, ...args] = message.trim().split(" ");
  if (status == 230 && currentCommand === "USER") {
    isAuthenticated = true;
  }

  if (status == 220) {
    currentCommand = "USER";
    client.write("USER anonymous");
  };
});
