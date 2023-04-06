from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from glm_parse import Converter
from graphviz import Source
from cors import cors_prelight_response, cors_actual_response
import os
import json
import sys

linkages = Blueprint("linkages", __name__)

VERSION = '1.0.1'

@linkages.route("/write-json", methods=["POST", "OPTIONS"])
def writeJson():
	if request.method == "OPTIONS": # CORS - Cross Origin Script
		# The preflight request with method OPTIONS is handled first
		return cors_prelight_response(), 201
	elif request.method == "POST":
		if not os.path.isdir("server/projects/"):
			os.makedirs('server/projects')
	
		writeJsonData = request.get_json()

		projectData = writeJsonData['project']
		linkagesJson = writeJsonData['linkagesJson']

		projectName = secure_filename(projectData['name'])

		if not os.path.isdir("server/projects/" + projectName + "/"):
			data = jsonify({
				"success": False,
				"message": "Invalid input, project: " + projectName + " not found.",
			})
			return cors_actual_response(data), 400
		
		fileName = projectData['linkagesFile']

		writeJsonFile(linkagesJson, fileName)

		data = jsonify({
			"success": True,
			"message": "success"
		})

		return cors_actual_response(data), 200

def writeJsonFile(data, fullFileName):
	with open(fullFileName, "w") as outfile:
		json.dump(data, outfile, indent=4, sort_keys=True)