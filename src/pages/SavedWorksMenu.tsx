import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../hooks/useGameContext';
import { SavedWork } from '../types';
import PageTitle from '../components/PageTitle';

const SavedWorksMenu: React.FC = () => {
   const navigate = useNavigate();
   const { dispatch } = useGameContext();
   const [savedWorks, setSavedWorks] = useState<SavedWork[]>([]);
   const [isDeleting, setIsDeleting] = useState(false);
   const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

   useEffect(() => {
      const stored = localStorage.getItem('vertic_saved_works');
      if (stored) {
         try {
            const parsed = JSON.parse(stored);
            setSavedWorks(parsed);
         } catch (e) {
            console.error('Failed to parse saved works', e);
         }
      }
   }, []);

   const getWorks = () => savedWorks.slice(0, 350);

   const handleWorkClick = (work: SavedWork) => {
      if (isDeleting) {
          const newSelected = new Set(selectedIds);
          if (newSelected.has(work.id)) newSelected.delete(work.id);
          else newSelected.add(work.id);
          setSelectedIds(newSelected);
      } else {
          dispatch({ type: 'LOAD_SAVED_WORK', payload: work });
          dispatch({ type: 'SET_SCREEN', payload: 'free-mode-board' });
          navigate('/free-board');
      }
   };

   const deleteSelected = () => {
       const filtered = savedWorks.filter(w => !selectedIds.has(w.id));
       setSavedWorks(filtered);
       setSelectedIds(new Set());
       localStorage.setItem('vertic_saved_works', JSON.stringify(filtered));
       
       if (filtered.length === 0) {
           navigate('/');
       }
   };

   return (
      <div className="screen-container" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100vh', boxSizing: 'border-box', background: 'white', color: '#1e293b' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '2rem' }}>
             <h1 style={{ margin: 0, fontSize: '2rem', color: '#1e293b' }}>Obras aprobadas por Albert Crostic</h1>
             <div style={{ display: 'flex', gap: '1rem' }}>
                 {isDeleting && selectedIds.size > 0 && (
                    <button className="btn btn-primary" style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }} onClick={deleteSelected}>
                        Borrar los seleccionados ({selectedIds.size})
                    </button>
                 )}
                 <button className="btn btn-secondary" style={{ backgroundColor: '#9333ea', color: 'white', borderColor: '#9333ea' }} onClick={() => { setIsDeleting(!isDeleting); setSelectedIds(new Set()); }}>
                    {isDeleting ? 'Cancelar' : 'Borrar'}
                 </button>
                 <div style={{ padding: '0.5rem', border: '2px solid #1e293b', borderRadius: '8px', background: '#f8fafc' }}>
                    <button className="btn btn-secondary" style={{ border: 'none', backgroundColor: '#9333ea', color: 'white' }} onClick={() => navigate('/')}>Volver al menú</button>
                 </div>
             </div>
         </div>

         <div style={{ 
             flex: 1, 
             overflowX: 'hidden', 
             overflowY: 'auto', 
             display: 'flex', 
             flexDirection: 'row', 
             flexWrap: 'wrap', 
             alignContent: 'flex-start',
             justifyContent: 'flex-start',
             gap: '1rem',
             paddingTop: '1rem'
         }}>
             {getWorks().map((work) => {
                 const isSelected = selectedIds.has(work.id);
                 const color = work.mode === 'free-pure' ? '#10b981' : (work.mode === 'challenge' ? '#ef4444' : '#1e293b');
                 
                 return (
                     <div 
                         key={work.id} 
                         onClick={() => handleWorkClick(work)}
                         className="animate-fade-in"
                         style={{
                             display: 'flex',
                             alignItems: 'center',
                             padding: '0.5rem 1rem',
                             background: isSelected ? 'rgba(239, 68, 68, 0.1)' : '#f8fafc',
                             border: `1px solid ${isSelected ? '#ef4444' : '#e2e8f0'}`,
                             borderRadius: '0.5rem',
                             cursor: 'pointer',
                             width: '300px',
                             boxSizing: 'border-box',
                             transition: 'all 0.2s',
                             whiteSpace: 'nowrap',
                             overflow: 'hidden',
                             textOverflow: 'ellipsis'
                         }}
                     >
                         {isDeleting && (
                             <div style={{ 
                                 width: '18px', height: '18px', border: '2px solid #64748b', 
                                 borderRadius: '4px', marginRight: '0.8rem', display: 'flex', 
                                 alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                 background: isSelected ? '#ef4444' : 'transparent',
                                 borderColor: isSelected ? '#ef4444' : '#64748b'
                             }}>
                                 {isSelected && <span style={{ color: 'white', fontSize: '14px', lineHeight: 1, fontWeight: 'bold' }}>✕</span>}
                             </div>
                         )}
                         <span style={{ color, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                             {work.title || 'Sin Título'}
                         </span>
                     </div>
                 );
             })}
         </div>

         {/* Albert Crostic in Bottom Right */}
         <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', display: 'flex', alignItems: 'flex-end', zIndex: 100 }}>
            <div style={{ 
               position: 'relative', 
               background: 'white', 
               border: '2px solid #1e293b', 
               borderRadius: '1.5rem', 
               padding: '1rem', 
               marginBottom: '5rem',
               marginRight: '1rem',
               maxWidth: '200px',
               boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
               fontSize: '0.9rem',
               fontWeight: 'bold',
               color: '#1e293b'
            }}>
               Tu futuro como verticaloguista está en mis manos.
               {/* Bubble tail */}
               <div style={{ 
                  position: 'absolute', 
                  bottom: '-10px', 
                  right: '20px', 
                  width: '20px', 
                  height: '20px', 
                  background: 'white', 
                  borderRight: '2px solid #1e293b', 
                  borderBottom: '2px solid #1e293b', 
                  transform: 'rotate(45deg)' 
               }} />
            </div>
            <div style={{ width: '250px', height: '250px', overflow: 'hidden', background: 'transparent' }}>
               <img 
                 src="/assets/crostic.png" 
                 alt="Albert Crostic" 
                 style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
               />
            </div>
         </div>

         <PageTitle title="Obras Aprobadas" />
      </div>
   );
};

export default SavedWorksMenu;
