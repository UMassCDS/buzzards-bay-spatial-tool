# Buzzards Bay Spatial Tool
A tool used to collect spatial annotations in interviews.

## Future Dev
Please refer to devnotes.md to learn about the dev side of the project.

## Installation
Open your terminal and clone the repo: `git clone https://github.com/UMassCDS/buzzards-bay-spatial-tool.git`, or download as a zip

To get started you just have install node.js

Go to: https://nodejs.org/en and install node.js, choose your configurations if you are prompted to do so.

After installation check if it's installed correctly.

Run `node --version` in a new terminal window, if you are seeing a version number it is installed correctly.

Carry on with the set up of the application.

Run `npm i` in both frontend and backend directories.

## How to run

1. Open two terminals
2. Navigate to backend in one terminal
3. `npm run start`
4. It will tell you it is running on `localhost:5174`
2. Navigate to frontend in the other terminal
3. `npm run dev`
4. It will tell you it is running on `localhost:5173`
5. Navigate to that url on your browser and start using. Instructions about the application is found inside the application by clicking on the dock icon.

## How to run with docker
1. Install Docker desktop by downloading the installer from their site
2. navigate to root of this project
3. Run `docker compose build`
4. Run `docker compose up`
5. Navigate to `localhost`

## How to deploy, generically
1. Install Docker desktop
2. Run `docker compose build`
3. Create your account with a Cloud service provider, like Azure
Next steps might vary based on your service provider, but here are some general steps, Azure compliant:
4. Create a container registry
5. Tag and upload your image to the registry
6. Create application service plan
7. Create two application services, one for the frontend and one for the backend
8. While creating services, set the input to use the image from the registry

Note: You probably have to update the .env to point to the correct backend url. To redeploy, you have to update the image in the registry and restart the services.

This was a very high level overview of the process, and you should refer to the documentation of your service provider for more detailed instructions, for bb interview tool refer to provided documentation on drive.