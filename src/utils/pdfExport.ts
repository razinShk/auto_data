
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFEntry {
  id: string;
  srno: string;
  partName: string;
  opNumber: string;
  observation: string;
  beforePhoto: string | null;
  afterPhoto: string | null;
  actionPlan: string;
  responsibility: string;
  remarks: string;
  timestamp?: string;
  status?: string;
}

export const generatePDF = async (entries: PDFEntry[], projectName: string = 'Observation Data') => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Helper function to add a new page
  const addNewPage = () => {
    pdf.addPage();
    yPosition = margin;
  };

  // Helper function to check if we need a new page
  const checkPageSpace = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      addNewPage();
    }
  };

  // Helper function to wrap text
  const wrapText = (text: string, maxWidth: number) => {
    return pdf.splitTextToSize(text, maxWidth);
  };

  // Helper function to add image to PDF
  const addImageToPDF = async (imageUrl: string, x: number, y: number, width: number, height: number) => {
    try {
      // Create a temporary image element
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            // Create a canvas to convert the image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = width * 3; // Higher resolution
            canvas.height = height * 3;
            
            if (ctx) {
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
              pdf.addImage(dataUrl, 'JPEG', x, y, width, height);
            }
            resolve(true);
          } catch (error) {
            console.error('Error processing image:', error);
            resolve(false);
          }
        };
        
        img.onerror = () => {
          console.error('Failed to load image:', imageUrl);
          resolve(false);
        };
        
        img.src = imageUrl;
      });
    } catch (error) {
      console.error('Error adding image to PDF:', error);
      return false;
    }
  };

  // Title Page
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Observation Data Report', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.text(projectName, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  pdf.setFontSize(12);
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 20;

  // Summary
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Summary', margin, yPosition);
  
  yPosition += 10;
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Total Entries: ${entries.length}`, margin, yPosition);
  
  yPosition += 6;
  const completedEntries = entries.filter(e => e.status === 'completed').length;
  pdf.text(`Completed: ${completedEntries}`, margin, yPosition);
  
  yPosition += 6;
  pdf.text(`Pending: ${entries.length - completedEntries}`, margin, yPosition);
  
  yPosition += 20;

  // Process each entry
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    
    // Check if we need a new page for this entry (estimate ~80mm needed)
    checkPageSpace(80);

    // Entry header
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Entry #${entry.srno} - ${entry.partName}`, margin, yPosition);
    
    yPosition += 10;

    // Entry details table
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const leftColumnX = margin;
    const rightColumnX = pageWidth / 2 + 10;
    const columnWidth = (pageWidth - margin * 2 - 10) / 2;
    
    // Left column
    pdf.setFont('helvetica', 'bold');
    pdf.text('Operation Number:', leftColumnX, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(entry.opNumber, leftColumnX + 35, yPosition);
    
    // Right column
    pdf.setFont('helvetica', 'bold');
    pdf.text('Responsibility:', rightColumnX, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(entry.responsibility, rightColumnX + 30, yPosition);
    
    yPosition += 8;

    // Status and timestamp
    if (entry.status) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Status:', leftColumnX, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(entry.status.toUpperCase(), leftColumnX + 15, yPosition);
    }
    
    if (entry.timestamp) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Date:', rightColumnX, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(new Date(entry.timestamp).toLocaleDateString(), rightColumnX + 15, yPosition);
    }
    
    yPosition += 12;

    // Observation
    pdf.setFont('helvetica', 'bold');
    pdf.text('Observation:', margin, yPosition);
    yPosition += 6;
    pdf.setFont('helvetica', 'normal');
    const observationLines = wrapText(entry.observation, pageWidth - margin * 2);
    pdf.text(observationLines, margin, yPosition);
    yPosition += observationLines.length * 4 + 6;

    // Action Plan
    pdf.setFont('helvetica', 'bold');
    pdf.text('Action Plan:', margin, yPosition);
    yPosition += 6;
    pdf.setFont('helvetica', 'normal');
    const actionLines = wrapText(entry.actionPlan, pageWidth - margin * 2);
    pdf.text(actionLines, margin, yPosition);
    yPosition += actionLines.length * 4 + 6;

    // Remarks
    if (entry.remarks) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Remarks:', margin, yPosition);
      yPosition += 6;
      pdf.setFont('helvetica', 'normal');
      const remarksLines = wrapText(entry.remarks, pageWidth - margin * 2);
      pdf.text(remarksLines, margin, yPosition);
      yPosition += remarksLines.length * 4 + 6;
    }

    // Images section
    if (entry.beforePhoto || entry.afterPhoto) {
      checkPageSpace(60); // Check space for images
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Images:', margin, yPosition);
      yPosition += 8;

      const imageWidth = 60;
      const imageHeight = 45;
      const imageSpacing = 10;

      if (entry.beforePhoto) {
        pdf.setFont('helvetica', 'normal');
        pdf.text('Before:', margin, yPosition);
        yPosition += 5;
        await addImageToPDF(entry.beforePhoto, margin, yPosition, imageWidth, imageHeight);
      }

      if (entry.afterPhoto) {
        const afterX = entry.beforePhoto ? margin + imageWidth + imageSpacing : margin;
        pdf.setFont('helvetica', 'normal');
        pdf.text('After:', afterX, entry.beforePhoto ? yPosition - 5 : yPosition);
        if (!entry.beforePhoto) yPosition += 5;
        await addImageToPDF(entry.afterPhoto, afterX, yPosition, imageWidth, imageHeight);
      }

      yPosition += imageHeight + 10;
    }

    // Add separator line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;
  }

  // Footer on last page
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Total ${entries.length} entries processed`, pageWidth / 2, pageHeight - 10, { align: 'center' });

  return pdf;
};
