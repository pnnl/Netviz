from flask import Blueprint, request, jsonify
from cors import cors_prelight_response, cors_actual_response
from werkzeug.utils import secure_filename
from glm_parse import Converter
import os
import json
import shutil
import sys
import platform

projects = Blueprint("projects", __name__)

VERSION = '1.0.1'
PROJECT_TYPE_NAME_KEY = 'NetViz-' + VERSION + '-ProjectFile'

@projects.route("/about")
def aboutpage():
	# return a short message that describes what this rout is used for.
	resultStr = "<p>This API is designed to access user projects for the NetViz App.</p><p>Current Version is: {version}</p><p>Current Working Directory: {cwd}</p>"
	return resultStr.format(version=VERSION, cwd=os.getcwd()), 201

@projects.route("/", methods=["GET", "POST", "DELETE", "OPTIONS"])
def getProjects():
	if request.method == "OPTIONS": # CORS - Cross Origin Script
		# The preflight request with method OPTIONS is handled first
		return cors_prelight_response(),201
	elif request.method == "GET":
		
		if not os.path.isdir("server/projects/"):
			os.makedirs('server/projects')

		jsonProjectFiles = [f for f in os.listdir("server/projects/") if f.endswith('.json')]
		jsonProjectData = []

		for jsFileName in jsonProjectFiles:
			jsFile = open("server/projects/" + jsFileName)
			jsData = json.load(jsFile)


			# JSON files must have a type prop on the root and they must be equal to the PROJECT_TYPE_NAME_KEY specified above
			if "type" in jsData and jsData['type'] == PROJECT_TYPE_NAME_KEY:
				jsonProjectData.append(jsData)

			jsFile.close()
		
		data = {
				"projects": jsonProjectData,
				"success": True,
		}
		
		return cors_actual_response(jsonify(data)), 200
	# Create New Project with POST
	elif request.method == "POST":
		if not os.path.isdir("server/projects/"):
			os.makedirs('server/projects')

		jsonProjectData = request.get_json()
		fileName = 'server/projects/' + secure_filename(jsonProjectData['name']) + '.json'

		while os.path.exists(fileName):
			data = {
					"projects": [jsonProjectData],
					"fileName": None,
					"success": False,
			}
		
		with open(fileName, 'w') as outfile:
			json.dump(jsonProjectData, outfile, indent=4, sort_keys=True)

		data = {
				"projects": [jsonProjectData],
				"fileName": fileName,
				"success": True,
		}
		
		return cors_actual_response(jsonify(data)), 200
	# Delete project with DELETE
	elif request.method == "DELETE":
		jsonProjectData = request.get_json()
		projectName = secure_filename(jsonProjectData['name'])
		projectJson = 'server/projects/' + projectName + '.json'
		projectDir = "server/projects/" + projectName + "/"

		try:
			os.remove(projectJson)
			if(os.path.isdir(projectDir)):
				shutil.rmtree(projectDir)
		except:
			data = jsonify({
				"success": False,
				"message": "Project failed to delete"
			})
			return cors_actual_response(data), 400

		data = jsonify({
			"success": True,
			"message": "Project successfully deleted"
		})
		return cors_actual_response(data), 200

@projects.route("/get-linkages", methods=["POST", "OPTIONS"])
def getLinkages():
	if request.method == "OPTIONS": # CORS - Cross Origin Script
		# The preflight request with method OPTIONS is handled first
		return cors_prelight_response(),201
	# Import New Project with POST
	elif request.method == "POST":
		serverFileName = request.get_json()['server-file-name']
		info = JsonFileInforamtion(serverFileName)

		if info['success'] and os.path.exists(serverFileName):
			data = jsonify({
				"success": True,
				"message": "success",
				"linkages": loadJsonFile(serverFileName)
			})
			return cors_actual_response(data), 200
		else:
			data = jsonify({
				"success": False,
				"message": "Json failed to load from file: " + serverFileName,
			})
			return cors_actual_response(data), 400


