import json

nb_path = r'd:\My projects\ISRO\kaggle_notebook\isro-lunar-loftr-matching.ipynb'

with open(nb_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Update cell 1
source = data['cells'][0]['source']
for i, line in enumerate(source):
    if 'Bharatiya Antariksh Hackathon' in line:
        source[i] = line.replace('Bharatiya Antariksh Hackathon', 'Antrix Hackathon by Smart India Hackathon')

source.insert(4, '    <h4 style="color: #666;">Represented by LumaInit</h4>\\n')

with open(nb_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=1)

print('Updated successfully.')
