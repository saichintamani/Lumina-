import json

nb_path = r'd:\My projects\ISRO\kaggle_notebook\isro-lunar-loftr-matching.ipynb'

with open(nb_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Update cell 1
source = data['cells'][0]['source']
for i, line in enumerate(source):
    if 'Antrix Hackathon by Smart India Hackathon' in line:
        source[i] = line.replace('Antrix Hackathon by Smart India Hackathon', 'Smart India Hackathon')

with open(nb_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=1)

print('Updated successfully.')
