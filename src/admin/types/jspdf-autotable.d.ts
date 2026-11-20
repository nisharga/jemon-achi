declare module 'jspdf' {
    interface jsPDF {
        // minimal typing for what auttable attaches
        lastAutoTable?: {
            finalY?: number;
            // you can add other fields here if needed
        };
    }
}
