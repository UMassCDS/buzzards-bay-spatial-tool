## Techstack
- Reactjs
- Nodejs
- Mantine Component Library
- React-Leaflet
- Leaflet Legend Library (Unmaintained had to make modifications)
- h3-js

## Getting env files
You need .env files to run local and for deployment.

The frontend .env has sections you can comment out depending on local or production deployment.

Please get the .env's from the drive folder shared to you by ethan. Make sure you place them in `backend` and `frontend` respectively and rename to .env.

## Compiling images

`docker compose build` to build the images.

`docker tag umasscds/bb_backend bbinterviewtool.azurecr.io/bb_backend:vX.X.X` and `docker tag umasscds/bb_frontend bbinterviewtool.azurecr.io/bb_frontend:vX.X.X` to tag the images.

`docker push bbinterviewtool.azurecr.io/bb_frontend:vX.X.X` and `docker push bbinterviewtool.azurecr.io/bb_backend:vX.X.X` to push to azure container registry.

After pushing you can restart Azure services to update the deployment.

## Code structure
The frontend code in src is organized in components and context mostly. Components hold DOM objects and the context holds the application logic. Things like currently selected hexagons and previous hexagons, etc are all in this context. Components use the context functions to modify and update the context.

The backend code has one function to save to Azure database. The db.js file has logic to save from frontend request. The .env for backend has Azure connection information. The .env for frontend for connecting to backend, whether if it's in local or deployed on azure.

The backend is also responsible for sending the sensor site locations and values to frontend when the application starts.

