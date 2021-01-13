# Flower Recognition System

An educational repository utilizing machine learning to recognize flowers in images.

## Features

* Detect and recognize flowers in an image.
* Draw bounding boxes around detected images.
* Show full taxonomy of detected images.
* Search by
    * image
    * keywords.
* Web interface.

## Used Technologies

* Machine Learning
* Convolutional Neural Network
* Tensorflow
* Transfer-Learning
* Object Detection
* `Django` in backend
* `Angular` in frontend

## Trained Flowers

The ML model was trained on following categories of flowers

* Garden Cosmos
* China Rose (Hawaiian Hibiscus)
* Merigold
* Nootka Rose
* Rose
* Sun Flower

## Build and Run

We assume you have following packages already installed

* `python3 < 3.8`
* `virtualenv`
* `pip`
* `nodejs`
* `npm`

### Clone this repository

```bash
git clone https://github.com/chitholian/Flower-Detection
cd Flower-Detection
PROJECT_DIR="$(pwd)"
```

### Build the Frontend

```bash
cd "$PROJECT_DIR/TheFrontEnd"
npm install
ng build --prod
```

### Build the Backend

```bash
cd "$PROJECT_DIR/TheBackEnd"
```

#### Create a Virtual Environment

```bash
virtualenv venv --python=python3
source venv/bin/activate
# Install required packages
pip install -r requirements.txt
```

#### Add Similar Flowers

The web interface shows images matching the keywords or the detected images. We have added very few images in order to keep this repository light. So, we recommend you to add some extra images. Put your images inside child directories (named 0,1,2...5) of `PROJECT_DIR/TheBackEnd/TheApp/flowers/images/`.

Note: After adding images you have to generate thumbnails too (see bellow).

#### Generate Thumbnails and Index

We shall generate thumbnails and create index of taxonomy files.

```bash
cd "$PROJECT_DIR/TheBackEnd/TheApp/flowers"
python index-and-thumb.py
```

#### Run Dev Server

```bash
cd "$PROJECT_DIR/TheBackEnd"
python manage.py runserver
```

Now you can open http://127.0.0.1:8000 in your browser and explore the web interface.
