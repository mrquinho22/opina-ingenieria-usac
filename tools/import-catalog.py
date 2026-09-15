"""Captura reproducible de fuentes oficiales. Requiere beautifulsoup4.
Descargar páginas con --download; sin él usa la captura local para revisar.
No se mezclan créditos CLAR con créditos del plan anterior.
"""
import json, sys, urllib.request
from pathlib import Path
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parent.parent
urls={'pensum':'https://redesestudio.ingenieria.usac.edu.gt/redesDeEstudio/ingenieriaEnCienciasYSistemas/28/clar','horarios':'https://usuarios.ingenieria.usac.edu.gt/horarios/semestre/2'}
(ROOT/'.local').mkdir(exist_ok=True)
if '--download' in sys.argv:
    for key,url in urls.items(): (ROOT/f'.local/{key}.html').write_bytes(urllib.request.urlopen(url,timeout=60).read())
p=BeautifulSoup((ROOT/'.local/pensum.html').read_text(encoding='utf8'),'html.parser')
h=BeautifulSoup((ROOT/'.local/horarios.html').read_text(encoding='utf8'),'html.parser')
courses=[]
for row in p.select('.body-red-curricular'):
    code=row.select_one('.body-red-codigo-division small')
    credits=row.select_one('[creditos]')
    name=row.select_one('.body-red-descripcion')
    area=row.select_one('[area]')
    if not all([code,credits,name]): continue
    courses.append(dict(code=code.get_text(strip=True),name=name.get_text(' ',strip=True),credits=int(credits['creditos']),area=area['area'] if area else 'comun',publication_enabled=False,source=urls['pensum']))
# La red marca con atributo area las materias específicas de la carrera.
# Los cursos comunes (matemática, física, idiomas) no llevan ese atributo.
professional={c['code'] for c in courses if c['area'] != 'comun'}
assignments=[]
for row in h.select('#tblHorarios tbody tr'):
    cells=[c.get_text(' ',strip=True) for c in row.find_all('td',recursive=False)]
    if len(cells)<8: continue
    code=cells[0].split()[0]
    if code not in professional: continue
    for index,role in [(6,'catedratico'),(7,'auxiliar')]:
        name=cells[index]
        if not name or name.startswith('SIN ') or name in {'POR ASIGNAR','PENDIENTE'}: continue
        item=dict(code=code,teacher=name,role=role,section=cells[1],semester='2026-2',source=urls['horarios'])
        if item not in assignments: assignments.append(item)
for c in courses: c['publication_enabled']=c['code'] in {a['code'] for a in assignments}
data=dict(captured_at='2026-09-15',plan='CLAR 2025',semester='2026-2',sources=urls,courses=courses,assignments=assignments)
(ROOT/'database/catalog.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(f'{len(courses)} cursos; {sum(c["publication_enabled"] for c in courses)} publicables; {len(assignments)} asignaciones.')
