# myFtp

Welcome on my project ftp for Efrei

## How to use

When you will start the project you have 2 option

- Log in with command `USER` (you will find existing users in './src/user.json')

``` USER [username] ```

- Create an user and a password with command `CREATEUSER` 

``` CREATEUSER [username] [password] ```

When this is done you can use the command `HELP` to see every other command possible 

For the commands `STOR` and `RETR` you can use files that already exist for tests

example once you connect : 

```
Command : PWD
PWD
Message received: 257, C:\Users\archi\Desktop\node_EFREI\myFtp\server

Command : CWD ../client/files
CWD ../client/files
Message received: 250 New path : C:\Users\archi\Desktop\node_EFREI\myFtp\client\files

Command : STOR clientTOserver.txt --First file to save in the server
STOR clientTOserver.txt
Message received: 552 C:\Users\archi\Desktop\node_EFREI\myFtp\client\files\clientTOserver.txt was copied to C:\Users\archi\Desktop\node_EFREI\myFtp\server\files\clientTOserver.txt.

Command : RETR serverTOclient.txt --Another file to save in the client
RETR serverTOclient.txt
Message received: 552 C:\Users\archi\Desktop\node_EFREI\myFtp\server\files\serverTOclient.txt was copied to C:\Users\archi\Desktop\node_EFREI\myFtp\client\files\serverTOclient.txt.

```



#

Have fun !

Archibald SABATIER
