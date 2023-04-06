from flask import Blueprint, request, jsonify
from cors import cors_prelight_response, cors_actual_response
from werkzeug.utils import secure_filename
import os
import json

graphicalSettings = Blueprint("graphicalSettings", __name__)

VERSION = '1.0.2'
PROJECT_TYPE_NAME_KEY = 'NetViz-' + VERSION + '-GraphicalSettings'
SETTINGS_FILE_NAME = "server/graphical-settings.json"

@graphicalSettings.route("/about")
def aboutpage():
	# return a short message that describes what this rout is used for.
	resultStr = "<p>This API is designed to access the Graphics Settings for the NetViz App.</p><p>Current Version is: {version}</p><p>Current Working Directory: {cwd}</p>"
	return resultStr.format(version=VERSION, cwd=os.getcwd()), 201

@graphicalSettings.route("/", methods=["GET", "POST", "OPTIONS"])
def getGraphicalSettings():
	if request.method == "OPTIONS": # CORS - Cross Origin Script
		# The preflight request with method OPTIONS is handled first
		return cors_prelight_response(),201
	# Return the Graphical Settings as JSON with GET
	elif request.method == "GET":
		if os.path.exists(SETTINGS_FILE_NAME):
			# Open the settings file for graphics
			jsonGraphicSettingsFile = open(SETTINGS_FILE_NAME)
			jsonGraphicSettingsContent = jsonGraphicSettingsFile.read()
			jsonGraphicSettingsStruct = json.loads(jsonGraphicSettingsContent)
			return cors_actual_response(jsonify(jsonGraphicSettingsStruct)), 200
		else:
			return cors_actual_response(jsonify({
				"success": False,
				"message": "graphics settings file not found [" + SETTINGS_FILE_NAME + "]"
			})), 404
	# Update Graphical Settings as JSON with POST
	elif request.method == "POST":
		jsonGraphicSettingsStruct = request.get_json()

		if os.path.exists(SETTINGS_FILE_NAME):
			with open(SETTINGS_FILE_NAME, "w") as outfile:
				json.dump(jsonGraphicSettingsStruct, outfile, indent=4, sort_keys=True)

		data = jsonify({
			"success": True,
			"message": "success"
		})

		return cors_actual_response(data), 200