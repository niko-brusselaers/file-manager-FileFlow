import { Store } from "@tauri-apps/plugin-store";

class tauriStore{

    async readLocalFile<T>(filePath:string) {
        try {
            const store = new Store(filePath);

            let result = await store.entries()
            .then((entries) => {                
                return entries.map((entry) => entry[1] as T);
            })
            .catch((error) => {throw Error(error)});             
            return result;   
        } catch (error) {
            console.error(error);
        }
        
    }
    
    async readKeyFromLocalFile<T>(filePath:string, key:string) {
        try {
            const store = new Store(filePath);

            let result = await store.get(key)
            .then((entry) => {
                if(entry) return entry as T;
                else throw Error("key not found");
                })
            .catch((error) => {throw Error(error)});             
            return result;   
        } catch (error) {
            console.error(error);
        }
    }

    async removeKeyFromLocalFile(filePath:string, key:string) {
        try {
            const store = new Store(filePath);

            await store.delete(key)
            .catch((error) => {throw Error(error)});             
        } catch (error) {
            console.error(error);
        }
    }
}

export default new tauriStore();