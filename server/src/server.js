import { createServer } from "net";

const fs = require('fs');
const users = JSON.parse(fs.readFileSync('./src/user.json'));
const directory = process.cwd();

export function launch(port) {
  const server = createServer((socket) => {
    console.log("new connection.");
    socket.on("data", (data) => {
      const message = data.toString();

      const [command, ...args] = message.trim().split(" ");
      console.log(command, args);

      switch(command) {
        case "USER":     
          if (args[0] == undefined) {
            socket.write('ERROR Please enter an username and a password.\r\n');
            break;
          }else{
            socket.name = args[0];
            let result = "";
            users.forEach(user => {
              if (user.name === socket.name){
                socket.pass = user.pass;
                result = '230 User logged in, proceed.\r\n';
              }else{
                result = '230 User not exist.\r\n';
              }
            });
            socket.write(result);
            break;  
          }
        case "PASS":
          if (args[0] == undefined || args[0] != socket.pass) {
            socket.write('ERROR Please enter a valid password.\r\n');
          }else if (args[0] == socket.pass){
            socket.write('331 Password valid.\r\n');
          }
          break;
        case "SYST":
          socket.write("215 \r\n");
          break;
        case "FEAT":
          socket.write("211 \r\n");
          break;
        case "LIST":
          socket.write(`\r\n`);
          fs.readdirSync(process.cwd()).forEach(file => {
            socket.write(`${file} \r\n`);
          });
          break;
        case "PWD":
          socket.write(`257, ${process.cwd()} \r\n`);
          break;
        case "HELP":
          socket.write(`214, \nType HELP to list all function name. \nType HELP name with name is a function name.\r\n`);
          if (args[0] == undefined) {
            socket.write(`USER [arg1] \nPASS [arg1] \nLIST \nPWD \nCWD [arg1] \nRETR [arg1] \nSTOR [arg1] \nQUIT \r\n`);
          }else{
            switch (args[0]) {
              case "USER":
                socket.write(`USER [arg1] : Connect with a username. \r\n`);
                break;
              case "PASS":
                socket.write(`PASS [arg1] : Authenticate the user with a password. \r\n`);
                break;
              case "LIST":
                socket.write(`LIST : List the current directory of the server. \r\n`);
                break;
              case "PWD":
                socket.write(`PWD : Display the name of the current directory of the server. \r\n`);
                break;
              case "CWD":
                socket.write(`CWD [arg1] : Change the current directory of the server. \r\n`);
                break;
              case "RETR":
                socket.write(`RETR [arg1] : Transfer a copy of the file FILE from the server to the client. \r\n`);
                break;
              case "STOR":
                socket.write(`STOR [arg1] : Transfer a copy of the file FILE from the client to the server. \r\n`);
                break;
              case "QUIT":
                socket.write(`QUIT : Close the connection and stop the program. \r\n`);
                break;
              default:
                socket.write(`Function name : '${args[0]}' not found. \r\n`);
                break;
            }
          }
          break;
        case "CWD":
          if (args[0] == undefined) {
            process.chdir(directory);
            socket.write(`250 New path : ${process.cwd()} \r\n`);
          }else {
            try{
              process.chdir(args[0]);
              socket.write(`250 New path : ${process.cwd()} \r\n`);
            } catch(err) {
              socket.write(`ERROR Try another path.\r\n`);
            }
          }
          break;
        case "QUIT":
          socket.write(`221 \r\n`);
          socket.destroy();
        case "TYPE":
          socket.write("200 \r\n");
          break;
        case "TEST":
          socket.write(`dirname : ${__dirname} cwd : ${process.cwd()} \r\n `);
          break;
        default:
          console.log("command not supported:", command, args);
      }
    });
  });

  server.listen(port, () => {
    console.log(`server started at localhost:${port}`);
  });
}
