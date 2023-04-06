from flask import Blueprint, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from cors import cors_prelight_response, cors_actual_response
import os
import json

pdf = Blueprint("pdf", __name__)

VERSION = '1.0.1'

@pdf.route("/about")
def aboutpage():
    # return a short message that describes what this rout is used for.
    return "<p>This API is designed to load a PDF file with a given path</p>".format(VERSION), 201

@pdf.route("/<path:filename>", methods=["GET", "OPTIONS"])
def getPdf(filename):
	if request.method == "OPTIONS": # CORS - Cross Origin Script
		# The preflight request with method OPTIONS is handled first
		return cors_prelight_response(), 201
	# Import New Project with POST
	elif request.method == "GET":
		return send_from_directory(os.getcwd(), filename)
