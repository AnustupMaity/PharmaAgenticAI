# Protein 3D Visualizer

## Overview
Ultra-modern, premium protein structure visualization tool integrated into PharmaAI platform with authentication protection.

## Features

### 🔐 Authentication Protected
- Only authenticated users can access
- Redirects to login if not authenticated
- Seamless integration with existing auth flow

### 📥 Multiple Loading Methods

1. **PDB ID Loading**
   - Load structures directly from RCSB Protein Data Bank
   - Example IDs: 1CRN, 2HHB, 6LU7 (COVID spike protein)
   - Press Enter or click "Load Structure"

2. **URL Loading**
   - Load from any public PDB/mmCIF URL
   - Supports AlphaFold predictions
   - Example: `https://alphafold.ebi.ac.uk/files/AF-P12345-F1-model_v4.pdb`

3. **File Upload**
   - Drag & drop or click to upload
   - Supports: .pdb, .ent, .cif, .mmcif
   - Local file visualization

### 🎨 Visualization Styles

Switch between multiple rendering modes:
- **Cartoon** - Classic ribbon representation (default)
- **Stick** - Ball-and-stick model
- **Sphere** - Space-filling spheres
- **Surface** - Van der Waals surface

### 🎯 UI/UX Features

- **Glassmorphism Design** - Modern frosted glass aesthetic
- **Responsive Layout** - Side panel + main viewer
- **Real-time Feedback** - Loading states, error messages
- **Structure Info Card** - Shows loaded structure details
- **No Overflow** - Properly contained 3D viewer
- **Smooth Animations** - Professional transitions
- **Gradient Accents** - Matches PharmaAI brand

## Usage

1. **Navigate to Protein Page**
   ```
   http://localhost:5173/protein
   ```

2. **Load a Structure**
   - Try example: Enter `1CRN` and click "Load Structure"
   - Or upload a PDB file
   - Or paste AlphaFold URL

3. **Explore**
   - Rotate: Click + drag
   - Zoom: Scroll wheel
   - Pan: Right-click + drag
   - Switch styles: Click visualization buttons

## Example PDB IDs to Try

- **1CRN** - Crambin (small, fast to load)
- **2HHB** - Hemoglobin
- **6LU7** - COVID-19 Main Protease
- **1AKI** - Adenylate Kinase
- **3J3Q** - CRISPR-Cas9

## AlphaFold Integration

Load AlphaFold predictions using direct URLs:
```
https://alphafold.ebi.ac.uk/files/AF-[UNIPROT_ID]-F1-model_v4.pdb
```

Example:
```
https://alphafold.ebi.ac.uk/files/AF-P12345-F1-model_v4.pdb
```

## Technology Stack

- **3Dmol.js** - WebGL-based molecular viewer
- **React** - Component framework
- **Lucide Icons** - Premium icon set
- **RCSB PDB API** - Structure database
- **AlphaFold DB** - AI-predicted structures

## Performance

- CDN-loaded library (cached after first load)
- Optimized rendering with cartoonQuality: 10
- Antialias enabled for smooth visuals
- Responsive to window resize

## Error Handling

- Network failures
- Invalid PDB IDs
- File read errors
- Library loading failures
- CORS issues (with helpful messages)

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Requires WebGL support

## Future Enhancements

- [ ] Sequence viewer integration
- [ ] Measurement tools (distances, angles)
- [ ] Multiple structure comparison
- [ ] Export rendered images
- [ ] Annotation/labeling
- [ ] AlphaFold prediction via backend
- [ ] Structure alignment
- [ ] Animation playback (MD trajectories)
