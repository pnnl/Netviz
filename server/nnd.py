from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from cors import cors_prelight_response, cors_actual_response
import os
import json
import graphviz
import sys
import csv

nnd = Blueprint("nnd", __name__)

VERSION = '1.0.1'

@nnd.route("/about")
def aboutpage():
	# return a short message that describes what this rout is used for.
	resultStr = "<p>This API is designed to convert NND file to DOT files for the NetViz App.</p><p>Current Version is: {version}</p><p>Current Working Directory: {cwd}</p>"
	return resultStr.format(version=VERSION, cwd=os.getcwd()), 201

@nnd.route("/get-json", methods=["POST", "OPTIONS"])
def getJson():
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
				"nnd_json": loadJsonFile(serverFileName)
			})
			return cors_actual_response(data), 200
		else:
			data = jsonify({
				"success": False,
				"message": "Json failed to load from file: " + serverFileName,
			})
			return cors_actual_response(data), 400

@nnd.route("/write-json", methods=["POST", "OPTIONS"])
def writeJson():
	if request.method == "OPTIONS": # CORS - Cross Origin Script
		# The preflight request with method OPTIONS is handled first
		return cors_prelight_response(), 201
	elif request.method == "POST":
		if not os.path.isdir("server/projects/"):
			os.makedirs('server/projects')
	
		writeJsonData = request.get_json()

		projectData = writeJsonData['project']
		glmJson = writeJsonData['nndJson']

		projectName = secure_filename(projectData['name'])

		if not os.path.isdir("server/projects/" + projectName + "/"):
			data = jsonify({
				"success": False,
				"message": "Invalid input, project: " + projectName + " not found.",
			})
			return cors_actual_response(data), 400
		
		fileName = projectData['commsFile']

		writeJsonFile(glmJson, fileName)

		data = jsonify({
			"success": True,
			"message": "success"
		})

		return cors_actual_response(data), 200

@nnd.route("/export-pdf", methods=["POST", "OPTIONS"])
def exportPdf():

	if request.method == "OPTIONS": # CORS - Cross Origin Script
		# The preflight request with method OPTIONS is handled first
		return cors_prelight_response(), 201
	elif request.method == "POST":
		serverFileName = request.get_json()['server-file-name']
		info = JsonFileInforamtion(serverFileName)
		if(info['success'] and os.path.exists(serverFileName)):

			json = loadJsonFile(serverFileName)
			src = createGraphForExport(json, serverFileName[:-4])
			fullPathFileRendered = src.render(directory=os.getcwd())

			data = jsonify({
				"success": True,
				"message": "success",
				"pdf": fullPathFileRendered.replace(os.getcwd(),'').replace('\\','/')
			})

			return cors_actual_response(data), 200

@nnd.route("/export-csv", methods=["POST", "OPTIONS"])
def exportCsv():

    if request.method == "OPTIONS": # CORS - Cross Origin Script
		# The preflight request with method OPTIONS is handled first
        return cors_prelight_response(), 201
    elif request.method == "POST":
        jsonFileName = request.get_json()['server-file-name']
        timeString = request.get_json()['time-string']
        csvJson = request.get_json()['csv-json']
        objType = request.get_json()['obj-type']

        download_path = get_download_path()
        download_path += '\\Netviz_Output'+timeString+'\\'
        os.makedirs(download_path,exist_ok=True)

        data_file = open(download_path+'comms_network_'+objType+'.csv', 'w', newline='')
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

@nnd.route("/download-file", methods=["POST", "OPTIONS"])
def downloadFile():

	if request.method == "OPTIONS": # CORS - Cross Origin Script
		# The preflight request with method OPTIONS is handled first
		return cors_prelight_response(), 201
	elif request.method == "POST":
		serverFileName = request.get_json()['server-file-name']
		timeString = request.get_json()['time-string']
		info = JsonFileInforamtion(serverFileName)
		if(info['success'] and os.path.exists(serverFileName)):

			jsonString = loadJsonFile(serverFileName)
			download_path = get_download_path()
			download_path += '\\Netviz_Output'+timeString+'\comms_files\\'
			os.makedirs(download_path,exist_ok=True)
			sys.stderr.write(download_path + serverFileName + '\n')
			fileName = os.path.split(serverFileName)[-1]
			writeJsonFile(jsonString, download_path+fileName)

			data = jsonify({
				"success": True,
				"message": "success",
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

def JsonFileInforamtion(fullFileName):
	jsonFile = open(fullFileName)
	jsonContent = jsonFile.read()
	jsonStruct = json.loads(jsonContent)

	if 'NNDVersion' in jsonStruct:
		return {
			"success": True,
			"fileType": "NND",
			"version": jsonStruct['NNDVersion'],
			"uploadedFileName": fullFileName,
			"message": "Valid NND JSON File"
		}
	else:
		return {
			"success": False,
			"fileType": "NND",
			"version": None,
			"uploadedFileName": fullFileName,
			"message": "No NND version provided"
		}

def createGraphForExport(json, fileName):

		node_style = {"fontname":"Helvetica", "fontcolor":"/x11/gray50", "fontsize":"8", "colorscheme":"accent8"}
		edge_style = {"colorscheme":"accent8"}
		dot = graphviz.Graph(fileName[:-5]+"_comms", comment='The comms net', engine='neato', node_attr=node_style, edge_attr=edge_style)

		nodes = list(json["network"]["nodes"].keys())
		for name in nodes:
			node = json["network"]["nodes"][name]

			node_type = 'monitor'
			if("typeName" in node.keys()):
				node_type = node["typeName"]

			x = 0
			y = 0
			scale = 0.012
			if("position" in node.keys()):

				x =  node['position']['x'] * scale
				#flip y axis because graph is upside down with positive scale
				y =  node['position']['y'] * -scale
				position = "{},{}!".format(x, y)
			

			label = name + '\n' + "({})".format(node_type)
			sys.stderr.write(node_type)
			if node_type == 'monitor':
				dot.node(name, label,shape="square", pos=position)
			elif (node_type == 'Router'):
				dot.node(name, label,shape="trapezium", pos=position)
			elif (node_type == 'Sensor'):
				dot.node(name, label,shape="triangle", pos=position)
			elif (node_type == 'Server'):
				dot.node(name, label,shape="octogon", pos=position)
			elif (node_type == 'switch'):
				dot.node(name, label,shape="doublecircle", pos=position)
			else:
				dot.node(name, label,shape="circle", pos=position)

		
		subnets = json['network']['topology']['subnets']
		subnetNames = list(subnets.keys())

		for subnetName in subnetNames:
				links = subnets[subnetName]['links'] 
				for link in links:
						interfacesKeys = list(link['interfaces'].keys())  
						for iKey in interfacesKeys:
								origin = iKey
								for m in range(1,len(interfacesKeys)):
										#fromNodeJson = json['network']['nodes'][origin]
										#toNodeJson = json['network']['nodes'][interfacesKeys[m]]
										#fromIpAddr = fromNodeJson["interfaces"][0]["ipAddr"]
										#toIpAddr = toNodeJson["interfaces"][0]["ipAddr"]
										if(origin in nodes and interfacesKeys[m] in nodes and origin != interfacesKeys[m]):
											dot.edge(origin, interfacesKeys[m], **{'color':'5','penwidth':'2'})
										
								

									
		return(dot)


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