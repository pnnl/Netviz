from flask import make_response

def cors_prelight_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add('Access-Control-Allow-Headers', "*")
    response.headers.add('Access-Control-Allow-Methods', "*")
    return response

def cors_actual_response(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response