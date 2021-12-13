import { createServer } from "net";
import { copyFile } from 'fs/promises';

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
              let flag = false;
              users.forEach(user => {
                if (user.name === socket.name){
                  flag = true;
                  socket.pass = user.pass;
                }
              });
              if (flag){
                flag = true;
                socket.write(`230 User ${socket.name} logged in, proceed by entering the password of ${socket.name} with command PASS.\r\n`);
                isconnect++;
              }else{
                socket.write('230 User not exist.\r\n');
              }
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
            let resultLIST = "";
            resultLIST += (`\r\n`);
            fs.readdirSync(process.cwd()).forEach(file => {
              resultLIST += (`${file} \r\n`);
            });
            socket.write(resultLIST);
            break;
          case "PWD":
            socket.write(`257, ${process.cwd()} \r\n`);
            break;
          case "HELP":
            let resultHELP = "";
            resultHELP += `214, \nType HELP to list all functions name. \nType HELP [name] with name is a function name.\r\n\r\n`;
            if (args[0] == undefined) {
              resultHELP += (`USER \nPASS \nCREATEUSER \nLIST \nPWD \nCWD \nRETR \nSTOR \nQUIT \r\n`);
            }else{
              switch (args[0]) {
                case "USER":
                  resultHELP += (`USER [username] : Connect with a username. \r\n`);
                  break;
                case "PASS":
                  resultHELP += (`PASS [password] : Authenticate the user with a password. \r\n`);
                  break;
                case "CREATEUSER":
                  resultHELP += (`CREATEUSER [username] [password] : Create a new User. \r\n`);
                  break;
                case "LIST":
                  resultHELP += (`LIST : List the current directory of the server. \r\n`);
                  break;
                case "PWD":
                  resultHELP += (`PWD : Display the name of the current directory of the server. \r\n`);
                  break;
                case "CWD":
                  resultHELP += (`CWD [directory] : Change the current directory of the server, if [directory] not specify you will return in the default directory. \r\n`);
                  break;
                case "RETR":
                  resultHELP += (`RETR [filename] : Transfer a copy of the file the server "/files" directory to your current directory. \r\n`);
                  break;
                case "STOR":
                  resultHELP += (`STOR [filename] : Transfer a copy of the file in your current directory to the server "/files" directory. \r\n`);
                  break;
                case "QUIT":
                  resultHELP += (`QUIT : Close the connection and stop the program. \r\n`);
                  break;
                default:
                  resultHELP += (`Function name : '${args[0]}' not found. \r\n`);
                  break;
              }
            }
            socket.write(resultHELP);
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
          case "TEST":
            socket.write(`${directory} \r\n`);
            break;
          case "RETR":
            if (args[0] == undefined) {
              socket.write(`ERROR Please specify the filename. \r\n`);
            }else {
              (async () => {
                try {
                  await copyFile(`${directory}\\files\\${args[0]}`, `${process.cwd()}\\${args[0]}`);
                  socket.write(`552 ${directory}\\files\\${args[0]} was copied to ${process.cwd()}\\${args[0]}. \r\n`);
                } catch (err) {
                  console.log(err);
                  socket.write(`ERROR The file could not be copied. \r\n`);
                }
              })();
            }
            break;
          case "STOR":
            if (args[0] == undefined) {
              socket.write(`ERROR Please specify the filename. \r\n`);
            }else {
              (async () => {
                try {
                  await copyFile(`${process.cwd()}\\${args[0]}`, `${directory}\\files\\${args[0]}`);
                  socket.write(`552 ${process.cwd()}\\${args[0]} was copied to ${directory}\\files\\${args[0]}. \r\n`);
                } catch (err) {
                  console.log(err);
                  socket.write(`ERROR The file could not be copied. \r\n`);
                }
              })();
            }
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
