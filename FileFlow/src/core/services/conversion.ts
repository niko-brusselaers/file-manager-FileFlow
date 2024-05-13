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
}

export default new conversion();