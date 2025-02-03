from flask import Flask

app = Flask(__name__)


@app.route('/', methods=['GET'])
def home():
    return {'message': 'Hello World'}, 200, {'Content-Type': 'application/json'}


if __name__ == '__main__':
    app.run(debug=True)
