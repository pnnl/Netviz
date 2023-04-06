#!/usr/bin/env python3

import sys
import argparse
from glm_parse import Converter

def get_file_type(args):
	if(args.output_type != None):
		output_type = args.output_type
	elif(args.output_file != None):
		#set output type using file extension
		output_type = args.output_file[-4:]
		output_type = output_type.strip('.')
	else:
		assert False, "example_use.py must be supplied with either --output_type or --output_file"

	return output_type

def main():

	parser = argparse.ArgumentParser()
	
	parser.add_argument('--input_file', required=True, help="The name of the file you want to convert, either a .glm or .json.")
	parser.add_argument('--output_type', required=False, default=None, help= "The type of file you want to output either json, glm or dot")
	parser.add_argument('--output_file', required=False, default=None, help= "The name of the file you want to output after conversion, either a .json, .glm or .dot")

	args = parser.parse_args()

	infilename = args.input_file

	#deteremine output file type, either using output_type arg, or file ending
	output_type = get_file_type(args)

	converter = Converter(infilename, verbose=False)

	outfilename = args.output_file

	if(output_type == 'json'):
		converter.writeJson(outfilename = outfilename)
	elif(output_type == 'dot'):
		converter.writeDot(outfilename = outfilename)
	elif(output_type == 'glm'):
		converter.writeGlm(outfilename = outfilename)


if __name__ == "__main__":
	main()