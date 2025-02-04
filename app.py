#!/bin/usr/env python

# TODO
# Import configuration from a app.json file
# Read from the configuration the endpoint we can query
# Request data from endpoint
# Save data to a CSV file

import requests
import json
import csv


def main():
    # Load configuration from app.json
    with open('app.json', 'r') as f:
        config = json.load(f)
        endpoint = config['endpoint']
    # Request data from endpoint
    response = requests.get(endpoint)
    data = response.json()
    # Save data to a CSV file
    with open('data.csv', 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(data.keys())
        writer.writerow(data.values())


def isOdd(number):
    return number % 2 != 0


if __name__ == '__main__':
    main()
