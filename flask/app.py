import numpy as np
import datetime as dt
import pandas as pd
import requests
import json


import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func, distinct, and_

from flask import Flask, jsonify
from flask_cors import CORS


#################################################
# Database Setup
#################################################
rds_connection_string = "immigration_cnn:@localhost:5432/migration_db"
engine = create_engine(f'postgresql://{rds_connection_string}')

# engine = create_engine("sqlite:///Database/migration_pgdb.sqlite")

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

# Save reference to the table
details = Base.classes.details
regional = Base.classes.regional
regions = Base.classes.regions
counties = Base.classes.counties
states = Base.classes.states

labels =['Age 0-5', 'Age 6-10', 'Age 11-15', 'Age 16-20', 'Age 20+', '9th Grade', '12th Grade', 'HS_Dropout', 'HS Grad', 'College 2 Yr', 'Bach Degree', 'Adv Degree', 'College Enroll 18-24', 'College Enroll 25+', 'Median Income FT', 'Median Income PT', 'Income 0-25k', 'Income 25k-48k', 'Income 48k-77k', 'Income 77k-125k', 'Income 125k+', 'Management', 'Science & Eng.', 'Legal Social Service', 'Education & Arts', 'Health care', 'Food prep serve', 'Cleaning & maint.', 'Other services', 'Sales', 'Administrative', 'Farming & fishing', 'Construction', 'Manufacturing', 'Transportation', 'Military', 'Unemployed']

#################################################
# Flask Setup
#################################################
app = Flask(__name__)
cors = CORS(app)


#################################################
# Flask Routes
#################################################

def Generate_lists(countries, years):

    if ":" in years:
    
        year_range = years.split(':')
        year_range = [int(year) for year in year_range]
        year_list = list(range(year_range[0],year_range[1]))
    
    elif years == 'all':
    
        a=1
    
    else:
    
        year_list = years.split('&')
        year_list = [int(year) for year in year_list]


    if countries == 'all':
    
        country_filter = details.birth_country.isnot(None)
        country_list = ['all']

    elif 'region' in countries:

        region = countries.split(":")[1]
        country_list = ObtainCountries(region)
        country_filter = details.birth_country.in_(country_list)



    else:
        country_list = countries.split('&')
        country_filter = details.birth_country.in_(country_list)

    if years == 'all':
    
        year_filter = details.year.isnot(None)
    
    else:
    
        year_filter = details.year.in_(year_list)

    return [country_filter, year_filter, country_list]


def Generate_State_lists(countries, years):

    if ":" in years:
    
        year_range = years.split(':')
        year_range = [int(year) for year in year_range]
        year_list = list(range(year_range[0],year_range[1]))
    
    elif years == 'all':
    
        a=1
    
    else:
    
        year_list = years.split('&')
        year_list = [int(year) for year in year_list]


    if countries == 'all':
    
        country_filter = details.residence.isnot(None)
        country_list = ['all']

#     elif 'region' in countries:

#         region = countries.split(":")[1]
#         country_list = ObtainCountries(region)
#         country_filter = details.birth_country.in_(country_list)

    else:
        country_list = countries.split('&')
        country_filter = details.residence.in_(country_list)

    if years == 'all':
    
        year_filter = details.year.isnot(None)
    
    else:
    
        year_filter = details.year.in_(year_list)
    
    return [country_filter, year_filter, country_list]




def ObtainCountries(region):

    session = Session(engine)

    Dataset = session.query(regions.country)\
    .filter(regions.region == region).all()
    
    session.close
    
    return [row.country for row in Dataset]

  



@app.route("/")
def welcome():
    """List all available api routes."""
    return (
        f"Available Routes:<br/>"
        f"/api/v1.0/years<br>"
        f"/api/v1.0/countries<br>"
        f"/api/v1.0/regions<br>"
        f"/api/v1.0/admission_classes<br>"
        f"/api/v1.0/migration_data/(demography)[age\education\median_income\income\occupation]<br/>"
        f"/api/v1.0/immigrants_by_county/(countries or regions)/(years)/(top)<br/>"
        f"/api/v1.0/immigrants_by_state/(countries or regions)/(years)/(top)<br/>"
        f"/api/v1.0/diversity_by_state/(locations)/(years)/(top)<br/>"
        f"/api/v1.0/top_colonies/(top)<br/>"
        f"Whereas: <br/>"
        f"countries Ex.1 China, Ex.2 China&Japan, Ex.4 region:Europe Ex.5 all<br/>"
        f"years Ex.1 2012, Ex.2 2012&2014, Ex.3 all<br/>"
  
    )

@app.route("/api/v1.0/countries")
def GetCountries():

    session = Session(engine)

    country = distinct(details.birth_country)
    Dataset = session.query(country).all()

    session.close

    myJson = [row[0] for row in Dataset]

    myJson.sort()

    return jsonify(myJson)

@app.route("/api/v1.0/years")
def GetYears():

    session = Session(engine)

    country = distinct(details.year)
    Dataset = session.query(country).all()

    session.close

    myJson = [row[0] for row in Dataset]

    myJson.sort()

    return jsonify(myJson)

@app.route("/api/v1.0/regions")
def GetRegions():

    session = Session(engine)

    country = distinct(regions.region)
    Dataset = session.query(country).all()

    session.close

    myJson = [row[0] for row in Dataset]

    myJson.sort()

    return jsonify(myJson)

