# David Lips - 622590
# script for converting CSV files to JSON format
# usage: python convertCSV2JSON.py -i input_file.csv -c colname1,colname2,colname3 -o output_file.json

import csv
import json
import sys
import optparse

def main():

	# parse command line input
	parser = optparse.OptionParser()

	parser.add_option('-i', '--ifile',
		action="store", dest="inputfile",
		help="example_input.csv", default="test.csv")

	parser.add_option('-c', '--colnames',
		action="store", dest="colnames",
		help="colname1,colname2,colname3", default="")

	parser.add_option('-o', '--ofile',
	    action="store", dest="outputfile",
	    help="example_output.json", default="convertCSV2JSON_output.json")

	options, args = parser.parse_args()
 
	inputfile = options.inputfile
	outputfile = options.outputfile
	colnames = options.colnames.split(',')

	# Open the csv file
	f = open(inputfile, 'rU' )  
	# read csv and skip comment lines
	reader = csv.DictReader(filter(lambda row: row[0]!='#' and row[0]!='"', f), fieldnames = colnames) 
	# Parse the CSV into JSON  
	out = json.dumps([row for row in reader])  
	# Save the JSON  
	f = open(outputfile, 'w')  
	f.write(out)  
	print "JSON file created!"

if __name__ == '__main__':
	main()