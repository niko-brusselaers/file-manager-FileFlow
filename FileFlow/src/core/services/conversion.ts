class conversion{

    //converts file size to human readable format
    convertFileSizeIdentifier(size: number): string {
        let i = -1;
        const byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
        do {
          size = size / 1024;
          i++;
        } while (size > 1024);
      
        return Math.max(size, 0.1).toFixed(2) + byteUnits[i];
    }

    //convert fileSize string to number
    convertFileSizeToNumber(size: string): number {
        let byteUnits = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        let sizeNumber = parseFloat(size);
        let sizeUnit = size.replace(sizeNumber.toString(), "").trim();
        let sizeIndex = byteUnits.indexOf(sizeUnit);
        return sizeNumber * Math.pow(1024, sizeIndex);
    }
}

export default new conversion();