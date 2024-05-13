import { Store } from "@tauri-apps/plugin-store";
import { ITransferProgress } from "../shared/types/ITransferProgress";

class tauriStore{

    async readLocalFile(filePath:string) {
    const store = new Store(filePath);
        try {
            let result = await store.entries()
            .then((entries) => {
                console.log(entries);
                
                return entries.map((entry) => entry[1]);
            })
            .catch((error) => {throw Error(error)}); 
            console.log(result);
            
            return result;   
        } catch (error) {
            console.error(error);
        }
        
    }
}

export default new tauriStore();