import re

with open("src/pages/TutorialPage.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Fix 1: Back button
back_btn = r"<button className=\"btn btn-secondary\" style={{ position: 'fixed', top: '1.5rem', left: '1.5rem', zIndex: 300 }} onClick={e => { e.stopPropagation(); navigate('/'); }}>\n        <ArrowLeft size={16} />&nbsp;Exit\n      </button>"
new_back_btn = """<div style={{ position: 'fixed', top: '1.5rem', left: '1.5rem', zIndex: 300, display: 'flex', gap: '1rem' }}>
        <button className="btn btn-secondary" onClick={e => { e.stopPropagation(); navigate('/'); }}>
          <ArrowLeft size={16} />&nbsp;Exit
        </button>
        {step > 1 && step < 32 && (
          <button className="btn btn-secondary" onClick={e => { e.stopPropagation(); setStep(p => Math.max(1, p - 1)); }}>
            Volver atrás
          </button>
        )}
      </div>"""
text = text.replace("<button className=\"btn btn-secondary\" style={{ position: 'fixed', top: '1.5rem', left: '1.5rem', zIndex: 300 }} onClick={e => { e.stopPropagation(); navigate('/'); }}>\n        <ArrowLeft size={16} />&nbsp;Exit\n      </button>", new_back_btn)

# Fix 2: Player name color to white instead of blue
text = text.replace('color="#3b82f6"', 'color="#ffffff"')

# Fix 3: Player text in GRANO to A (i===2), Albert to i===0.
# We ensure the SideLabel is fixed. I'll just regex replace the lines in GranoCol.
text = re.sub(r"\{albert && i === 0 && <SideLabel.*?\}", r"{albert && i === 0 && <SideLabel name=\"Albert\" aqui style={{ top: '50%', transform: 'translateY(-50%)', right: 'calc(100% + 20px)' }} />}", text)
text = re.sub(r"\{playerName && i === 1 && <SideLabel.*?\}", r"{playerName && i === 2 && <SideLabel name={playerName} color=\"#ffffff\" style={{ top: '50%', transform: 'translateY(-50%)', right: 'calc(100% + 20px)' }} />}", text)
text = re.sub(r"\{playerName && i === 2 && <SideLabel.*?\}", r"{playerName && i === 2 && <SideLabel name={playerName} color=\"#ffffff\" style={{ top: '50%', transform: 'translateY(-50%)', right: 'calc(100% + 20px)' }} />}", text)

# Fix 4: In GranodearrozCol, Albert at i===0, Player at i===3 and i===11.
gda_find = r"\{i === 3 && revealStep >= 0 && <SideLabel.*?\}\n.*?\{i === 11 && revealStep >= 7 && <SideLabel.*?\}"
gda_repl = """{i === 0 && revealStep >= 0 && <SideLabel name=\"Albert\" aqui style={{ top: '50%', transform: 'translateY(-50%)', right: 'calc(100% + 20px)' }} />}
            {i === 3 && revealStep >= 0 && <SideLabel name={playerName || 'Player'} color=\"#ffffff\" style={{ top: '50%', transform: 'translateY(-50%)', right: 'calc(100% + 20px)' }} />}
            {i === 11 && revealStep >= 7 && <SideLabel name={playerName || 'Player'} color=\"#ffffff\" style={{ top: '50%', transform: 'translateY(-50%)', right: 'calc(100% + 20px)' }} />}"""
text = re.sub(gda_find, gda_repl, text, flags=re.DOTALL)

# Let's also forcefully insert Albert in Granodearroz if it's missing entirely:
if "SideLabel name=\"Albert\"" not in text.split("GranodearrozCol")[1]:
    text = re.sub(r'return \(\n\s*<div key=\{i\} style=\{\{ display: \'flex\', alignItems: \'baseline\', position: \'relative\' \}\}>',
                  "return (\n          <div key={i} style={{ display: 'flex', alignItems: 'baseline', position: 'relative' }}>\n            " + gda_repl, text, count=1)

# Fix 5: Next to 'el' and 'de' put inline AQUI
aqui_tag = """<span style={{ position: 'absolute', right: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#10b981', letterSpacing: '2px' }}>AQUÍ</span>
                  <svg width="24" height="16" viewBox="0 0 24 16" fill="none"><path d="M0 8H20M20 8L14 2M20 8L14 14" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>"""

text = text.replace("<span style={{ color: stepExtraWords >= 28 ? '#10b981' : 'inherit', textDecoration: stepExtraWords >= 28 ? 'underline' : 'none' }}>el</span>",
                    "<span style={{ position: 'relative', color: stepExtraWords >= 28 ? '#10b981' : 'inherit', textDecoration: stepExtraWords >= 28 ? 'underline' : 'none' }}>{(stepExtraWords >= 28) && " + aqui_tag + "}el</span>")
text = text.replace("<span style={{ color: stepExtraWords >= 28 ? '#10b981' : 'inherit', textDecoration: stepExtraWords >= 28 ? 'underline' : 'none' }}>de</span>",
                    "<span style={{ position: 'relative', color: stepExtraWords >= 28 ? '#10b981' : 'inherit', textDecoration: stepExtraWords >= 28 ? 'underline' : 'none' }}>{(stepExtraWords >= 28) && " + aqui_tag + "}de</span>")

# Fix 6: In bubble for 28: "eliminar las dos veces que aparece subrayada en verde"
text = text.replace("unas palabras extra <span style={{color: '#10b981', textDecoration: 'underline'}}>aquí</span> subrayada en verde y <span style={{color: '#10b981', textDecoration: 'underline'}}>aquí</span> subrayada en verde.",
                    "unas palabras extra <span style={{color: '#10b981', textDecoration: 'underline'}}>aquí</span> y <span style={{color: '#10b981', textDecoration: 'underline'}}>aquí</span>.")

# In bubble 29: remove underline/green from bubble.
text = text.replace("stepExtraWords={28}", "stepExtraWords={step}")

# Fix 7: In ESTE_DATA, size of pre marks
# The rendering of ¿ in GranVerticalogoCol must be 3rem like the main chars!
text = text.replace("{row.pre && <span style={{ position: 'absolute', right: '100%', top: 0 }}>{row.pre}</span>}",
                    "{row.pre && <span style={{ position: 'absolute', right: '100%', top: 0, fontSize: '3rem', fontWeight: 900, color: '#f8fafc', marginTop: '-0.3rem' }}>{row.pre}</span>}")

with open("src/pages/TutorialPage.tsx", "w", encoding="utf-8") as f:
    f.write(text)

print("success!")
