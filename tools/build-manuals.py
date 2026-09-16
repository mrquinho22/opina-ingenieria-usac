"""Genera manuales PDF desde Markdown editable; requiere reportlab y pymupdf."""
from pathlib import Path
import re, html
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader

ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'output/pdf'; OUT.mkdir(parents=True,exist_ok=True)
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='BodyOpina',fontName='Helvetica',fontSize=10,leading=15,spaceAfter=9,textColor=colors.HexColor('#20374c'),allowWidows=0,allowOrphans=0))
styles.add(ParagraphStyle(name='CellOpina',parent=styles['BodyOpina'],fontSize=8,leading=11,spaceAfter=0,wordWrap='CJK'))
styles.add(ParagraphStyle(name='CodeOpina',fontName='Courier',fontSize=8,leading=11,backColor=colors.HexColor('#edf2f7'),spaceAfter=10))
styles['Title'].textColor=colors.HexColor('#102e4b'); styles['Title'].fontSize=27; styles['Title'].leading=32
for key in ['Heading1','Heading2','Heading3']:
    styles[key].textColor=colors.HexColor('#1959aa'); styles[key].spaceBefore=15; styles[key].spaceAfter=8

def inline(text):
    text=html.escape(text)
    text=re.sub(r'\*\*(.+?)\*\*',r'<b>\1</b>',text)
    text=re.sub(r'`([^`]+)`',r'<font name="Courier">\1</font>',text)
    return text

def footer(canvas,doc):
    canvas.saveState(); canvas.setStrokeColor(colors.HexColor('#d3deea'));canvas.line(42,40,A4[0]-42,40)
    canvas.setFont('Helvetica',8);canvas.setFillColor(colors.HexColor('#64768a'))
    canvas.drawString(42,27,'OPINA INGENIERÍA USAC | Segundo semestre 2026')
    canvas.drawRightString(A4[0]-42,27,str(doc.page));canvas.restoreState()

def build(name):
    styles['BodyOpina'].fontSize=9.5 if name=='manual-tecnico' else 10
    styles['BodyOpina'].leading=14 if name=='manual-tecnico' else 15
    styles['BodyOpina'].spaceAfter=8 if name=='manual-tecnico' else 9
    source=ROOT/'docs'/f'{name}.md'; lines=source.read_text(encoding='utf8').splitlines();story=[];i=0;width=A4[0]-84
    while i<len(lines):
        line=lines[i].strip()
        if not line:i+=1;continue
        if line.startswith('```'):
            code=[];i+=1
            while i<len(lines) and not lines[i].startswith('```'):code.append(lines[i]);i+=1
            story.append(Paragraph('<br/>'.join(html.escape(s).replace(' ','&#160;') for s in code),styles['CodeOpina']));i+=1;continue
        if line.startswith('|'):
            rows=[]
            while i<len(lines) and lines[i].strip().startswith('|'):
                cells=[c.strip() for c in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r'[:\- ]+',c) for c in cells):rows.append([Paragraph(inline(c),styles['CellOpina']) for c in cells])
                i+=1
            count=len(rows[0]); widths=[width/count]*count
            if count==4:widths=[width*.25,width*.27,width*.26,width*.22]
            table=Table(rows,colWidths=widths,repeatRows=1,hAlign='LEFT')
            table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e0eaf5')),('VALIGN',(0,0),(-1,-1),'TOP'),('GRID',(0,0),(-1,-1),.3,colors.HexColor('#cbd6e2')),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]));story.extend([table,Spacer(1,12)]);continue
        match=re.match(r'!\[(.*?)\]\((.*?)\)',line)
        if match:
            path=source.parent/match.group(2);w,h=ImageReader(str(path)).getSize();scale=min(width/w,360/h)
            story.append(KeepTogether([Image(str(path),width=w*scale,height=h*scale),Spacer(1,4),Paragraph(match.group(1)+' - captura real',styles['Caption'] if 'Caption' in styles else styles['BodyOpina']),Spacer(1,12)]));i+=1;continue
        if line.startswith('# '):story.extend([Paragraph(inline(line[2:]),styles['Title']),Paragraph('Proyecto académico · Versión completa · 16/09/2026',styles['BodyOpina']),Spacer(1,12)]);i+=1;continue
        if line.startswith('## '):story.append(Paragraph(inline(line[3:]),styles['Heading2']));i+=1;continue
        if line.startswith('### '):story.append(Paragraph(inline(line[4:]),styles['Heading3']));i+=1;continue
        if line.startswith('- '):story.append(Paragraph('• '+inline(line[2:]),styles['BodyOpina']));i+=1;continue
        paragraph=[line];i+=1
        while i<len(lines) and lines[i].strip() and not lines[i].startswith(('#','|','```','![','- ')) and not re.match(r'\d+\.',lines[i]):paragraph.append(lines[i].strip());i+=1
        story.append(Paragraph(inline(' '.join(paragraph)),styles['BodyOpina']))
    grouped=[]; n=0
    while n<len(story):
        item=story[n]
        if isinstance(item,Paragraph) and item.style.name in ['Heading2','Heading3'] and n+1<len(story):
            grouped.append(KeepTogether([item,story[n+1]]));n+=2
        else:grouped.append(item);n+=1
    doc=SimpleDocTemplate(str(OUT/f'{name}.pdf'),pagesize=A4,rightMargin=42,leftMargin=42,topMargin=40,bottomMargin=55,title=lines[0].lstrip('# '),author='Proyecto Opina Ingeniería USAC')
    doc.build(grouped,onFirstPage=footer,onLaterPages=footer)
    print(OUT/f'{name}.pdf')

for name in ['manual-usuario','manual-tecnico','estudio']:build(name)