@projects.route("/check-file", methods=["POST"])
def checkProjectFile():
	if request.method == "POST":
		# The actual request following the preflight
		# ---------------------------------------------
		if not request.files or not 'check-file' in request.files:
			return jsonify({
				"success": False,
				"message": "Invalid input, check-file required.",
				"fileType": "missing",
			}), 400
				
		fileRef = request.files['check-file']

		if not os.path.isdir("server/"):
			os.makedirs('server')

		if not os.path.isdir("server/uploads/"):
			os.makedirs('server/uploads')

		if not os.path.isdir("server/uploads/temp"):
			os.makedirs('server/uploads/temp')

		inFileName = "server/uploads/temp/" + secure_filename(fileRef.filename)
		if os.path.exists(request.form['file-path']):
			
			filename, file_extension = os.path.splitext(inFileName)

			if file_extension == '.json':
				# write the import file to the temp directory
				tempDir = open(inFileName,'w')
				inputFile = open(request.form['file-path'], 'r')
				tempDir.write(inputFile.read())
				tempDir.close()
				inputFile.close()

				data = JsonFileInforamtion(inFileName)
			elif file_extension == '.glm':

				file_path = request.form['file-path']

				if platform.system() == "Windows":
					file_path_arr = file_path.split('\\')
				else:
					file_path_arr = file_path.split('/')

				home_dir = os.getcwd()
				
				if platform.system() == "Windows":
					file_dir = '\\'.join(file_path_arr[0:-1])
				else:
					file_dir = '/'.join(file_path_arr[0:-1])


				#change directory to load included files by file path found in selected glm file
				os.chdir(file_dir)
				parsedGlm = Converter(file_path_arr[-1], calc_pos=True, verbose=False, position_layout='graphviz')
				#change back to previous working directory
				os.chdir(home_dir)
				
				inFileNameAsJson = inFileName.replace('.glm', '.json')
				parsedGlm.writeJson(inFileNameAsJson)
				data = JsonFileInforamtion(inFileNameAsJson)
			else:
				data = {
					"success": False,
					"fileType": "invalid",
					"version": None,
					"uploadedFileName": inFileName,
					"message": "The file extension [" + file_extension + "] is invalid."
				}
		else:
			data = {
				"success": False,
				"fileType": "invalid",
				"version": None,
				"uploadedFileName": inFileName,
				"message": "Could not find file [" + inFileName + "]"
			}

		return cors_actual_response(jsonify(data)),200
		# ---------------------------------------------
	else:
			raise RuntimeError("Weird - don't know how to handle method {}".format(request.method))

@projects.route("/import-after-check", methods=["POST", "OPTIONS"])
def importProject():
	if request.method == "OPTIONS": # CORS - Cross Origin Script
		# The preflight request with method OPTIONS is handled first
		return cors_prelight_response(),201
	# Import New Project with POST
	elif request.method == "POST":

		if not os.path.isdir("server/projects/"):
			os.makedirs('server/projects')

		jsonFormData = request.get_json()
		jsonProjectData = jsonFormData['project']
		jsonImportData = jsonFormData['import']

		# If updating files for an existing project, remove old files
		projectName = secure_filename(jsonProjectData['name'])
		projectJsonFile = "server/projects/" + projectName + ".json"
		projectDir = "server/projects/" + projectName 
		if os.path.isdir(projectDir):
			if os.path.isfile(projectJsonFile):
				with open(os.path.abspath(projectJsonFile), "r") as oldJson:
					projectJson = json.load(oldJson)
					if (jsonImportData['fileType'] == 'NND') and (projectJson['commsFile']):
						os.remove(projectJson['commsFile'])
					if (jsonImportData['fileType'] == 'GLM-JSON') and (projectJson['powerFile']):
						os.remove(projectJson['powerFile'])

		# Make a folder for the current project
		if not os.path.isdir("server/projects/" + projectName + "/"):
			os.makedirs("server/projects/" + projectName)
		
		# Move the temp file from the temp location into the project folder with a sub folder named after the project file name
		tempImportFilePath = jsonImportData['uploadedFileName']
		projectImportFilePath = tempImportFilePath.replace('server/uploads/temp/', "server/projects/" + projectName + "/")
		os.rename(tempImportFilePath, projectImportFilePath)

		# If the imported file was a NND file, set the commsFile value to the file path in the projects folder
		if jsonImportData['fileType'] == 'NND':
			jsonProjectData['commsFile'] = projectImportFilePath

		# If the imported file was a GLM-JSON file, set the powerFile value to the file path in the projects folder
		if jsonImportData['fileType'] == 'GLM-JSON':
			jsonProjectData['powerFile'] = projectImportFilePath

		# If the imported file was a GLM file, convert the GLM to a GLM-JSON, then set the powerFile value to the file path in the projects folder
		if jsonImportData['fileType'] == 'GLM':
			parsedGlm = Converter(projectImportFilePath, calc_pos=True, verbose=False, position_layout='graphviz')
			projectImportFilePathAsJson = projectImportFilePath.replace('.glm', '.json')
			jsonProjectData['powerFile'] = projectImportFilePathAsJson

			with open(projectImportFilePathAsJson, 'w') as outfile:
				json.dump(parsedGlm.to_json(), outfile, indent=4, sort_keys=True)

		# If the imported file was a linkages file, set the linkagesFile value to the file path in the projects folder
		if jsonImportData['fileType'] == 'Linkages':
			jsonProjectData['linkagesFile'] = projectImportFilePath

		# Save the project to the projects folder with the calcaulted settings
		fileName = 'server/projects/' + projectName + '.json'
		
		with open(fileName, 'w') as outfile:
			json.dump(jsonProjectData, outfile, indent=4, sort_keys=True)

		data = {
			"projects": [jsonProjectData],
			"fileName": fileName,
			"success": True,
		}
		
		return cors_actual_response(jsonify(data)), 200

