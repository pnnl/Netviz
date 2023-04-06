import os
import argparse
from flask import Flask, send_from_directory
from glm import glm as glm_blueprint
from projects import projects as projects_blueprint
from nnd import nnd as nnd_blueprint
from pdf import pdf as pdf_blueprint
from graphicalSettings import graphicalSettings as graphicalSettings_blueprint
from linkages import linkages as linkages_blueprint

def create_app() -> Flask:
	app = Flask(__name__, static_folder="")

	# Serve React App
	@app.route('/', defaults={'path': ''})
	@app.route('/<path:path>')
	def root(path):
			buildFolderPath = app.static_folder + '/build'
			if os.path.isdir(buildFolderPath):
				app.static_folder = buildFolderPath
			else:
				buildFolderPath = app.static_folder + '/../build'
				if os.path.isdir(buildFolderPath):
					app.static_folder = buildFolderPath

			print("Path is = {p}, static folder = {s}, build folder = {b}".format(p = path, s = app.static_folder, b = buildFolderPath))

			if path != "" and os.path.exists(app.static_folder + '/' + path):
					return send_from_directory(app.static_folder, path)
			else:
					return send_from_directory(app.static_folder, 'index.html')

	with app.app_context():
		app.register_blueprint(glm_blueprint, url_prefix="/api/glm/")
		app.register_blueprint(projects_blueprint, url_prefix="/api/projects/")
		app.register_blueprint(nnd_blueprint, url_prefix="/api/nnd/")
		app.register_blueprint(pdf_blueprint, url_prefix="/api/pdf/")
		app.register_blueprint(graphicalSettings_blueprint, url_prefix="/api/graphicalSettings/")
		app.register_blueprint(linkages_blueprint, url_prefix="/api/linkages/")

	return app

def setCurrentWorkingDirectory(argValue):
	# if no arg value was passed send back cwd from os
	if argValue is None:
		return os.getcwd()
	
	_cwd = argValue

	# check if the param starts with "".""
	if _cwd.startswith('./') or _cwd.startswith('.\\'):
		# add current workign directory, and remove the "."
		_cwd = os.getcwd() + _cwd[1:]

	if os.path.isdir(_cwd):
		os.chdir(_cwd)
	else:
		print("--cwd param ERROR: Path not found {path}".format(path=_cwd))

	return _cwd

if __name__ == '__main__':
	parser = argparse.ArgumentParser()
	parser.add_argument('--cwd', required=False, help="The path or current working directory for the server and server files.")
	args = parser.parse_args()

	# use teh param to set the current workign directory for the API server
	setCurrentWorkingDirectory(args.cwd)

	create_app().run(host="127.0.0.1", port=40401)