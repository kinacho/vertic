with open('src/pages/TutorialPage.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '<SideLabel name=\\"Albert\\"' in line or 'name=\\"Albert\\"' in line:
        lines[i] = '            {albert && i === 0 && <SideLabel name="Albert" aqui style={{ top: \'50%\', transform: \'translateY(-50%)\', right: \'calc(100% + 20px)\' }} />}\n'
    elif '{playerName && i === 2 && <SideLabel' in line:
        lines[i] = '            {playerName && i === 2 && <SideLabel name={playerName} color="#ffffff" style={{ top: \'50%\', transform: \'translateY(-50%)\', right: \'calc(100% + 20px)\' }} />}\n'
    elif '{i === 0 && revealStep >= 0 && <SideLabel' in line:
        lines[i] = '            {i === 0 && revealStep >= 0 && <SideLabel name="Albert" aqui style={{ top: \'50%\', transform: \'translateY(-50%)\', right: \'calc(100% + 20px)\' }} />}\n'
    elif '{i === 3 && revealStep >= 0 && <SideLabel' in line:
        lines[i] = '            {i === 3 && revealStep >= 0 && <SideLabel name={playerName || \'Player\'} color="#ffffff" style={{ top: \'50%\', transform: \'translateY(-50%)\', right: \'calc(100% + 20px)\' }} />}\n'
    elif '{i === 11 && revealStep >= 7 && <SideLabel' in line:
        lines[i] = '            {i === 11 && revealStep >= 7 && <SideLabel name={playerName || \'Player\'} color="#ffffff" style={{ top: \'50%\', transform: \'translateY(-50%)\', right: \'calc(100% + 20px)\' }} />}\n'

with open('src/pages/TutorialPage.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