@projects.route("/update-project", methods=["PUT", "OPTIONS"])
def updateProject():
	if request.method == "OPTIONS": # CORS - Cross Origin Script
		# The preflight request with method OPTIONS is handled first
		return cors_prelight_response(),201
	# Update project data with PUT
	elif request.method == "PUT":
		projectData = request.get_json()
		projectName = secure_filename(projectData['name'])
		projectJsonFile = "server/projects/" + projectName + ".json"
		projectDirName = "server/projects/" + projectName + "/"
		
		if projectData['powerFile']:
			path = projectData['powerFile'].split("/")
		elif projectData['commsFile']:
			path = projectData['commsFile'].split("/")
		
		oldName = path[2]

		if oldName != projectName:
			shutil.move("server/projects/" + oldName + "/", projectDirName)
			shutil.move("server/projects/" + oldName + ".json", projectJsonFile)
			if projectData['powerFile']:
				projectData['powerFile'] = projectData['powerFile'].replace(oldName, projectName)
			if projectData['commsFile']:
				projectData['commsFile'] = projectData['commsFile'].replace(oldName, projectName)

		with open(projectJsonFile, 'w') as outfile:
			json.dump(projectData, outfile, indent=4, sort_keys=True)

		data = {
			"projects": [projectData],
			"fileName": projectJsonFile,
			"success": True
		}
		
		return cors_actual_response(jsonify(data)), 200

def loadJsonFile(fullFileName):
	jsonFile = open(fullFileName)
	jsonContent = jsonFile.read()
	jsonStruct = json.loads(jsonContent)
	return jsonStruct

def JsonFileInforamtion(fullFileName):
	jsonFile = open(fullFileName)
	jsonContent = jsonFile.read()
	jsonStruct = json.loads(jsonContent)

	# Check if it is an NND JSON File
	if 'NNDVersion' in jsonStruct and 'HELICSFederateName' in jsonStruct:
		return {
			"success": True,
			"fileType": "NND",
			"version": jsonStruct['NNDVersion'],
			"uploadedFileName": fullFileName,
			"message": "Valid NND JSON File"
		}
	elif 'header' in jsonStruct and 'glm_lines' in jsonStruct:
		return {
			"success": True,
			"fileType": "GLM-JSON",
			"version": "1.0",
			"uploadedFileName": fullFileName,
			"message": "Valid GLM JSON File"
		}
	elif 'linkages' in jsonStruct:
		return {
			"success": True,
			"fileType": "Linkages",
			"version": "1.0",
			"uploadedFileName": fullFileName,
			"message": "Valid Linkages File"
		}
	else:
		return {
			"success": False,
			"fileType": "UNKNOWN-JSON",
			"version": None,
			"uploadedFileName": fullFileName,
			"message": "Invalid JSON file Structure"
		}
