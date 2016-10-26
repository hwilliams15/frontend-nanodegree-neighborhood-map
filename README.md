# Neighborhood Map

## Basic installation
* Run `npm install` in the project root directory.
* Open the index.html page in your web browser.

## Ngrok (optional)
* You can use ngrok for localhost tunneling.
* Start Python server: `python -m SimpleHTTPServer 8080`
* You can now go to http://localhost:8080/dist/index.html
* To use ngrok if dependency doesn't exist, run `npm install` in the root folder of the project.
* Run ngrok: `node_modules/ngrok/bin/ngrok http 8080`.
* Use the output URL for example, http://54f3a59c.ngrok.io/index.html