@app.route("/api/v1.0/admission_classes")
def admission_classes():

    session = Session(engine)

    country = distinct(details.admission_class)
    Dataset = session.query(country).all()

    session.close

    myJson = [row[0] for row in Dataset]

    myJson.sort()

    return jsonify(myJson)




@app.route("/api/v1.0/migration_data/<demography>")
def migration_data(demography):

    session = Session(engine)

    stmt = session.query(regional).statement
    df = pd.read_sql_query(stmt, session.bind)

    session.close

    if demography == 'age':
        n = 2
        demography_df = df.iloc[:, n:7]

    elif demography == 'education':
        
        n = 7
        demography_df = df.iloc[:, n:14]
        
    elif demography == 'median_income':
        
        n=16
        demography_df = df.iloc[:, n:18]

    elif demography == 'income':
        
        n=18
        demography_df = df.iloc[:, n:23]

    elif demography == 'occupation':
        
        n=23
        demography_df = df.iloc[:, n:39]

    else:
        return jsonify('data not found')

    headers = [column for column in demography_df.columns]
    

    traces = [demography_df[column].to_list() for column in demography_df.columns]

    myjson = {
        'demography':demography,
        'labels':df.iloc[:,1].to_list(),
        'headers':headers,
        'values': traces
        }

    return jsonify(myjson)

    

@app.route("/api/v1.0/immigrants_by_county/<countries>/<years>/<top>")
def immigrants_by_county(countries, years = 'all', top = 'all'):

    country_filter, year_filter, country_list =  Generate_lists(countries, years)

    population_count = func.sum(details.admissions).label('Count')

    if top == 'all':
        sortby = population_count.desc()
        top = 9000000
    else:
        sortby = population_count.desc()

    session = Session(engine)

    Dataset = session.query(details.residence, details.residence_county, counties.latitude, counties.longitude, population_count)\
    .filter(country_filter)\
    .filter(year_filter)\
    .join(counties, and_(details.residence_county == counties.county, details.residence == counties.state))\
    .group_by(details.residence, details.residence_county, counties.latitude, counties.longitude)\
    .order_by(sortby)\
    .limit(int(top))\
    .all()

    session.close

    json =  {

        'subject': ', '.join(country_list),
        'labels':['Count'],
        'max': Dataset[0][4],
        'locations': [[*row] for row in Dataset]
    }

    return jsonify(json)

@app.route("/api/v1.0/immigrants_by_state/<countries>/<years>/<top>")
def immigrants_by_state(countries, years, top):

    country_filter, year_filter, country_list =  Generate_lists(countries, years)

    population_count = func.sum(details.admissions).label('Count')

    if top == 'all':
        sortby = population_count.desc()
        top = 9000000
    else:
        sortby = population_count.desc()

    session = Session(engine)

    Dataset = session.query(details.residence, states.latitude, states.longitude, population_count)\
    .filter(country_filter)\
    .filter(year_filter)\
    .group_by(details.residence, states.latitude, states.longitude)\
    .filter(details.residence == states.name)\
    .order_by(sortby)\
    .limit(int(top))\
    .all()

    session.close

    json = {
    
    'subject': ', '.join(country_list),
    'labels':['Count'],
    'max': Dataset[0][3],
    'locations': [[*row] for row in Dataset]
    }

    return jsonify(json)

@app.route("/api/v1.0/diversity_by_state/<locations>/<years>/<top>")
def diversity_by_state(locations, years, top):

    country_filter, year_filter, country_list =  Generate_State_lists(locations, years)

    population_count = func.sum(details.admissions).label('Count')

    if top == 'all':
        top = 9000000

    session = Session(engine)

    Dataset = session.query(details.birth_country, population_count)\
    .filter(country_filter)\
    .filter(year_filter)\
    .group_by(details.birth_country)\
    .order_by(population_count.desc())\
    .limit(int(top))\
    .all()

    session.close

    total = 0
    for row in Dataset:
        total += row[1] 

    json = {

    'subject': ', '.join(country_list),
    'labels':[row.birth_country for row in Dataset],
    'counts': [row[1] for row in Dataset],
    'total': total
    }

    return jsonify(json)

@app.route("/api/v1.0/top_colonies/<top>")
def top_colonies(top):

    population_count = func.sum(details.admissions).label('Count')
    population_max = func.sum(population_count).label('Max')

    if top == 'all':
        sortby = population_count.desc()
        top = 9000000
    else:
        sortby = population_count.desc()


    session = Session(engine)

    stmt = session.query(details.birth_country, details.residence, details.residence_county, counties.latitude, counties.longitude, population_count)\
    .join(counties, and_(details.residence_county == counties.county, details.residence == counties.state))\
    .group_by(details.birth_country, details.residence, details.residence_county, counties.latitude, counties.longitude)\
    .order_by(sortby)\
    .limit(int(top))\
    .statement

    session.close

    df = pd.read_sql_query(stmt, session.bind)

    result = df.to_json(orient="records")

    Data = json.loads(result)



    headers = [{'headerName':column, 'field':column} for column in df.columns]


    output_json = {
                    'headers':headers,
                    'data':Data
                }



    return jsonify(output_json)



if __name__ == '__main__':
    app.run(debug=True)