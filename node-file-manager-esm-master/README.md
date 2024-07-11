# 🎉 File Manager 🎉

![screenshot v3](https://user-images.githubusercontent.com/1894723/74705515-7a209280-5214-11ea-8547-79287118ef43.png)

Welcome to **File Manager** - the web server that's here to make managing your files a breeze! Built on Node.js with Koa, Angular.js, and Bootstrap, this project has been updated to use the latest Koa and is mount compatible. Plus, it's rewritten as an ECMAScript Module (or Babel) and features multi-file upload capabilities. 🎈

## 🚀 Features

- **ESM-importable**: Use it as an ECMAScript Module.
- **Standalone & Docker Support**: Run it standalone or in a Docker container.
- **Multi-file Upload**: Easily upload multiple files at once.
- **Reduced Dependencies**: Sleeker and faster than ever before.
- **CLI Usability**: Run it directly from your terminal.
- **Access over the Internet**: Share files with the world (with security in mind).

## 🛠 Usage

### As a Koa App: How to Mount

```js
import fm from 'node-file-manager-esm';
// see CLI params below: -d & -f & -mf & -m & -n (only -d is required)
let appFm = fm('/tmp/uploadpath', 'zip|txt|mp4', 'image/*', 300).app;

//mainApp.use(mount('/fm', appFm));  // could be mounted to path on another Koa App
appFm.listen(8080);
```

Mount it within another Koa instance and start managing your files like a pro!

### As a Docker Container
Check out our Docker container on [DockerHub - docker-node-filemanager-esm](https://hub.docker.com/r/bananaacid/docker-node-filemanager-esm).

### Standalone / CLI
Requires Node >= v10.5

Run the file manager directly from your terminal. Set the port and data root directory with `-p` and `-d`, defaults to 5000 and the current directory.

**Instant Start**: No installation required (Linux, OSX, Win)
```shell
$ npx node-file-manager-esm --logging --open
```

**Configure Basics**: No installation required (Linux, OSX, Win)
```shell
$ npx node-file-manager-esm -p 8080 -d /path/to/show --logging --secure --user me:secret --open
```

**Install Globally** and use on a folder
```shell
$ npm install -g node-file-manager-esm
$ node-file-manager-esm -p 8080 -d /path/to/show
```

**Use with Port as Environment Variable** (Heroku, Linux, OSX, IIS: iisnode uses the port-env as well)
```shell
$    PORT=8080 node-file-manager-esm
\>   set PORT=8080 && node-file-manager-esm
ps1> $PORT=8080 ; node-file-manager-esm
```

### On Older Versions of Node

For Node > v8.9.0 & < v13
```shell
$ node --experimental-modules ./bin/node-file-manager-esm.mjs [...PARAMS]
```

For Node < v12
```shell
$ node -r esm ./bin/node-file-manager-esm.mjs [...PARAMS]
```

For Node >= v13
```shell
$ node ./bin/node-file-manager-esm.mjs [...PARAMS]
```

## ✨ Major Changes in This Fork

- Updated to use a recent Koa
- Koa-mount compatible
- Rewritten as an ECMAScript Module (or Babel)
- Multi-file upload
- Reduced dependencies
- Support for big files (v3.2.0)
- Upload progress and file updates for all connected clients (v3.2.0)
- Max upload file size (v3.2.0)
- Handling of canceled files (v3.2.0)
- Full standalone support (v3.2.0)
  - Relative paths support for `--directory` and `--secure` (v3.2.0)
- File renaming if an error-named file exists (v3.3.1)
- Adding users via commandline/env (v3.3.1)
- Fixed env for Docker to use FM_USER (v3.3.2)
- Added compose file (v3.3.2)
- Reduced Docker image size from 1GB to 211MB (v3.3.3)

## 🔧 CLI Params

- `-p | --port <int>`: Server port (default 5000)
- `-d | --directory <string>`: Path to provide files from (relative paths supported)
- `-s | --secure <string>`: Use BASIC-AUTH with the provided htpasswd file path
- `-u | --user <name:pw>`: Add users manually
- `-m | --maxsize <int>`: Max file size for uploads in MB (default 300)
- `-l | --logging <string>`: Output logging info
- `-f | --filter <string|null>`: Important files to filter for
- `-mf | --mimefilter <string>`: File selection filter for the upload dialog
- `-n | --name <string>`: Overwrite the web UI title
- `-v | --version`: Show server version
- `-o | --open`: Open the website in a browser when the server starts

## 🌐 Access It Over the Internet

### Quickly Tunnel for Free

- **Localtunnel**: 
  ```shell
  npx localtunnel -p 5000
  ```
- **ngrok.io**:
  ```shell
  npx ngrok http 5000
  ```

### Port Forwarding / Hosting at Home

- Configure your router to forward port 80 to your device on port 5000.
- Use a free dynamic subdomain from [freedns.afraid.org](https://freedns.afraid.org/).

## 👥 HTTP Basic Auth

For extra security, it's recommended to use HTTP Basic Auth over TLS (HTTPS). Let’s Encrypt is a great tool for this.

### Manually Add a User
```shell
# Create a new htpasswd file:
htpasswd -c ./htpasswd adam

# Add another user:
htpasswd ./htpasswd john
```

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Now you're all set to start managing your files like a pro! Happy file managing! 🎉🗂️
