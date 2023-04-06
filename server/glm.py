from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from glm_parse import Converter
from graphviz import Source
from cors import cors_prelight_response, cors_actual_response
import os
import json
import sys
import csv

glm = Blueprint("glm", __name__)

VERSION = '1.0.1'

@glm.route("/about")
def aboutpage():
    # return a short message that describes what this rout is used for.
	resultStr = "<p>This API is designed to convert GLM file to DOT files for the NetViz App.</p><p>Current Version is: {version}</p><p>Current Working Directory: {cwd}</p>"
	return resultStr.format(version=VERSION, cwd=os.getcwd()), 201

@glm.route("/upload-file", methods=["POST", "OPTIONS"])
def uploadGlmFile():

    if request.method == "OPTIONS": # CORS - Cross Origin Script
        # The preflight request with method OPTIONS is handled first
        return cors_prelight_response(),201
    elif request.method == "POST":
        # The actual request following the preflight
        # ---------------------------------------------
        if not request.files or not 'in-file' in request.files:
            return jsonify({
                "file_on_server": None,
                "uploaded_file_name": None,
                "errors": ["Invalid input, in-file and out-file are required."],
                "sent": request.files,
                "message": "Invalid input, in-file and out-file are required.",
                "success": False
            }), 400

        fileRef = request.files['in-file']

        if not os.path.isdir("server/"):
            os.makedirs('server')

        if not os.path.isdir("server/uploads/"):
            os.makedirs('server/uploads')

        inFileName = "server/uploads/" + secure_filename(fileRef.filename)
        fileRef.save(inFileName)

        data = {
            "file_on_server": inFileName,
            "uploaded_file_name": fileRef.filename,
            "errors": None,
            "sent": request.files,
            "message": "File successfully uploaded",
            "success": True,
        }

        return cors_actual_response(jsonify(data)), 200
        # ---------------------------------------------
    else:
        raise RuntimeError("Weird - don't know how to handle method {}".format(request.method))

@glm.route("/get-json", methods=["POST", "OPTIONS"])
def parseJsonFromGlmFile():
    if request.method == "OPTIONS": # CORS - Cross Origin Script
        # The preflight request with method OPTIONS is handled first
        return cors_prelight_response(),201
    elif request.method == "POST":
        # The actual request following the preflight
        # ---------------------------------------------
        
        serverFileName = request.get_json()['server-file-name']

        if os.path.exists(serverFileName):
            data = {
                **{
                    "glm_json": loadJsonFile(serverFileName) if serverFileName.endswith(".json") else parseFiletoJson(serverFileName)
                },
                **{
                    "success": True,
                    "message": "success"
                }
            }
        else:
            data = {
                "glm_json": None,
                "success": False,
                "message": "Could not find file [" + serverFileName + "]"
            }

        return cors_actual_response(jsonify(data)),200
        # ---------------------------------------------
    else:
        raise RuntimeError("Weird - don't know how to handle method {}".format(request.method))

@glm.route("/write-json", methods=["POST", "OPTIONS"])
def writeJson():
	if request.method == "OPTIONS": # CORS - Cross Origin Script
		# The preflight request with method OPTIONS is handled first
		return cors_prelight_response(), 201
	elif request.method == "POST":
		if not os.path.isdir("server/projects/"):
			os.makedirs('server/projects')
	
		writeJsonData = request.get_json()

		projectData = writeJsonData['project']
		glmJson = writeJsonData['glmJson']

		projectName = secure_filename(projectData['name'])

		if not os.path.isdir("server/projects/" + projectName + "/"):
			data = jsonify({
				"success": False,
				"message": "Invalid input, project: " + projectName + " not found.",
			})
			return cors_actual_response(data), 400
		
		fileName = projectData['powerFile']

		writeJsonFile(glmJson, fileName)

		data = jsonify({
			"success": True,
			"message": "success"
		})

		return cors_actual_response(data), 200

def writeJsonFile(data, fullFileName):
	with open(fullFileName, "w") as outfile:
		json.dump(data, outfile, indent=4, sort_keys=True)

def loadJsonFile(fullFileName):
	jsonFile = open(fullFileName)
	jsonContent = jsonFile.read()
	jsonStruct = json.loads(jsonContent)
	return jsonStruct

