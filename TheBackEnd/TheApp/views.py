from django.http import JsonResponse
import tensorflow as tf
import numpy as np
from PIL import Image
from django_numpy_json_encoder.numpy_encoder import NumpyJSONEncoder
from whoosh.qparser import QueryParser

from TheProject.settings import BASE_DIR

from whoosh.filedb.filestore import FileStorage
from whoosh.fields import *

import glob
import os


def get_taxanomy_and_images(categories):
    categories = [i % 6 for i in categories]
    taxanomy = {}
    similar_images = {}
    with open(f'{BASE_DIR}/TheApp/flowers/ML-Models/labelmap.txt', 'r') as label_file:
        i = 0
        for line in label_file:
            label = line.strip()
            if len(label) == 0:
                continue
            if i not in categories:
                taxanomy[i] = ''
                similar_images[i] = []
            else:
                thumbs = glob.glob(f'{BASE_DIR}/TheApp/flowers/thumbs/{i}/*.jpg')
                images = [os.path.basename(t) for t in thumbs[:20]]
                similar_images[i] = images
                with open(f'{BASE_DIR}/TheApp/flowers/taxanomy/{i}.html', 'r') as info_file:
                    taxanomy[i] = info_file.read()
            i = i + 1

    return list(taxanomy.values()), list(similar_images.values())


def search(request):
    if request.method != 'POST':
        return JsonResponse({
            'error': 'Method not allowed'
        }, status=405)
    if request.POST['searchType'] == 'keywords':
        if not request.POST['keywords']:
            return JsonResponse({'error': 'Bad request'}, status=400)

        result = {
            'detections': 0,
            'locations': [],
            'scores': [],
            'categories': [],
            'similarImages': [],
            'taxanomy': [],
            'queryType': 'keywords',
        }

        schema = Schema(title=TEXT(stored=True), cat_id=ID(stored=True), content=TEXT)
        storage = FileStorage(f'{BASE_DIR}/TheApp/flowers/indexdir')
        ix = storage.open_index(schema=schema)
        with ix.searcher() as searcher:
            query = QueryParser('content', ix.schema).parse(request.POST['keywords'])
            results = searcher.search(query)
            for r in results:
                if 'cat_id' in r:
                    cid = int(r['cat_id'])
                    result['categories'].append(cid)

        result['detections'] = len(set(result['categories']))

        result['taxanomy'], result['similarImages'] = get_taxanomy_and_images(result['categories'])

        return JsonResponse(result, safe=True)

    elif request.POST['searchType'] == 'image':
        if not request.FILES['image']:
            return JsonResponse({'error': 'Bad request'}, status=400)

        # Run inference on the uploaded image.
        image = Image.open(request.FILES.get('image'))
        image = image.resize((300, 300)).convert('RGB')
        image = np.asarray(image, dtype=np.uint8)

        # Load TFLite model and allocate tensors.
        interpreter = tf.lite.Interpreter(model_path=f"{BASE_DIR}/TheApp/flowers/ML-Models/model.tflite")
        interpreter.allocate_tensors()

        # Get input and output tensors.
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()

        input_shape = input_details[0]['shape']

        input_data = np.reshape(image, input_shape)
        interpreter.set_tensor(input_details[0]['index'], input_data)

        interpreter.invoke()

        locations = interpreter.get_tensor(output_details[0]['index'])
        categories = interpreter.get_tensor(output_details[1]['index'])
        scores = interpreter.get_tensor(output_details[2]['index'])
        detections = interpreter.get_tensor(output_details[3]['index'])

        result = {
            'detections': 0,
            'locations': [],
            'scores': [],
            'categories': [],
            'similarImages': [],
            'taxanomy': [],
            'queryType': 'image',
        }

        for d in range(int(detections[0])):
            score = scores[0][d]
            if score >= 0.25:
                loc = locations[0][d]
                category = categories[0][d]
                result['detections'] = result['detections'] + 1
                result['locations'].append(loc)
                result['scores'].append(score)
                result['categories'].append(category)

        result['taxanomy'], result['similarImages'] = get_taxanomy_and_images(result['categories'])

        return JsonResponse(result, encoder=NumpyJSONEncoder, safe=True)

    else:
        return JsonResponse({'error': 'Bad request'}, status=400)

    # return JsonResponse({'error': 'Server Error'}, status=500)
