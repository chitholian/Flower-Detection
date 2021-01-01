#!/usr/bin/env python

from whoosh.filedb.filestore import FileStorage
from whoosh.index import create_in
from whoosh.fields import *
from PIL import Image
import glob
import os


schema = Schema(title=TEXT(stored=True), cat_id=ID(stored=True), content=TEXT)
storage = FileStorage("indexdir")

# ## Create index of flowers ## #
ix = storage.create_index(schema)
writer = ix.writer()

# Collect categories.
with open('ML-Models/labelmap.txt', 'r') as labels:
    i = 0
    for line in labels:
        label = line.strip()
        if len(label) == 0:
            continue
        print(f'{i}. Working on flower "{label}"...')

        print(f'{i}. Reading taxanomy...')
        with open(f'taxanomy/{i}.html', 'r') as flower_info:
            info = label + '\n' + flower_info.read()
            print(f'{i}. Creating index...')
            writer.add_document(title=f"{label}", cat_id=f"{i}", content=info)

        print(f'{i}. Creating thumbnails...')
        for image in glob.glob(f'images/{i}/*.jpg'):
            try:
                img = Image.open(image)
                img.thumbnail((128, 128), Image.ANTIALIAS)
                target_name = os.path.basename(image)
                img.save(f'thumbs/{i}/{target_name}', 'JPEG')
                print(f'{i}. thumbs/{i}/{target_name}... Done')
            except IOError:
                print(f'{i}. Cannot create thumbnail for {image}')
        i = i + 1

writer.commit()

print("... All Done!")
