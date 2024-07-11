# 🎉 File Manager 🎉

![screenshot v3](https://user-images.githubusercontent.com/1894723/74706364-003dd880-5217-11ea-8f26-b616f99eb39a.png)

Welcome to **File Manager** - the ultimate web server for managing your files with style! 🚀 Built on Node.js with Koa, Angular.js, and Bootstrap, this project has been modernized to use the latest Koa, be mount compatible, and rewritten as an ECMAScript Module (or Babel). With multi-file upload capabilities and reduced dependencies, it's your go-to solution for file management. Usable from CLI, standalone, or Docker - the choice is yours! 🎈

## 🌟 Features

- **ESM-importable**: Use it as an ECMAScript Module.
- **Standalone & Docker Support**: Run it standalone or in a Docker container.
- **Multi-file Upload**: Easily upload multiple files at once.
- **Reduced Dependencies**: Sleeker and faster than ever before.
- **CLI Usability**: Run it directly from your terminal.
- **Access over the Internet**: Share files with the world (with security in mind).

## 🔧 Environment Variables
These are relevant for the container:

- `FM_PORT`: [5000] The server port to use.
- `FM_SECURE`: Use BASIC-AUTH with the htpasswd file path provided. To use `FM_USER` or `--user`, set `FM_SECURE=true`.
- `FM_USER`: If `FM_SECURE` is used, users can be added manually. `pw` can be a clear password or a password hash created by `htpasswd`. Example: `FM_USER="adam:adam123\neve:eve123"`.
- `FM_MAXSIZE`: [300] Set the max file size for uploads in MB.
- `FM_LOGGING`: Output logging info. Use `*` for full logging.
- `FM_FILTER`: ["zip|tar.gz|7z|..."] Important files to filter for. The pattern is separated by `|`.
- `FM_MIMEFILTER`: ["video/*|audio/*|image/*"] File selection filter for the upload dialog.
- `FM_NAME`: ["File Manager"] Overwrite the web UI title.

## 📂 Volumes
Exposed are:

- `/data`: Folder to use.
- `/logs`: Folder to save any logs to.
- `/secure`: Folder where the `htpasswd` file is (to be used as `FM_SECURE=/secure/htpasswd`).

## 🚀 Usage

### Docker Command

Run the File Manager with Docker:
```bash
docker run -p 5000:5000 -it --volume D:\:/data --name node-filemanager-esm bananaacid/docker-node-filemanager-esm
```

### Docker Compose

Use the following `docker-compose.yaml` to set up your environment:
```yaml
version: '3.3'

services:
  file-manager:
    image: bananaacid/docker-node-filemanager-esm:latest
    restart: unless-stopped
    container_name: file-manager
    hostname: file-manager

    environment:
      FM_FILTER: "zip|tar.gz|7z|7zip|tar|gz|tgz|tbz|tar.bz2|tar.bz|txt|md|doc|docx|otf|ppt|pptx|xls|xlsx|csv|indd|jpg|jpeg|heic|heif|png|ps|svg|ai|avi|mp4|mpg|wav|flac|mpeg|mov"
      FM_MIMEFILTER: "video/*|audio/*|image/*"
      FM_SECURE:
      FM_USER:
      FM_MAXSIZE: 300
      FM_LOGGING: "*"
      FM_NAME: 
    expose:
      - "5000"
    volumes:
      - /data
      - /logs
      - /secure
networks:
  filemanager:
```

## 🔄 Changes

- **Big File Support**: Now you can upload those large files without a hitch! (v3.2.0)
- **Upload Progress**: Stay informed with upload progress updates for all connected clients. (v3.2.0)
- **Max Upload Filesize**: Set limits on file size to keep things under control. (v3.2.0)
- **Cancel File Handling**: Manage canceled file uploads with ease. (v3.2.0)
- **Standalone Support**: Full standalone support with relative path handling. (v3.2.0)
- **File Renaming**: Automatic file renaming to avoid conflicts. (v3.3.1)
- **User Management**: Add users via command line or environment variables. (v3.3.1)
- **Docker Enhancements**: Fixed environment variables and reduced image size from 1GB to 211MB! (v3.3.3)

## 🔐 Generating htaccess, Proxy, etc.
For more details, visit the [npm package page](https://www.npmjs.com/package/node-file-manager-esm).

---

Now you're all set to manage your files like a pro! Happy file managing! 🎉🗂️
