import { createServer } from "net";

export function launch(port) {
  const server = createServer((socket) => {
    console.log("new connection.");
    socket.on("data", (data) => {
      const message = data.toString();

      const [command, ...args] = message.trim().split(" ");
      console.log(command, args);

      switch(command) {
        case "USER":
          socket.write("230 User logged in, proceed.\r\n");
          break;
        case "SYST":
          socket.write("215 \r\n");
          break;
        case "FEAT":
          socket.write("211 \r\n");
          break;
        case "PWD":
          socket.write("257 /users/dylan\r\n");
          break;
        case "TYPE":
          socket.write("200 \r\n");
          break;
        default:
          console.log("command not supported:", command, args);
      }
    });

    socket.write("220 Hello World \r\n");
  });

  server.listen(port, () => {
    console.log(`server started at localhost:${port}`);
  });
}
