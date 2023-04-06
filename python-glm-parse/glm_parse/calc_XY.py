import numpy as np
import time
import graphviz
from graphviz import Source
import json
import io
import math


#This stack overflow link is useful for understanding the projection method used in setXYfromLatLong function: 
#https://stackoverflow.com/questions/16266809/convert-from-latitude-longitude-to-x-y
def setXYfromLongLat(converter):

    #earths radius in m
    EARTH_RADIUS = 6367000.0

    #Used for scaling meters to Dot inches, 3.281ft per meter, 
    # 0.005 feet per DOT inch
    METER2DOT =  3.281 * 0.005 

    max_lat = float("-inf")
    min_lat = float("inf")
    max_lng = float("-inf")
    min_lng = float("inf")

    #first loop is to calculate phi_0(mid lat point of map) for use in projection
    for node in converter.lists['nodes']:
        dot_props = node.dot_props()
        has_pos = 'latitude' in dot_props.keys() and 'longitude' in dot_props.keys() and dot_props['latitude'] != None and dot_props['longitude'] != None
        if has_pos:
            lat = math.radians(float(dot_props['latitude']))
            lng = math.radians(float(dot_props['longitude']))

            if lat != None:
                if lat < min_lat:
                    min_lat = lat
                if lat > max_lat:
                    max_lat = lat
            if lng != None :
                if lng < min_lng:
                    min_lng = lng
                if lng > max_lng:
                    max_lng = lng
          
    #phi_0 should be set to mid lat-point of your map
    phi_0 = (max_lat + min_lat) /2
    
    #Set origin, used to 'center' map
    min_X =  min_lng * math.cos(phi_0) * EARTH_RADIUS * METER2DOT
    min_Y =  min_lat * EARTH_RADIUS * METER2DOT
    origin = (min_X,min_Y)

    #second loop sets X and Y
    savedX = None 
    savedY = None
    for node in converter.lists['nodes']:
        dot_props = node.dot_props()
        has_pos = 'latitude' in dot_props.keys() and 'longitude' in dot_props.keys() and dot_props['latitude'] != None and dot_props['longitude'] != None
        if has_pos:
            lng = math.radians(float(dot_props['longitude']))
            lat = math.radians(float(dot_props['latitude']))
        
            X =  lng * math.cos(phi_0) * EARTH_RADIUS
            Y =  lat * EARTH_RADIUS

            scaled_X = X * METER2DOT
            scaled_Y = Y * METER2DOT
            
            translated_X = scaled_X - origin[0]
            translated_Y = scaled_Y - origin[1]

            node['meta_props']['X_pos'] = str(translated_X)
            node['meta_props']['Y_pos'] = str(translated_Y)

def setXYfromGraph(converter):
    names = []
    for n in converter.lists['nodes']:
        names += [n['meta_props']['name']]

    # Use a position layout moth for calcualting the position
    if converter.position_layout == 'circle':
        nodePos = calc_circle_positions(names, converter.lists['edges'])
    else:
        nodePos = calc_graphviz_neato(converter)
    
    for n in converter.lists['nodes']:
        name = n['meta_props']['name']
        if name in nodePos.keys():
            n['meta_props']['X_pos'] = str(nodePos[name][0])
            n['meta_props']['Y_pos'] = str(nodePos[name][1])

def setXY(converter):
    if(converter.calc_geo_pos):
        setXYfromLongLat(converter)
    else:
        setXYfromGraph(converter)

def calc_circle_positions(nodes, p_edges, scale = 1):
    rotate = None
    center = None
    
    radius_bump = scale / len(nodes)

    if(len(nodes)) == 1:
        radius = 0.0
    else:
        radius = radius_bump

    if rotate is None:
        rotate = np.pi / len(nodes)
    
    initial_theta = rotate
    npos = {}
    for n in nodes:
        theta = (
            np.linspace(0, 2 * np.pi, len(nodes), endpoint=False) + initial_theta
        )

        pos = radius * np.column_stack([np.cos(theta), np.sin(theta)])
        npos.update(zip(nodes,pos))
        radius += radius_bump
        initial_theta += rotate
    
    return npos

def calc_graphviz_neato(converter):
    # Load the DOT data into a Graphviz Source Object
    src = Source(converter.to_dot(), engine='dot', format='json')
    #src.render("temp_rendered") 
    
    # Pipe the output of the graph digram out and parse it into a JSON object
    jsonGra = json.loads(src.pipe())
	
    # get all the node Ids
    node_names = {}
    for node in converter.lists['nodes']:
        node_names[node.clean_dot_name(node['meta_props']['name'])] = node['meta_props']['name']

    # Init an empty collection of node positions
    nodePositions = {}
    # Use the objects in the JSON to identify the node positions
    if('objects' in jsonGra.keys()):
        for obj in jsonGra['objects']:
            if obj['name'] in node_names.keys() and 'pos' in obj.keys():
                pos =  obj['pos'].split(',')
                name = node_names[obj['name']]
                nodePositions[name] = [float(pos[0]), float(pos[1])]
    return nodePositions