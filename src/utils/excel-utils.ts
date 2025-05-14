import * as XLSX from 'xlsx';
import { Ouvrage, Projet } from '../types/metr';

export const generateExcelFile = (projet: Projet): Blob => {
  // Group ouvrages by niveau
  const ouvragesByNiveau: Record<string, Ouvrage[]> = {};
  
  projet.ouvrages.forEach(ouvrage => {
    const niveau = ouvrage.localisation.niveau;
    if (!ouvragesByNiveau[niveau]) {
      ouvragesByNiveau[niveau] = [];
    }
    ouvragesByNiveau[niveau].push(ouvrage);
  });
  
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Create worksheets for each level (niveau)
  Object.entries(ouvragesByNiveau).forEach(([niveau, ouvrages]) => {
    // Group by piece within this level
    const ouvragesByPiece: Record<string, Ouvrage[]> = {};
    
    ouvrages.forEach(ouvrage => {
      const piece = ouvrage.localisation.piece;
      if (!ouvragesByPiece[piece]) {
        ouvragesByPiece[piece] = [];
      }
      ouvragesByPiece[piece].push(ouvrage);
    });
    
    // Create data for this worksheet
    const wsData: any[][] = [
      ["Pièce", "Désignation", "Lot", "Quantité", "Unité", "Prix unitaire", "Total (€)"]
    ];
    
    Object.entries(ouvragesByPiece).forEach(([piece, pieceOuvrages]) => {
      // Add piece name as a header row
      wsData.push([piece, "", "", "", "", "", ""]);
      
      // Add ouvrages for this piece
      pieceOuvrages.forEach(ouvrage => {
        const total = ouvrage.quantite * ouvrage.prix_unitaire;
        wsData.push([
          "",
          ouvrage.designation,
          ouvrage.lot,
          ouvrage.quantite,
          ouvrage.unite,
          ouvrage.prix_unitaire,
          total
        ]);
      });
      
      // Add empty row after each piece
      wsData.push(["", "", "", "", "", "", ""]);
    });
    
    // Create the worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    const colWidths = [
      { wch: 15 }, // Pièce
      { wch: 40 }, // Désignation
      { wch: 15 }, // Lot
      { wch: 10 }, // Quantité
      { wch: 8 },  // Unité
      { wch: 12 }, // Prix unitaire
      { wch: 12 }  // Total
    ];
    
    ws['!cols'] = colWidths;
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, niveau);
  });
  
  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

export const downloadExcel = (projet: Projet): void => {
  const excelBlob = generateExcelFile(projet);
  
  // Create download link
  const url = URL.createObjectURL(excelBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${projet.nom}_metré.xlsx`;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}; 