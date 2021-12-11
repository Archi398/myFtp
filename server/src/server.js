import { createServer } from "net";

const fs = require('fs');
const users = JSON.parse(fs.readFileSync('./src/user.json'));
const directory = process.cwd();

export function launch(port) {
  const server = createServer((socket) => {
    let isconnect = 0;
    console.log("new connection.");
    socket.on("data", (data) => {
      const message = data.toString();

      const [command, ...args] = message.trim().split(" ");
      console.log(command, args);


      if (isconnect == 0){
        switch (command) {
          case "USER":
            if (args[0] == undefined) {
              socket.write('ERROR Please enter an username.\r\n');
            }else{
              socket.name = args[0];
              let result = "";
              let flag = false;
              users.forEach(user => {
                if (user.name === socket.name){
                  flag = true;
                  socket.pass = user.pass;
                }
              });
              if (flag){
                flag = true;
                result = `230 User ${socket.name} logged in, proceed by entering the password of ${socket.name} with command PASS.\r\n`;
                isconnect++;
              }else{
                result = '230 User not exist.\r\n';
              }
              socket.write(result);
            }
            break;
          case "CREATEUSER":
            if (args[0] == undefined || args[1] == undefined) {
              socket.write('ERROR Please enter an username and a password.\r\n');
            }else{
              let flag = false;
              users.forEach(user => {
                if (user.name === args[0]){
                  flag = true;
                }
              });
              if (flag){
                socket.write(`ERROR A user as already this username, please choose another username.\r\n`);
              }else{
                socket.name = args[0];
                socket.pass = args[1];
                users.push({name: args[0], pass: args[1]});
                fs.writeFile('./src/user.json', JSON.stringify(users), 'utf8', function(error) {
                  if(error) { 
                    socket.write(`ERROR An error has occurred when creating the new User. Retry or connect with command USER.\r\n`);
                  } else {
                    socket.write(`230 User ${socket.name} successfully created, you will now be logged in.\r\n`);
                  }
                });
                isconnect = 2;
              }
            }
            break;
          default:
            socket.write('ERROR You must connect with command USER [username] OR CREATEUSER [username] [password] before continue.\r\n');
            break;
        }
      }else if (isconnect == 1){
        switch (command) {
          case "PASS":
            if (args[0] == undefined || args[0] != socket.pass) {
              socket.write('ERROR Please enter a valid password.\r\n');
            }else if (args[0] == socket.pass){
              socket.write('331 Password valid.\r\n');
              isconnect++;
            }
            break;
          default:
            socket.write('ERROR You must connect with command PASS before continue.\r\n');
            break;
        }
      }else if (isconnect == 2){
        switch(command) {
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
            socket.write(`214, \nType HELP to list all functions name. \nType HELP [name] with name is a function name.\r\n`);
            if (args[0] == undefined) {
              socket.write(`USER \nPASS \nCREATEUSER \nLIST \nPWD \nCWD \nRETR \nSTOR \nQUIT \r\n`);
            }else{
              switch (args[0]) {
                case "USER":
                  socket.write(`USER [username] : Connect with a username. \r\n`);
                  break;
                case "PASS":
                  socket.write(`PASS [password] : Authenticate the user with a password. \r\n`);
                  break;
                case "CREATEUSER":
                  socket.write(`CREATEUSER [username] [password] : Create a new User. \r\n`);
                  break;
                case "LIST":
                  socket.write(`LIST : List the current directory of the server. \r\n`);
                  break;
                case "PWD":
                  socket.write(`PWD : Display the name of the current directory of the server. \r\n`);
                  break;
                case "CWD":
                  socket.write(`CWD [directory] : Change the current directory of the server. \r\n`);
                  break;
                case "RETR":
                  socket.write(`RETR [filename] : Transfer a copy of the file FILE from the server to the client. \r\n`);
                  break;
                case "STOR":
                  socket.write(`STOR [filename] : Transfer a copy of the file FILE from the client to the server. \r\n`);
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
          case "RETR":
            socket.write("200 \r\n");
            break;
          case "STOR":
            socket.write("200 \r\n");
            break;
          case "QUIT":
            socket.write(`221 \r\n`);
            console.log('Client close');
            socket.destroy();
            isconnect = 0;
            break;
          default:
            socket.write(`ERROR Command not supported : ${command} .`);
            console.log("command not supported:", command, args);
            break;
        }  
      }

    });
  });

  server.listen(port, () => {
    console.log(`server started at localhost:${port}`);
  });

  server.on('close', function() {
    console.log('Server closed');
  });
}
