import CssFilterConverter from "css-filter-converter";

class themeManagement{

    checkTheme(){
        let theme = localStorage.getItem('theme');
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        switch(theme){
            case 'light':
                this.applyLightTheme();
                break;
            case 'dark':
                this.applyDarkTheme();
                break;
            case 'device':
                if(mediaQuery.matches) this.applyDarkTheme();
                else this.applyLightTheme();
                break;
            default:
                localStorage.setItem('theme','device');

                if(mediaQuery.matches) this.applyDarkTheme();
                else this.applyLightTheme();
                break
        }
    }

    applyDarkTheme(){
        this.setDefaultColors();

        document.documentElement.style.setProperty('--background', '23, 34, 65');
        document.documentElement.style.setProperty('--tertiary', '49, 61, 95');
        document.documentElement.style.setProperty('--text', '255, 255, 255');

        //convert the hex color to css filter color
        let iconColor = CssFilterConverter.hexToFilter("#FFFFFF").color
        let whiteIconColor = CssFilterConverter.hexToFilter("#FFFFFF").color

        document.documentElement.style.setProperty('--icon', iconColor);
        document.documentElement.style.setProperty('--whiteIcon', whiteIconColor);
        
    };

    applyLightTheme(){
        this.setDefaultColors();

        document.documentElement.style.setProperty('--background', '245, 245, 248');
        document.documentElement.style.setProperty('--tertiary', '227, 227, 227');
        document.documentElement.style.setProperty('--text', '0, 0, 0');

        //convert the hex color to css filter color
        let iconColor = CssFilterConverter.hexToFilter("#000000").color
        let whiteIconColor = CssFilterConverter.hexToFilter("#FFFFFF").color

        document.documentElement.style.setProperty('--icon', iconColor);
        document.documentElement.style.setProperty('--whiteIcon', whiteIconColor);
    }

    private setDefaultColors(){
        //set primary and secondary colors based
        document.documentElement.style.setProperty('--primary', '9, 9, 38');
        document.documentElement.style.setProperty('--secondary', '1, 57, 214');
    }
}

export default new themeManagement();