def JsonFileInforamtion(jsonStruct):
	# Check if it is a valid GLMJson\ File
	if 'header' in jsonStruct and 'glm_lines' in jsonStruct:
		return {
			"success": True,
			"fileType": "GLM-JSON",
			"version": "1.0",
			"message": "Valid GLM JSON File"
		}
	else:
		return {
			"success": False,
			"fileType": "UNKNOWN-JSON",
			"version": None,
			"message": "Invalid JSON file Structure"
		}

def parseFiletoJson(serverFileName):
    parsedGlm = Converter(serverFileName, calc_pos=True, verbose=False, position_layout='graphviz')
    json_out = json.loads(parsedGlm.to_json())
    # send results to client
    return json_out

@glm.route("/export-pdf", methods=["POST", "OPTIONS"])
def exportPdf():

    if request.method == "OPTIONS": # CORS - Cross Origin Script
		# The preflight request with method OPTIONS is handled first
        return cors_prelight_response(), 201
    elif request.method == "POST":
        jsonFileName = request.get_json()['server-file-name']

        pdfFileName = jsonFileName[:-5]+"_power"
        parsedGlm = Converter(jsonFileName, calc_pos=True, verbose=False, position_layout='graphviz')
        src = Source(parsedGlm.to_dot(), filename=pdfFileName, engine='dot', format='pdf')
        src.render(directory=os.getcwd())

        data = jsonify({
			"success": True,
			"message": "success",
            "pdf": "{f}.pdf".format(f = pdfFileName)
		})

        return cors_actual_response(data), 200

@glm.route("/export-csv", methods=["POST", "OPTIONS"])
def exportCsv():

    if request.method == "OPTIONS": # CORS - Cross Origin Script
		# The preflight request with method OPTIONS is handled first
        return cors_prelight_response(), 201
    elif request.method == "POST":
        jsonFileName = request.get_json()['server-file-name']
        timeString = request.get_json()['time-string']
        csvJson = request.get_json()['csv-json']
        objType = request.get_json()['obj-type']



        pdfFileName = jsonFileName[:-5]+"_power"
        download_path = get_download_path()
        download_path += '\\Netviz_Output'+timeString+'\\'
        os.makedirs(download_path,exist_ok=True)

        data_file = open(download_path+'power_network_'+objType+'.csv', 'w', newline='')
        csv_writer = csv.writer(data_file)
        
        count = 0
        for data in csvJson['objects']:
            if count == 0:
                header = data.keys()
                csv_writer.writerow(header)
                count += 1
            csv_writer.writerow(data.values())
        
        data_file.close()
        #sys.stderr.write(str(csvJson))
        sys.stderr.write(download_path + '\n')
        data = jsonify({
			"success": True,
			"message": "success",
		})

        return cors_actual_response(data), 200

@glm.route("/download-file", methods=["POST", "OPTIONS"])
def downloadFile():

    if request.method == "OPTIONS": # CORS - Cross Origin Script
		# The preflight request with method OPTIONS is handled first
        return cors_prelight_response(), 201
    elif request.method == "POST":
        jsonFileName = request.get_json()['server-file-name']
        timeString = request.get_json()['time-string']

        pdfFileName = jsonFileName[:-5]+"_power"
        parsedGlm = Converter(jsonFileName, calc_pos=True, verbose=False, position_layout='graphviz')
        download_path = get_download_path()
        download_path += '\\Netviz_Output'+timeString+'\power_files\\'
        os.makedirs(download_path,exist_ok=True)
        sys.stderr.write(download_path + '\n')
        parsedGlm.writeGlm(outfoldername=download_path)


        data = jsonify({
			"success": True,
			"message": "success",
		})

        return cors_actual_response(data), 200


def get_download_path():
    """Returns the default downloads path for linux or windows"""
    if os.name == 'nt':
        import winreg
        sub_key = r'SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders'
        downloads_guid = '{374DE290-123F-4565-9164-39C4925E467B}'
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, sub_key) as key:
            location = winreg.QueryValueEx(key, downloads_guid)[0]
        return location
    else:
        return os.path.join(os.path.expanduser('~'), 'downloads')




